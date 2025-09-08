// Enhanced Query Analysis for Women's and Children's Issues
// Add this to the analyzeQuery function in chat-engine.js

function analyzeQuery(query) {
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

    // Rest of the analysis code
    analysis.isVictim = queryLower.includes('my ') || queryLower.includes('me ') || 
                       queryLower.includes('i ') || queryLower.includes('someone') && 
                       (queryLower.includes('abuse') || queryLower.includes('victim') || 
                        queryLower.includes('hurt') || queryLower.includes('hacked') || 
                        queryLower.includes('stole'));

    analysis.hasEvidence = queryLower.includes('proof') || queryLower.includes('evidence') || 
                          queryLower.includes('i know') || queryLower.includes('photo') || 
                          queryLower.includes('video') || queryLower.includes('record');

    analysis.knowsPerpetrator = queryLower.includes('i know him') || queryLower.includes('i know who') || 
                               queryLower.includes('my husband') || queryLower.includes('my wife') || 
                               queryLower.includes('neighbor') || queryLower.includes('relative');

    if (queryLower.includes('what type of crime') || queryLower.includes('what crime')) {
        analysis.wantsToKnow.push('crime_type');
    }
    if (queryLower.includes('what i will do') || queryLower.includes('what should i do') || 
        queryLower.includes('how can i') || queryLower.includes('steps')) {
        analysis.wantsToKnow.push('procedures');
    }
    if (queryLower.includes('which section') || queryLower.includes('what section') || 
        queryLower.includes('what law') || queryLower.includes('legal')) {
        analysis.wantsToKnow.push('legal_sections');
    }
    if (queryLower.includes('penalty') || queryLower.includes('punishment') || 
        queryLower.includes('jail') || queryLower.includes('fine')) {
        analysis.wantsToKnow.push('penalties');
    }

    return analysis;
}
