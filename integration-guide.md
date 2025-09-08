# Integration Guide for Enhanced Women's and Children's Rights Responses

This guide explains how to integrate the enhanced functionality for women's and children's rights queries into your existing NyaAI Legal Assistant.

## Step 1: Add Women's and Children's Rights Knowledge Base

Open `chat-engine.js` and locate the `initializeEnhancedAnswerGenerator()` method. Add the `womensAndChildrensRights` object to the `legalKnowledgeBase` structure:

```javascript
// Inside initializeEnhancedAnswerGenerator() method
this.legalKnowledgeBase = {
    cyberCrimes: {
        // Existing cyberCrimes entries...
    },
    
    // Add new section for women's and children's rights
    womensAndChildrensRights: {
        'domestic_violence': {
            commonSections: ['Prevention of Oppression Against Women and Children Act, Sections 9, 10, 11'],
            typicalPenalties: 'Up to 14 years imprisonment depending on severity and/or fine',
            description: 'Physical, mental, or sexual abuse against women or children within domestic relationships',
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
        'child_abuse': {
            commonSections: ['Children Act 2013, Sections 70-76', 'Prevention of Oppression Against Women and Children Act'],
            typicalPenalties: 'Up to 14 years imprisonment depending on severity and/or fine',
            description: 'Physical, emotional, or sexual abuse of children, including exploitation and neglect',
            procedures: [
                'Report to Child Affairs Police Officer or nearest police station',
                'Contact Department of Social Services or Child Welfare Board',
                'Ensure child receives medical examination if needed',
                'Child may be placed in protective custody during investigation'
            ]
        },
        'child_marriage': {
            commonSections: ['Child Marriage Restraint Act 2017'],
            typicalPenalties: 'Imprisonment up to 2 years and/or fine up to 50,000 taka',
            description: 'Marriage of girls under 18 years and boys under 21 years of age',
            procedures: [
                'Report to local government officials or police',
                'Contact Child Welfare Board',
                'Provide information about the child and family',
                'Legal action can be taken against parents, guardians and marriage officiators'
            ]
        },
        'dowry_related_crimes': {
            commonSections: ['Dowry Prohibition Act 1980', 'Prevention of Oppression Against Women and Children Act, Section 11'],
            typicalPenalties: 'Up to life imprisonment for dowry deaths and 1-5 years for demanding dowry',
            description: 'Demanding, giving, or taking dowry; violence or death related to dowry demands',
            procedures: [
                'File complaint with nearest police station',
                'Report to Women and Children Repression Prevention Tribunal',
                'Preserve evidence of dowry demands (messages, witnesses)',
                'Seek protection orders if facing threats'
            ]
        },
        'human_trafficking': {
            commonSections: ['Prevention and Suppression of Human Trafficking Act 2012'],
            typicalPenalties: 'Up to life imprisonment or death penalty in severe cases',
            description: 'Trafficking of women and children for sexual exploitation, labor, or other purposes',
            procedures: [
                'Report to Anti-Human Trafficking Offence Tribunal',
                'Contact specialized NGOs working with trafficking victims',
                'Victim is entitled to protection, rehabilitation, and compensation',
                'Government provides legal aid and protective custody'
            ]
        }
    }
};
```

## Step 2: Enhance the analyzeQuery Function

Update the `analyzeQuery` method in `chat-engine.js` to detect women's and children's rights related queries:

```javascript
analyzeQuery(query) {
    const queryLower = query.toLowerCase();
    
    const analysis = {
        incidentType: null,
        isVictim: false,
        hasEvidence: false,
        knowsPerpetrator: false,
        wantsToKnow: [],
        urgency: 'normal'
    };

    // Existing cyber crime detection code
    if (queryLower.includes('hack') || queryLower.includes('hacked')) {
        analysis.incidentType = 'hacking';
    } else if (queryLower.includes('unauthorized access') || queryLower.includes('accessed without permission')) {
        analysis.incidentType = 'unauthorized_access';
    } else if (queryLower.includes('data breach') || queryLower.includes('data stolen')) {
        analysis.incidentType = 'data_breach';
    } else if (queryLower.includes('identity') && queryLower.includes('stolen')) {
        analysis.incidentType = 'identity_theft';
    } else if (queryLower.includes('fraud') || queryLower.includes('scam')) {
        analysis.incidentType = 'computer_fraud';
    } 
    
    // New women's and children's rights detection code
    else if ((queryLower.includes('domestic') && (queryLower.includes('violence') || queryLower.includes('abuse'))) || 
             (queryLower.includes('wife') && queryLower.includes('beat')) ||
             (queryLower.includes('husband') && (queryLower.includes('hit') || queryLower.includes('abuse')))) {
        analysis.incidentType = 'domestic_violence';
    } else if (queryLower.includes('sexual') && 
              (queryLower.includes('harassment') || queryLower.includes('assault') || queryLower.includes('abuse'))) {
        analysis.incidentType = 'sexual_harassment';
    } else if ((queryLower.includes('child') || queryLower.includes('children')) && 
               (queryLower.includes('abuse') || queryLower.includes('harm') || queryLower.includes('hurt'))) {
        analysis.incidentType = 'child_abuse';
    } else if (queryLower.includes('child') && queryLower.includes('marriage')) {
        analysis.incidentType = 'child_marriage';
    } else if (queryLower.includes('dowry')) {
        analysis.incidentType = 'dowry_related_crimes';
    } else if (queryLower.includes('trafficking')) {
        analysis.incidentType = 'human_trafficking';
    } else if ((queryLower.includes('woman') || queryLower.includes('women')) && 
               (queryLower.includes('abuse') || queryLower.includes('rights'))) {
        // Set a default for women's issues if no specific type is detected
        analysis.incidentType = 'domestic_violence';
    }

    // Rest of the existing analysis code...
    
    return analysis;
}
```

