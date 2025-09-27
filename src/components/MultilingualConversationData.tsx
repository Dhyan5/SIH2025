export interface AssessmentQuestion {
  id: string;
  question: string;
  followups: string[];
  category: string;
}

export const MULTILINGUAL_ASSESSMENT_QUESTIONS = {
  en: [
    {
      id: 'memory_recent',
      question: 'Tell me about your memory - do you sometimes forget recent conversations or where you put things?',
      followups: ['Can you give me a specific example?', 'How often does this happen?'],
      category: 'memory'
    },
    {
      id: 'memory_names',
      question: 'How is your memory for names and faces? Do you sometimes struggle to remember people you\'ve met recently?',
      followups: ['Is this something new, or has it always been challenging for you?'],
      category: 'memory'
    },
    {
      id: 'attention_focus',
      question: 'How well can you focus on tasks or conversations? Do you find your mind wandering more than usual?',
      followups: ['What activities do you find most difficult to concentrate on?'],
      category: 'attention'
    },
    {
      id: 'daily_activities',
      question: 'Have you noticed any changes in how you handle daily activities like cooking, managing finances, or following directions?',
      followups: ['Which activities feel more challenging now?', 'When did you first notice these changes?'],
      category: 'executive'
    },
    {
      id: 'language_words',
      question: 'Do you ever have trouble finding the right words when speaking, or following complex conversations?',
      followups: ['Does this happen more in certain situations?'],
      category: 'language'
    },
    {
      id: 'orientation_time',
      question: 'How confident do you feel about keeping track of dates, times, and where you are?',
      followups: ['Have you ever gotten confused about what day it is or where you were going?'],
      category: 'orientation'
    },
    {
      id: 'mood_changes',
      question: 'Have you or your family noticed any changes in your mood, personality, or behavior recently?',
      followups: ['Can you describe what kinds of changes?'],
      category: 'emotional'
    },
    {
      id: 'social_activities',
      question: 'How do you feel about social activities and hobbies you used to enjoy? Are you still as interested in them?',
      followups: ['What activities do you miss most?', 'What still brings you joy?'],
      category: 'social'
    }
  ],
  
  hi: [
    {
      id: 'memory_recent',
      question: 'अपनी याददाश्त के बारे में बताइए - क्या आप कभी-कभी हाल की बातचीत या चीजें कहाँ रखी हैं, भूल जाते हैं?',
      followups: ['क्या आप कोई खास उदाहरण दे सकते हैं?', 'यह कितनी बार होता है?'],
      category: 'memory'
    },
    {
      id: 'memory_names',
      question: 'नामों और चेहरों को याद रखने में आपकी याददाश्त कैसी है? क्या आपको हाल ही में मिले लोगों को याद रखने में कभी परेशानी होती है?',
      followups: ['क्या यह कुछ नया है, या हमेशा से चुनौतीपूर्ण रहा है?'],
      category: 'memory'
    },
    {
      id: 'attention_focus',
      question: 'आप कामों या बातचीत पर कितनी अच्छी तरह ध्यान केंद्रित कर सकते हैं? क्या आपका मन सामान्य से अधिक भटकता है?',
      followups: ['किन गतिविधियों पर ध्यान केंद्रित करना सबसे कठिन लगता है?'],
      category: 'attention'
    },
    {
      id: 'daily_activities',
      question: 'क्या आपने खाना पकाने, पैसों का प्रबंधन करने, या निर्देशों का पालन करने जैसी रोजमर्रा की गतिविधियों में कोई बदलाव महसूस किया है?',
      followups: ['कौन सी गतिविधियाँ अब अधिक चुनौतीपूर्ण लगती हैं?', 'आपने पहली बार ये बदलाव कब महसूस किए?'],
      category: 'executive'
    },
    {
      id: 'language_words',
      question: 'क्या आपको कभी बोलते समय सही शब्द खोजने में परेशानी होती है, या जटिल बातचीत को समझने में कठिनाई होती है?',
      followups: ['क्या यह किसी खास स्थिति में अधिक होता है?'],
      category: 'language'
    },
    {
      id: 'orientation_time',
      question: 'तारीखों, समय और आप कहाँ हैं, इसका ध्यान रखने में आप कितना आत्मविश्वास महसूस करते हैं?',
      followups: ['क्या आप कभी इस बात को लेकर भ्रमित हुए हैं कि आज कौन सा दिन है या आप कहाँ जा रहे थे?'],
      category: 'orientation'
    },
    {
      id: 'mood_changes',
      question: 'क्या आपने या आपके परिवार ने हाल ही में आपके मूड, व्यक्तित्व या व्यवहार में कोई बदलाव देखा है?',
      followups: ['आप किस तरह के बदलावों का वर्णन कर सकते हैं?'],
      category: 'emotional'
    },
    {
      id: 'social_activities',
      question: 'उन सामाजिक गतिविधियों और शौकों के बारे में आप कैसा महसूस करते हैं जिनका आप पहले आनंद लेते थे? क्या आप अभी भी उनमें उतनी रुचि रखते हैं?',
      followups: ['आप किन गतिविधियों को सबसे अधिक मिस करते हैं?', 'अभी भी क्या आपको खुशी देता है?'],
      category: 'social'
    }
  ],
  
  kn: [
    {
      id: 'memory_recent',
      question: 'ನಿಮ್ಮ ಸ್ಮರಣೆಯ ಬಗ್ಗೆ ಹೇಳಿ - ನೀವು ಕೆಲವೊಮ್ಮೆ ಇತ್ತೀಚಿನ ಸಂಭಾಷಣೆಗಳನ್ನು ಅಥವಾ ವಸ್ತುಗಳನ್ನು ಎಲ್ಲಿ ಇಟ್ಟಿದ್ದೀರಿ ಎಂಬುದನ್ನು ಮರೆತುಬಿಡುತ್ತೀರಾ?',
      followups: ['ನೀವು ಯಾವುದಾದರೂ ನಿರ್ದಿಷ್ಟ ಉದಾಹರಣೆಯನ್ನು ಕೊಡಬಹುದೇ?', 'ಇದು ಎಷ್ಟು ಬಾರಿ ಆಗುತ್ತದೆ?'],
      category: 'memory'
    },
    {
      id: 'memory_names',
      question: 'ಹೆಸರುಗಳು ಮತ್ತು ಮುಖಗಳನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳುವಲ್ಲಿ ನಿಮ್ಮ ಸ್ಮರಣೆ ಹೇಗಿದೆ? ಇತ್ತೀಚೆಗೆ ಭೇಟಿಯಾದ ಜನರನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಲು ನಿಮಗೆ ಕೆಲವೊಮ್ಮೆ ಕಷ್ಟವಾಗುತ್ತದೆಯೇ?',
      followups: ['ಇದು ಹೊಸ ವಿಷಯವೇ, ಅಥವಾ ಯಾವಾಗಲೂ ಸವಾಲಿನ ವಿಷಯವಾಗಿತ್ತೇ?'],
      category: 'memory'
    },
    {
      id: 'attention_focus',
      question: 'ಕೆಲಸಗಳ ಮೇಲೆ ಅಥವಾ ಸಂಭಾಷಣೆಗಳಲ್ಲಿ ನೀವು ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಬಹುದು? ನಿಮ್ಮ ಮನಸ್ಸು ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಲೆದಾಡುತ್ತಿದೆಯೇ?',
      followups: ['ಯಾವ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ಗಮನ ಕೇಂದ್ರೀಕರಿಸುವುದು ಅತ್ಯಂತ ಕಷ್ಟಕರವಾಗಿದೆ?'],
      category: 'attention'
    },
    {
      id: 'daily_activities',
      question: 'ಅಡುಗೆ, ಹಣ ನಿರ್ವಹಣೆ, ಅಥವಾ ನಿರ್ದೇಶನಗಳನ್ನು ಅನುಸರಿಸುವುದು ಮುಂತಾದ ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳನ್ನು ನಿರ್ವಹಿಸುವಲ್ಲಿ ಯಾವುದಾದರೂ ಬದಲಾವಣೆಗಳನ್ನು ನೀವು ಗಮನಿಸಿದ್ದೀರಾ?',
      followups: ['ಯಾವ ಚಟುವಟಿಕೆಗಳು ಈಗ ಹೆಚ್ಚು ಸವಾಲಿನಂತೆ ಅನಿಸುತ್ತವೆ?', 'ನೀವು ಮೊದಲ ಬಾರಿಗೆ ಈ ಬದಲಾವಣೆಗಳನ್ನು ಯಾವಾಗ ಗಮನಿಸಿದ್ದೀರಿ?'],
      category: 'executive'
    },
    {
      id: 'language_words',
      question: 'ಮಾತನಾಡುವಾಗ ಸರಿಯಾದ ಪದಗಳನ್ನು ಹುಡುಕುವಲ್ಲಿ ಅಥವಾ ಸಂಕೀರ್ಣ ಸಂಭಾಷಣೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ನಿಮಗೆ ಕೆಲವೊಮ್ಮೆ ತೊಂದರೆ ಆಗುತ್ತದೆಯೇ?',
      followups: ['ಇದು ಯಾವುದಾದರೂ ನಿರ್ದಿಷ್ಟ ಸಂದರ್ಭಗಳಲ್ಲಿ ಹೆಚ್ಚು ಆಗುತ್ತದೆಯೇ?'],
      category: 'language'
    },
    {
      id: 'orientation_time',
      question: 'ದಿನಾಂಕಗಳು, ಸಮಯ ಮತ್ತು ನೀವು ಎಲ್ಲಿದ್ದೀರಿ ಎಂಬುದರ ಬಗ್ಗೆ ಗಮನವಿಟ್ಟುಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಎಷ್ಟು ಆತ್ಮವಿಶ್ವಾಸ ಅನುಭವಿಸುತ್ತೀರಿ?',
      followups: ['ಇಂದು ಯಾವ ದಿನ ಅಥವಾ ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ ಎಂಬುದರ ಬಗ್ಗೆ ನೀವು ಎಂದಾದರೂ ಗೊಂದಲಕ್ಕೊಳಗಾಗಿದ್ದೀರಾ?'],
      category: 'orientation'
    },
    {
      id: 'mood_changes',
      question: 'ನೀವು ಅಥವಾ ನಿಮ್ಮ ಕುಟುಂಬದವರು ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ಮೂಡ್, ವ್ಯಕ್ತಿತ್ವ ಅಥವಾ ವರ್ತನೆಯಲ್ಲಿ ಯಾವುದಾದರೂ ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿದ್ದೀರಾ?',
      followups: ['ನೀವು ಯಾವ ರೀತಿಯ ಬದಲಾವಣೆಗಳನ್ನು ವಿವರಿಸಬಹುದು?'],
      category: 'emotional'
    },
    {
      id: 'social_activities',
      question: 'ನೀವು ಮೊದಲು ಆನಂದಿಸುತ್ತಿದ್ದ ಸಾಮಾಜಿಕ ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ಹವ್ಯಾಸಗಳ ಬಗ್ಗೆ ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತದೆ? ನೀವು ಇನ್ನೂ ಅವುಗಳಲ್ಲಿ ಅಷ್ಟೇ ಆಸಕ್ತಿ ಹೊಂದಿದ್ದೀರಾ?',
      followups: ['ನೀವು ಯಾವ ಚಟುವಟಿಕೆಗಳನ್ನು ಹೆಚ್ಚು ಮಿಸ್ ಮಾಡುತ್ತೀರಿ?', 'ಇನ್ನೂ ಯಾವುದು ನಿಮಗೆ ಸಂತೋಷ ತರುತ್ತದೆ?'],
      category: 'social'
    }
  ]
};

