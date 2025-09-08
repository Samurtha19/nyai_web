// Enhanced Document Extraction for Women's and Children's Topics
// This enhances the extractAndImproveSnippet function in chat-engine.js

function enhancedExtractAndImproveSnippet(document, queryTokens, originalQuery, analysis, maxLength = 250) {
    if (!document) return '';
    
    // Check if it's a women's or children's rights related query
    const isWomensRightsQuery = /woman|women|girl|female|domestic|abuse|victim|dowry|wife|mother/.test(originalQuery.toLowerCase());
    const isChildrensRightsQuery = /child|minor|juvenile|underage|young|boy|kid|baby/.test(originalQuery.toLowerCase());
    
    if (document.length < 100 && document.includes('?')) {
        return enhanceQuestionTitle(document, analysis);
    }
    
    // For women's and children's rights topics, use a specialized extraction approach
    if (isWomensRightsQuery || isChildrensRightsQuery) {
        return extractSensitiveTopicSnippet(document, queryTokens, originalQuery, analysis, maxLength);
    }
    
    // Otherwise use the default approach
    return extractBestSnippet(document, queryTokens, originalQuery, maxLength);
}

function extractSensitiveTopicSnippet(document, queryTokens, originalQuery, analysis, maxLength = 250) {
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

// This enhances the question title formatting for sensitive topics
function enhanceQuestionTitle(questionTitle, analysis) {
    const enhanced = questionTitle.replace('?', '');
    
    // For women's and children's rights topics
    if (analysis.incidentType === 'domestic_violence' || analysis.incidentType === 'sexual_harassment' || 
        analysis.incidentType === 'dowry_related_crimes') {
        return `${enhanced} - This falls under the Prevention of Oppression Against Women and Children Act with specific protections for women and children victims.`;
    }
    else if (analysis.incidentType === 'child_abuse' || analysis.incidentType === 'child_marriage') {
        return `${enhanced} - The Children Act 2013 and related laws provide specific protections and procedures for child welfare and safety.`;
    }
    else if (analysis.incidentType && this.legalKnowledgeBase.cyberCrimes[analysis.incidentType]) {
        const crimeInfo = this.legalKnowledgeBase.cyberCrimes[analysis.incidentType];
        return `${enhanced} - Typically covered under ${crimeInfo.commonSections.join(' or ')} with penalties of ${crimeInfo.typicalPenalties.toLowerCase()}.`;
    }
    
    return enhanced + ' - Refer to relevant sections of applicable laws for specific provisions and penalties.';
}
