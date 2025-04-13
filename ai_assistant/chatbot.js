// AI Farming Assistant JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const loadingOverlay = document.getElementById('loading-overlay');
    const apiKeyModal = document.getElementById('api-key-modal');
    const apiKeyForm = document.getElementById('api-key-form');
    const apiKeyInput = document.getElementById('api-key');
    const questionButtons = document.querySelectorAll('.question-btn');
    
    // Chat history for context
    let chatHistory = [];
    
    // Add auto-resize to textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        // Cap the height
        if (parseInt(this.style.height) > 120) {
            this.style.height = '120px';
        }
    });
    
    // Check if API key is stored
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (!storedApiKey) {
        apiKeyModal.style.display = 'flex';
    }
    
    // API Key form submission
    apiKeyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey) {
            localStorage.setItem('gemini_api_key', apiKey);
            apiKeyModal.style.display = 'none';
        }
    });
    
    // Chat form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;
        
        // Display user message
        addMessage(message, 'user');
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Get response from Gemini
        getGeminiResponse(message);
    });
    
    // Suggested question buttons
    questionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.dataset.question;
            userInput.value = question;
            
            // Trigger form submission
            const event = new Event('submit');
            chatForm.dispatchEvent(event);
        });
    });
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        // Add to chat history for context
        chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: text });
        
        // If it's from the assistant, render markdown
        if (sender === 'assistant' || sender === 'system') {
            // Process markdown with marked.js
            messageContent.innerHTML = marked.parse(text);
            
            // Apply syntax highlighting to code blocks
            messageContent.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } else {
            messageContent.textContent = text;
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Get response from Gemini API
    async function getGeminiResponse(message) {
        const apiKey = localStorage.getItem('gemini_api_key');
        
        if (!apiKey) {
            apiKeyModal.style.display = 'flex';
            return;
        }
        
        try {
            // Show loading animation
            loadingOverlay.style.display = 'flex';
            
            // Create context from previous messages (limited to last 10 for token efficiency)
            const recentHistory = chatHistory.slice(-10);
            
            // Prepare the system prompt to make the AI focus on farming
            const systemPrompt = {
                role: "system",
                content: `You are an AI farming assistant specialized in agricultural knowledge. Your expertise includes:
                1. Crop selection, cultivation, and care
                2. Soil health and management
                3. Pest and disease identification and control
                4. Agricultural best practices and innovations
                5. Sustainable and organic farming methods
                6. Weather impacts on agriculture
                7. Irrigation and water management

                Respond to user queries with accurate, helpful information about farming and agriculture.
                If asked about non-farming topics, politely redirect the conversation to agricultural topics.
                Use markdown formatting for your responses to improve readability.
                Keep your responses concise but informative.`
            };
            
            // Prepare messages array with system prompt and recent history
            const messages = [systemPrompt, ...recentHistory];
            
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: messages,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                }),
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract the response text
            let responseText = '';
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts) {
                responseText = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from API');
            }
            
            // Add AI response to chat
            addMessage(responseText, 'assistant');
            
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            addMessage(`**Error:** ${error.message || 'Failed to get response from AI.'}. Please check your API key and try again.`, 'system');
            
            // If API key issue, show modal again
            if (error.message && error.message.includes('API')) {
                localStorage.removeItem('gemini_api_key');
                setTimeout(() => {
                    apiKeyModal.style.display = 'flex';
                }, 1500);
            }
        } finally {
            // Hide loading animation
            loadingOverlay.style.display = 'none';
        }
    }
    
    // Auto-focus input field
    userInput.focus();
    
    // Fallback for API calls when offline or testing
    function getFallbackResponse(query) {
        const lowercaseQuery = query.toLowerCase();
        
        if (lowercaseQuery.includes('soil') && lowercaseQuery.includes('clay')) {
            return `### Crops That Grow Well in Clay Soil

Many crops can thrive in clay soil despite its challenges, especially when properly amended:

**Vegetables:**
- Broccoli and cauliflower
- Brussels sprouts
- Cabbage
- Beans and peas
- Potatoes (in raised beds)
- Leafy greens like kale and Swiss chard

**Fruits:**
- Pears
- Plums
- Apples (on appropriate rootstocks)
- Some berry varieties

**Grains:**
- Winter wheat
- Oats

Clay soil benefits from regular additions of organic matter to improve structure and drainage. Adding compost or aged manure before planting can significantly improve results.`;
        } else if (lowercaseQuery.includes('aphid') && (lowercaseQuery.includes('organic') || lowercaseQuery.includes('natural'))) {
            return `### Organic Aphid Management Strategies

Aphids can be controlled effectively with these organic methods:

**Biological Controls:**
- Introduce beneficial insects like ladybugs, lacewings, and parasitic wasps
- Create habitat for natural predators with diverse plantings

**Physical Controls:**
- Spray plants with strong water jet to dislodge aphids
- Use yellow sticky traps to capture flying aphids
- Remove heavily infested shoots and leaves

**Organic Sprays:**
- Neem oil solution (2 tsp neem oil, 1 tsp mild liquid soap, 1 quart water)
- Insecticidal soap spray
- Garlic or hot pepper spray

**Preventive Measures:**
- Avoid excessive nitrogen fertilization which encourages succulent growth
- Plant companion plants like marigolds, nasturtiums, and alliums
- Regular monitoring to catch infestations early

Apply treatments in early morning or evening to avoid harming beneficial insects.`;
        } else {
            return `I'm currently unable to connect to the Gemini API. Please check your internet connection and API key.

In the meantime, here are some general farming tips:

1. Rotate crops to interrupt pest cycles and improve soil health
2. Test your soil before planting to understand nutrient needs
3. Use cover crops to prevent erosion and add organic matter
4. Implement integrated pest management rather than relying solely on pesticides
5. Consider water conservation techniques like drip irrigation

Would you like to try another question when the connection is restored?`;
        }
    }
}); 