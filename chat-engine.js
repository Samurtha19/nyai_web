// COMPLETE Enhanced Legal Chat Engine - Preserves All Original Functions

class LegalChatEngine {
    constructor() {
        this.documents = [];
        this.metadata = [];
        this.config = {};
        this.isLoaded = false;
        this.docFrequency = new Map();
        this.avgDocLength = 0;
        this.termFrequency = new Map();
        this.answerGenerator = null;
        
        // Initialize enhanced answer generator
        this.initializeEnhancedAnswerGenerator();
    }

    async loadData() {
        try {
            const fileName = 'web_deployment_full.json';
            
            console.log(`Attempting to load ${fileName}...`);
            const response = await fetch(fileName);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${fileName}: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Successfully loaded ${fileName}`);
            
            this.documents = data.documents || [];
            this.metadata = data.metadata || [];
            this.config = data.config || {};
            
            if (this.documents.length === 0) {
                throw new Error('No documents found in the data file');
            }
            
            this.preprocessDocuments();
            this.isLoaded = true;
            
            console.log(`✅ Successfully loaded ${this.documents.length} legal documents`);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to load legal documents:', error);
            return false;
        }
    }

    preprocessDocuments() {
        const docLengths = [];
        this.docFrequency.clear();
        this.termFrequency.clear();
        
        console.log('🔄 Preprocessing documents...');
        
        this.documents.forEach((doc, index) => {
            if (index % 500 === 0) console.log(`Processing document ${index}...`);
            
            const tokens = this.tokenize(doc);
            docLengths.push(tokens.length);
            
            const uniqueTokens = new Set(tokens);
            uniqueTokens.forEach(token => {
                this.docFrequency.set(token, (this.docFrequency.get(token) || 0) + 1);
            });
            
            tokens.forEach(token => {
                this.termFrequency.set(token, (this.termFrequency.get(token) || 0) + 1);
            });
        });
        
        this.avgDocLength = docLengths.reduce((a, b) => a + b, 0) / docLengths.length;
        console.log(`✅ Preprocessing complete - ${this.docFrequency.size} unique terms found`);
    }

    tokenize(text) {
        if (!text || typeof text !== 'string') return [];
        
        return text.toLowerCase()
            .replace(/[^\w\s\u0980-\u09FF\u0900-\u097F]/g, ' ')
            .replace(/\b(\w+)\s*(\d+)\b/g, '$1$2')
            .split(/\s+/)
            .filter(token => token.length > 1)
            .filter(token => !this.isStopWord(token));
    }

    isStopWord(word) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
        ]);
        return stopWords.has(word.toLowerCase());
    }

    // QUERY CLASSIFICATION - Distinguishes legal vs general chat
    classifyQuery(query) {
        const queryLower = query.toLowerCase().trim();
        
        const generalChatPatterns = [
            /^(hi|hello|hey|good morning|good afternoon|good evening)$/,
            /^(hi there|hello there|hey there)$/,
            /^(what'?s your name|who are you|what are you)$/,
            /^(how are you|how do you do)$/,
            /^(what can you do|what do you know)$/,
            /^(are you (a )?robot|are you (an )?ai|are you human)$/,
            /^(thank you|thanks|bye|goodbye|see you)$/,
            /^(how'?s (the )?weather|what'?s the weather)$/,
            /^(what time is it|what'?s the time)$/,
            /^(tell me a joke|make me laugh)$/,
            /^(what'?s \d+ plus \d+|calculate \d+)/,
            /^(what'?s your favorite|do you like)/,
            /^(how old are you|when were you (born|made))/,
        ];
        
        for (const pattern of generalChatPatterns) {
            if (pattern.test(queryLower)) {
                return 'general_chat';
            }
        }
        
        const legalIndicators = [
            'law', 'legal', 'act', 'section', 'penalty', 'punishment', 'fine', 'crime',
            'cyber', 'digital', 'computer', 'hacking', 'unauthorized', 'breach',
            'data protection', 'privacy', 'security', 'violation', 'illegal',
            'court', 'judge', 'lawyer', 'attorney', 'case', 'ruling'
        ];
        
        const hasLegalTerms = legalIndicators.some(term => queryLower.includes(term));
        if (hasLegalTerms) return 'legal_query';
        
        const questionPatterns = [
            /^(what|how|when|where|why|which|who)/,
            /^(is it|can i|should i|may i|must i)/,
            /^(define|explain|describe|tell me about)/,
            /(penalty|punishment|consequences|liable|responsible)/,
            /(procedure|process|steps|requirements)/
        ];
        
        const isQuestion = questionPatterns.some(pattern => pattern.test(queryLower));
        const wordCount = queryLower.split(/\s+/).length;
        
        if (isQuestion && wordCount > 3) return 'potential_legal';
        if (wordCount <= 3 && !hasLegalTerms) return 'general_chat';
        
        return 'potential_legal';
    }

    handleGeneralChat(query) {
        const queryLower = query.toLowerCase().trim();
        
        if (/^(hi|hello|hey)/.test(queryLower)) {
            return "Hello! I'm NyaAI, your legal assistant for Bangladeshi cyber security law. How can I help you with legal questions today?";
        }
        
        if (/what'?s your name|who are you/.test(queryLower)) {
            return "I'm NyaAI Legal Assistant, designed to help answer questions about Bangladeshi cyber security law and digital legislation. What legal topic would you like to explore?";
        }
        
        if (/how are you/.test(queryLower)) {
            return "I'm functioning well and ready to help with your legal questions! I have access to legal documents about cyber security law. What would you like to know?";
        }
        
        if (/what can you do|what do you know/.test(queryLower)) {
            return "I can help you understand Bangladeshi cyber security law by:\n\n• Explaining legal definitions and concepts\n• Finding relevant penalties and punishments\n• Describing legal procedures and processes\n• Answering questions about digital rights and protections\n\nTry asking about cyber crimes, data protection, or digital security laws!";
        }
        
        if (/are you (a )?robot|are you (an )?ai/.test(queryLower)) {
            return "Yes, I'm an AI legal assistant specialized in Bangladeshi cyber security law. I can search through legal documents and provide relevant information to help answer your legal questions.";
        }
        
        if (/thank you|thanks/.test(queryLower)) {
            return "You're welcome! Feel free to ask me anything about Bangladeshi cyber security law anytime.";
        }
        
        if (/bye|goodbye/.test(queryLower)) {
            return "Goodbye! Come back anytime you have questions about cyber security law or digital legal matters.";
        }
        
        return "I'm a legal assistant focused on Bangladeshi cyber security law. I'm not equipped to answer general questions, but I'd be happy to help with legal topics like cyber crimes, data protection, digital security, or related legal matters. What legal question can I help you with?";
    }

    search(query, maxResults = 8) {
        if (!this.isLoaded || !query.trim()) {
            return { results: [], total: 0 };
        }

        const queryType = this.classifyQuery(query);
        
        if (queryType === 'general_chat') {
            return { 
                results: [], 
                total: 0, 
                isGeneralChat: true,
                chatResponse: this.handleGeneralChat(query)
            };
        }
        
        // Special handling for women's rights queries to ensure they get relevant results
        const queryLower = query.toLowerCase();
        if ((queryLower.includes('woman') || queryLower.includes('women') || queryLower.includes('girl') || 
             queryLower.includes('female') || queryLower.includes('wife')) && 
            (queryLower.includes('abuse') || queryLower.includes('victim') || queryLower.includes('violence') || 
             queryLower.includes('harassment'))) {
                
            // Add specific search terms to get better document matches
            query = query + " prevention of oppression against women and children act";
        }
        
        // Special handling for children's rights queries
        else if ((queryLower.includes('child') || queryLower.includes('children') || 
                 queryLower.includes('minor') || queryLower.includes('juvenile') || 
                 queryLower.includes('underage'))) {
            
            // Add specific search terms based on query topic
            if (queryLower.includes('labor') || queryLower.includes('labour') || queryLower.includes('work') || 
                queryLower.includes('employ')) {
                query = query + " Bangladesh Labour Act children employment";
            } else if (queryLower.includes('abuse') || queryLower.includes('harm') || queryLower.includes('hurt')) {
                query = query + " Children Act protection from harm abuse";
            } else if (queryLower.includes('education') || queryLower.includes('school')) {
                query = query + " education right to education compulsory primary";
            } else {
                query = query + " Children Act 2013 rights protection";
            }
        }

        console.log(`🔍 Searching for: "${query}" (Type: ${queryType})`);
        
        const queryTokens = this.tokenize(query);
        const expandedQuery = this.expandQueryDynamically(queryTokens, query);
        
        console.log('📝 Original tokens:', queryTokens);
        console.log('🔄 Expanded tokens:', expandedQuery);

        const scores = [];
        const startTime = Date.now();

        for (let i = 0; i < this.documents.length; i++) {
            const bm25Score = this.calculateBM25Score(expandedQuery, i);
            const semanticBoost = this.calculateSemanticBoost(query, this.documents[i], queryTokens);
            const contextBoost = this.calculateContextualRelevance(queryTokens, this.documents[i]);
            
            const finalScore = bm25Score * (1 + semanticBoost + contextBoost);
            
            if (finalScore > 0.01) {
                scores.push({
                    index: i,
                    score: finalScore,
                    bm25Score: bm25Score,
                    semanticBoost: semanticBoost,
                    contextBoost: contextBoost,
                    document: this.documents[i],
                    metadata: this.metadata[i] || {}
                });
            }
        }

        const searchTime = Date.now() - startTime;
        console.log(`⏱️ Search completed in ${searchTime}ms, found ${scores.length} relevant documents`);

        scores.sort((a, b) => b.score - a.score);
        const topResults = scores.slice(0, maxResults);

        return {
            results: topResults.map(result => ({
                ...result,
                confidence: this.calculateConfidence(result.score, scores, query, result.document)
            })),
            total: scores.length,
            searchTime: searchTime
        };
    }

    expandQueryDynamically(queryTokens, originalQuery) {
        const expanded = [...queryTokens];
        
        const contextualSynonyms = this.findContextualSynonyms(queryTokens, originalQuery);
        expanded.push(...contextualSynonyms);
        
        const variations = this.generateWordVariations(queryTokens);
        expanded.push(...variations);
        
        const relatedTerms = this.findRelatedTerms(queryTokens);
        expanded.push(...relatedTerms);
        
        return [...new Set(expanded)];
    }

    findContextualSynonyms(queryTokens, query) {
        const synonyms = [];
        const queryLower = query.toLowerCase();
        
        const synonymMap = {
            'penalty': ['punishment', 'fine', 'sanction', 'sentence'],
            'punishment': ['penalty', 'fine', 'sentence'],
            'crime': ['offense', 'offence', 'violation', 'breach'],
            'law': ['act', 'legislation', 'statute', 'rule', 'regulation'],
            'computer': ['digital', 'electronic', 'cyber'],
            'hacking': ['unauthorized', 'intrusion', 'breach', 'attack'],
            'data': ['information', 'record', 'file'],
            'protection': ['security', 'safety', 'safeguard'],
            'illegal': ['unlawful', 'prohibited', 'forbidden'],
            'access': ['entry', 'login', 'use'],
            'network': ['system', 'infrastructure'],
            'privacy': ['confidentiality', 'secrecy']
        };
        
        if (queryLower.includes('cyber') || queryLower.includes('digital') || queryLower.includes('computer')) {
            synonyms.push('technology', 'electronic', 'online', 'internet');
        }
        
        if (queryLower.includes('security') || queryLower.includes('protection')) {
            synonyms.push('safety', 'defense', 'safeguard');
        }
        
        queryTokens.forEach(token => {
            if (synonymMap[token]) {
                synonyms.push(...synonymMap[token]);
            }
        });
        
        return synonyms;
    }

    generateWordVariations(queryTokens) {
        const variations = [];
        
        queryTokens.forEach(token => {
            if (token.endsWith('s') && token.length > 3) {
                variations.push(token.slice(0, -1));
            } else {
                variations.push(token + 's');
            }
            
            if (token.endsWith('ing')) {
                variations.push(token.slice(0, -3));
                variations.push(token.slice(0, -3) + 'ed');
            }
            
            if (token.endsWith('ed')) {
                variations.push(token.slice(0, -2));
                variations.push(token.slice(0, -2) + 'ing');
            }
            
            if (!token.includes('tion')) {
                variations.push(token + 'tion');
            }
        });
        
        return variations;
    }

    findRelatedTerms(queryTokens) {
        const related = [];
        
        queryTokens.forEach(token => {
            const cooccurringTerms = this.getCooccurringTerms(token);
            related.push(...cooccurringTerms.slice(0, 3));
        });
        
        return related;
    }

    getCooccurringTerms(token) {
        const related = [];
        
        const legalPairs = {
            'cyber': ['security', 'crime', 'attack', 'law'],
            'data': ['protection', 'breach', 'privacy', 'security'],
            'unauthorized': ['access', 'use', 'entry'],
            'digital': ['security', 'crime', 'law', 'act'],
            'computer': ['system', 'network', 'security'],
            'penalty': ['fine', 'imprisonment', 'punishment'],
            'section': ['subsection', 'act', 'law'],
            'violation': ['breach', 'infringement']
        };
        
        if (legalPairs[token]) {
            related.push(...legalPairs[token]);
        }
        
        return related;
    }

    calculateSemanticBoost(query, document, queryTokens) {
        let boost = 0;
        const queryLower = query.toLowerCase();
        const docLower = document.toLowerCase();
        
        if (docLower.includes(queryLower)) {
            boost += 1.0;
        }
        
        const queryWords = queryLower.split(/\s+/);
        for (let i = 0; i <= queryWords.length - 2; i++) {
            const phrase = queryWords.slice(i, i + 2).join(' ');
            if (docLower.includes(phrase)) {
                boost += 0.3;
            }
        }
        
        const conceptDensity = queryTokens.filter(token => 
            docLower.includes(token)
        ).length / queryTokens.length;
        
        boost += conceptDensity * 0.5;
        
        return Math.min(boost, 1.5);
    }

    calculateContextualRelevance(queryTokens, document) {
        let relevance = 0;
        const docLower = document.toLowerCase();
        
        if (docLower.includes('section') || docLower.includes('subsection')) relevance += 0.1;
        if (docLower.includes('act') || docLower.includes('law')) relevance += 0.1;
        if (docLower.includes('shall') || docLower.includes('must')) relevance += 0.1;
        if (docLower.includes('penalty') || docLower.includes('punishment')) relevance += 0.2;
        if (docLower.includes('defined') || docLower.includes('means')) relevance += 0.1;
        if (docLower.includes('procedure') || docLower.includes('process')) relevance += 0.1;
        
        const proximityBonus = this.calculateTermProximity(queryTokens, document);
        relevance += proximityBonus;
        
        return Math.min(relevance, 0.8);
    }

    calculateTermProximity(queryTokens, document) {
        const docTokens = this.tokenize(document);
        let proximityScore = 0;
        
        for (let i = 0; i < queryTokens.length - 1; i++) {
            const term1 = queryTokens[i];
            const term2 = queryTokens[i + 1];
            
            const pos1 = docTokens.indexOf(term1);
            const pos2 = docTokens.indexOf(term2);
            
            if (pos1 !== -1 && pos2 !== -1) {
                const distance = Math.abs(pos1 - pos2);
                if (distance <= 5) {
                    proximityScore += 0.2 / distance;
                }
            }
        }
        
        return Math.min(proximityScore, 0.5);
    }

    calculateBM25Score(queryTokens, docIndex, k1 = 1.2, b = 0.75) {
        const doc = this.tokenize(this.documents[docIndex]);
        const docLength = doc.length;
        
        if (docLength === 0) return 0;
        
        const termFreq = new Map();
        doc.forEach(term => {
            termFreq.set(term, (termFreq.get(term) || 0) + 1);
        });

        let score = 0;
        queryTokens.forEach(term => {
            const tf = termFreq.get(term) || 0;
            if (tf > 0) {
                const df = this.docFrequency.get(term) || 0;
                if (df > 0) {
                    const idf = Math.log((this.documents.length - df + 0.5) / (df + 0.5));
                    const numerator = tf * (k1 + 1);
                    const denominator = tf + k1 * (1 - b + b * (docLength / this.avgDocLength));
                    score += idf * (numerator / denominator);
                }
            }
        });

        return Math.max(0, score);
    }

    calculateConfidence(score, allScores, query, document) {
        if (allScores.length === 0) return 60;
        
        const maxScore = Math.max(...allScores.map(s => s.score));
        const normalizedScore = maxScore > 0 ? score / maxScore : 0;
        
        let confidence = 60 + normalizedScore * 30;
        
        if (document.toLowerCase().includes(query.toLowerCase())) {
            confidence += 5;
        }
        
        const queryTokens = this.tokenize(query);
        const matchedTerms = queryTokens.filter(token => 
            document.toLowerCase().includes(token)
        ).length;
        
        const matchRatio = queryTokens.length > 0 ? matchedTerms / queryTokens.length : 0;
        confidence += matchRatio * 10;
        
        return Math.max(55, Math.min(95, Math.round(confidence)));
    }

    // ENHANCED ANSWER GENERATION WITH LEGAL KNOWLEDGE BASE
    initializeEnhancedAnswerGenerator() {
        this.legalKnowledgeBase = {
            womensRights: {
                'domestic_violence': {
                    commonSections: ['Prevention of Oppression Against Women and Children Act, Sections 9, 10, 11'],
                    typicalPenalties: 'Up to 14 years imprisonment depending on severity and/or fine',
                    description: 'Physical, mental, or sexual abuse against women within domestic relationships',
                    procedures: [
                        'File complaint with nearest police station or Women and Children Repression Prevention Tribunal',
                        'Preserve medical evidence if there are physical injuries',
                        'Contact legal aid for assistance',
                        'Apply for protective orders if needed'
                    ]
                },
                'sexual_harassment': {
                    commonSections: ['Prevention of Oppression Against Women and Children Act, Sections 9, 10'],
                    typicalPenalties: 'Up to 10 years imprisonment and/or fine',
                    description: 'Unwanted sexual behavior including physical advances, remarks, or requests for sexual favors',
                    procedures: [
                        'Report to police station or Women and Children Repression Prevention Tribunal',
                        'Document all incidents with dates and times',
                        'Identify witnesses if available',
                        'Seek support from women\'s rights organizations'
                    ]
                },
                'women_abuse': {
                    commonSections: ['Prevention of Oppression Against Women and Children Act', 'Domestic Violence Act'],
                    typicalPenalties: 'Up to 14 years imprisonment depending on type and severity',
                    description: 'Any form of physical, sexual, psychological, or economic abuse against women',
                    procedures: [
                        'Report to nearest police station',
                        'Visit One-Stop Crisis Center for medical, legal, and psychological support',
                        'Contact National Helpline for Violence Against Women: 109',
                        'Seek assistance from women\'s rights organizations'
                    ]
                }
            },
            childrensRights: {
                'child_labor': {
                    commonSections: ['Bangladesh Labour Act 2006 (amended 2013)', 'Children Act 2013'],
                    typicalPenalties: 'Imprisonment up to 1 year and/or fine up to 5,000 taka for employers',
                    description: 'Employment of children under 14 years in any occupation or enterprise. Limited employment permitted for children aged 14-18 with restrictions on working hours and conditions.',
                    procedures: [
                        'Report to Department of Labour or nearest police station',
                        'Provide details about the employer and workplace',
                        'Contact child welfare organizations or Child Helpline: 1098',
                        'Child may be rescued and placed in protective care'
                    ],
                    additionalInfo: 'The Bangladesh Labour Act prohibits employment of children under 14. Children between 14-18 are considered adolescents and may work with restrictions: no hazardous work, maximum 5 hour workday, no night work (7pm-7am), and must have education opportunities.'
                },
                'child_abuse': {
                    commonSections: ['Children Act 2013, Sections 70-76', 'Prevention of Oppression Against Women and Children Act'],
                    typicalPenalties: 'Up to 14 years imprisonment and/or fine depending on severity',
                    description: 'Physical, emotional, or sexual abuse of children, including exploitation and neglect',
                    procedures: [
                        'Report to Child Affairs Police Officer or nearest police station',
                        'Contact Department of Social Services or Child Welfare Board',
                        'Call Child Helpline: 1098 for immediate assistance',
                        'Child may be placed in protective custody during investigation'
                    ]
                },
                'child_education': {
                    commonSections: ['Compulsory Primary Education Act', 'Children Act 2013'],
                    typicalPenalties: 'Not explicitly defined for guardians, but schools refusing admission can face penalties',
                    description: 'Every child has the right to education. Primary education is compulsory and free in Bangladesh.',
                    procedures: [
                        'Report to local education authorities if a child is denied education',
                        'Contact the Upazila Education Officer',
                        'Seek assistance from NGOs focused on children\'s education',
                        'For underprivileged children, apply for educational stipends'
                    ]
                },
                'child_trafficking': {
                    commonSections: ['Prevention and Suppression of Human Trafficking Act 2012', 'Children Act 2013'],
                    typicalPenalties: 'Imprisonment for life or up to 14 years and fine',
                    description: 'Trafficking of children for any purpose including labor, sexual exploitation, or other forms of exploitation',
                    procedures: [
                        'Report to police immediately',
                        'Contact Anti-Human Trafficking Offence Tribunal',
                        'Call National Helpline: 109 or Child Helpline: 1098',
                        'Victim entitled to protection, rehabilitation, and compensation'
                    ]
                }
            },
            cyberCrimes: {
                'unauthorized_access': {
                    commonSections: ['Section 32', 'Section 54'],
                    typicalPenalties: 'Up to 5 years imprisonment and/or fine up to 10 lakh taka',
                    description: 'Unauthorized access to computer systems or networks',
                    procedures: [
                        'File complaint with local police cyber crime unit',
                        'Preserve digital evidence (screenshots, logs, etc.)',
                        'Contact nearest Digital Security Agency office',
                        'Gather witness statements if available'
                    ]
                },
                'hacking': {
                    commonSections: ['Section 32', 'Section 33', 'Section 43'],
                    typicalPenalties: 'Up to 7 years imprisonment and/or fine up to 25 lakh taka',
                    description: 'Unauthorized intrusion into computer systems with intent to damage or steal data',
                    procedures: [
                        'Immediately change all passwords and secure accounts',
                        'Document the intrusion with timestamps and evidence',
                        'File FIR at cyber crime police station',
                        'Report to Bangladesh Computer Emergency Response Team (BD-CERT)'
                    ]
                },
                'data_breach': {
                    commonSections: ['Section 26', 'Section 32'],
                    typicalPenalties: 'Up to 3 years imprisonment and/or fine up to 5 lakh taka',
                    description: 'Unauthorized access to or disclosure of personal data',
                    procedures: [
                        'Report to Data Protection Authority',
                        'File complaint with ICT Division',
                        'Preserve evidence of data compromise',
                        'Notify affected parties if required'
                    ]
                },
                'identity_theft': {
                    commonSections: ['Section 28', 'Section 57'],
                    typicalPenalties: 'Up to 5 years imprisonment and/or fine up to 10 lakh taka',
                    description: 'Using someone else\'s digital identity without authorization',
                    procedures: [
                        'File complaint with local police',
                        'Report to relevant online platforms',
                        'Gather evidence of misuse',
                        'Contact financial institutions if applicable'
                    ]
                },
                'computer_fraud': {
                    commonSections: ['Section 35', 'Section 36'],
                    typicalPenalties: 'Up to 10 years imprisonment and/or fine up to 50 lakh taka',
                    description: 'Using computer systems to commit fraud or financial crimes',
                    procedures: [
                        'File FIR with cyber crime police',
                        'Report to Bangladesh Bank if financial fraud',
                        'Preserve transaction records and communications',
                        'Contact legal counsel for complex cases'
                    ]
                }
            }
        };
    }

    analyzeQuery(query) {
        const queryLower = query.toLowerCase();
        
        const analysis = {
            incidentType: null,
            incidentCategory: null,
            isVictim: false,
            hasEvidence: false,
            knowsPerpetrator: false,
            wantsToKnow: [],
            urgency: 'normal'
        };

        // Check for women's rights issues first
        if ((queryLower.includes('woman') || queryLower.includes('women') || queryLower.includes('girl') || 
             queryLower.includes('female') || queryLower.includes('wife') || queryLower.includes('mother')) && 
            (queryLower.includes('abuse') || queryLower.includes('victim') || queryLower.includes('violence') || 
             queryLower.includes('harassment') || queryLower.includes('assault') || queryLower.includes('beat') || 
             queryLower.includes('hit') || queryLower.includes('hurt') || queryLower.includes('oppress'))) {
            
            analysis.incidentCategory = 'womens_rights';
            
            if (queryLower.includes('domestic') || queryLower.includes('husband') || 
                queryLower.includes('marriage') || queryLower.includes('family')) {
                analysis.incidentType = 'domestic_violence';
            } else if (queryLower.includes('sexual') || queryLower.includes('harass')) {
                analysis.incidentType = 'sexual_harassment';
            } else {
                analysis.incidentType = 'women_abuse';
            }
        }
        // Check for children's rights issues
        else if ((queryLower.includes('child') || queryLower.includes('children') || queryLower.includes('kid') || 
                 queryLower.includes('minor') || queryLower.includes('juvenile') || queryLower.includes('underage') || 
                 queryLower.includes('young') || queryLower.includes('infant') || queryLower.includes('baby'))) {
            
            analysis.incidentCategory = 'childrens_rights';
            
            if (queryLower.includes('labor') || queryLower.includes('labour') || queryLower.includes('work') || 
                queryLower.includes('job') || queryLower.includes('employ') || queryLower.includes('factory')) {
                analysis.incidentType = 'child_labor';
            } else if (queryLower.includes('abuse') || queryLower.includes('beat') || queryLower.includes('hurt') || 
                      queryLower.includes('harm') || queryLower.includes('neglect') || queryLower.includes('exploit')) {
                analysis.incidentType = 'child_abuse';
            } else if (queryLower.includes('education') || queryLower.includes('school') || 
                      queryLower.includes('study') || queryLower.includes('learning')) {
                analysis.incidentType = 'child_education';
            } else if (queryLower.includes('traffic') || queryLower.includes('sell') || 
                      queryLower.includes('smuggle') || queryLower.includes('border')) {
                analysis.incidentType = 'child_trafficking';
            } else {
                // Default to child labor for general children's rights queries
                analysis.incidentType = 'child_labor';
            }
        }
        // Then check for cybercrime issues
        else if (queryLower.includes('hack') || queryLower.includes('hacked')) {
            analysis.incidentCategory = 'cyber_crimes';
            analysis.incidentType = 'hacking';
        } else if (queryLower.includes('unauthorized access') || queryLower.includes('accessed without permission')) {
            analysis.incidentCategory = 'cyber_crimes';
            analysis.incidentType = 'unauthorized_access';
        } else if (queryLower.includes('data breach') || queryLower.includes('data stolen')) {
            analysis.incidentCategory = 'cyber_crimes';
            analysis.incidentType = 'data_breach';
        } else if (queryLower.includes('identity') && queryLower.includes('stolen')) {
            analysis.incidentCategory = 'cyber_crimes';
            analysis.incidentType = 'identity_theft';
        } else if (queryLower.includes('fraud') || queryLower.includes('scam')) {
            analysis.incidentCategory = 'cyber_crimes';
            analysis.incidentType = 'computer_fraud';
        }

        analysis.isVictim = queryLower.includes('my ') || queryLower.includes('me ') || 
                           queryLower.includes('i ') || queryLower.includes('someone') && 
                           (queryLower.includes('hacked') || queryLower.includes('stole'));

        analysis.hasEvidence = queryLower.includes('proof') || queryLower.includes('evidence') || 
                              queryLower.includes('i know');

        analysis.knowsPerpetrator = queryLower.includes('i know him') || queryLower.includes('i know who');

        if (queryLower.includes('what type of crime') || queryLower.includes('what crime')) {
            analysis.wantsToKnow.push('crime_type');
        }
        if (queryLower.includes('what i will do') || queryLower.includes('what should i do')) {
            analysis.wantsToKnow.push('procedures');
        }
        if (queryLower.includes('which section') || queryLower.includes('what section')) {
            analysis.wantsToKnow.push('legal_sections');
        }
        if (queryLower.includes('penalty') || queryLower.includes('punishment')) {
            analysis.wantsToKnow.push('penalties');
        }

        return analysis;
    }

    generateAnswer(query, searchResults) {
        if (searchResults.isGeneralChat) {
            return {
                answer: searchResults.chatResponse,
                sources: [],
                isGeneralChat: true
            };
        }

        const queryAnalysis = this.analyzeQuery(query);
        
        if (searchResults.results.length === 0) {
            return this.generateKnowledgeBasedAnswer(query, queryAnalysis);
        }

        return this.generateComprehensiveAnswer(query, queryAnalysis, searchResults);
    }

    generateKnowledgeBasedAnswer(query, analysis) {
        if (!analysis.incidentType) {
            return {
                answer: `I understand you're asking about a legal matter, but I need more specific information to provide accurate guidance. Could you please clarify:\n\n• What type of incident occurred?\n• Are you the victim or seeking general information?\n• What specific legal information do you need?\n\nFor example: "Someone hacked my computer and I have evidence. What crime is this and how do I report it?"`,
                sources: []
            };
        }
        