export const MULTILINGUAL_RESPONSES = {
  en: {
    greeting: [
      `Hello! I'm Dr. Vaidhya, your AI cognitive health assistant. I'm here to have a friendly conversation with you about your cognitive health and well-being.

This isn't a medical diagnosis - think of it as a supportive conversation where I can learn about your experiences and provide personalized insights.

How are you feeling today, and what brings you here?`,

      `Welcome! I'm Dr. Vaidhya, and I'm delighted to speak with you today. I'm here to understand your experiences and provide supportive guidance about cognitive health.

Remember, this is a caring conversation, not a medical examination. Please feel comfortable sharing whatever feels relevant to you.

What would you like to talk about regarding your cognitive health?`
    ],
    
    encouragingResponses: [
      "I appreciate you sharing that with me. ",
      "Thank you for being so open about your experiences. ",
      "That's very helpful information. ",
      "I understand, and that's completely normal to experience. ",
      "Thank you for trusting me with these details. "
    ],
    
    completionMessage: `Thank you for sharing so openly with me. I've gathered valuable insights from our conversation about your cognitive health and daily experiences.

Based on our discussion, I can now provide you with a comprehensive analysis including:

🧠 **Detailed Cognitive Assessment** - Performance across memory, attention, language, and other key domains
📊 **Personalized Insights** - AI-powered analysis tailored to your specific responses  
🎯 **Actionable Recommendations** - Immediate, short-term, and long-term strategies
📈 **Benchmark Comparisons** - How you compare to others in your age group

I'm ready to generate your beautiful, detailed cognitive health report. This will open in a new dedicated results page with interactive charts and personalized guidance.

Would you like me to create your comprehensive cognitive health analysis now?`,

    followupTransition: "That's helpful context. Let me ask you about another area..."
  },
  
  hi: {
    greeting: [
      `नमस्ते! मैं डॉ. वैद्य हूँ, आपका AI संज्ञानात्मक स्वास्थ्य सहायक। मैं यहाँ आपके संज्ञानात्मक स्वास्थ्य और कल्याण के बारे में आपसे मित्रवत बातचीत करने के लिए हूँ।

यह कोई चिकित्सा निदान नहीं है - इसे एक सहायक बातचीत के रूप में समझें जहाँ मैं आपके अनुभवों को समझ सकूं और व्यक्तिगत सुझाव दे सकूं।

आज आप कैसा महसूस कर रहे हैं, और क्या बात आपको यहाँ लेकर आई है?`,

      `स्वागत है! मैं डॉ. वैद्य हूँ, और मुझे आज आपसे बात करके खुशी हो रही है। मैं यहाँ आपके अनुभवों को समझने और संज्ञानात्मक स्वास्थ्य के बारे में सहायक मार्गदर्शन प्रदान करने के लिए हूँ।

याद रखें, यह एक स्नेहपूर्ण बातचीत है, कोई चिकित्सा परीक्षा नहीं। कृपया जो भी आपको प्रासंगिक लगे, उसे साझा करने में सहज महसूस करें।

अपने संज्ञानात्मक स्वास्थ्य के बारे में आप क्या बात करना चाहेंगे?`
    ],
    
    encouragingResponses: [
      "मैं आपके साथ यह साझा करने की सराहना करता हूँ। ",
      "आपके अनुभवों के बारे में इतने खुले तरीके से बताने के लिए धन्यवाद। ",
      "यह बहुत उपयोगी जानकारी है। ",
      "मैं समझता हूँ, और ऐसा अनुभव करना बिल्कुल सामान्य है। ",
      "इन विवरणों पर मुझ पर भरोसा करने के लिए धन्यवाद। "
    ],
    
    completionMessage: `मेरे साथ इतनी खुली बातचीत करने के लिए धन्यवाद। मैंने आपके संज्ञानात्मक स्वास्थ्य और दैनिक अनुभवों के बारे में हमारी बातचीत से मूल्यवान अंतर्दृष्टि एकत्र की है।

हमारी चर्चा के आधार पर, मैं अब आपको एक व्यापक विश्लेषण प्रदान कर सकता हूँ जिसमें शामिल है:

🧠 **वि���्तृत संज्ञानात्मक मूल्यांकन** - स्मृति, ध्यान, भाषा और अन्य मुख्य क्षेत्रों में प्रदर्शन
📊 **व्यक्तिगत अंतर्दृष्टि** - आपकी विशिष्ट प्रतिक्रियाओं के अनुरूप AI-संचालित विश्लेषण
🎯 **क्रियान्वित सुझाव** - तत्काल, अल्पकालिक और दीर्घकालिक रणनीतियाँ
📈 **बेंचमार्क तुलना** - आपकी आयु समूह के अन्य लोगों से तुलना

मैं आपकी सुंदर, विस्तृत संज्ञानात्मक स्वास्थ्य रिपोर्ट तैयार करने के लिए तैयार हूँ। यह इंटरैक्टिव चार्ट और व्यक्तिगत मार्गदर्शन के साथ एक नए समर्पित परिणाम पृष्ठ में खुलेगी।

क्या आप चाहते हैं कि मैं अभी आपका व्यापक संज्ञानात्मक स्वास्थ्य विश्लेषण तैयार करूं?`,

    followupTransition: "यह उपयोगी संदर्भ है। मुझे आपसे एक और क्षेत्र के बारे में पूछने दीजिए..."
  },
  
  kn: {
    greeting: [
      `ನಮಸ್ಕಾರ! ನಾನು ಡಾ. ವೈದ್ಯ, ನಿಮ್ಮ AI ಅರಿವಿನ ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮದ ಬಗ್ಗೆ ನಿಮ್ಮೊಂದಿಗೆ ಸ್ನೇಹಪೂರ್ವಕ ಸಂಭಾಷಣೆ ನಡೆಸಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.

ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ - ಇದನ್ನು ಸಹಾಯಕ ಸಂಭಾಷಣೆಯಾಗಿ ಭಾವಿಸಿ, ಅಲ್ಲಿ ನಾನು ನಿಮ್ಮ ಅನುಭವಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಹುದು ಮತ್ತು ವೈಯಕ್ತಿಕ ಒಳನೋಟಗಳನ್ನು ಒದಗಿಸಬಹುದು.

ಇಂದು ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ, ಮತ್ತು ಏನು ನಿಮ್ಮನ್ನು ಇಲ್ಲಿಗೆ ತಂದಿದೆ?`,

      `ಸ್ವಾಗತ! ನಾನು ಡಾ. ವೈದ್ಯ, ಮತ್ತು ಇಂದು ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲು ನನಗೆ ಸಂತೋಷವಾಗಿದೆ. ನಿಮ್ಮ ಅನುಭವಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಅರಿವಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಸಹಾಯಕ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.

ನೆನಪಿಡಿ, ಇದು ಪ್ರೀತಿಯ ಸಂಭಾಷಣೆ, ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಯಲ್ಲ. ನಿಮಗೆ ಪ್ರಸ್ತುತವೆನಿಸುವ ಯಾವುದನ್ನಾದರೂ ಹಂಚಿಕೊಳ್ಳಲು ದಯವಿಟ್ಟು ಆರಾಮದಾಯಕವಾಗಿರಿ.

ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನೀವು ಏನನ್ನು ಚರ್ಚಿಸಲು ಬಯಸುತ್ತೀರಿ?`
    ],
    
    encouragingResponses: [
      "ಅದನ್ನು ನನ್ನೊಂದಿಗೆ ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕೆ ನಾನು ಮೆಚ್ಚುಗೆ ವ್ಯಕ್ತಪಡಿಸುತ್ತೇನೆ. ",
      "ನಿಮ್ಮ ಅನುಭವಗಳ ಬಗ್ಗೆ ಇಷ್ಟು ಮುಕ್ತವಾಗಿ ಹೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು. ",
      "ಅದು ಬಹಳ ಉಪಯುಕ್ತ ಮಾಹಿತಿ. ",
      "ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತೇನೆ, ಮತ್ತು ಅಂತಹ ಅನುಭವ ಪಡೆಯುವುದು ಸಂಪೂರ್ಣವಾಗಿ ಸಾಮಾನ್ಯ. ",
      "ಈ ವಿವರಗಳನ್ನು ನನ್ನೊಂದಿಗೆ ನಂಬಿಕೆಯಿಂದ ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು. "
    ],
    
    completionMessage: `ನನ್ನೊಂದಿಗೆ ಇಷ್ಟು ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯ ಮತ್ತು ದೈನಂದಿನ ಅನುಭವಗಳ ಬಗ್ಗೆ ನಮ್ಮ ಸಂಭಾಷಣೆಯಿಂದ ನಾನು ಮೌಲ್ಯಯುತ ಒಳನೋಟಗಳನ್ನು ಸಂಗ್ರಹಿಸಿದ್ದೇನೆ.

ನಮ್ಮ ಚರ್ಚೆಯ ಆಧಾರದ ಮೇಲೆ, ನಾನು ಈಗ ನಿಮಗೆ ಒಂದು ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಒದಗಿಸಬಹುದು, ಅದರಲ್ಲಿ ಸೇರಿದೆ:

🧠 **ವಿಸ್ತೃತ ಅರಿವಿನ ಮೌಲ್ಯಮಾಪನ** - ಸ್ಮರಣೆ, ಗಮನ, ಭಾಷೆ ಮತ್ತು ಇತರ ಪ್ರಮುಖ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಕಾರ್ಯಕ್ಷಮತೆ
📊 **ವೈಯಕ್ತಿಕ ಒಳನೋಟಗಳು** - ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಗೆ ಅನುಗುಣವಾದ AI-ಚಾಲಿತ ವಿಶ್ಲೇಷಣೆ
🎯 **ಕ್ರಿಯಾಶೀಲ ಶಿಫಾರಸುಗಳು** - ತಕ್ಷಣದ, ಅಲ್ಪಾವಧಿ ಮತ್ತು ದೀರ್ಘಾವಧಿಯ ಕಾರ್ಯತಂತ್ರಗಳು
📈 **ಮಾನದಂಡ ಹೋಲಿಕೆಗಳು** - ನಿಮ್ಮ ವಯೋಮಾನದ ಇತರರೊಂದಿಗೆ ನೀವು ಹೇಗೆ ಹೋಲಿಕೆ ಮಾಡುತ್ತೀರಿ

ನಿಮ್ಮ ಸುಂದರವಾದ, ವಿಸ್ತೃತ ಅರಿವಿನ ಆರೋಗ್ಯ ವರದಿಯನ್ನು ರಚಿಸಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ. ಇದು ಸಂವಾದಾತ್ಮಕ ಚಾರ್ಟ್‌ಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಹೊಸ ಮೀಸಲಾದ ಫಲಿತಾಂಶಗಳ ಪುಟದಲ್ಲಿ ತೆರೆಯುತ್ತದೆ.

ನಾನು ಈಗ ನಿಮ್ಮ ಸಮಗ್ರ ಅರಿವಿನ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆಯನ್ನು ರಚಿಸಬೇಕೆಂದು ನೀವು ಬಯಸುತ್ತೀರಾ?`,

    followupTransition: "ಅದು ಉಪಯುಕ್ತ ಸಂದರ್ಭ. ನಾನು ನಿಮ್ಮನ್ನು ಇನ್ನೊಂದು ಕ್ಷೇತ್ರದ ಬಗ್ಗೆ ಕೇಳುತ್ತೇನೆ..."
  }
};

