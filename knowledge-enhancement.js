// Enhanced Knowledge Base for Women's and Children's Rights
// Add this to the initializeEnhancedAnswerGenerator function in chat-engine.js

this.legalKnowledgeBase = {
    // Keep existing cyberCrimes section
    cyberCrimes: {
        // Existing entries...
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
