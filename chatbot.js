document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWrapper = document.getElementById('chatbot-wrapper');
    const closeBtn = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chatbot-input');
    const chatSend = document.getElementById('chatbot-send');
    const chatMessages = document.getElementById('chatbot-messages');
    const quickReplies = document.querySelectorAll('.quick-reply');
    
    // Initialize the chatbot
    initChatbot();
    
    // Setup event listeners
    function initChatbot() {
        // HARDCODED API KEY FOR PERSONAL TESTING ONLY - Replace with your actual key
        localStorage.setItem('gemini_api_key', 'AIzaSyCtx40hyxcUGr7su9OHsD3v4Ka3yk6arSg');
        
        // Initialize resizable chatbot
        initResizableChatbot();
        
        // Toggle chatbot visibility
        if (chatToggle) {
            chatToggle.addEventListener('click', toggleChatbot);
        }
        
        // Close chatbot
        if (closeBtn) {
            closeBtn.addEventListener('click', toggleChatbot);
        }
        
        // Send message on button click
        if (chatSend) {
            chatSend.addEventListener('click', sendMessage);
        }
        
        // Send message on Enter key
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        // Handle quick replies
        if (quickReplies.length > 0) {
            quickReplies.forEach(reply => {
                reply.addEventListener('click', function() {
                    const query = this.getAttribute('data-query');
                    if (query) {
                        // Set input value to the query
                        if (chatInput) {
                            chatInput.value = query;
                        }
                        // Send the message
                        sendMessage();
                    }
                });
            });
        }

        // Welcome message on first load
        if (chatMessages && !localStorage.getItem('chatbot_welcomed')) {
            addMessageToChat('bot', "Welcome to AgriGlance AI Assistant! I can help with questions about crops, pests, soil management, and more. Type a question or try one of the quick replies below.");
            
            // Check if API key is set
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey || apiKey.trim() === '') {
                setTimeout(() => {
                    addMessageToChat('bot', "To use advanced AI features, please set your Gemini API key. You can get a free API key from <a href='https://ai.google.dev/' target='_blank'>Google AI Studio</a>.");
                    addApiKeyInput();
                }, 1000);
            }
            
            localStorage.setItem('chatbot_welcomed', 'true');
        }
        
        // Apply theme to chatbot based on current theme
        applyCurrentTheme();
        
        // Listen for theme changes via localStorage
        window.addEventListener('storage', function(e) {
            if (e.key === 'theme') {
                applyCurrentTheme();
            }
        });
        
        // Listen for custom themechange event
        window.addEventListener('themechange', function() {
            applyCurrentTheme();
        });
        
        // Also listen for data-theme attribute changes on the document element
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-theme') {
                    applyCurrentTheme();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
    }
    
    // Add API key input UI
    function addApiKeyInput() {
        if (!chatMessages) return;
        
        const apiKeyContainer = document.createElement('div');
        apiKeyContainer.className = 'api-key-container';
        apiKeyContainer.innerHTML = `
            <div class="api-key-input-wrapper">
                <input type="text" id="gemini-api-key" placeholder="Enter your Gemini API key">
                <button id="save-api-key">Save</button>
            </div>
            <p class="api-key-help">The API key will be stored in your browser's local storage and is not sent to our servers.</p>
        `;
        
        chatMessages.appendChild(apiKeyContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add event listener to save button
        const saveButton = document.getElementById('save-api-key');
        const apiKeyInput = document.getElementById('gemini-api-key');
        
        if (saveButton && apiKeyInput) {
            saveButton.addEventListener('click', function() {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey !== '') {
                    localStorage.setItem('gemini_api_key', apiKey);
                    apiKeyContainer.remove();
                    addMessageToChat('bot', "Thanks! Your API key has been saved. You can now use advanced AI features.");
                }
            });
            
            // Also save on Enter key
            apiKeyInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const apiKey = apiKeyInput.value.trim();
                    if (apiKey !== '') {
                        localStorage.setItem('gemini_api_key', apiKey);
                        apiKeyContainer.remove();
                        addMessageToChat('bot', "Thanks! Your API key has been saved. You can now use advanced AI features.");
                    }
                }
            });
        }
    }
    
    // Apply the current theme to chatbot elements
    function applyCurrentTheme() {
        // Check both localStorage and document attribute
        // Document attribute takes precedence if available
        const docTheme = document.documentElement.getAttribute('data-theme');
        const localTheme = localStorage.getItem('theme');
        const currentTheme = docTheme || localTheme || 'light';
        
        // Ensure both are in sync
        if (docTheme !== localTheme && docTheme) {
            localStorage.setItem('theme', docTheme);
        } else if (!docTheme && localTheme) {
            document.documentElement.setAttribute('data-theme', localTheme);
        }
        
        if (chatWrapper) {
            if (currentTheme === 'dark') {
                chatWrapper.classList.add('dark-theme');
            } else {
                chatWrapper.classList.remove('dark-theme');
            }
        }
    }
    
    // Toggle chatbot visibility
    function toggleChatbot() {
        if (chatWrapper) {
            chatWrapper.classList.toggle('open');
            if (chatToggle) {
                chatToggle.classList.toggle('active');
            }
            
            // If opening chatbot, focus on input
            if (chatWrapper.classList.contains('open') && chatInput) {
                chatInput.focus();
            }
        }
    }
    
    // Chat history for context
    let chatHistory = [];
    
    // Send a message to the chatbot
    function sendMessage() {
        if (!chatInput || !chatInput.value.trim()) return;
        
        const userMessage = chatInput.value.trim();
        
        // Add user message to chat
        addMessageToChat('user', userMessage);
        
        // Add to chat history
        chatHistory.push({ role: 'user', content: userMessage });
        
        // Clear input
        chatInput.value = '';
        
        // Focus back on input
        chatInput.focus();
        
        // Process the message and get a response (with a typing delay)
        setTimeout(() => {
            processUserMessage(userMessage);
        }, 500);
    }
    
    // Add a message to the chat
    function addMessageToChat(sender, message) {
        if (!chatMessages) return;
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        // Handle links in messages
        if (message.includes('<a')) {
            messageEl.innerHTML = message;
        } else {
            messageEl.textContent = message;
        }
        
        // Add custom data attribute for theme identification
        messageEl.setAttribute('data-sender', sender);
        
        // Add to chat
        chatMessages.appendChild(messageEl);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to chat history if bot message
        if (sender === 'bot') {
            chatHistory.push({ role: 'assistant', content: message });
            
            // Keep history to a reasonable size
            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (!chatMessages) return;
        
        const typingEl = document.createElement('div');
        typingEl.className = 'bot-message typing-indicator';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        typingEl.id = 'typing-indicator';
        
        chatMessages.appendChild(typingEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
    }
    
    // Process user message and get a response
    async function processUserMessage(message) {
        // Show typing indicator
        showTypingIndicator();
        
        // Special command to set API key
        if (message.toLowerCase().startsWith('/setapikey ')) {
            const apiKey = message.substring(11).trim();
            if (apiKey) {
                localStorage.setItem('gemini_api_key', apiKey);
                hideTypingIndicator();
                addMessageToChat('bot', "API key has been set successfully! You can now use advanced AI features.");
            } else {
                hideTypingIndicator();
                addMessageToChat('bot', "Please provide a valid API key. Format: /setapikey YOUR_API_KEY");
            }
            return;
        }
        
        // Handle API key management commands
        if (message.toLowerCase() === '/apikey') {
            hideTypingIndicator();
            addMessageToChat('bot', "You can set your Gemini API key with the command '/setapikey YOUR_API_KEY' or via the input below:");
            addApiKeyInput();
            return;
        }
        
        // Check if we have an API key
        const apiKey = localStorage.getItem('gemini_api_key');
        
        if (apiKey && apiKey.trim() !== '') {
            try {
                // Try to get a response from the Gemini API
                const response = await getGeminiResponse(message, apiKey);
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response
                addMessageToChat('bot', response);
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                
                // Check if the error is related to an invalid API key
                let errorMessage = "I couldn't connect to the AI service. ";
                
                if (error.message.includes('403') || error.message.includes('invalid') || error.message.includes('400')) {
                    errorMessage += "Your API key might be invalid or incorrectly formatted. Please check it's entered correctly.";
                    // Clear the invalid API key
                    localStorage.removeItem('gemini_api_key');
                    
                    // Use fallback response
                    const fallbackResponse = getMockResponse(message);
                    setTimeout(() => {
                        addMessageToChat('bot', "In the meantime, here's what I can tell you: " + fallbackResponse);
                        addApiKeyInput();
                    }, 1000);
                } else {
                    // If it's another type of error, use mock response
                    const fallbackResponse = getMockResponse(message);
                    errorMessage += "Here's a basic response: " + fallbackResponse;
                }
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add error message
                addMessageToChat('bot', errorMessage);
            }
        } else {
            // No API key or empty key, use mock response
            const response = getMockResponse(message);
            
            // Add some delay to simulate processing time
            setTimeout(() => {
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response with note about API key
                addMessageToChat('bot', response);
                
                // If this is the first user message, add a note about the API key
                if (chatHistory.filter(msg => msg.role === 'user').length === 1) {
                    setTimeout(() => {
                        addMessageToChat('bot', "For more advanced responses, you can add your Gemini API key. Type /apikey to set it up.");
                    }, 1000);
                }
            }, 1000);
        }
    }
    
    // Get a response from Gemini API
    async function getGeminiResponse(message, apiKey) {
        // Prepare the system prompt
        const systemPrompt = {
            role: "system",
            content: `You are an AI agricultural assistant for AgriGlance, specialized in farming knowledge. Your expertise includes:
            1. Crop selection, cultivation, and care
            2. Soil health and management
            3. Pest and disease identification and control
            4. Agricultural best practices and innovations
            5. Sustainable and organic farming methods
            6. Weather impacts on agriculture
            7. Irrigation and water management

            Respond to user queries with accurate, helpful information about farming and agriculture.
            If asked about non-farming topics, politely redirect the conversation to agricultural topics.
            Keep your responses concise but informative.`
        };
        
        // Create context from previous messages (limited for token efficiency)
        const recentHistory = chatHistory.slice(-10);
        
        // Prepare messages array with system prompt and recent history
        const messages = [systemPrompt, ...recentHistory];
        
        try {
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Extract the response text
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }
    
    // Get a mock response based on user message
    function getMockResponse(message) {
        message = message.toLowerCase();
        
        // Check for specific keywords and return relevant responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! How can I help you with your farming questions today?";
        }
        
        if (message.includes('api') || message.includes('key')) {
            return "To use the full AI capabilities, you can add your Gemini API key. You can get a free API key from Google AI Studio (ai.google.dev). Type /apikey to set it up. Without an API key, I'll provide helpful pre-written responses to common farming questions.";
        }
        
        if (message.includes('weather')) {
            return "Weather forecasts are available on the Weather Dashboard. For specific crop recommendations based on weather, consider factors like temperature range, precipitation, and growing season length.";
        }
        
        if (message.includes('pest') || message.includes('disease')) {
            return "For pest and disease management, it's important to identify the specific issue first. Consider integrated pest management (IPM) approaches which combine biological controls, resistant varieties, and minimal chemical interventions.";
        }
        
        if (message.includes('crop rotation')) {
            return "Crop rotation helps manage soil fertility and reduces pest/disease problems. Try to avoid planting crops from the same family in the same spot for at least 3 years. Use our Crop Rotation planner for personalized recommendations.";
        }
        
        if (message.includes('fertilizer') || message.includes('nutrient')) {
            return "Balanced fertilization is key to healthy crops. Consider soil testing to determine exact nutrient needs. Organic options include compost, manure, and cover crops. Chemical fertilizers should be applied according to specific crop requirements.";
        }
        
        if (message.includes('organic') || message.includes('natural')) {
            return "Organic farming relies on natural processes and materials. Key practices include crop rotation, green manures, compost, biological pest control, and mechanical cultivation. Certification requires following specific standards for at least 3 years.";
        }
        
        if (message.includes('water') || message.includes('irrigation')) {
            return "Efficient irrigation is crucial for water conservation. Drip irrigation can be 90% efficient compared to 50-70% for sprinklers. Consider soil moisture sensors, weather-based scheduling, and drought-resistant varieties where appropriate.";
        }
        
        if (message.includes('soil') || message.includes('dirt')) {
            return "Healthy soil is the foundation of farming. Key factors include organic matter content, pH balance, nutrient levels, and microbial activity. Regular testing and amendments like compost can help maintain optimal soil health.";
        }
        
        if (message.includes('aphid')) {
            return "Aphids can be managed through several approaches: 1) Beneficial insects like ladybugs and lacewings, 2) Neem oil or insecticidal soap sprays, 3) Strong water sprays to dislodge them, and 4) For severe infestations, systemic insecticides may be needed. Always monitor plants regularly for early detection.";
        }
        
        if (message.includes('clay soil')) {
            return "For clay soils, good crop choices include brassicas (cabbage, kale), root vegetables like carrots and beets, beans, and certain fruit trees. Improve clay soil by adding organic matter, avoiding working it when wet, and considering raised beds for better drainage.";
        }
        
        // Default response for unrecognized queries
        return "I don't have specific information on that topic yet. For more detailed assistance, please set up your Gemini API key for advanced AI responses or check the relevant section in our app.";
    }

    // Make chatbot resizable
    function initResizableChatbot() {
        if (!chatWrapper) return;
        
        // Create and append resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'chatbot-resize-handle';
        chatWrapper.appendChild(resizeHandle);
        
        let startX, startY, startWidth, startHeight;
        
        // Mouse down event to start resizing
        resizeHandle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(chatWrapper).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(chatWrapper).height, 10);
            
            // Add event listeners for resizing
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });
        
        // Resize function
        function resize(e) {
            chatWrapper.style.width = (startWidth + e.clientX - startX) + 'px';
            chatWrapper.style.height = (startHeight + e.clientY - startY) + 'px';
        }
        
        // Stop resizing function
        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            
            // Save the dimensions to localStorage
            localStorage.setItem('chatbot_width', chatWrapper.style.width);
            localStorage.setItem('chatbot_height', chatWrapper.style.height);
        }
        
        // Restore saved dimensions if available
        const savedWidth = localStorage.getItem('chatbot_width');
        const savedHeight = localStorage.getItem('chatbot_height');
        
        if (savedWidth && savedHeight) {
            chatWrapper.style.width = savedWidth;
            chatWrapper.style.height = savedHeight;
        }
    }
});