        // Handle women's rights issues
        if (analysis.incidentCategory === 'womens_rights') {
            const rightsInfo = this.legalKnowledgeBase.womensRights[analysis.incidentType];
            if (rightsInfo) {
                return this.generateWomensRightsAnswer(query, analysis, rightsInfo);
            }
        }
        
        // Handle children's rights issues
        if (analysis.incidentCategory === 'childrens_rights') {
            const rightsInfo = this.legalKnowledgeBase.childrensRights[analysis.incidentType];
            if (rightsInfo) {
                return this.generateChildrensRightsAnswer(query, analysis, rightsInfo);
            }
        }
        
        // Handle cybercrime issues
        const crimeInfo = this.legalKnowledgeBase.cyberCrimes[analysis.incidentType];
        if (!crimeInfo) {
            return this.generateGenericLegalGuidance(query);
        }

        let answer = `Based on your query about ${analysis.incidentType.replace('_', ' ')}, here's the legal information:\n\n`;

        if (analysis.wantsToKnow.includes('crime_type') || analysis.wantsToKnow.length === 0) {
            answer += `**🚨 Crime Classification:**\n`;
            answer += `• **Offense:** ${crimeInfo.description}\n`;
            answer += `• **Likely Sections:** ${crimeInfo.commonSections.join(', ')} under Digital Security Act 2018\n\n`;
        }

