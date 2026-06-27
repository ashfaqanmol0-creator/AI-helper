const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatArea = document.getElementById('chat-area');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const imageUpload = document.getElementById('image-upload');
const micBtn = document.getElementById('mic-btn');

let progressValue = 65;

const mockResponses = [
    "That's a great question! Let me break that down for you...",
    "I can help with that. The formula you need is E=mc².",
    "Hmm, let's think about this step-by-step. First...",
    "Here's a hint: try looking at the chapter on photosynthesis.",
    "You're doing great! Keep it up. The answer involves finding the derivative.",
    "Sure! A metaphor is a figure of speech that...",
    "Awesome job! You've leveled up your study skills."
];

function createMessageElement(content, isUser = false) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-message' : 'ai-message glass-card'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const p = document.createElement('p');
    // Escape HTML and replace newlines with <br> for multi-line messages
    p.innerHTML = content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    
    contentDiv.appendChild(p);
    div.appendChild(contentDiv);
    
    return div;
}

function createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message ai-message glass-card typing-indicator';
    div.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        div.appendChild(dot);
    }
    
    return div;
}

function updateProgress() {
    progressValue += 5;
    if (progressValue > 100) progressValue = 100;
    
    progressFill.style.width = `${progressValue}%`;
    progressText.textContent = `Lvl 3 Scholar - ${progressValue}%`;
}

function evaluateMath(text) {
    try {
        // Remove trailing equals signs which users often type
        const cleanText = text.replace(/=+$/, '').trim();
        // Simple regex to check if string contains only numbers and basic math operators
        if (/^[\d+\-*/().\s]+$/.test(cleanText) && cleanText.match(/\d/)) {
            // Using Function constructor to safely evaluate simple math expressions without full eval
            const result = new Function('return ' + cleanText)();
            return `${cleanText} = ${result}`;
        }
    } catch (e) {
        // Not valid math
    }
    return null;
}

function getSmartMockResponse(text) {
    const lowerText = text.toLowerCase().replace(/\s+/g, '');
    const cleanLower = text.toLowerCase();
    
    // Natural language math
    const squareMatch = cleanLower.match(/square of (\d+)/);
    if (squareMatch) {
        const num = parseInt(squareMatch[1], 10);
        return `The square of ${num} is ${num * num}.`;
    }
    
    const sqrtMatch = cleanLower.match(/square root of (\d+)/);
    if (sqrtMatch) {
        const num = parseInt(sqrtMatch[1], 10);
        return `The square root of ${num} is ${Math.sqrt(num)}.`;
    }
    
    if (lowerText.includes("x+1/x=5") && (lowerText.includes("x5") || lowerText.includes("x^5"))) {
        return "To find x⁵ + 1/x⁵ when x + 1/x = 5:\n\n1. x² + 1/x² = 5² - 2 = 23\n2. x³ + 1/x³ = 5³ - 3(5) = 110\n3. x⁵ + 1/x⁵ = (23 × 110) - 5 = 2525.";
    }
    if (lowerText.includes("x+1/x=5")) {
        return "I see x + 1/x = 5. Are you looking to find the value of x² + 1/x², or maybe x⁵ + 1/x⁵?";
    }
    if (lowerText.includes("x5+1/x5") || lowerText.includes("x^5+1/x^5")) {
        return "Assuming x + 1/x = 5 from earlier:\n\n1. x² + 1/x² = 23\n2. x³ + 1/x³ = 110\n3. x⁵ + 1/x⁵ = (23 × 110) - 5 = 2525!";
    }
    
    // Generic algebra mock
    if (/[a-zA-Z]/.test(text) && text.includes("=")) {
        return "That looks like an algebraic equation! Since I'm currently running as a UI template without a real AI backend connected, I can't solve complex algebra just yet. But I can look pretty while trying! ✨";
    }
    
    return null;
}

function showAIResponse(text, delay) {
    // Show typing indicator
    const typingIndicator = createTypingIndicator();
    chatArea.appendChild(typingIndicator);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    setTimeout(() => {
        // Remove typing indicator
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Add AI response
        const aiMsg = createMessageElement(text, false);
        chatArea.appendChild(aiMsg);
        
        // Update progress
        updateProgress();
        
        // Scroll to bottom
        chatArea.scrollTop = chatArea.scrollHeight;
    }, delay);
}

// Handle Image Upload
if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const userMsg = createMessageElement('I uploaded a picture!', true);
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'message-image';
                userMsg.querySelector('.message-content').appendChild(img);
                chatArea.appendChild(userMsg);
                chatArea.scrollTop = chatArea.scrollHeight;
                
                // Show AI response
                showAIResponse("Oh, a picture! Give me a moment to analyze that for you.", 1500);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Handle Speech Recognition
if (micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            micBtn.classList.add('recording');
            userInput.placeholder = "Listening...";
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                alert("Microphone access blocked! If you are opening this file directly from your computer (file://...), browsers block the mic for security reasons. You may need to run this through a local server (like VS Code Live Server).");
            } else {
                alert("Microphone error: " + event.error + ". (Make sure you are using Chrome or Edge and have a working mic).");
            }
            micBtn.classList.remove('recording');
            userInput.placeholder = "Type your homework question here...";
        };
        
        recognition.onend = () => {
            micBtn.classList.remove('recording');
            userInput.placeholder = "Type your homework question here...";
        };
        
        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('recording')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        micBtn.addEventListener('click', () => {
            alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
        });
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = userInput.value.trim();
    if (!text) return;
    
    // Add user message
    const userMsg = createMessageElement(text, true);
    chatArea.appendChild(userMsg);
    
    // Clear input
    userInput.value = '';
    
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Show typing indicator
    const typingIndicator = createTypingIndicator();
    chatArea.appendChild(typingIndicator);
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
        let apiKey = localStorage.getItem('gemini_api_key') || "AQ.Ab8RN6IKhIu3zMxPeSXrjMU9RtVVYHcclOT-klwBjXWeTVQ6-g";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a friendly, encouraging AI Homework Helper for a student. Provide a detailed, comprehensive, and step-by-step answer to the following question: ${text}`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        // Remove typing indicator
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        if (data.error) {
            if (data.error.message && (data.error.message.includes("Quota exceeded") || data.error.message.includes("authentication credentials") || data.error.message.includes("API key not valid"))) {
                const newKey = prompt("The API key is invalid or has reached its quota limit.\n\nPlease enter your own Gemini API key (get one for free at aistudio.google.com):");
                if (newKey) {
                    localStorage.setItem('gemini_api_key', newKey);
                    throw new Error("New API key saved! Please try your question again.");
                } else {
                    throw new Error("A valid API key is required. Please try again.");
                }
            }
            throw new Error(data.error.message || "Failed to get response from AI");
        }

        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            
            // Add AI response
            const aiMsg = createMessageElement(aiText, false);
            chatArea.appendChild(aiMsg);
            
            // Update progress
            updateProgress();
            
            // Scroll to bottom
            chatArea.scrollTop = chatArea.scrollHeight;
        } else {
            throw new Error("No answer returned from AI.");
        }
        
    } catch (error) {
        // Remove typing indicator if it's still there
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
        
        const errorMsg = createMessageElement(`Oops! ${error.message}`, false);
        chatArea.appendChild(errorMsg);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
});
