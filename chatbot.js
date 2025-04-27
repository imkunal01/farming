document.addEventListener('DOMContentLoaded', function() {
    // Configuration - REPLACE THIS WITH YOUR ACTUAL API KEY
    const GEMINI_API_KEY = 'AIzaSyCtx40hyxcUGr7su9OHsD3v4Ka3yk6arSg'; // Replace with a different key if needed
    
    // DOM Elements
    const chatContainer = document.querySelector('.chatbot-container');
    
    // Create the modern UI elements
    function createChatbotUI() {
        // Remove existing chatbot if present
        if (document.getElementById('chatbot-wrapper')) {
            document.getElementById('chatbot-wrapper').remove();
        }
        if (document.getElementById('chatbot-toggle')) {
            document.getElementById('chatbot-toggle').remove();
        }
        
        // Create new elements
        const chatbotHTML = `
            <button id="chatbot-toggle" class="chatbot-toggle">
                <i class="fas fa-seedling"></i>
            </button>
            <div id="chatbot-wrapper" class="chatbot-wrapper">
                <div class="resize-handle" id="resize-handle"></div>
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <i class="fas fa-seedling"></i>
                        <h3>AgriGlance AI</h3>
                    </div>
                    <div class="chatbot-controls">
                        <button id="chatbot-clear" class="chatbot-btn" title="Clear chat">
                            <i class="fas fa-broom"></i>
                        </button>
                        <button id="chatbot-theme" class="chatbot-btn" title="Toggle theme">
                            <i class="fas fa-moon"></i>
                        </button>
                        <button id="chatbot-close" class="chatbot-btn" title="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div id="chatbot-messages" class="chatbot-messages">
                    <div class="welcome-message">
                        <div class="welcome-icon">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <div class="welcome-text">
                            <h4>Welcome to AgriGlance</h4>
                            <p>Your AI assistant. I can help with farming questions and general knowledge. What would you like to know?</p>
                        </div>
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <div class="chatbot-quick-replies">
                        <div class="quick-reply" data-query="How to control aphids?">Aphid Control</div>
                        <div class="quick-reply" data-query="Tell me a joke">Joke</div>
                        <div class="quick-reply" data-query="Current weather trends">Weather</div>
                        <div class="quick-reply" data-query="What can you help with?">Help</div>
                    </div>
                    <div class="chatbot-input-container">
                        <input type="text" id="chatbot-input" placeholder="Ask me anything...">
                        <button id="chatbot-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the new HTML
        chatContainer.innerHTML = chatbotHTML;
        
        // Add the CSS styles
        addChatbotStyles();
    }
    
    // Add styles for the new UI
    function addChatbotStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'chatbot-custom-styles';
        
        // Remove any existing styles
        if (document.getElementById('chatbot-custom-styles')) {
            document.getElementById('chatbot-custom-styles').remove();
        }
        
        styleElement.textContent = `
            /* Chatbot Container */
            .chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Poppins', sans-serif;
            }
            
            /* Toggle Button */
            .chatbot-toggle {
                width: 56px;
                height: 56px;
                border-radius: 15px;
                background: #3B7A57;
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
                position: absolute;
                bottom: 0;
                right: 0;
                transform: rotate(0deg);
            }
            
            .chatbot-toggle:hover {
                transform: rotate(15deg);
                background: #2E8B57;
            }
            
            /* Main Chatbot Wrapper */
            .chatbot-wrapper {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 340px;
                height: 500px;
                background: #f8f9fa;
                border-radius: 15px;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                border: 1px solid #e9ecef;
                resize: both;
                min-width: 300px;
                min-height: 400px;
                max-width: 90vw;
                max-height: 80vh;
            }
            
            .chatbot-wrapper.open {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }
            
            /* Resize handle */
            .resize-handle {
                position: absolute;
                right: 0;
                bottom: 0;
                width: 15px;
                height: 15px;
                cursor: nwse-resize;
                background-image: linear-gradient(135deg, transparent 70%, #3B7A57 70%, #3B7A57 80%, transparent 80%);
                z-index: 10;
            }
            
            /* Chatbot Header */
            .chatbot-header {
                padding: 15px;
                background: #3B7A57;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chatbot-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .chatbot-title h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
            }
            
            .chatbot-controls {
                display: flex;
                gap: 8px;
            }
            
            .chatbot-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                width: 30px;
                height: 30px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .chatbot-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* Messages Area */
            .chatbot-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                scroll-behavior: smooth;
            }
            
            .welcome-message {
                display: flex;
                gap: 12px;
                padding: 15px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                margin-bottom: 10px;
                border-left: 3px solid #3B7A57;
            }
            
            .welcome-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background: rgba(59, 122, 87, 0.1);
                color: #3B7A57;
                border-radius: 10px;
                font-size: 18px;
            }
            
            .welcome-text h4 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 14px;
            }
            
            .welcome-text p {
                margin: 0;
                color: #666;
                font-size: 13px;
                line-height: 1.4;
            }
            
            /* Message Bubbles */
            .user-message, .bot-message {
                padding: 12px 15px;
                border-radius: 10px;
                max-width: 85%;
                margin-bottom: 2px;
                font-size: 14px;
                line-height: 1.5;
                animation: fadeInMessage 0.3s ease;
            }
            
            .user-message {
                background: #3B7A57;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 3px;
            }
            
            .bot-message {
                background: white;
                color: #333;
                align-self: flex-start;
                border-bottom-left-radius: 3px;
                border-left: 3px solid #3B7A57;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Typing Indicator */
            .typing-indicator {
                display: flex;
                align-items: center;
                background: white;
                padding: 10px 15px;
                border-radius: 10px;
                border-left: 3px solid #3B7A57;
                width: fit-content;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                align-self: flex-start;
                margin-top: 2px;
            }
            
            .typing-indicator span {
                width: 7px;
                height: 7px;
                background: #3B7A57;
                border-radius: 50%;
                display: inline-block;
                margin: 0 2px;
                opacity: 0.6;
            }
            
            .typing-indicator span:nth-child(1) {
                animation: typingBounce 1.2s infinite;
            }
            
            .typing-indicator span:nth-child(2) {
                animation: typingBounce 1.2s infinite 0.2s;
            }
            
            .typing-indicator span:nth-child(3) {
                animation: typingBounce 1.2s infinite 0.4s;
            }
            
            /* Input Area */
            .chatbot-input-area {
                background: white;
                border-top: 1px solid #e9ecef;
            }
            
            /* Quick Replies */
            .chatbot-quick-replies {
                padding: 10px 15px;
                display: flex;
                gap: 8px;
                overflow-x: auto;
                flex-wrap: nowrap;
                scrollbar-width: thin;
            }
            
            .chatbot-quick-replies::-webkit-scrollbar {
                height: 3px;
            }
            
            .chatbot-quick-replies::-webkit-scrollbar-thumb {
                background: rgba(59, 122, 87, 0.3);
                border-radius: 3px;
            }
            
            .quick-reply {
                background: rgba(59, 122, 87, 0.1);
                color: #3B7A57;
                padding: 8px 12px;
                border-radius: 12px;
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            
            .quick-reply:hover {
                background: rgba(59, 122, 87, 0.2);
                border-color: #3B7A57;
            }
            
            /* Input Container */
            .chatbot-input-container {
                display: flex;
                padding: 10px 15px 15px;
            }
            
            #chatbot-input {
                flex: 1;
                padding: 12px 15px;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                outline: none;
                font-family: inherit;
                font-size: 14px;
                transition: all 0.2s;
                background: #f8f9fa;
            }
            
            #chatbot-input:focus {
                border-color: #3B7A57;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 122, 87, 0.1);
            }
            
            #chatbot-send {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                background: #3B7A57;
                color: white;
                border: none;
                margin-left: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            #chatbot-send:hover {
                background: #2E8B57;
            }
            
            /* Animations */
            @keyframes fadeInMessage {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes typingBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            /* Dark Theme */
            [data-theme="dark"] .chatbot-wrapper,
            .chatbot-wrapper.dark-theme {
                background-color: #222;
                border-color: #444;
            }
            
            [data-theme="dark"] .chatbot-messages,
            .chatbot-wrapper.dark-theme .chatbot-messages {
                background-color: #222;
            }
            
            [data-theme="dark"] .welcome-message,
            [data-theme="dark"] .bot-message,
            [data-theme="dark"] .typing-indicator,
            .chatbot-wrapper.dark-theme .welcome-message,
            .chatbot-wrapper.dark-theme .bot-message,
            .chatbot-wrapper.dark-theme .typing-indicator {
                background-color: #333;
                color: #eee;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            [data-theme="dark"] .welcome-text h4,
            .chatbot-wrapper.dark-theme .welcome-text h4 {
                color: #eee;
            }
            
            [data-theme="dark"] .welcome-text p,
            .chatbot-wrapper.dark-theme .welcome-text p {
                color: #ccc;
            }
            
            [data-theme="dark"] .chatbot-input-area,
            .chatbot-wrapper.dark-theme .chatbot-input-area {
                background-color: #333;
                border-color: #444;
            }
            
            [data-theme="dark"] .quick-reply,
            .chatbot-wrapper.dark-theme .quick-reply {
                background-color: rgba(59, 122, 87, 0.2);
                color: #9ED9B5;
            }
            
            [data-theme="dark"] #chatbot-input,
            .chatbot-wrapper.dark-theme #chatbot-input {
                background-color: #444;
                color: #eee;
                border-color: #555;
            }
            
            [data-theme="dark"] #chatbot-input:focus,
            .chatbot-wrapper.dark-theme #chatbot-input:focus {
                background-color: #3a3a3a;
                border-color: #3B7A57;
            }
            
            /* Responsive Design */
            @media (max-width: 480px) {
                .chatbot-wrapper {
                    width: calc(100vw - 40px);
                    height: 60vh;
                    bottom: 80px;
                }
                
                .chatbot-toggle {
                    bottom: 10px;
                    right: 10px;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Initialize the chatbot
    function initChatbot() {
        // Create UI
        createChatbotUI();
        
        // DOM references
        const chatToggle = document.getElementById('chatbot-toggle');
        const chatWrapper = document.getElementById('chatbot-wrapper');
        const closeBtn = document.getElementById('chatbot-close');
        const clearBtn = document.getElementById('chatbot-clear');
        const themeBtn = document.getElementById('chatbot-theme');
        const chatInput = document.getElementById('chatbot-input');
        const chatSend = document.getElementById('chatbot-send');
        const chatMessages = document.getElementById('chatbot-messages');
        const quickReplies = document.querySelectorAll('.quick-reply');
        const resizeHandle = document.getElementById('resize-handle');
        
        // Initialize resizable functionality
        initResizable();
        
        // Toggle chatbot visibility
        chatToggle.addEventListener('click', () => {
            chatWrapper.classList.toggle('open');
            
            // If opening chatbot, focus on input
            if (chatWrapper.classList.contains('open')) {
                setTimeout(() => chatInput.focus(), 300);
                
                // Send welcome message if it's the first time
                if (!localStorage.getItem('chatbot_welcomed')) {
                    addBotMessage("Hello! I'm your AI assistant. I can help with farming questions as well as general knowledge topics. What would you like to know?");
                    localStorage.setItem('chatbot_welcomed', 'true');
                }
            }
        });
        
        // Close chatbot
        closeBtn.addEventListener('click', () => {
            chatWrapper.classList.remove('open');
        });
        
        // Clear chat history
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear chat history?')) {
                chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <div class="welcome-text">
                            <h4>Welcome to AgriGlance</h4>
                            <p>Your AI assistant. I can help with farming questions and general knowledge. What would you like to know?</p>
                        </div>
                    </div>
                `;
                chatHistory = [];
            }
        });
        
        // Toggle theme
        themeBtn.addEventListener('click', () => {
            chatWrapper.classList.toggle('dark-theme');
            themeBtn.innerHTML = chatWrapper.classList.contains('dark-theme') ? 
                '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
        
        // Send message on button click
        chatSend.addEventListener('click', sendMessage);
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Handle quick replies
        quickReplies.forEach(reply => {
            reply.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                if (query) {
                    chatInput.value = query;
                    sendMessage();
                }
            });
        });
        
        // Apply theme based on global site theme
        applyCurrentTheme();
        
        // Listen for theme changes
        window.addEventListener('themechange', applyCurrentTheme);
        
        // Set up observer for data-theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    applyCurrentTheme();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        // Initialize resizing functionality
        function initResizable() {
            if (!resizeHandle || !chatWrapper) return;
            
            let isResizing = false;
            let startX, startY, startWidth, startHeight;
            
            // Initialize with saved dimensions if available
            const savedWidth = localStorage.getItem('chatbot_width');
            const savedHeight = localStorage.getItem('chatbot_height');
            
            if (savedWidth && savedHeight) {
                chatWrapper.style.width = savedWidth;
                chatWrapper.style.height = savedHeight;
            }
            
            resizeHandle.addEventListener('mousedown', function(e) {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(document.defaultView.getComputedStyle(chatWrapper).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(chatWrapper).height, 10);
                
                document.addEventListener('mousemove', resizeMove);
                document.addEventListener('mouseup', resizeStop);
                e.preventDefault();
            });
            
            function resizeMove(e) {
                if (!isResizing) return;
                
                const width = startWidth + e.clientX - startX;
                const height = startHeight + e.clientY - startY;
                
                // Enforce min/max dimensions
                const newWidth = Math.min(Math.max(width, 300), window.innerWidth * 0.9);
                const newHeight = Math.min(Math.max(height, 400), window.innerHeight * 0.8);
                
                chatWrapper.style.width = newWidth + 'px';
                chatWrapper.style.height = newHeight + 'px';
            }
            
            function resizeStop() {
                isResizing = false;
                document.removeEventListener('mousemove', resizeMove);
                document.removeEventListener('mouseup', resizeStop);
                
                // Save dimensions
                localStorage.setItem('chatbot_width', chatWrapper.style.width);
                localStorage.setItem('chatbot_height', chatWrapper.style.height);
            }
        }
    }
    
    // Apply the current theme to chatbot elements
    function applyCurrentTheme() {
        const chatWrapper = document.getElementById('chatbot-wrapper');
        const themeBtn = document.getElementById('chatbot-theme');
        if (!chatWrapper || !themeBtn) return;
        
        const docTheme = document.documentElement.getAttribute('data-theme');
        
        if (docTheme === 'dark') {
            chatWrapper.classList.add('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            chatWrapper.classList.remove('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Chat history for context window
    let chatHistory = [];
    
    // Send a message to the chatbot
    function sendMessage() {
        const chatInput = document.getElementById('chatbot-input');
        const chatMessages = document.getElementById('chatbot-messages');
        
        if (!chatInput || !chatMessages) return;
        
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;
        
        // Add user message to chat
        addUserMessage(userMessage);
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process and respond (with delay for natural feeling)
        setTimeout(() => {
            processUserMessage(userMessage);
        }, 700);
    }
    
    // Add a user message to the chat
    function addUserMessage(message) {
        const chatMessages = document.getElementById('chatbot-messages');
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'user-message';
        messageEl.textContent = message;
        
        chatMessages.appendChild(messageEl);
        scrollToBottom();
        
        // Add to chat history
        chatHistory.push({ role: 'user', content: message });
    }
    
    // Add a bot message to the chat
    function addBotMessage(message) {
        const chatMessages = document.getElementById('chatbot-messages');
        if (!chatMessages) return;
        
        // Hide typing indicator if present
        hideTypingIndicator();
        
        const messageEl = document.createElement('div');
        messageEl.className = 'bot-message';
        
        // Handle HTML in messages (for links)
        if (message.includes('<a') || message.includes('<br>')) {
            messageEl.innerHTML = message;
        } else {
            messageEl.textContent = message;
        }
        
        chatMessages.appendChild(messageEl);
        scrollToBottom();
        
        // Add to chat history
        chatHistory.push({ role: 'assistant', content: message });
        
        // Limit history size
        if (chatHistory.length > 15) {
            chatHistory = chatHistory.slice(-15);
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const chatMessages = document.getElementById('chatbot-messages');
        if (!chatMessages) return;
        
        // Remove existing indicator if present
        hideTypingIndicator();
        
        const typingEl = document.createElement('div');
        typingEl.className = 'typing-indicator';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        
        chatMessages.appendChild(typingEl);
        scrollToBottom();
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        const chatMessages = document.getElementById('chatbot-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Process user message and get a response
    async function processUserMessage(message) {
        // Check for special commands
        if (message.toLowerCase() === '/clear') {
            const clearBtn = document.getElementById('chatbot-clear');
            if (clearBtn) clearBtn.click();
            hideTypingIndicator();
            return;
        }
        
        try {
            // Get response from Gemini API
            const response = await getGeminiResponse(message);
            
            // Add bot response with a slight delay for more natural feeling
            setTimeout(() => {
                addBotMessage(response);
            }, 300);
        } catch (error) {
            console.error('Error processing message:', error);
            
            // Provide a fallback response on error
            setTimeout(() => {
                addBotMessage("I'm having trouble accessing my knowledge base right now. Please try again in a moment.");
            }, 300);
        }
    }
    
    // Get a response from the Gemini API
    async function getGeminiResponse(message) {
        // System prompt to guide AI responses
        const systemPrompt = {
            role: "system",
            content: `You are an AI assistant for AgriGlance. While you have expertise in agriculture and farming topics, you can also help with general knowledge questions. 

You can assist with:
1. Farming, crops, and agricultural practices
2. General knowledge questions
3. Science and technology
4. Educational topics
5. Simple calculations
6. Weather and climate information
7. And other general topics

Respond in a helpful, concise, and informative way. If asked specifically about agriculture, provide detailed farming information, but otherwise, feel free to answer general questions on any topic.`
        };
        
        try {
            // Get recent history for context (limited for token efficiency)
            const recentHistory = chatHistory.slice(-6);
            
            // Log the API call attempt for debugging
            console.log('Attempting Gemini API call with message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
            
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: message }]
                        }
                    ],
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 800,
                    },
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error status:', response.status, errorText);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Received API response:', data);
            
            // Extract the response text
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid API response format:', data);
                // Use fallback if response format is unexpected
                return getFallbackResponse(message);
            }
        } catch (error) {
            console.error('API Error:', error);
            return getFallbackResponse(message);
        }
    }
    
    // Get a fallback response based on user message keywords
    function getFallbackResponse(message) {
        message = message.toLowerCase();
        
        // Check for keywords and return relevant responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! How can I help you today? Feel free to ask me about any topic.";
        }
        
        if (message.includes('how are you') || message.includes('how do you feel')) {
            return "I'm doing well, thanks for asking! I'm ready to assist you with any questions you have.";
        }
        
        if (message.includes('your name') || message.includes('who are you')) {
            return "I'm the AgriGlance AI Assistant. While I specialize in agricultural topics, I can help with many different subjects. What would you like to know about?";
        }
        
        if (message.includes('weather')) {
            return "Weather information is important for many activities. If you're interested in weather for farming, local weather patterns significantly impact crop selection and growth cycles. What specific weather information are you looking for?";
        }
        
        if (message.includes('help') || message.includes('can you')) {
            return "I can help with a wide range of topics including agriculture, general knowledge questions, educational topics, and more. What specific information are you looking for?";
        }
        
        if (message.includes('thank')) {
            return "You're welcome! Feel free to ask if you need help with anything else.";
        }
        
        if (message.includes('joke') || message.includes('funny')) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "What did the farmer say when he lost his tractor? 'Where's my tractor?'",
                "Why did the scarecrow win an award? Because he was outstanding in his field!",
                "What do you call a fake noodle? An impasta!",
                "How does a penguin build its house? Igloos it together!"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
        
        if (message.includes('time') || message.includes('date')) {
            const now = new Date();
            return `The current time is ${now.toLocaleTimeString()} and today's date is ${now.toLocaleDateString()}.`;
        }
        
        // Agriculture-specific responses
        if (message.includes('crop') || message.includes('plant') || message.includes('grow')) {
            return "Growing crops successfully requires understanding your climate, soil conditions, and plant needs. What specific crop or plant are you interested in?";
        }
        
        if (message.includes('soil') || message.includes('dirt')) {
            return "Healthy soil is essential for growing plants. Regular testing and adding organic matter can improve soil quality. Do you have a specific soil question?";
        }
        
        if (message.includes('pest') || message.includes('insect') || message.includes('bug')) {
            return "Pest management is important for both gardens and agriculture. Integrated pest management combines prevention, monitoring, and various control methods. What pest issue are you dealing with?";
        }
        
        // Default response if no keywords match
        return "I'm here to answer questions on a variety of topics. I specialize in agricultural information but can help with general knowledge too. Could you provide more details about what you'd like to know?";
    }
    
    // Start the chatbot
    initChatbot();
}); 