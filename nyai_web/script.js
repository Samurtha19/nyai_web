// NyaAI Legal Information Retrieval System
// Advanced JavaScript Search Engine with BM25 Algorithm

class NyaAISearchEngine {
    constructor() {
        this.searchData = null;
        this.isLoading = false;
        this.currentQuery = '';
        this.searchHistory = [];
        this.maxHistory = 10;
        this.modelName = 'BM25';
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🔄 Loading NyaAI search data...');
            this.showLoadingState();
            
            // Try to load the lightweight dataset first
            const response = await fetch('web_deployment_lightweight.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.searchData = await response.json();
            console.log('✅ Search data loaded successfully');
            console.log(`📊 Model: ${this.searchData.config.model_name}`);
            console.log(`📚 Documents: ${this.searchData.documents.length}`);
            
            this.setupEventListeners();
            this.updateUIWithConfig();
            this.hideLoadingState();
            
        } catch (error) {
            console.error('❌ Error loading search data:', error);
            this.showError('Failed to load search data. Please ensure web_deployment_lightweight.json is in the same folder as this HTML file.');
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');

        // Search functionality
        searchButton.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Real-time suggestions
        searchInput.addEventListener('input', (e) => {
            this.handleInputChange(e.target.value);
        });

        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });

        console.log('🎯 Event listeners set up successfully');
    }

    updateUIWithConfig() {
        if (this.searchData && this.searchData.config) {
            const config = this.searchData.config;
            
            // Update document count
            const docCountElement = document.getElementById('docCount');
            if (docCountElement) {
                docCountElement.textContent = this.searchData.documents.length;
            }
            
            // Update model name
            const modelNameElement = document.getElementById('modelName');
            if (modelNameElement) {
                modelNameElement.textContent = config.model_name;
            }
            
            // Update accuracy
            const accuracyElement = document.getElementById('accuracy');
            if (accuracyElement && config.performance_metrics) {
                const f1Score = config.performance_metrics.f1 || config.performance_metrics['f1@5'] || 0.806;
                accuracyElement.textContent = `${(f1Score * 100).toFixed(1)}%`;
            }
            
            // Update model info
            const modelInfoElement = document.getElementById('modelInfo');
            if (modelInfoElement && config.performance_metrics) {
                const f1Score = config.performance_metrics.f1 || config.performance_metrics['f1@5'] || 0.806;
                modelInfoElement.textContent = `Powered by ${config.model_name} • F1 Score: ${f1Score.toFixed(3)}`;
            }
        }
    }

    handleInputChange(value) {
        this.currentQuery = value;
        
        // Clear previous timeout
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
        }
        
        // Debounce suggestions
        this.inputTimeout = setTimeout(() => {
            if (value.length > 2) {
                this.showSuggestions(value);
            } else {
                this.hideSuggestions();
            }
        }, 300);
    }

    showSuggestions(query) {
        const suggestions = document.getElementById('searchSuggestions');
        if (!suggestions || !this.searchData) return;
        
        const suggestedTerms = this.findRelatedTerms(query);
        if (suggestedTerms.length > 0) {
            suggestions.innerHTML = suggestedTerms.map(term => 
                `<div class="suggestion-item" onclick="legalSearch.selectSuggestion('${term.replace(/'/g, "\\'")}')">${term}</div>`
            ).join('');
            suggestions.style.display = 'block';
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    selectSuggestion(term) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = term;
            this.hideSuggestions();
            this.performSearch();
        }
    }

    findRelatedTerms(query) {
        if (!this.searchData) return [];
        
        const queryLower = query.toLowerCase();
        const relatedTerms = new Set();
        
        // Search through metadata for related terms
        for (const metadata of this.searchData.metadata.slice(0, 50)) {
            if (metadata.name && metadata.name.toLowerCase().includes(queryLower)) {
                relatedTerms.add(metadata.name);
            }
            if (metadata.original_query && metadata.original_query.toLowerCase().includes(queryLower)) {
                relatedTerms.add(metadata.original_query);
            }
        }
        
        return Array.from(relatedTerms).slice(0, 5);
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        
        if (!query) {
            this.showError('Please enter a search query.');
            return;
        }

        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.currentQuery = query;
        this.addToHistory(query);
        this.showLoading();
        this.hideSuggestions();

        try {
            const startTime = performance.now();
            const results = await this.searchDocuments(query);
            const endTime = performance.now();
            const searchTime = ((endTime - startTime) / 1000).toFixed(3);
            
            console.log(`🔍 Search completed in ${searchTime}s`);
            this.displayResults(results, query, searchTime);
            
        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError('An error occurred during search. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    async searchDocuments(query) {
        if (!this.searchData) {
            throw new Error('Search data not loaded');
        }

        console.log('🔍 Using BM25 search algorithm');
        return this.bm25Search(query);
    }

    bm25Search(query) {
        const queryLower = query.toLowerCase();
        const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 1);
        
        const results = [];
        const k1 = 1.5;  // BM25 parameter
        const b = 0.75;  // BM25 parameter
        
        // Calculate average document length
        const avgDocLength = this.searchData.documents.reduce((sum, doc) => 
            sum + doc.split(' ').length, 0) / this.searchData.documents.length;
        
        for (let i = 0; i < this.searchData.documents.length; i++) {
            const doc = this.searchData.documents[i];
            const metadata = this.searchData.metadata[i];
            const docLower = doc.toLowerCase();
            const docLength = doc.split(' ').length;
            
            let score = 0;
            let matchedTerms = 0;
            
            // Calculate BM25 score for each term
            for (const term of queryTerms) {
                let termScore = 0;
                
                // Exact phrase bonus
                if (docLower.includes(queryLower)) {
                    termScore += 10;
                }
                
                // Term frequency in document
                const termFreq = (docLower.match(new RegExp(term, 'g')) || []).length;
                
                if (termFreq > 0) {
                    matchedTerms++;
                    
                    // Document frequency (simplified - using term frequency as proxy)
                    const docFreq = Math.max(1, termFreq);
                    
                    // IDF calculation
                    const idf = Math.log((this.searchData.documents.length - docFreq + 0.5) / (docFreq + 0.5));
                    
                    // TF normalization
                    const tf = termFreq / (termFreq + k1 * (1 - b + b * (docLength / avgDocLength)));
                    
                    termScore += idf * tf * 10;
                }
                
                // Boost for matches in important fields
                if (metadata.name && metadata.name.toLowerCase().includes(term)) {
                    termScore += 8;
                }
                if (metadata.original_query && metadata.original_query.toLowerCase().includes(term)) {
                    termScore += 15; // Highest boost for query matches
                }
                if (metadata.section && metadata.section.toLowerCase().includes(term)) {
                    termScore += 5;
                }
                if (metadata.victim && metadata.victim.toLowerCase().includes(term)) {
                    termScore += 3;
                }
                
                score += termScore;
            }
            
            // Apply coverage bonus
            const coverage = matchedTerms / queryTerms.length;
            score *= (0.3 + 0.7 * coverage);
            
            if (score > 0 && matchedTerms > 0) {
                results.push({
                    index: i,
                    score: score,
                    document: doc,
                    metadata: metadata,
                    matchedTerms: matchedTerms,
                    totalTerms: queryTerms.length,
                    coverage: coverage
                });
            }
        }
        
        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);
        
        console.log(`📊 Found ${results.length} results using BM25 algorithm`);
        return results.slice(0, 10); // Return top 10 results
    }

    addToHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > this.maxHistory) {
                this.searchHistory.pop();
            }
        }
        console.log('📝 Search history updated:', this.searchHistory);
    }

    showLoadingState() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>🔍 Searching legal documents...</p>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
                        Using ${this.modelName} algorithm
                    </p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        // Loading state will be replaced by search results or hidden
    }

    showLoading() {
        this.showLoadingState();
    }

    displayResults(results, query, searchTime) {
        const resultsSection = document.getElementById('resultsSection');
        
        if (results.length === 0) {
            resultsSection.innerHTML = `
                <div class="results-header">
                    <h2><i class="fas fa-search-minus"></i> No Results Found</h2>
                    <span class="results-count">0 results</span>
                </div>
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No documents found for "${query}"</h3>
                    <p>Try different keywords, check spelling, or use simpler terms.</p>
                    <div style="margin-top: 20px;">
                        <strong>Suggestions:</strong>
                        <ul style="text-align: left; display: inline-block; margin-top: 10px;">
                            <li>Use broader terms (e.g., "cyber crime" instead of specific types)</li>
                            <li>Try synonyms or related words</li>
                            <li>Check for spelling errors</li>
                            <li>Use simpler language</li>
                        </ul>
                    </div>
                </div>
            `;
            resultsSection.style.display = 'block';
            return;
        }

        let resultsHtml = `
            <div class="results-header">
                <h2><i class="fas fa-search-plus"></i> Search Results</h2>
                <span class="results-count">${results.length} results (${searchTime}s)</span>
            </div>
            <div class="search-results">
        `;

        results.forEach((result, index) => {
            const confidence = Math.min(100, Math.round((result.score / Math.max(1, results[0].score)) * 100));
            const metadata = result.metadata;
            
            // Determine confidence class
            let confidenceClass = 'confidence-score';
            if (confidence >= 80) confidenceClass += ' high-confidence';
            else if (confidence >= 60) confidenceClass += ' medium-confidence';
            else confidenceClass += ' low-confidence';
            
            resultsHtml += `
                <div class="result-item" data-index="${result.index}" data-score="${result.score}">
                    <div class="result-header">
                        <div class="result-rank">${index + 1}</div>
                        <div class="${confidenceClass}">${confidence}% match</div>
                    </div>
                    <div class="result-content">
                        <h4 class="result-title">${metadata.name || 'Legal Provision'}</h4>
                        <div class="result-meta">
                            ${metadata.act ? `<span><i class="fas fa-file-alt"></i> ${metadata.act}</span>` : ''}
                            ${metadata.section ? `<span><i class="fas fa-bookmark"></i> ${metadata.section}</span>` : ''}
                            ${metadata.victim ? `<span><i class="fas fa-users"></i> ${this.truncateText(metadata.victim, 40)}</span>` : ''}
                            <span><i class="fas fa-chart-line"></i> ${result.matchedTerms}/${result.totalTerms} terms</span>
                        </div>
                        <div class="result-text">
                            <strong>Question:</strong> ${this.highlightText(metadata.original_query || 'N/A', query)}
                        </div>
                        ${metadata.law ? `
                            <div class="result-law">
                                <strong><i class="fas fa-gavel"></i> Legal Provision:</strong><br>
                                ${this.highlightText(this.truncateText(metadata.law, 600), query)}
                                ${metadata.law.length > 600 ? '<br><em style="color: #666;">... (click copy to see full text)</em>' : ''}
                            </div>
                        ` : ''}
                        <div class="result-actions">
                            <button onclick="legalSearch.copyResult(${index})" class="btn-copy" title="Copy full result">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        resultsHtml += '</div>';
        resultsSection.innerHTML = resultsHtml;
        resultsSection.style.display = 'block';
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Log search analytics
        this.logSearchAnalytics(query, results.length, searchTime);
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        
        const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
        let highlightedText = text;
        
        queryTerms.forEach(term => {
            const regex = new RegExp(`(\\b${term}\\b)`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }

    copyResult(index) {
        const resultElement = document.querySelector(`[data-index="${index}"]`);
        if (!resultElement) return;
        
        const title = resultElement.querySelector('.result-title').textContent;
        const question = resultElement.querySelector('.result-text').textContent;
        const lawElement = resultElement.querySelector('.result-law');
        
        let copyText = `${title}\n\n${question}`;
        if (lawElement) {
            copyText += `\n\n${lawElement.textContent}`;
        }
        copyText += `\n\nSource: NyaAI Legal Information Retrieval System`;
        
        this.copyToClipboard(copyText);
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('✅ Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('✅ Copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('❌ Failed to copy', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    logSearchAnalytics(query, resultCount, searchTime) {
        const analytics = {
            timestamp: new Date().toISOString(),
            query: query,
            resultCount: resultCount,
            searchTime: parseFloat(searchTime),
            model: this.modelName
        };
        
        console.log('📊 Search Analytics:', analytics);
        
        // In a production environment, you would send this to an analytics service
        // Example: this.sendToAnalytics(analytics);
    }

    showError(message) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
                <strong>Error:</strong> ${message}
                <div style="margin-top: 15px; font-size: 0.9rem;">
                    Make sure the web_deployment_lightweight.json file is in the same folder as this HTML file.
                </div>
            </div>
        `;
    }

    // Public method to get search statistics
    getSearchStatistics() {
        return {
            totalSearches: this.searchHistory.length,
            modelName: this.modelName,
            searchHistory: this.searchHistory,
            documentsLoaded: this.searchData ? this.searchData.documents.length : 0
        };
    }
}

// Helper function for example queries
function searchExample(query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        if (window.legalSearch) {
            window.legalSearch.performSearch();
        }
    }
}

// Initialize the search engine when the page loads
let legalSearch;
document.addEventListener('DOMContentLoaded', () => {
    legalSearch = new NyaAISearchEngine();
    window.legalSearch = legalSearch; // Make it globally accessible
    console.log('🚀 NyaAI Legal Information Retrieval System initialized');
});

// Export for global access
window.searchExample = searchExample;