## Step 3: Add Enhanced Answer Generator for Women's and Children's Rights

Modify the `generateAnswer` method in `chat-engine.js` to use specialized response generation for women's and children's issues:

```javascript
generateAnswer(query, searchResults) {
    if (searchResults.isGeneralChat) {
        return {
            answer: searchResults.chatResponse,
            sources: [],
            isGeneralChat: true
        };
    }

    const queryAnalysis = this.analyzeQuery(query);
    
    // Check if this is a women's or children's rights related query
    const isWomensChildrensRightsQuery = 
        queryAnalysis.incidentType && 
        this.legalKnowledgeBase.womensAndChildrensRights && 
        this.legalKnowledgeBase.womensAndChildrensRights[queryAnalysis.incidentType];
    
    if (isWomensChildrensRightsQuery) {
        // Use the specialized answer generator for women's and children's rights
        return this.generateWomensChildrensRightsAnswer(query, queryAnalysis, searchResults);
    }
    
    // Original logic for other types of queries
    if (searchResults.results.length === 0) {
        return this.generateKnowledgeBasedAnswer(query, queryAnalysis);
    }

    return this.generateComprehensiveAnswer(query, queryAnalysis, searchResults);
}

// Add this new method to your LegalChatEngine class
generateWomensChildrensRightsAnswer(query, analysis, searchResults) {
    const topDocs = searchResults.results.slice(0, 4);
    const queryTokens = this.tokenize(query);
    
    let answer = '';
    
    // If we have a match in our knowledge base
    if (analysis.incidentType && this.legalKnowledgeBase.womensAndChildrensRights[analysis.incidentType]) {
        const rightsInfo = this.legalKnowledgeBase.womensAndChildrensRights[analysis.incidentType];
        
        // Format the incident type for display
        const formattedIncidentType = analysis.incidentType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Add a clear section title and incident info
        answer += `**${formattedIncidentType} Information:**\n\n`;
        answer += `**📝 Definition:** ${rightsInfo.description}\n\n`;
        answer += `**⚖️ Legal Framework:** ${rightsInfo.commonSections.join(', ')}\n\n`;
        
        // Add penalty information if requested or by default
        if (analysis.wantsToKnow.includes('penalties') || analysis.wantsToKnow.length === 0) {
            answer += `**🚫 Penalties:** ${rightsInfo.typicalPenalties}\n\n`;
        }
        
        // Add procedures information - always include for victim scenarios
        if (analysis.wantsToKnow.includes('procedures') || analysis.isVictim || analysis.wantsToKnow.length === 0) {
            answer += `**📋 Legal Procedures:**\n`;
            rightsInfo.procedures.forEach((step, index) => {
                answer += `${index + 1}. ${step}\n`;
            });
            answer += `\n`;
        }
        
        // Add a section specifically addressing victim support
        if (analysis.isVictim) {
            answer += `**🆘 Immediate Help:**\n`;
            answer += `• National Helpline for Violence Against Women and Children: 109\n`;
            answer += `• Police Emergency: 999\n`;
            answer += `• Nearest police station or One-Stop Crisis Center\n`;
            answer += `• Legal aid services available at district courts\n\n`;
        }
    }
    
    // Add the document-based evidence section with snippets from legal texts
    answer += `**📚 Relevant Legal Provisions:**\n\n`;
    
    if (topDocs.length > 0) {
        topDocs.forEach((doc, index) => {
            const snippet = this.extractAndImproveSnippet(doc.document, queryTokens, query, analysis);
            if (snippet.trim()) {
                answer += `**${index + 1}.** ${snippet}\n\n`;
            }
        });
    } else {
        // If no documents found, provide general guidance
        answer += `No specific legal texts matched your exact query. However, the following laws generally apply to these matters:\n\n`;
        answer += `• Prevention of Oppression Against Women and Children Act\n`;
        answer += `• Children Act 2013\n`;
        answer += `• Domestic Violence (Prevention and Protection) Act 2010\n`;
        answer += `• Dowry Prohibition Act 1980\n`;
        answer += `• Child Marriage Restraint Act 2017\n\n`;
    }
    
    // Add disclaimer and support information
    answer += `**⚠️ Important Note:** This information is provided as general guidance only. For your specific situation, please consult with a qualified legal professional or contact a women's support organization.\n\n`;
    
    // Add additional support resources
    answer += `**📞 Support Resources:**\n`;
    answer += `• National Legal Aid Services Organization: 16430\n`;
    answer += `• Bangladesh National Woman Lawyers' Association: +880-2-8321461\n`;
    answer += `• Ain o Salish Kendra (ASK): +880-2-8614954\n`;
    
    return {
        answer: answer,
        sources: topDocs.map(doc => ({
            text: this.extractAndImproveSnippet(doc.document, queryTokens, query, analysis, 120),
            confidence: doc.confidence,
            metadata: doc.metadata
        }))
    };
}
```

## Step 4: Enhance the extractAndImproveSnippet Function

Update the `extractAndImproveSnippet` function to better handle women's and children's rights topics:

```javascript
extractAndImproveSnippet(document, queryTokens, originalQuery, analysis, maxLength = 250) {
    if (!document) return '';
    
    // Check if it's a women's or children's rights related query
    const isWomensRightsQuery = /woman|women|girl|female|domestic|abuse|victim|dowry|wife|mother/.test(originalQuery.toLowerCase());
    const isChildrensRightsQuery = /child|minor|juvenile|underage|young|boy|kid|baby/.test(originalQuery.toLowerCase());
    
    if (document.length < 100 && document.includes('?')) {
        return this.enhanceQuestionTitle(document, analysis);
    }
    
    // For women's and children's rights topics, use a more careful extraction approach
    if (isWomensRightsQuery || isChildrensRightsQuery) {
        return this.extractSensitiveTopicSnippet(document, queryTokens, originalQuery, analysis, maxLength);
    }
    
    // Otherwise use the default approach
    return this.extractBestSnippet(document, queryTokens, originalQuery, maxLength);
}