export const MULTILINGUAL_UI_TEXT = {
  en: {
    doctorName: "Dr. Vaidhya",
    specialization: "AI Cognitive Health Assistant",
    stepLabel: "Question",
    analysisTitle: "Assessment Complete",
    analysisDescription: "Ready to generate your cognitive health analysis",
    generateReport: "Generate My Report",
    conversationalAssessment: "Conversational Assessment",
    supportiveConversation: "This is a supportive conversation, not a medical diagnosis",
    typingPlaceholder: "Share your thoughts and experiences...",
    aiThinking: "Dr. Vaidhya is thinking..."
  },
  hi: {
    doctorName: "डॉ. वैद्य",
    specialization: "AI संज्ञानात्मक स्वास्थ्य सहायक",
    stepLabel: "प्रश्न",
    analysisTitle: "मूल्यांकन पूर्ण",
    analysisDescription: "आपका संज्ञानात्मक स्वास्थ्य विश्लेषण तैयार करने के लिए तैयार",
    generateReport: "मेरी रिपोर्ट तैयार करें",
    conversationalAssessment: "बातचीत आधारित मूल्यांकन",
    supportiveConversation: "यह एक सहायक बातचीत है, चिकि���्सा निदान नहीं",
    typingPlaceholder: "अपने विचार और अनुभव साझा करें...",
    aiThinking: "डॉ. वैद्य सोच रहे हैं..."
  },
  kn: {
    doctorName: "ಡಾ. ವೈದ್ಯ",
    specialization: "AI ಅರಿವಿನ ಆರೋಗ್ಯ ಸಹಾಯಕ",
    stepLabel: "ಪ್ರಶ್ನೆ",
    analysisTitle: "ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣ",
    analysisDescription: "ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆಯನ್ನು ರಚಿಸಲು ಸಿದ್ಧ",
    generateReport: "ನನ್ನ ವರದಿಯನ್ನು ರಚಿಸಿ",
    conversationalAssessment: "ಸಂಭಾಷಣೆ ಆಧಾರಿತ ಮೌಲ್ಯಮಾಪನ",
    supportiveConversation: "ಇದು ಸಹಾಯಕ ಸಂಭಾಷಣೆ, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ",
    typingPlaceholder: "ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಮತ್ತು ಅನುಭವಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...",
    aiThinking: "ಡಾ. ವೈದ್ಯ ಆಲೋಚಿಸುತ್ತಿದ್ದಾರೆ..."
  }
};