/* Additional CSS to inject via JavaScript for theme support */
document.addEventListener('DOMContentLoaded', function() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add the CSS rules for dark theme support
    style.textContent = `
        [data-theme="dark"] .chatbot-wrapper,
        .chatbot-wrapper.dark-theme {
            background-color: #1e1e1e;
            color: #f0f0f0;
        }
        
        [data-theme="dark"] .chatbot-messages,
        .chatbot-wrapper.dark-theme .chatbot-messages {
            background-color: #1e1e1e;
        }
        
        [data-theme="dark"] .bot-message,
        .chatbot-wrapper.dark-theme .bot-message {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        [data-theme="dark"] .user-message,
        .chatbot-wrapper.dark-theme .user-message {
            background-color: #4caf50;
            color: white;
        }
        
        [data-theme="dark"] .chatbot-input-container,
        .chatbot-wrapper.dark-theme .chatbot-input-container {
            background-color: #1e1e1e;
            border-top: 1px solid #444;
        }
        
        [data-theme="dark"] .chatbot-input-container input,
        .chatbot-wrapper.dark-theme .chatbot-input-container input {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        [data-theme="dark"] .chatbot-quick-replies,
        .chatbot-wrapper.dark-theme .chatbot-quick-replies {
            background-color: #1e1e1e;
            border-top: 1px solid #444;
        }
        
        [data-theme="dark"] .quick-reply,
        .chatbot-wrapper.dark-theme .quick-reply {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        [data-theme="dark"] .quick-reply:hover,
        .chatbot-wrapper.dark-theme .quick-reply:hover {
            background-color: #4caf50;
            color: white;
        }
        
        /* API Key Input Styling */
        .api-key-container {
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 10px;
            background-color: rgba(76, 175, 80, 0.1);
            border: 1px dashed #4caf50;
        }
        
        [data-theme="dark"] .api-key-container,
        .chatbot-wrapper.dark-theme .api-key-container {
            background-color: rgba(76, 175, 80, 0.05);
            border: 1px dashed #4caf50;
        }
        
        .api-key-input-wrapper {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .api-key-input-wrapper input {
            flex: 1;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-family: inherit;
        }
        
        [data-theme="dark"] .api-key-input-wrapper input,
        .chatbot-wrapper.dark-theme .api-key-input-wrapper input {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        .api-key-input-wrapper button {
            padding: 8px 16px;
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 500;
        }
        
        .api-key-help {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        [data-theme="dark"] .api-key-help,
        .chatbot-wrapper.dark-theme .api-key-help {
            color: #aaa;
        }
        
        /* Make chatbot text smaller and more readable */
        .bot-message, .user-message {
            font-size: 14px;
            line-height: 1.5;
            padding: 10px 12px;
        }
        
        .chatbot-input-container input {
            font-size: 14px;
        }
        
        .quick-reply {
            font-size: 12px;
        }
        
        .chatbot-header h3 {
            font-size: 16px;
        }
        
        .api-key-help {
            font-size: 11px;
        }
        
        /* Resizable chatbot styles */
        .chatbot-wrapper {
            resize: both;
            overflow: hidden;
            min-width: 300px;
            min-height: 400px;
            max-width: 90vw;
            max-height: 90vh;
        }
        
        .chatbot-resize-handle {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 15px;
            height: 15px;
            background-image: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%);
            cursor: nwse-resize;
            z-index: 1000;
        }
        
        .chatbot-messages {
            height: calc(100% - 130px); /* Adjust based on header and input height */
        }
    `;
    
    // Append to head
    document.head.appendChild(style);
}); 