        if (analysis.wantsToKnow.includes('penalties') || analysis.wantsToKnow.length === 0) {
            answer += `**⚖️ Potential Penalties:**\n`;
            answer += `• ${crimeInfo.typicalPenalties}\n`;
            answer += `• This is typically a cognizable and non-bailable offense\n\n`;
        }

        if (analysis.wantsToKnow.includes('procedures') || analysis.isVictim) {
            answer += `**📋 What You Should Do:**\n`;
            crimeInfo.procedures.forEach((step, index) => {
                answer += `${index + 1}. ${step}\n`;
            });
            answer += `\n`;
        }

        if (analysis.isVictim && analysis.hasEvidence) {
            answer += `**🔍 Since You Have Evidence:**\n`;
            answer += `• Preserve all digital evidence immediately\n`;
            answer += `• Take screenshots of any unauthorized activities\n`;
            answer += `• Do not delete or modify any files\n`;
            answer += `• File complaint within reasonable time\n\n`;
        }

        if (analysis.knowsPerpetrator) {
            answer += `**👤 Since You Know the Perpetrator:**\n`;
            answer += `• Include their identity in your complaint\n`;
            answer += `• Gather any communication records with them\n`;
            answer += `• Consider if there are witnesses to the incident\n`;
            answer += `• Be prepared to provide their contact information\n\n`;
        }

