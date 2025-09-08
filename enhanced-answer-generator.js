// Enhanced Answer Generator for Women's and Children's Rights Topics
// Add to the generateAnswer function in chat-engine.js

function generateComprehensiveWomensChildrensRightsAnswer(query, analysis, searchResults) {
    const topDocs = searchResults.results.slice(0, 4);
    const queryTokens = this.tokenize(query);
    
    let answer = '';
    
    // If the query relates to women's or children's rights topics
    if (analysis.incidentType && this.legalKnowledgeBase.womensAndChildrensRights[analysis.incidentType]) {
        const rightsInfo = this.legalKnowledgeBase.womensAndChildrensRights[analysis.incidentType];
        
        // Add a clear section title and incident info
        answer += `**${formatIncidentTitle(analysis.incidentType)} Information:**\n\n`;
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
            const snippet = extractSensitiveTopicSnippet(doc.document, queryTokens, query, analysis);
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
            text: extractSensitiveTopicSnippet(doc.document, queryTokens, query, analysis, 120),
            confidence: doc.confidence,
            metadata: doc.metadata
        }))
    };
}

// Helper function to format incident type for display
function formatIncidentTitle(incidentType) {
    return incidentType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