// Add this new method to your LegalChatEngine class
extractSensitiveTopicSnippet(document, queryTokens, originalQuery, analysis, maxLength = 250) {
    if (!document) return '';
    
    // Split document into sentences for better context
    const sentences = document.split(/[.!?]+/).filter(s => s.trim().length > 15);
    if (sentences.length === 0) return document.substring(0, maxLength) + '...';
    
    // Keywords for different sensitive topics to boost relevance
    const keywordCategories = {
        domestic_violence: ['domestic', 'violence', 'abuse', 'victim', 'protection', 'hurt', 'injury'],
        sexual_harassment: ['sexual', 'harassment', 'assault', 'unwanted', 'consent'],
        child_abuse: ['child', 'abuse', 'neglect', 'harm', 'welfare', 'protection'],
        child_marriage: ['marriage', 'minor', 'consent', 'age'],
        dowry: ['dowry', 'demand', 'gift', 'marriage', 'bride'],
        women_rights: ['right', 'equality', 'discrimination', 'protection', 'woman', 'women']
    };
    
    // Score sentences based on query relevance and sensitive topic keywords
    const scoredSentences = sentences.map(sentence => {
        let score = 0;
        const sentenceLower = sentence.toLowerCase();
        
        // Direct query match bonus
        if (sentenceLower.includes(originalQuery.toLowerCase())) {
            score += 10;
        }
        
        // Query tokens match
        queryTokens.forEach(token => {
            if (sentenceLower.includes(token)) score += 2;
        });
        
        // Sensitive topic keyword matches
        Object.values(keywordCategories).forEach(keywords => {
            keywords.forEach(keyword => {
                if (sentenceLower.includes(keyword)) score += 1;
            });
        });
        
        // Prioritize sentences with legal reference
        if (sentenceLower.includes('section') || sentenceLower.includes('act')) score += 2;
        if (sentenceLower.includes('law') || sentenceLower.includes('legal')) score += 1;
        
        // Prioritize sentences with procedures or actions
        if (sentenceLower.includes('file') || sentenceLower.includes('report')) score += 1;
        if (sentenceLower.includes('complaint') || sentenceLower.includes('police')) score += 1;
        
        // Prefer sentences of reasonable length
        if (sentence.length > 20 && sentence.length < 200) score += 1;
        
        return { sentence: sentence.trim(), score };
    });
    
    // Sort by relevance score
    scoredSentences.sort((a, b) => b.score - a.score);
    
    // Build snippet from most relevant sentences
    let snippet = '';
    for (const item of scoredSentences) {
        if ((snippet.length + item.sentence.length) < maxLength && item.score > 0) {
            snippet += (snippet ? ' ' : '') + item.sentence + '.';
        } else if (snippet.length > 50) {
            break;
        }
    }
    
    // Add a clarification for sensitive topics if relevant
    if (snippet.length > 0 && snippet.length < maxLength - 70) {
        if (analysis.incidentType === 'domestic_violence' || analysis.incidentType === 'sexual_harassment') {
            snippet += " For specific legal assistance in these sensitive matters, consult with a legal aid organization or women's rights advocate.";
        } else if (analysis.incidentType === 'child_abuse' || analysis.incidentType === 'child_marriage') {
            snippet += " For child protection issues, contact the nearest Department of Social Services or Child Welfare Board.";
        }
    }
    
    return snippet || document.substring(0, maxLength) + '...';
}