        answer += `**⚠️ Important Notes:**\n`;
        answer += `• This guidance is based on typical provisions of Bangladeshi cyber law\n`;
        answer += `• Specific sections and penalties may vary based on exact circumstances\n`;
        answer += `• Consult with a lawyer for complex cases or if significant damages occurred\n`;
        answer += `• Time is important - file complaints promptly to preserve evidence`;

        return {
            answer: answer,
            sources: [],
            isKnowledgeBased: true
        };
    }

    generateComprehensiveAnswer(query, analysis, searchResults) {
        const topDocs = searchResults.results.slice(0, 4);
        const queryTokens = this.tokenize(query);
        
        let answer = '';

        // Handle women's rights issues
        if (analysis.incidentCategory === 'womens_rights' && analysis.incidentType) {
            const rightsInfo = this.legalKnowledgeBase.womensRights[analysis.incidentType];
            if (rightsInfo) {
                answer += `**🚨 Legal Summary:**\n`;
                answer += `• **Issue Type:** ${rightsInfo.description}\n`;
                answer += `• **Applicable Law:** ${rightsInfo.commonSections}\n`;
                answer += `• **Potential Penalties:** ${rightsInfo.typicalPenalties}\n\n`;
            }
        }
        // Handle children's rights issues
        else if (analysis.incidentCategory === 'childrens_rights' && analysis.incidentType) {
            const rightsInfo = this.legalKnowledgeBase.childrensRights[analysis.incidentType];
            if (rightsInfo) {
                answer += `**🚨 Legal Summary:**\n`;
                answer += `• **Issue Type:** ${rightsInfo.description}\n`;
                answer += `• **Applicable Law:** ${rightsInfo.commonSections}\n`;
                answer += `• **Potential Penalties:** ${rightsInfo.typicalPenalties}\n\n`;
                
                // Add additional info for child labor specifically
                if (analysis.incidentType === 'child_labor' && rightsInfo.additionalInfo) {
                    answer += `**ℹ️ Key Legal Details:**\n`;
                    answer += `${rightsInfo.additionalInfo}\n\n`;
                }
            }
        }
        // Handle cybercrime issues
        else if (analysis.isVictim && analysis.incidentType) {
            const crimeInfo = this.legalKnowledgeBase.cyberCrimes[analysis.incidentType];
            if (crimeInfo) {
                answer += `**🚨 Your Case Summary:**\n`;
                answer += `• **Crime Type:** ${crimeInfo.description}\n`;
                answer += `• **Applicable Law:** Digital Security Act 2018\n`;
                answer += `• **Likely Sections:** ${crimeInfo.commonSections.join(', ')}\n\n`;
            }
        }

        answer += `**📚 Based on Legal Documents:**\n\n`;

        topDocs.forEach((doc, index) => {
            const snippet = this.extractAndImproveSnippet(doc.document, queryTokens, query, analysis);
            if (snippet.trim()) {
                answer += `**${index + 1}.** ${snippet}\n\n`;
            }
        });

        if (analysis.isVictim || analysis.incidentCategory === 'womens_rights' || analysis.incidentCategory === 'childrens_rights') {
            answer += `**📋 Immediate Action Steps:**\n`;
            
            if (analysis.incidentCategory === 'womens_rights' && analysis.incidentType && 
                this.legalKnowledgeBase.womensRights[analysis.incidentType]) {
                // For women's rights issues
                const procedures = this.legalKnowledgeBase.womensRights[analysis.incidentType].procedures;
                procedures.forEach((step, index) => {
                    answer += `${index + 1}. ${step}\n`;
                });
                
                // Add helpline information
                answer += `\n**📞 Emergency Contacts:**\n`;
                answer += `• National Helpline for Violence Against Women and Children: 109\n`;
                answer += `• Police Emergency: 999\n`;
            }
            else if (analysis.incidentCategory === 'childrens_rights' && analysis.incidentType && 
                this.legalKnowledgeBase.childrensRights[analysis.incidentType]) {
                // For children's rights issues
                const procedures = this.legalKnowledgeBase.childrensRights[analysis.incidentType].procedures;
                procedures.forEach((step, index) => {
                    answer += `${index + 1}. ${step}\n`;
                });
                
                // Add helpline information
                answer += `\n**📞 Emergency Contacts:**\n`;
                answer += `• Child Helpline: 1098\n`;
                answer += `• National Helpline for Violence Against Women and Children: 109\n`;
                answer += `• Police Emergency: 999\n`;
            }
            else if (analysis.incidentType && this.legalKnowledgeBase.cyberCrimes[analysis.incidentType]) {
                // For cybercrime issues
                const procedures = this.legalKnowledgeBase.cyberCrimes[analysis.incidentType].procedures;
                procedures.forEach((step, index) => {
                    answer += `${index + 1}. ${step}\n`;
                });
            } 
            else {
                // Default steps
                answer += `1. File complaint with local police station\n`;
                answer += `2. Preserve all evidence\n`;
                answer += `3. Document the incident with timestamps\n`;
                answer += `4. Gather witness statements if available\n`;
            }
            answer += `\n`;
        }

        answer += `**🔍 Search Context:** Found ${searchResults.total} relevant documents in ${searchResults.searchTime}ms.\n\n`;

        // Customize the disclaimer based on the type of query
        if (analysis.incidentCategory === 'womens_rights') {
            answer += `**⚠️ Legal Disclaimer:** This information is based on available legal documents and Bangladesh laws protecting women. For your specific case, please consult with a qualified lawyer or contact a women's rights organization for proper assistance. In emergency situations, call the National Helpline for Violence Against Women and Children at 109.`;
        } 
        else if (analysis.incidentCategory === 'childrens_rights') {
            answer += `**⚠️ Legal Disclaimer:** This information is based on Bangladesh laws protecting children's rights and welfare. For specific cases involving children, please contact the Department of Social Services, local Child Welfare Board, or call the Child Helpline at 1098 for immediate assistance.`;
        }
        else {
            answer += `**⚠️ Legal Disclaimer:** This information is based on available legal documents and general legal principles. For your specific case, especially with evidence and known perpetrator, consult with a qualified lawyer or visit the nearest cyber crime police station for immediate assistance.`;
        }

        return {
            answer: answer,
            sources: topDocs.map(doc => ({
                text: this.extractAndImproveSnippet(doc.document, queryTokens, query, analysis, 120),
                confidence: doc.confidence,
                metadata: doc.metadata
            }))
        };
    }

    extractAndImproveSnippet(document, queryTokens, originalQuery, analysis, maxLength = 250) {
        if (!document) return '';
        
        if (document.length < 100 && document.includes('?')) {
            return this.enhanceQuestionTitle(document, analysis);
        }
        
        return this.extractBestSnippet(document, queryTokens, originalQuery, maxLength);
    }

    enhanceQuestionTitle(questionTitle, analysis) {
        const enhanced = questionTitle.replace('?', '');
        
        if (analysis.incidentType && this.legalKnowledgeBase.cyberCrimes[analysis.incidentType]) {
            const crimeInfo = this.legalKnowledgeBase.cyberCrimes[analysis.incidentType];
            return `${enhanced} - Typically covered under ${crimeInfo.commonSections.join(' or ')} with penalties of ${crimeInfo.typicalPenalties.toLowerCase()}.`;
        }
        
        return enhanced + ' - Refer to relevant sections of Digital Security Act 2018 for specific provisions and penalties.';
    }

    generateGenericLegalGuidance(query) {
        return {
            answer: `I understand you're seeking legal guidance. While I couldn't identify the specific type of cyber crime from your query, here's general guidance:\n\n**🔍 Common Cyber Crimes in Bangladesh:**\n• Unauthorized computer access (Section 32)\n• Computer hacking (Section 33)\n• Data theft or breach (Section 26, 32)\n• Identity theft (Section 28)\n• Computer fraud (Section 35, 36)\n\n**📋 General Steps for Cyber Crime Victims:**\n1. Immediately secure your systems and change passwords\n2. Preserve all evidence (screenshots, logs, communications)\n3. File complaint with local police cyber crime unit\n4. Report to Bangladesh Computer Emergency Response Team (BD-CERT)\n5. Consider consulting with a cyber law attorney\n\n**⚠️ Important:** Time is critical in cyber crime cases. File complaints promptly and preserve evidence carefully.\n\nCould you provide more specific details about the incident for more targeted legal guidance?`,
            sources: []
        };
    }
    
    generateWomensRightsAnswer(query, analysis, rightsInfo) {
        let answer = `**${this.formatIncidentTitle(analysis.incidentType)} - Legal Information:**\n\n`;
        
        answer += `**📋 Description:**\n`;
        answer += `${rightsInfo.description}\n\n`;
        
        answer += `**⚖️ Applicable Law:**\n`;
        answer += `${rightsInfo.commonSections}\n\n`;
        
        answer += `**🚫 Penalties:**\n`;
        answer += `${rightsInfo.typicalPenalties}\n\n`;
        
        answer += `**🆘 Steps to Take:**\n`;
        rightsInfo.procedures.forEach((step, index) => {
            answer += `${index + 1}. ${step}\n`;
        });
        answer += `\n`;
        
        answer += `**📞 Help Resources:**\n`;
        answer += `• National Helpline for Violence Against Women and Children: 109\n`;
        answer += `• Police Emergency: 999\n`;
        answer += `• Bangladesh National Woman Lawyers' Association: +880-2-8321461\n`;
        answer += `• Ain o Salish Kendra (ASK): +880-2-8614954\n\n`;
        
        answer += `**⚠️ Important Note:** This information is provided as general guidance. For specific legal assistance with your situation, please consult with a qualified legal professional or contact a women's support organization.`;
        
        return {
            answer: answer,
            sources: [],
            isKnowledgeBased: true
        };
    }
    
    formatIncidentTitle(incidentType) {
        return incidentType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    generateChildrensRightsAnswer(query, analysis, rightsInfo) {
        let answer = `**${this.formatIncidentTitle(analysis.incidentType)} Laws in Bangladesh:**\n\n`;
        
        answer += `**📋 Description:**\n`;
        answer += `${rightsInfo.description}\n\n`;
        
        answer += `**⚖️ Applicable Laws:**\n`;
        answer += `${rightsInfo.commonSections}\n\n`;
        
        answer += `**🚫 Penalties:**\n`;
        answer += `${rightsInfo.typicalPenalties}\n\n`;
        
        // Include additional info if available (especially for child labor)
        if (rightsInfo.additionalInfo) {
            answer += `**ℹ️ Key Information:**\n`;
            answer += `${rightsInfo.additionalInfo}\n\n`;
        }
        
        answer += `**🆘 Reporting Procedures:**\n`;
        rightsInfo.procedures.forEach((step, index) => {
            answer += `${index + 1}. ${step}\n`;
        });
        answer += `\n`;
        
        answer += `**📞 Help Resources:**\n`;
        answer += `• Child Helpline: 1098\n`;
        answer += `• National Helpline for Violence Against Women and Children: 109\n`;
        answer += `• Police Emergency: 999\n`;
        answer += `• Department of Social Services: Contact your local office\n\n`;
        
        answer += `**⚠️ Important Note:** This information is provided as general guidance. For specific legal assistance regarding a child's welfare, please consult with a qualified legal professional or contact the Department of Social Services.`;
        
        return {
            answer: answer,
            sources: [],
            isKnowledgeBased: true
        };
    }

    generateNoResultsResponse(query) {
        const suggestions = this.generateSearchSuggestions(query);
        
        return `I couldn't find information directly matching "${query}" in the legal documents.\n\n**Possible reasons:**\n• The query uses different terminology than the legal text\n• The topic might not be covered in the current document collection\n• Try using more general or different terms\n\n**Suggestions:**\n${suggestions.join('\n')}\n\n**Tip:** Try rephrasing your question or using broader terms related to your topic.`;
    }

    generateSearchSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('hack') || queryLower.includes('unauthorized')) {
            suggestions.push('• Try: "unauthorized access" or "computer intrusion"');
        }
        if (queryLower.includes('penalty') || queryLower.includes('punishment')) {
            suggestions.push('• Try: "cyber crime penalties" or "digital security punishment"');
        }
        if (queryLower.includes('data') || queryLower.includes('privacy')) {
            suggestions.push('• Try: "data protection" or "information security"');
        }
        
        suggestions.push('• Use broader terms like "cyber crime", "digital law", or "computer security"');
        suggestions.push('• Try asking about specific legal concepts or procedures');
        
        return suggestions.slice(0, 4);
    }

    extractBestSnippet(document, queryTokens, originalQuery, maxLength = 250) {
        if (!document) return '';
        
        const sentences = document.split(/[.!?]+/).filter(s => s.trim().length > 15);
        if (sentences.length === 0) return document.substring(0, maxLength) + '...';
        
        const scoredSentences = sentences.map(sentence => {
            let score = 0;
            const sentenceLower = sentence.toLowerCase();
            
            if (sentenceLower.includes(originalQuery.toLowerCase())) {
                score += 10;
            }
            
            queryTokens.forEach(token => {
                if (sentenceLower.includes(token)) score += 2;
            });
            
            if (sentence.length > 20 && sentence.length < 200) score += 1;
            if (sentenceLower.includes('section') || sentenceLower.includes('act')) score += 1;
            
            return { sentence: sentence.trim(), score };
        });
        
        scoredSentences.sort((a, b) => b.score - a.score);
        
        let snippet = '';
        for (const item of scoredSentences) {
            if (snippet.length + item.sentence.length < maxLength && item.score > 0) {
                snippet += (snippet ? ' ' : '') + item.sentence + '.';
            } else if (snippet.length > 50) {
                break;
            }
        }
        
        return snippet || document.substring(0, maxLength) + '...';
    }

    getStats() {
        return {
            totalDocuments: this.documents.length,
            accuracy: this.config.performance_metrics ? 
                Math.round((this.config.performance_metrics['f1@5'] || 0.85) * 100) : 85
        };
    }
}