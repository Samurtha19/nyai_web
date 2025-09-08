// Chat Application Logic

class LegalChatApp {
    constructor() {
        this.engine = new LegalChatEngine();
        this.chats = [];
        this.currentChatId = null;
        this.isLoading = false;
        
        this.initializeElements();
        this.loadEngine();
        this.loadChatHistory();
        this.attachEventListeners();
    }

    initializeElements() {
        this.sidebar = document.getElementById('sidebar');
        this.chatHistory = document.getElementById('chatHistory');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.messages = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.totalDocs = document.getElementById('totalDocs');
        this.accuracy = document.getElementById('accuracy');
    }

    async loadEngine() {
        this.showLoading(true, 'Loading legal documents...');
        
        const success = await this.engine.loadData();
        if (success) {
            const stats = this.engine.getStats();
            this.totalDocs.textContent = stats.totalDocuments.toLocaleString();
            this.accuracy.textContent = stats.accuracy + '%';
            console.log('Engine loaded successfully');
        } else {
            console.error('Failed to load engine');
        }
        
        this.showLoading(false);
    }

    attachEventListeners() {
        // New chat button
        this.newChatBtn.addEventListener('click', () => this.createNewChat());

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Input handling
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 200) + 'px';
        });
    }

    createNewChat() {
        const chatId = this.generateChatId();
        const chat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date()
        };
        
        this.chats.unshift(chat);
        this.currentChatId = chatId;
        this.updateChatHistory();
        this.showWelcomeMessage();
        this.saveChatHistory();
        
        console.log('Created new chat:', chatId);
    }

    generateChatId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || this.isLoading) return;

        console.log('Sending message:', text);

        // Create chat if none exists
        if (!this.currentChatId) {
            this.createNewChat();
        }

        const currentChat = this.getCurrentChat();
        if (!currentChat) return;

        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Add user message
        const userMessage = {
            id: this.generateChatId(),
            type: 'user',
            content: text,
            timestamp: new Date()
        };

        currentChat.messages.push(userMessage);
        
        // Update title if first message
        if (currentChat.title === 'New Chat') {
            currentChat.title = text.length > 50 ? text.substring(0, 47) + '...' : text;
            this.updateChatHistory();
        }

        this.hideWelcomeMessage();
        this.renderMessages();
        this.scrollToBottom();

        // Show typing indicator
        this.showTypingIndicator();
        this.isLoading = true;
        this.sendBtn.disabled = true;

        try {
            // Search for relevant documents
            const searchResults = this.engine.search(text, 5);
            console.log('Search results:', searchResults);
            
            // Generate AI response
            const aiResponse = this.engine.generateAnswer(text, searchResults);
            console.log('AI response:', aiResponse);
            
            // Simulate thinking time
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

            // Add assistant message
            const assistantMessage = {
                id: this.generateChatId(),
                type: 'assistant',
                content: aiResponse.answer,
                sources: aiResponse.sources,
                timestamp: new Date()
            };

            currentChat.messages.push(assistantMessage);
            this.renderMessages();
            this.scrollToBottom();

        } catch (error) {
            console.error('Error generating response:', error);
            
            const errorMessage = {
                id: this.generateChatId(),
                type: 'assistant',
                content: "I apologize, but I encountered an error while processing your request. Please try rephrasing your question or contact support if the issue persists.",
                sources: [],
                timestamp: new Date()
            };

            currentChat.messages.push(errorMessage);
            this.renderMessages();
            this.scrollToBottom();
        } finally {
            this.hideTypingIndicator();
            this.isLoading = false;
            this.sendBtn.disabled = false;
            this.saveChatHistory();
        }
    }

    getCurrentChat() {
        return this.chats.find(chat => chat.id === this.currentChatId);
    }

    selectChat(chatId) {
        this.currentChatId = chatId;
        this.updateChatHistory();
        this.hideWelcomeMessage();
        this.renderMessages();
        this.scrollToBottom();
    }

    renderMessages() {
        if (!this.messages) return;
        
        const currentChat = this.getCurrentChat();
        if (!currentChat || currentChat.messages.length === 0) {
            this.messages.innerHTML = '';
            return;
        }

        this.messages.innerHTML = currentChat.messages.map(message => 
            this.renderMessage(message)
        ).join('');
    }

    renderMessage(message) {
        const isUser = message.type === 'user';
        const avatarClass = isUser ? 'user-avatar' : 'assistant-avatar';
        const messageClass = isUser ? 'user-message' : 'assistant-message';
        const avatarText = isUser ? 'U' : 'AI';
        
        const sourcesHtml = message.sources && message.sources.length > 0 ? `
            <div class="sources-container">
                <div class="sources-header">Sources Found:</div>
                ${message.sources.map(source => `
                    <div class="source-item">
                        <span class="source-confidence">${source.confidence}%</span>
                        <span class="source-text">${source.text}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="message ${messageClass}">
                <div class="message-content">
                    <div class="message-avatar ${avatarClass}">${avatarText}</div>
                    <div class="message-text">
                        ${this.formatMessageContent(message.content)}
                        ${sourcesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    formatMessageContent(content) {
        // Convert markdown-style formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.+)$/, '<p>$1</p>');
    }

    showTypingIndicator() {
        if (!this.messages) return;
        
        const typingHtml = `
            <div class="message assistant-message" id="typingIndicator">
                <div class="message-content">
                    <div class="message-avatar assistant-avatar">AI</div>
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.messages.insertAdjacentHTML('beforeend', typingHtml);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateChatHistory() {
        if (!this.chatHistory) return;
        
        this.chatHistory.innerHTML = this.chats.map(chat => {
            const isActive = chat.id === this.currentChatId;
            const preview = chat.messages.length > 0 ? 
                chat.messages[chat.messages.length - 1].content.substring(0, 50) + '...' : 
                'No messages yet';
            
            return `
                <div class="chat-item ${isActive ? 'active' : ''}" onclick="app.selectChat('${chat.id}')">
                    <div class="chat-item-title">${chat.title}</div>
                    <div class="chat-item-preview">${preview}</div>
                </div>
            `;
        }).join('');
    }

    showWelcomeMessage() {
        if (this.welcomeMessage && this.messages) {
            this.welcomeMessage.style.display = 'flex';
            this.messages.style.display = 'none';
        }
    }

    hideWelcomeMessage() {
        if (this.welcomeMessage && this.messages) {
            this.welcomeMessage.style.display = 'none';
            this.messages.style.display = 'block';
        }
    }

    showLoading(show, message = 'Loading...') {
        if (!this.loadingOverlay) return;
        
        if (show) {
            this.loadingOverlay.style.display = 'flex';
            const loadingText = this.loadingOverlay.querySelector('p');
            if (loadingText) loadingText.textContent = message;
        } else {
            this.loadingOverlay.style.display = 'none';
        }
    }

    scrollToBottom() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
    }

    saveChatHistory() {
        try {
            const data = {
                chats: this.chats,
                currentChatId: this.currentChatId
            };
            localStorage.setItem('legalChatHistory', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('legalChatHistory');
            if (saved) {
                const data = JSON.parse(saved);
                this.chats = data.chats || [];
                this.currentChatId = data.currentChatId;
                
                // Convert date strings back to Date objects
                this.chats.forEach(chat => {
                    chat.createdAt = new Date(chat.createdAt);
                    chat.messages.forEach(message => {
                        message.timestamp = new Date(message.timestamp);
                    });
                });
                
                this.updateChatHistory();
                
                if (this.currentChatId && this.getCurrentChat()) {
                    this.hideWelcomeMessage();
                    this.renderMessages();
                } else {
                    this.showWelcomeMessage();
                }
            } else {
                this.showWelcomeMessage();
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            this.showWelcomeMessage();
        }
    }
}

// Global function for example questions
function askExample(question) {
    if (window.app && window.app.messageInput) {
        window.app.messageInput.value = question;
        window.app.sendMessage();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LegalChatApp();
    console.log('Legal Chat App initialized');
});