// Also update the enhanceQuestionTitle function
enhanceQuestionTitle(questionTitle, analysis) {
    const enhanced = questionTitle.replace('?', '');
    
    // For women's and children's rights topics
    if (analysis.incidentType === 'domestic_violence' || analysis.incidentType === 'sexual_harassment' || 
        analysis.incidentType === 'dowry_related_crimes') {
        return `${enhanced} - This falls under the Prevention of Oppression Against Women and Children Act with specific protections for women and children victims.`;
    }
    else if (analysis.incidentType === 'child_abuse' || analysis.incidentType === 'child_marriage') {
        return `${enhanced} - The Children Act 2013 and related laws provide specific protections and procedures for child welfare and safety.`;
    }
    // Keep the existing cyber crime section
    else if (analysis.incidentType && this.legalKnowledgeBase.cyberCrimes[analysis.incidentType]) {
        const crimeInfo = this.legalKnowledgeBase.cyberCrimes[analysis.incidentType];
        return `${enhanced} - Typically covered under ${crimeInfo.commonSections.join(' or ')} with penalties of ${crimeInfo.typicalPenalties.toLowerCase()}.`;
    }
    
    return enhanced + ' - Refer to relevant sections of applicable laws for specific provisions and penalties.';
}
```

## Step 5: Enhance the classifyQuery Function

Update the `classifyQuery` function to better detect women's and children's rights related queries:

```javascript
classifyQuery(query) {
    const queryLower = query.toLowerCase().trim();
    
    // Keep existing general chat patterns
    const generalChatPatterns = [
        // ... existing patterns
    ];
    
    for (const pattern of generalChatPatterns) {
        if (pattern.test(queryLower)) {
            return 'general_chat';
        }
    }
    
    // Expand legal indicators to include women's and children's rights terms
    const legalIndicators = [
        // Existing cyber terms
        'law', 'legal', 'act', 'section', 'penalty', 'punishment', 'fine', 'crime',
        'cyber', 'digital', 'computer', 'hacking', 'unauthorized', 'breach',
        'data protection', 'privacy', 'security', 'violation', 'illegal',
        'court', 'judge', 'lawyer', 'attorney', 'case', 'ruling',
        
        // Women's and children's rights terms
        'domestic violence', 'abuse', 'harassment', 'dowry', 'marriage', 
        'trafficking', 'victim', 'child', 'minor', 'juvenile', 'exploitation',
        'women', 'girl', 'gender', 'protection', 'oppression', 'compensation'
    ];
    
    const hasLegalTerms = legalIndicators.some(term => queryLower.includes(term));
    if (hasLegalTerms) return 'legal_query';
    
    // Rest of the function remains the same...
    const questionPatterns = [
        // ... existing patterns
    ];
    
    const isQuestion = questionPatterns.some(pattern => pattern.test(queryLower));
    const wordCount = queryLower.split(/\s+/).length;
    
    if (isQuestion && wordCount > 3) return 'potential_legal';
    if (wordCount <= 3 && !hasLegalTerms) return 'general_chat';
    
    return 'potential_legal';
}
```

## Step 6: Test the Enhancements

After implementing these changes, thoroughly test the system with various queries related to women's and children's rights issues to ensure it's responding appropriately.

Example test queries:
- "What happens if a woman is abused by her husband?"
- "What are the laws protecting children from abuse?"
- "What can I do if someone is demanding dowry from me?"
- "What is the punishment for child marriage?"
- "How can I report domestic violence?"

## Step 7: Monitor and Refine

After deploying these changes, monitor user interactions with these sensitive topics and continue to refine the responses based on feedback. Consider expanding the knowledge base with more detailed information as needed.
