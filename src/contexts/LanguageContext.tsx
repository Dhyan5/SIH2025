import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('brainpath-language') as Language;
    if (savedLanguage && ['en', 'hi', 'kn'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('brainpath-language', lang);
  };

  // Translation function with better error handling
  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if translation not found
          value = translations.en;
          for (const fallbackKey of keys) {
            if (value && typeof value === 'object' && fallbackKey in value) {
              value = value[fallbackKey];
            } else {
              console.warn(`Translation missing for key: ${key} in language: ${language}`);
              return key; // Return key if no translation found
            }
          }
          break;
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translation data - Fixed Hindi and Kannada characters
const translations = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      save: "Save",
      cancel: "Cancel",
      continue: "Continue",
      back: "Back",
      next: "Next",
      submit: "Submit",
      close: "Close",
      yes: "Yes",
      no: "No",
      of: "of",
      minutes: "minutes"
    },
    header: {
      title: "BrainPath",
      subtitle: "Cognitive Health Assessment & Resources"
    },
    navigation: {
      overview: "Overview",
      aiChat: "AI Chat",
      assessment: "Assessment",
      education: "Learn More",
      resources: "Resources"
    },
    disclaimer: {
      title: "Important Medical Disclaimer:",
      content: "This tool is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare professional for medical advice and proper diagnosis."
    },
    overview: {
      hero: {
        badge: "Early Detection Matters",
        title: "Understanding Cognitive Health",
        description: "Early awareness of cognitive changes can make a significant difference in planning and care. Our educational screening tool helps you understand potential warning signs and connects you with valuable resources.",
        startAiChat: "Start AI Chat",
        fullAssessment: "Full Assessment"
      },
      stats: {
        worldwideTitle: "55+ Million",
        worldwideDesc: "People worldwide living with dementia",
        detectionTitle: "Early Detection",
        detectionDesc: "Can improve quality of life and planning",
        supportTitle: "Support Available",
        supportDesc: "Resources for patients and families"
      },
      features: {
        title: "How We Can Help",
        subtitle: "Comprehensive tools and resources for cognitive health awareness",
        aiChatTitle: "AI Chat Assessment",
        aiChatDesc: "Interactive conversation with visual graph analysis and real-time insights",
        educationTitle: "Education",
        educationDesc: "Learn about dementia types, risk factors, and prevention strategies",
        resourcesTitle: "Resources",
        resourcesDesc: "Access to support groups, care options, and professional help",
        supportTitle: "Support",
        supportDesc: "Guidance for next steps and connecting with healthcare providers"
      },
      cta: {
        title: "Ready to Learn More?",
        description: "Take our educational assessment to better understand cognitive health warning signs"
      }
    },
    aiChat: {
      title: "AI Cognitive Health Conversation",
      description: "Have a natural, friendly conversation with our AI doctor who will assess your cognitive health and provide instant visual analysis with personalized insights and recommendations.",
      infoAlert: "This AI conversation adapts to your responses and provides real-time visual analysis. The chat takes about 10-15 minutes and generates comprehensive graphs and insights."
    },
    assessment: {
      title: "Cognitive Health Assessment",
      description: "This screening tool helps identify potential warning signs of cognitive decline. It is not a diagnostic tool and should not replace professional medical evaluation.",
      infoAlert: "This comprehensive assessment includes personal information, symptom questionnaire, and interactive cognitive tests. It takes about 15-20 minutes and uses AI to provide personalized analysis. Your data is processed locally and not stored.",
      personalInfo: "Personal Information",
      symptoms: "Symptom Assessment", 
      cognitiveTests: "Cognitive Tests",
      results: "Results & Analysis"
    },
    education: {
      title: "Understanding Dementia",
      description: "Learn about different types of dementia, risk factors, warning signs, and prevention strategies",
      warningSignsTitle: "Warning Signs of Dementia",
      warningSignsDescription: "Early recognition of these warning signs can help with timely evaluation and better planning for care. If you notice several of these signs, consider consulting with a healthcare professional.",
      warningSigns: {
        memoryLoss: {
          title: "Memory Loss",
          description: "Difficulty remembering recent events, names, or important information that disrupts daily activities"
        },
        languageProblems: {
          title: "Language Difficulties",
          description: "Trouble finding the right words, following conversations, or understanding written or spoken language"
        },
        timeConfusion: {
          title: "Time and Place Confusion",
          description: "Getting lost in familiar places, confusion about dates, times, or seasons"
        },
        poorJudgment: {
          title: "Poor Judgment",
          description: "Making unusual financial decisions, neglecting personal hygiene, or poor decision-making"
        },
        moodChanges: {
          title: "Mood and Personality Changes",
          description: "Unusual changes in mood, personality, or behavior that are out of character"
        },
        dailyTaskDifficulties: {
          title: "Daily Task Difficulties",
          description: "Trouble completing familiar tasks at home, work, or during leisure activities"
        }
      },
      riskFactorsTitle: "Risk Factors for Dementia",
      riskFactorsDescription: "Understanding risk factors can help you make informed decisions about lifestyle choices and health management.",
      riskFactors: {
        age: {
          name: "Age",
          description: "The strongest risk factor. Most people with dementia are 65 and older, though early-onset can occur."
        },
        genetics: {
          name: "Family History",
          description: "Having relatives with dementia increases risk, though it's not deterministic."
        },
        heartHealth: {
          name: "Cardiovascular Health",
          description: "Heart disease, stroke, high blood pressure, and diabetes can increase dementia risk."
        },
        headTrauma: {
          name: "Head Trauma",
          description: "Serious head injuries, especially repeated ones, may increase dementia risk later in life."
        },
        education: {
          name: "Educational Attainment",
          description: "Lower levels of formal education are associated with higher dementia risk."
        },
        lifestyle: {
          name: "Lifestyle Factors",
          description: "Smoking, excessive alcohol use, physical inactivity, and social isolation increase risk."
        }
      },
      preventionTitle: "Prevention and Brain Health",
      preventionDescription: "While there's no guaranteed way to prevent dementia, these strategies may help reduce risk and promote brain health.",
      prevention: {
        physicalActivity: {
          title: "Regular Physical Exercise",
          description: "Aim for at least 150 minutes of moderate exercise weekly. Walking, swimming, and dancing are excellent choices."
        },
        healthyDiet: {
          title: "Healthy Diet",
          description: "Follow a Mediterranean-style diet rich in fruits, vegetables, whole grains, fish, and healthy fats."
        },
        socialConnections: {
          title: "Social Engagement",
          description: "Maintain social connections, join groups, volunteer, and engage in community activities."
        },
        mentalStimulation: {
          title: "Mental Stimulation",
          description: "Challenge your brain with reading, puzzles, learning new skills, or playing strategic games."
        },
        healthConditions: {
          title: "Manage Health Conditions",
          description: "Control blood pressure, diabetes, cholesterol levels, and treat hearing problems promptly."
        },
        qualitySleep: {
          title: "Quality Sleep",
          description: "Aim for 7-9 hours of quality sleep nightly and treat sleep disorders like sleep apnea."
        }
      },
      dementiaTypesTitle: "Types of Dementia",
      dementiaTypesDescription: "Understanding different types of dementia can help in recognition and appropriate care planning.",
      dementiaTypes: {
        alzheimers: {
          title: "Alzheimer's Disease",
          badge: "Most Common",
          description: "Accounts for 60-80% of dementia cases. Characterized by memory loss, confusion, and progressive cognitive decline."
        },
        vascular: {
          title: "Vascular Dementia",
          description: "Results from reduced blood flow to the brain, often after strokes. Symptoms may include difficulty with planning and judgment."
        },
        lewyBody: {
          title: "Lewy Body Dementia",
          description: "Features visual hallucinations, sleep disturbances, and movement problems similar to Parkinson's disease."
        },
        frontotemporal: {
          title: "Frontotemporal Dementia",
          description: "Affects personality, behavior, and language. Often occurs at younger ages compared to other types."
        }
      }
    },
    resources: {
      title: "Indian Healthcare Resources",
      description: "Comprehensive directory of dementia care facilities, support organizations, and government schemes across India. Find specialized hospitals, expert doctors, and financial assistance programs near you."
    },
    auth: {
      welcomeBack: "Welcome back",
      sessionStarted: "Session started",
      administrator: "Administrator",
      patientUser: "Patient User",
      guestUser: "Guest User",
      user: "User"
    },
    footer: {
      description: "Educational resource for cognitive health awareness. Not intended for medical diagnosis. Always consult healthcare professionals for medical advice.",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      contact: "Contact"
    },
    chatbot: {
      doctorName: "Dr. Vaidhya",
      specialization: "Cognitive health specialist",
      stepLabel: "Step",
      conversationComplete: "Thank you for sharing all that information with me. Let me analyze your responses and create a personalized cognitive health report. This will just take a moment...",
      startNewConversation: "Start New Conversation",
      analysisTitle: "AI Analysis Pending",
      analysisDescription: "Complete the conversation to see your personalized cognitive health report with beautiful visual insights",
      cognitiveScore: "Cognitive Health Score",
      cognitiveDomains: "Cognitive Domains",
      progressTrend: "Progress Trend",
      riskAssessment: "Risk Assessment",
      aiRecommendations: "AI Recommendations",
      questions: {
        greeting: "Hello! I'm Dr. Vaidhya, your cognitive health assistant. What's your name?",
        mood: "Nice to meet you! How are you feeling today?",
        memory: "Have you noticed any changes in your memory recently?",
        attention: "How well can you concentrate on tasks?",
        language: "Do you sometimes have trouble finding the right words?",
        navigation: "How confident do you feel navigating familiar places?",
        breakfast: "Can you tell me what you had for breakfast this morning?",
        selfAssessment: "How would you rate your overall cognitive health?"
      }
    },
    games: {
      title: "Cognitive Assessment Tests",
      subtitle: "Take simple, clinically-inspired tests to assess your cognitive abilities",
      description: "Each test is designed to be accessible and takes just a few minutes to complete.",
      infoAlert: "These tests are based on clinical assessments used by healthcare providers. They measure memory, attention, and processing speed in a user-friendly format. Results provide educational insights about your cognitive health.",
      backToTests: "Back to Tests",
      startTest: "Start Test",
      completeAssessment: "Complete Assessment",
      estimatedTime: "Estimated time: 6-8 minutes",
      allTestsIncluded: "All tests included",
      professionalReport: "Professional report",
      startAssessment: "Start Assessment",
      readyToBegin: "Ready to Begin?",
      completeAllTests: "Complete all 3 tests for a comprehensive cognitive assessment",
      sessionProgress: "Current Session Progress",
      gamesCompleted: "games completed",
      overallScore: "Overall Score",
      resetSession: "Reset Session",
      viewResults: "View Results",
      cognitiveAssessment: "Cognitive Assessment",
      assessmentDisclaimer: "This assessment is for educational purposes only and should not replace professional medical evaluation.",
      memoryTest: {
        title: "Memory Test",
        description: "Remember and recall a list of words"
      },
      attentionTest: {
        title: "Attention Test",
        description: "Press the button when you see the letter 'A'"
      },
      processingTest: {
        title: "Processing Speed",
        description: "Answer simple questions as quickly as possible"
      },
      common: {
        tryAgain: "Try Again",
        continueToNext: "Continue to Next Test",
        timeLeft: "Time Left",
        duration: "Duration",
        level: "Level",
        questions: "Questions",
        correct: "Correct",
        missed: "Missed",
        wrongClicks: "Wrong Clicks",
        standard: "Standard"
      }
    },
    analytics: {
      title: "Detailed Cognitive Analytics",
      subtitle: "Comprehensive AI-powered analysis by",
      domains: {
        memory: "Memory",
        attention: "Attention", 
        language: "Language",
        visuospatial: "Visuospatial",
        executive: "Executive",
        orientation: "Orientation"
      },
      benchmarks: {
        ageGroup: "Age Group",
        education: "Education Level",
        general: "General Population"
      }
    }
  },
  hi: {
    common: {
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      save: "सेव करें",
      cancel: "रद्द करें",
      continue: "जारी रखें",
      back: "वापस",
      next: "अगला",
      submit: "जमा करें",
      close: "बंद करें",
      yes: "हाँ",
      no: "नहीं",
      of: "का",
      minutes: "मिनट"
    },
    header: {
      title: "ब्रेनपाथ",
      subtitle: "संज्ञानात्मक स्वास्थ्य मूल्यांकन और संसाधन"
    },
    navigation: {
      overview: "अवलोकन",
      aiChat: "AI चैट",
      assessment: "मूल्यांकन",
      education: "और जानें",
      resources: "संसाधन"
    },
    disclaimer: {
      title: "महत्वपूर्ण चिकित्सा अस्वीकरण:",
      content: "यह उपकरण केवल शैक्षिक उद्देश्यों के लिए है और किसी भी बीमारी का निदान, उपचार, इलाज या रोकथाम के लिए नहीं है। चिकित्सा सलाह और उचित निदान के लिए हमेशा योग्य स्वास्थ्य पेशेवर से सलाह लें।"
    },
    overview: {
      hero: {
        badge: "प्रारंभिक पहचान मायने रखती है",
        title: "संज्ञानात्मक स्वास्थ्य को समझना",
        description: "संज्ञानात्मक परिवर्तनों की प्रारंभिक जागरूकता योजना और देखभाल में महत्वपूर्ण अंतर ला सकती है। हमारा शैक्षिक स्क्रीनिंग उपकरण आपको संभावित चेतावनी संकेतों को समझने और मूल्यवान संसाधनों से जुड़ने में मदद करता है।",
        startAiChat: "AI चैट शुरू करें",
        fullAssessment: "पूर्ण मूल्यांकन"
      },
      stats: {
        worldwideTitle: "5.5+ करोड़",
        worldwideDesc: "दुनिया भर में डिमेंशिया के साथ रहने वाले लोग",
        detectionTitle: "प्रारंभिक पहचान",
        detectionDesc: "जीवन की गुणवत्ता और योज��ा में सुधार ला सकती है",
        supportTitle: "सहायता उपलब्ध",
        supportDesc: "रोगियों और परिवारों के लिए संसाधन"
      },
      features: {
        title: "हम कैसे मदद कर सकते हैं",
        subtitle: "संज्ञानात्मक स्वास्थ्य जागरूकता के लिए व्यापक उपकरण और संसाधन",
        aiChatTitle: "AI चैट मूल्यांकन",
        aiChatDesc: "दृश्य ग्राफ विश्लेषण और वास्तविक समय की अंतर्दृष्टि के साथ इंटरैक्टिव बातचीत",
        educationTitle: "शिक्षा",
        educationDesc: "डिमेंशिया के प्रकार, जोखिम कारक और रोकथाम रणनीतियों के बारे में जानें",
        resourcesTitle: "संसाधन",
        resourcesDesc: "सहायता समूहों, देखभाल विकल्पों और पेशेवर सहायता तक पहुंच",
        supportTitle: "सहायता",
        supportDesc: "अगले कदम और स्वास्थ्य सेवा प्रदाताओं से जुड़ने के लिए मार्गदर्शन"
      },
      cta: {
        title: "और जानने के लिए तैयार हैं?",
        description: "संज्ञानात्मक स्वास्थ्य चेतावनी संकेतों को बेहतर समझने के लिए हमारा शैक्षिक मूल्यांकन लें"
      }
    },
    aiChat: {
      title: "AI संज्ञानात्मक स्वास्थ्य बातचीत",
      description: "हमारे AI डॉक्टर के साथ प्राकृतिक, मित्रवत बातचीत करें जो आपके संज्ञानात्मक स्वास्थ्य का आकलन करेगा और व्यक्तिगत अंतर्दृष्टि और सिफारिशों के साथ तत्काल दृश्य विश्लेषण प्रदान करेगा।",
      infoAlert: "यह AI बातचीत आपकी प्रतिक्रियाओं के अनुकूल होती है और वास्तविक समय दृश्य विश्लेषण प्रदान करती है। चैट में लगभग 10-15 मिनट लगते हैं और व्यापक ग्राफ और अंतर्दृष्टि उत्पन्न करता है।"
    },
    assessment: {
      title: "संज्ञानात्मक स्वास्थ्य मूल्यांकन",
      description: "यह स्क्रीनिंग उपकरण संज्ञानात्मक गिरावट के संभावित चेतावनी संकेतों की पहचान करने में मदद करता है। यह एक निदान उपकरण नहीं है और पेशेवर चिकित्सा मूल्यांकन का स्थान नहीं ले सकता।",
      infoAlert: "इस व्यापक मूल्यांकन में व्यक्तिगत जानकारी, लक्षण प्रश्नावली और इंटरैक्टिव संज्ञानात्मक परीक्षण शामिल हैं। इसमें लगभग 15-20 मिनट लगते हैं और व्यक्तिगत विश्लेषण प्रदान करने के लिए AI का उपयोग करता है। आपका डेटा स्थानीय रूप से संसाधित होता है और संग्रहीत नहीं किया जाता।",
      personalInfo: "व्यक्तिगत जानकारी",
      symptoms: "लक्षण मूल्यांकन", 
      cognitiveTests: "संज्ञानात्मक परीक्षण",
      results: "परिणाम और विश्लेषण"
    },
    education: {
      title: "डिमेंशिया को समझना",
      description: "डिमेंशिया के विभिन्न प्रकार, जोखिम कारक, चेतावनी संकेत और रोकथाम रणनीतियों के बारे में जानें",
      warningSignsTitle: "डिमेंशिया के चेतावनी संकेत",
      warningSignsDescription: "इन चेतावनी संकेतों की शीघ्र पहचान समय पर मूल्यांकन और देखभाल की बेहतर योजना में मदद कर सकती है। यदि आप इनमें से कई संकेत देखते हैं, तो स्वास्थ्य पेशेवर से सलाह लेने पर विचार करें।",
      warningSigns: {
        memoryLoss: {
          title: "स्मृति हानि",
          description: "हाल की घटनाओं, नामों या महत्वपूर्ण जानकारी को याद रखने में कठिनाई जो दैनिक गतिविधियों में बाधा डालती है"
        },
        languageProblems: {
          title: "भाषा संबंधी कठिनाइयां",
          description: "सही शब्द खोजने, बातचीत का पालन करने या लिखित या बोली जाने वाली भाषा को समझने में परेशानी"
        },
        timeConfusion: {
          title: "समय और स्थान की भ्रम",
          description: "परिचित जगहों में खो जाना, तारीखों, समय या मौसमों के बारे में भ्रम"
        },
        poorJudgment: {
          title: "गलत निर्णय",
          description: "असामान्य वित्तीय निर्णय लेना, व्यक्तिगत स्वच्छता की उपेक्षा करना या गलत निर्णय लेना"
        },
        moodChanges: {
          title: "मूड और व्यक्तित्व में बदलाव",
          description: "मूड, व्यक्तित्व या व्यवहार में असामान्य बदलाव जो चरित्र से बाहर हैं"
        },
        dailyTaskDifficulties: {
          title: "दैनिक कार्यों में कठिनाई",
          description: "घर, काम या अवकाश गतिविधियों के दौरान परिचित कार्यों को पूरा करने में परेशानी"
        }
      },
      riskFactorsTitle: "डिमेंशिया के जोखिम कारक",
      riskFactorsDescription: "जोखिम कारकों को समझना आपको जीवनशैली विकल्पों और स्वास्थ्य प्रबंधन के बारे में सूचित निर्णय लेने में मदद कर सकता है।",
      riskFactors: {
        age: {
          name: "आयु",
          description: "सबसे मजबूत जोखिम कारक। डिमेंशिया वाले अधिकांश लोग 65 और उससे अधिक उम्र के हैं, हालांकि प्रारंभिक शुरुआत हो सकती है।"
        },
        genetics: {
          name: "पारिवारिक इतिहास",
          description: "डिमेंशिया वाले रिश्तेदारों का होना जोखिम बढ़ाता है, हालांकि यह निर्धारक नहीं है।"
        },
        heartHealth: {
          name: "हृदय स्वास्थ्य",
          description: "हृदय रोग, स्ट्रोक, उच्च रक्तचाप और मधुमेह डिमेंशिया का जोखिम बढ़ा सकते हैं।"
        },
        headTrauma: {
          name: "सिर की चोट",
          description: "गंभीर सिर की चोटें, विशेष रूप से बार-बार होने वाली, जीवन में बाद में डिमेंशिया का जोखिम बढ़ा सकती हैं।"
        },
        education: {
          name: "शैक्षिक उपलब्धि",
          description: "औपचारिक शिक्षा के निम्न स्तर उच्च डिमेंशिया जोखिम से जुड़े होते हैं।"
        },
        lifestyle: {
          name: "जीवनशैली कारक",
          description: "धूम्रपान, अत्यधिक शराब का सेवन, शारीरिक निष्क्रियता और सामाजिक अलगाव जोखिम बढ़ाते हैं।"
        }
      },
      preventionTitle: "रोकथाम और मस्तिष्क स्वास्थ्य",
      preventionDescription: "जबकि डिमेंशिया को रोकने का कोई गारंटीशुदा तरीका नहीं है, ये रणनीतियां जोखिम कम करने और मस्तिष्क स्वास्थ्य को बढ़ावा देने में मदद कर सकती हैं।",
      prevention: {
        physicalActivity: {
          title: "नियमित शारीरिक व्यायाम",
          description: "साप्ताहिक कम से कम 150 मिनट मध्यम व्यायाम का लक्ष्य रखें। चलना, तैराकी और नृत्य उत्कृष्ट विकल्प हैं।"
        },
        healthyDiet: {
          title: "स्वस्थ आहार",
          description: "फलों, सब्जियों, साबुत अनाज, मछली और स्वस्थ वसा से भरपूर भूमध्यसागरीय शैली के आहार का पालन करें।"
        },
        socialConnections: {
          title: "सामाजिक जुड़ाव",
          description: "सामाजिक संपर्क बनाए रखें, समूहों में शामिल हों, स्वयंसेवा करें और सामुदायिक गतिविधियों में भाग लें।"
        },
        mentalStimulation: {
          title: "मानसिक उत्तेजना",
          description: "पढ़ने, पहेलियों, नए कौशल सीखने या रणनीतिक खेल खेलने से अपने मस्तिष्क को चुनौती दें।"
        },
        healthConditions: {
          title: "स्वास्थ्य स्थितियों का प्रबंधन",
          description: "रक्तचाप, मधुमेह, कोलेस्ट्रॉल के स्तर को नियंत्रित करें और सुनने की समस्याओं का तुरंत इलाज करें।"
        },
        qualitySleep: {
          title: "गुणवत्तापूर्ण नींद",
          description: "रात में 7-9 घंटे की गुणवत्तापूर्ण नींद का लक्ष्य रखें और स्लीप एप्निया जैसे नींद विकारों का इलाज करें।"
        }
      },
      dementiaTypesTitle: "डिमेंशिया के प्रकार",
      dementiaTypesDescription: "डिमेंशिया के विभिन्न प्रकारों को समझना पहचान और उचित देखभाल योजना में मदद कर सकता है।",
      dementiaTypes: {
        alzheimers: {
          title: "अल्जाइमर रोग",
          badge: "सबसे आम",
          description: "डिमेंशिया के 60-80% मामलों के लिए जिम्मेदार। स्मृति हानि, भ्रम और प्रगतिशील संज्ञानात्मक गिरावट की विशेषता।"
        },
        vascular: {
          title: "संवहनी डिमेंशिया",
          description: "मस्तिष्क में कम रक्त प्रवाह के परिणामस्वरूप, अक्सर स्ट्रोक के बाद। लक्षणों में योजना और निर्णय में कठिनाई शामिल हो सकती है।"
        },
        lewyBody: {
          title: "लेवी बॉडी डिमेंशिया",
          description: "दृश्य मतिभ्रम, नींद की गड़बड़ी और पार्किंसन रोग के समान गति संबंधी समस्याएं शामिल हैं।"
        },
        frontotemporal: {
          title: "फ्रंटोटेम्पोरल डिमेंशिया",
          description: "व्यक्तित्व, व्यवहार और भाषा को प्रभावित करता है। अक्सर अन्य प्रकारों की तुलना में कम उम्र में होता है।"
        }
      }
    },
    resources: {
      title: "भारतीय स्वास्थ्य सेवा संसाधन",
      description: "भारत भर में डिमेंशिया देखभाल सुविधाओं, सहायता संगठनों और सरकारी योजनाओं की व्यापक निर्देशिका। विशेष अस्पताल, विशेषज्ञ डॉक्टर और आपके नज़दीक वित्तीय सहायता कार्यक्रम खोजें।"
    },
    auth: {
      welcomeBack: "वापस आपका स्वागत है",
      sessionStarted: "सत्र शुरू हुआ",
      administrator: "प्रशासक",
      patientUser: "रोगी उपयोगकर्ता",
      guestUser: "अतिथि उपयोगकर्ता",
      user: "उपयोगकर्ता"
    },
    footer: {
      description: "संज्ञानात्मक स्वास्थ्य जागरूकता के लिए शैक्षणिक संसाधन। चिकित्सा निदान के लिए अभिप्रेत नहीं। चिकित्सा सलाह के लिए हमेशा स्वास्थ्य पेशेवरों से सलाह लें।",
      privacy: "गोपनीयता नीति",
      terms: "उपयोग की शर्तें",
      contact: "संपर्क"
    },
    chatbot: {
      doctorName: "डॉ. वैद्य",
      specialization: "संज्ञानात्मक स्वास्थ्य विशेषज्ञ",
      stepLabel: "चरण",
      conversationComplete: "मेरे साथ यह सारी जानकारी साझा करने के लिए धन्यवाद। मुझे आपकी प्रतिक्रियाओं का विश्लेषण करने और एक व्यक्तिगत संज्ञानात्मक स्वास्थ्य रिपोर्ट बनाने दें। इसमें बस एक क्षण लगेगा...",
      startNewConversation: "नई बातचीत शुरू करें",
      analysisTitle: "AI विश्लेषण लंबित",
      analysisDescription: "सुंदर दृश्य अंतर्दृष्टि के साथ अपनी व्यक्तिगत संज्ञानात्मक स्वास्थ्य रिपोर्ट देखने के लिए बातचीत पूरी करें",
      cognitiveScore: "संज्ञानात्मक स्वास्थ्य स्कोर",
      cognitiveDomains: "संज्ञानात्मक क्षेत्र",
      progressTrend: "प्रगति रुझान",
      riskAssessment: "जोखिम मूल्यांकन",
      aiRecommendations: "AI सिफारिशें",
      questions: {
        greeting: "नमस्ते! मैं डॉ. वैद्य हूं, आपका संज्ञानात्मक स्वास्थ्य सहायक। आपका नाम क्या है?",
        mood: "आपसे मिलकर खुशी हुई! आज आप कैसा महसूस कर रहे हैं?",
        memory: "क्या आपने हाल ही में अपनी याददाश्त में कोई बदलाव महसूस किया है?",
        attention: "आप कार्यों पर कितनी अच्छी तरह ध्यान केंद्रित कर सकते हैं?",
        language: "क्या आपको कभी-कभी सही शब्द खोजने में परेशानी होती है?",
        navigation: "परिचित जगहों पर जाने में आप कितना आत्मविश्वास महसूस करते हैं?",
        breakfast: "कृपया बताएं कि आज सुबह आपने नाश्ते में क्या खाया था?",
        selfAssessment: "आप अपने समग्र संज्ञानात्मक स्वास्थ्य ��ो कैसे रेट करेंगे?"
      }
    },
    games: {
      title: "संज्ञानात्मक मूल्यांकन परीक्षण",
      subtitle: "अपनी संज्ञानात्मक क्षमताओं का आकलन करने के लिए सरल, नैदानिक रूप से प्रेरित परीक्षण लें",
      description: "प्रत्येक परीक्षण सुलभ होने के लिए डिज़ाइन किया गया है और पूरा होने में केवल कुछ मिनट लगते हैं।",
      infoAlert: "ये परीक्षण स्वास्थ्य सेवा प्रदाताओं द्वारा उपयोग किए जाने वाले नैदानिक मूल्यांकन पर आधारित हैं। वे उपयोगकर्ता-अनुकूल प्रारूप में स्मृति, ध्यान और प्रसंस्करण गति को मापते हैं। परिणाम आपके संज्ञानात्मक स्वास्थ्य के बारे में शैक्षणिक अंतर्दृष्टि प्रदान करते हैं।",
      backToTests: "परीक्षणों पर वापस जाएं",
      startTest: "परीक्षण शुरू करें",
      completeAssessment: "मूल्यांकन पूरा करें",
      estimatedTime: "अनुमानित समय: 6-8 मिनट",
      allTestsIncluded: "सभी परीक्षण शामिल",
      professionalReport: "पेशेवर रिपोर्ट",
      startAssessment: "मूल्यांकन शुरू करें",
      readyToBegin: "शुरू करने के लिए तैयार हैं?",
      completeAllTests: "व्यापक संज्ञानात्मक मूल्यांकन के लिए सभी 3 परीक्षण पूरे करें",
      sessionProgress: "वर्तमान सत्र प्रगति",
      gamesCompleted: "खेल पूरे हुए",
      overallScore: "समग्र स्कोर",
      resetSession: "सत्र रीसेट करें",
      viewResults: "परिणाम देखें",
      cognitiveAssessment: "संज्ञानात्मक मूल्यांकन",
      assessmentDisclaimer: "यह मूल्यांकन केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा मूल्यांकन का स्थान नहीं ले सकता।",
      memoryTest: {
        title: "स्मृति परीक्षण",
        description: "शब्दों की सूची को याद रखें और वापस बताएं"
      },
      attentionTest: {
        title: "ध्यान परीक्षण",
        description: "जब आप अक्षर 'A' देखें तो बटन दबाएं"
      },
      processingTest: {
        title: "प्रसंस्करण गति",
        description: "जितनी जल्दी हो सके सरल प्रश्नों के उत्तर दें"
      },
      common: {
        tryAgain: "फिर से कोशिश करें",
        continueToNext: "अगले परीक्षण पर जाएं",
        timeLeft: "बचा हुआ समय",
        duration: "अवधि",
        level: "स्तर",
        questions: "प्रश्न",
        correct: "सही",
        missed: "छूटे हुए",
        wrongClicks: "गलत क्लिक",
        standard: "मानक"
      }
    },
    analytics: {
      title: "विस्तृत संज्ञानात्मक विश्लेषण",
      subtitle: "द्वारा व्यापक AI-संचालित विश्लेषण",
      domains: {
        memory: "स्मृति",
        attention: "ध्यान", 
        language: "भाषा",
        visuospatial: "दृश्य-स्थानिक",
        executive: "कार्यकारी",
        orientation: "अभिविन्यास"
      },
      benchmarks: {
        ageGroup: "आयु समूह",
        education: "शिक्षा स्तर",
        general: "सामान्य जनसंख्या"
      }
    }
  },
  kn: {
    common: {
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      error: "ದೋಷ",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      continue: "ಮುಂದುವರಿಸಿ",
      back: "ಹಿಂದೆ",
      next: "ಮುಂದೆ",
      submit: "ಸಲ್ಲಿಸಿ",
      close: "ಮುಚ್ಚಿ",
      yes: "ಹೌದು",
      no: "ಇಲ್ಲ",
      of: "ರ",
      minutes: "ನಿಮಿಷಗಳು"
    },
    header: {
      title: "ಬ್ರೇನ್ಪಾತ್",
      subtitle: "ಅರಿವಿನ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು"
    },
    navigation: {
      overview: "ಅವಲೋಕನ",
      aiChat: "AI ಚಾಟ್",
      assessment: "ಮೌಲ್ಯಮಾಪನ",
      education: "ಹೆಚ್ಚು ತಿಳಿಯಿರಿ",
      resources: "ಸಂಪನ್ಮೂಲಗಳು"
    },
    disclaimer: {
      title: "ಪ್ರಮುಖ ವೈದ್ಯಕೀಯ ಹಕ್ಕು ನಿರಾಕರಣೆ:",
      content: "ಈ ಸಾಧನವು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮತ್ತು ಯಾವುದೇ ರೋಗವನ್ನು ಪತ್ತೆಹಚ್ಚಲು, ಚಿಕಿತ್ಸೆ ನೀಡಲು, ಗುಣಪಡಿಸಲು ಅಥವಾ ತಡೆಯಲು ಉದ್ದೇಶಿಸಿಲ್ಲ. ವೈದ್ಯಕೀಯ ಸಲಹೆ ಮತ್ತು ಸರಿಯಾದ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಯಾವಾಗಲೂ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ."
    },
    overview: {
      hero: {
        badge: "ಆರಂಭಿಕ ಪತ್ತೆ ಮುಖ್ಯವಾಗಿದೆ",
        title: "ಅರಿವಿನ ಆರೋಗ್ಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು",
        description: "ಅರಿವಿನ ಬದಲಾವಣೆಗಳ ಆರಂಭಿಕ ಅರಿವು ಯೋಜನೆ ಮತ್ತು ಆರೈಕೆಯಲ್ಲಿ ಗಮನಾರ್ಹ ವ್ಯತ್ಯಾಸವನ್ನು ಮಾಡಬಹುದು. ನಮ್ಮ ಶೈಕ್ಷಣಿಕ ಸ್ಕ್ರೀನಿಂಗ್ ಸಾಧನವು ಸಂಭಾವ್ಯ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಬೆಲೆಬಾಳುವ ಸಂಪನ್ಮೂಲಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
        startAiChat: "AI ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ",
        fullAssessment: "ಪೂರ್ಣ ಮೌಲ್ಯಮಾಪನ"
      },
      stats: {
        worldwideTitle: "5.5+ ಕೋಟಿ",
        worldwideDesc: "ಪ್ರಪಂಚದಾದ್ಯಂತ ಬುದ್ಧಿಮರೆಯೊಂದಿಗೆ ಬದುಕುತ್ತಿರುವ ಜನರು",
        detectionTitle: "ಆರಂಭಿಕ ಪತ್ತೆ",
        detectionDesc: "ಜೀವನದ ಗುಣಮಟ್ಟ ಮತ್ತು ಯೋಜನೆಯನ್ನು ಸುಧಾರಿಸಬಹುದು",
        supportTitle: "ಬೆಂಬಲ ಲಭ್ಯ",
        supportDesc: "ರೋಗಿಗಳು ಮತ್ತು ಕುಟುಂಬಗಳಿಗೆ ಸಂಪನ್ಮೂಲಗಳು"
      },
      features: {
        title: "ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು",
        subtitle: "ಅರಿವಿನ ಆರೋಗ್ಯ ಜಾಗೃತಿಗಾಗಿ ಸಮಗ್ರ ಉಪಕರಣಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು",
        aiChatTitle: "AI ಚಾಟ್ ಮೌಲ್ಯಮಾಪನ",
        aiChatDesc: "ದೃಶ್ಯ ಗ್ರಾಫ್ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ನೈಜ-ಸಮಯದ ಒಳನೋಟಗಳೊಂದಿಗೆ ಸಂವಾದಾತ್ಮಕ ಸಂಭಾಷಣೆ",
        educationTitle: "ಶಿಕ್ಷಣ",
        educationDesc: "ಬುದ್ಧಿಮರೆ ಪ್ರಕಾರಗಳು, ಅಪಾಯ ಅಂಶಗಳು ಮತ್ತು ತಡೆಗಟ್ಟುವಿಕೆ ತಂತ್ರಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",
        resourcesTitle: "ಸಂಪನ್ಮೂಲಗಳು",
        resourcesDesc: "ಬೆಂಬಲ ಗುಂಪುಗಳು, ಆರೈಕೆ ಆಯ್ಕೆಗಳು ಮತ್ತು ವೃತ್ತಿಪರ ಸಹಾಯದ ಪ್ರವೇಶ",
        supportTitle: "ಬೆಂಬಲ",
        supportDesc: "ಮುಂದಿನ ಹಂತಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಸೇವಾ ಪೂರೈಕೆದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ಮಾರ್ಗದರ್ಶನ"
      },
      cta: {
        title: "ಹೆಚ್ಚು ತಿಳಿಯಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
        description: "ಅರಿವಿನ ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳನ್ನು ಉತ್ತಮವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಮ್ಮ ಶೈಕ್ಷಣಿಕ ಮೌಲ್ಯಮಾಪನವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ"
      }
    },
    aiChat: {
      title: "AI ಅರಿವಿನ ಆರೋಗ್ಯ ಸಂಭಾಷಣೆ",
      description: "ನಮ್ಮ AI ವೈದ್ಯರೊಂದಿಗೆ ನೈಸರ್ಗಿಕ, ಸ್ನೇಹಪರ ಸಂಭಾಷಣೆ ನಡೆಸಿ, ಅವರು ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತಾರೆ ಮತ್ತು ವೈಯಕ್ತಿಕ ಒಳನೋಟಗಳು ಮತ್ತು ಶಿಫಾರಸುಗಳೊಂದಿಗೆ ತ್ವರಿತ ದೃಶ್ಯ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಒದಗಿಸುತ್ತಾರೆ.",
      infoAlert: "ಈ AI ಸಂಭಾಷಣೆಯು ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ ಮತ್ತು ನೈಜ-ಸಮಯದ ದೃಶ್ಯ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ. ಚಾಟ್ ಸುಮಾರು 10-15 ನಿಮಿಷಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ ಮತ್ತು ಸಮಗ್ರ ಗ್ರಾಫ್‌ಗಳು ಮತ್ತು ಒಳನೋಟಗಳನ್ನು ಉತ್ಪಾದಿಸುತ್ತದೆ."
    },
    assessment: {
      title: "ಅರಿವಿನ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ",
      description: "ಈ ಸ್ಕ್ರೀನಿಂಗ್ ಸಾಧನವು ಅರಿವಿನ ಅವನತಿಯ ಸಂಭಾವ್ಯ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳನ್ನು ಗುರುತಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ರೋಗನಿರ್ಣಯ ಸಾಧನವಲ್ಲ ಮತ್ತು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಬದಲಾಯಿಸಬಾರದು.",
      infoAlert: "ಈ ಸಮಗ್ರ ಮೌಲ್ಯಮಾಪನವು ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ, ರೋಗಲಕ್ಷಣ ಪ್ರಶ್ನಾವಳೀ ಮತ್ತು ಸಂವಾದಾತ್ಮಕ ಅರಿವಿನ ಪರೀಕ್ಷೆಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. ಇದು ಸುಮಾರು 15-20 ನಿಮಿಷಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ ಮತ್ತು ವೈಯಕ್ತಿಕ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಒದಗಿಸಲು AI ಅನ್ನು ಬಳಸುತ್ತದೆ. ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.",
      personalInfo: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
      symptoms: "ರೋಗಲಕ್ಷಣ ಮೌಲ್ಯಮಾಪನ", 
      cognitiveTests: "ಅರಿವಿನ ಪರೀಕ್ಷೆಗಳು",
      results: "ಫಲಿತಾಂಶಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ"
    },
    education: {
      title: "ಬುದ್ಧಿಮರೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು",
      description: "ಬುದ್ಧಿಮರೆಯ ವಿವಿಧ ಪ್ರಕಾರಗಳು, ಅಪಾಯ ಅಂಶಗಳು, ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು ಮತ್ತು ತಡೆಗಟ್ಟುವಿಕೆ ತಂತ್ರಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",
      warningSignsTitle: "ಬುದ್ಧಿಮರೆಯ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು",
      warningSignsDescription: "ಈ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳ ಆರಂಭಿಕ ಗುರುತಿಸುವಿಕೆ ಸಮಯೋಚಿತ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಆರೈಕೆಯ ಉತ್ತಮ ಯೋಜನೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು. ನೀವು ಇವುಗಳಲ್ಲಿ ಹಲವಾರು ಚಿಹ್ನೆಗಳನ್ನು ಗಮನಿಸಿದರೆ, ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಲಹೆ ಮಾಡುವುದನ್ನು ಪರಿಗಣಿಸಿ.",
      warningSigns: {
        memoryLoss: {
          title: "ಸ್ಮರಣೆ ನಷ್ಟ",
          description: "ಇತ್ತೀಚಿನ ಘಟನೆಗಳು, ಹೆಸರುಗಳು ಅಥವಾ ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳುವಲ್ಲಿ ಕಷ್ಟ ಮತ್ತು ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳಿಗೆ ಅಡ್ಡಿ"
        },
        languageProblems: {
          title: "ಭಾಷಾ ಕಷ್ಟಗಳು",
          description: "ಸರಿಯಾದ ಪದಗಳನ್ನು ಕಂಡುಹಿಡಿಯುವಲ್ಲಿ, ಸಂಭಾಷಣೆಯನ್ನು ಅನುಸರಿಸುವಲ್ಲಿ ಅಥವಾ ಲಿಖಿತ ಅಥವಾ ಮಾತನಾಡುವ ಭಾಷೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ತೊಂದರೆ"
        },
        timeConfusion: {
          title: "ಸಮಯ ಮತ್ತು ಸ್ಥಳದ ಗೊಂದಲ",
          description: "ಪರಿಚಿತ ಸ್ಥಳಗಳಲ್ಲಿ ಕಳೆದುಹೋಗುವುದು, ದಿನಾಂಕಗಳು, ಸಮಯಗಳು ಅಥವಾ ಋತುಗಳ ಬಗ್ಗೆ ಗೊಂದಲ"
        },
        poorJudgment: {
          title: "ಕಳಪೆ ನಿರ್ಣಯ",
          description: "ಅಸಾಮಾನ್ಯ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳು, ವೈಯಕ್ತಿಕ ನೈರ್ಮಲ್ಯವನ್ನು ನಿರ್ಲಕ್ಷಿಸುವುದು ಅಥವಾ ಕಳಪೆ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವುದು"
        },
        moodChanges: {
          title: "ಮನಸ್ಥಿತಿ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವ ಬದಲಾವಣೆಗಳು",
          description: "ಮನಸ್ಥಿತಿ, ವ್ಯಕ್ತಿತ್ವ ಅಥವಾ ನಡವಳಿಕೆಯಲ್ಲಿ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆಗಳು ಮತ್ತು ಪಾತ್ರದಿಂದ ಹೊರಗಿರುವುದು"
        },
        dailyTaskDifficulties: {
          title: "ದೈನಂದಿನ ಕಾರ್ಯಗಳ ಕಷ್ಟಗಳು",
          description: "ಮನೆಯಲ್ಲಿ, ಕೆಲಸದಲ್ಲಿ ಅಥವಾ ವಿರಾಮ ಚಟುವಟಿಕೆಗಳ ಸಮಯದಲ್ಲಿ ಪರಿಚಿತ ಕಾರ್ಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸುವಲ್ಲಿ ತೊಂದರೆ"
        }
      },
      riskFactorsTitle: "ಬುದ್ಧಿಮರೆಯ ಅಪಾಯ ಅಂಶಗಳು",
      riskFactorsDescription: "ಅಪಾಯ ಅಂಶಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ಜೀವನಶೈಲಿ ಆಯ್ಕೆಗಳು ಮತ್ತು ಆರೋಗ್ಯ ನಿರ್ವಹಣೆಯ ಬಗ್ಗೆ ತಿಳುವಳಿಕೆಯುಳ್ಳ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      riskFactors: {
        age: {
          name: "ವಯಸ್ಸು",
          description: "ಬಲವಾದ ಅಪಾಯ ಅಂಶ. ಬುದ್ಧಿಮರೆ ಹೊಂದಿರುವ ಹೆಚ್ಚಿನ ಜನರು 65 ಮತ್ತು ಅದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ವಯಸ್ಸಿನವರು, ಆದರೂ ಆರಂಭಿಕ ಆರಂಭ ಸಂಭವಿಸಬಹುದು."
        },
        genetics: {
          name: "ಕುಟುಂಬದ ಇತಿಹಾಸ",
          description: "ಬುದ್ಧಿಮರೆ ಹೊಂದಿರುವ ಸಂಬಂಧಿಕರು ಇರುವುದು ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ, ಆದರೂ ಇದು ನಿರ್ಧಾರಕವಲ್ಲ."
        },
        heartHealth: {
          name: "ಹೃದಯ ಆರೋಗ್ಯ",
          description: "ಹೃದ್ರೋಗ, ಪಾರ್ಶ್ವವಾಯು, ಅಧಿಕ ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಮಧುಮೇಹವು ಬುದ್ಧಿಮರೆಯ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸಬಹ���ದು."
        },
        headTrauma: {
          name: "ತಲೆಯ ಆಘಾತ",
          description: "ಗಂಭೀರ ತಲೆಯ ಗಾಯಗಳು, ವಿಶೇಷವಾಗಿ ಪುನರಾವರ್ತಿತವಾದವು, ಜೀವನದಲ್ಲಿ ನಂತರ ಬುದ್ಧಿಮರೆಯ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸಬಹುದು."
        },
        education: {
          name: "ಶೈಕ್ಷಣಿಕ ಸಾಧನೆ",
          description: "ಔಪಚಾರಿಕ ಶಿಕ್ಷಣದ ಕಡಿಮೆ ಮಟ್ಟಗಳು ಹೆಚ್ಚಿನ ಬುದ್ಧಿಮರೆ ಅಪಾಯದೊಂದಿಗೆ ಸಂಬಂಧಿಸಿವೆ."
        },
        lifestyle: {
          name: "ಜೀವನಶೈಲಿ ಅಂಶಗಳು",
          description: "ಧೂಮಪಾನ, ಅತಿಯಾದ ಮದ್ಯಸೇವನೆ, ದೈಹಿಕ ನಿಷ್ಕ್ರಿಯತೆ ಮತ್ತು ಸಾಮಾಜಿಕ ಪ್ರತ್ಯೇಕತೆ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ."
        }
      },
      preventionTitle: "ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಮೆದುಳಿನ ಆರೋಗ್ಯ",
      preventionDescription: "ಬುದ್ಧಿಮರೆಯನ್ನು ತಡೆಗಟ್ಟಲು ಖಾತರಿಯ ಮಾರ್ಗವಿಲ್ಲದಿದ್ದರೂ, ಈ ತಂತ್ರಗಳು ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಮೆದುಳಿನ ಆರೋಗ್ಯವನ್ನು ಉತ್ತೇಜಿಸಲು ಸಹಾಯ ಮಾಡಬಹುದು.",
      prevention: {
        physicalActivity: {
          title: "ನಿಯಮಿತ ದೈಹಿಕ ವ್ಯಾಯಾಮ",
          description: "ಸಾಪ್ತಾಹಿಕ ಕನಿಷ್ಠ 150 ನಿಮಿಷಗಳ ಮಧ್ಯಮ ವ್ಯಾಯಾಮದ ಗುರಿಯಿಡಿ. ನಡಿಗೆ, ಈಜು ಮತ್ತು ನರ್ತನೆ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆಗಳು."
        },
        healthyDiet: {
          title: "ಆರೋಗ್ಯಕರ ಆಹಾರ",
          description: "ಹಣ್ಣುಗಳು, ತರಕಾರಿಗಳು, ಸಂಪೂರ್ಣ ಧಾನ್ಯಗಳು, ಮೀನು ಮತ್ತು ಆರೋಗ್ಯಕರ ಕೊಬ್ಬುಗಳಿಂದ ಭರಿತ ಮೆಡಿಟರೇನಿಯನ್ ಶೈಲಿಯ ಆಹಾರವನ್ನು ಅನುಸರಿಸಿ."
        },
        socialConnections: {
          title: "ಸಾಮಾಜಿಕ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ",
          description: "ಸಾಮಾಜಿಕ ಸಂಪರ್ಕಗಳನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ, ಗುಂಪುಗಳಿಗೆ ಸೇರಿ, ಸ್ವಯಂಸೇವಕರಾಗಿ ಮತ್ತು ಸಮುದಾಯ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ."
        },
        mentalStimulation: {
          title: "ಮಾನಸಿಕ ಉತ್ತೇಜನೆ",
          description: "ಓದುವಿಕೆ, ಪಝಲ್‌ಗಳು, ಹೊಸ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವುದು ಅಥವಾ ತಂತ್ರಗತ ಆಟಗಳನ್ನು ಆಡುವುದರ ಮೂಲಕ ನಿಮ್ಮ ಮೆದುಳಿಗೆ ಸವಾಲು ಹಾಕಿ."
        },
        healthConditions: {
          title: "ಆರೋಗ್ಯ ಸ್ಥಿತಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
          description: "ರಕ್ತದೊತ್ತಡ, ಮಧುಮೇಹ, ಕೊಲೆಸ್ಟ್ರಾಲ್ ಮಟ್ಟವನ್ನು ನಿಯಂತ್ರಿಸಿ ಮತ್ತು ಶ್ರವಣ ಸಮಸ್ಯೆಗಳಿಗೆ ತಕ್ಷಣವೇ ಚಿಕಿತ್ಸೆ ನೀಡಿ."
        },
        qualitySleep: {
          title: "ಗುಣಮಟ್ಟದ ನಿದ್ರೆ",
          description: "ರಾತ್ರಿಗೆ 7-9 ಗಂಟೆಗಳ ಗುಣಮಟ್ಟದ ನಿದ್ರೆಯ ಗುರಿಯಿಡಿ ಮತ್ತು ನಿದ್ರಾ ಕಮಿ ಮುಂತಾದ ನಿದ್ರಾ ಅಸ್ವಸ್ಥತೆಗಳಿಗೆ ಚಿಕಿತ್ಸೆ ನೀಡಿ."
        }
      },
      dementiaTypesTitle: "ಬುದ್ಧಿಮರೆಯ ಪ್ರಕಾರಗಳು",
      dementiaTypesDescription: "ಬುದ್ಧಿಮರೆಯ ವಿವಿಧ ಪ್ರಕಾರಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ಸೂಕ್ತ ಆರೈಕೆ ಯೋಜನೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      dementiaTypes: {
        alzheimers: {
          title: "ಅಲ್ಝೈಮರ್ ಕಾಯಿಲೆ",
          badge: "ಅತ್ಯಂತ ಸಾಮಾನ್ಯ",
          description: "ಬುದ್ಧಿಮರೆಯ 60-80% ಪ್ರಕರಣಗಳಿಗೆ ಕಾರಣ. ಸ್ಮರಣೆ ನಷ್ಟ, ಗೊಂದಲ ಮತ್ತು ಪ್ರಗತಿಶೀಲ ಅರಿವಿನ ಅವನತಿಯ ಲಕ್ಷಣಗಳು."
        },
        vascular: {
          title: "ರಕ್ತನಾಳೀಯ ಬುದ್ಧಿಮರೆ",
          description: "ಮೆದುಳಿಗೆ ಕಡಿಮೆ ರಕ್ತ ಪ್ರವಾಹದ ಪರಿಣಾಮವಾಗಿ, ಸಾಮಾನ್ಯವಾಗಿ ಪಾರ್ಶ್ವವಾಯು ನಂತರ. ಲಕ್ಷಣಗಳು ಯೋಜನೆ ಮತ್ತು ನಿರ್ಣಯದಲ್ಲಿ ಕಷ್ಟವನ್ನು ಒಳಗೊಂಡಿರಬಹುದು."
        },
        lewyBody: {
          title: "ಲೇವಿ ಬಾಡಿ ಬುದ್ಧಿಮರೆ",
          description: "ದೃಶ್ಯ ಭ್ರಮೆಗಳು, ನಿದ್ರಾ ಅಸ್ವಸ್ಥತೆಗಳು ಮತ್ತು ಪಾರ್ಕಿನ್ಸನ್ ಕಾಯಿಲೆಯಂತೆಯೇ ಚಲನೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ಒಳಗೊಂಡಿದೆ."
        },
        frontotemporal: {
          title: "ಫ್ರಂಟೋಟೆಂಪೋರಲ್ ಬುದ್ಧಿಮರೆ",
          description: "ವ್ಯಕ್ತಿತ್ವ, ನಡವಳಿಕೆ ಮತ್ತು ಭಾಷೆಯನ್ನು ಪ್ರಭಾವಿಸುತ್ತದೆ. ಇತರ ಪ್ರಕಾರಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ಸಾಮಾನ್ಯವಾಗಿ ಕಡಿಮೆ ವಯಸ್ಸಿನಲ್ಲಿ ಸಂಭವಿಸುತ್ತದೆ."
        }
      }
    },
    resources: {
      title: "ಭಾರತೀಯ ಆರೋಗ್ಯ ಸೇವಾ ಸಂಪನ್ಮೂಲಗಳು",
      description: "ಭಾರತದಾದ್ಯಂತ ಬುದ್ಧಿಮರೆ ಆರೈಕೆ ಸೌಲಭ್ಯಗಳು, ಬೆಂಬಲ ಸಂಸ್ಥೆಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಸಮಗ್ರ ಡೈರೆಕ್ಟರಿ. ವಿಶೇಷ ಆಸ್ಪತ್ರೆಗಳು, ಪರಿಣಿತ ವೈದ್ಯರು ಮತ್ತು ನಿಮ್ಮ ಸಮೀಪದ ಆರ್ಥಿಕ ���ಹಾಯ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಹುಡುಕಿ."
    },
    auth: {
      welcomeBack: "ಮತ್ತೆ ಸ್ವಾಗತ",
      sessionStarted: "ಸೆಷನ್ ಪ್ರಾರಂಭವಾಯಿತು",
      administrator: "ನಿರ್ವಾಹಕ",
      patientUser: "ರೋಗಿ ಬಳಕೆದಾರ",
      guestUser: "ಅತಿಥಿ ಬಳಕೆದಾರ",
      user: "ಬಳಕೆದಾರ"
    },
    footer: {
      description: "ಅರಿವಿನ ಆರೋಗ್ಯ ಜಾಗೃತಿಗಾಗಿ ಶೈಕ್ಷಣಿಕ ಸಂಪನ್ಮೂಲ. ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಉದ್ದೇಶಿಸಿಲ್ಲ. ವೈದ್ಯಕೀಯ ಸಲಹೆಗಾಗಿ ಯಾವಾಗಲೂ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      privacy: "ಗೌಪ್ಯತೆ ನೀತಿ",
      terms: "ಬಳಕೆಯ ನಿಯಮಗಳು",
      contact: "ಸಂಪರ್ಕ"
    },
    chatbot: {
      doctorName: "ಡಾ. ವೈದ್ಯ",
      specialization: "ಅರಿವಿನ ಆರೋಗ್ಯ ವಿಶೇಷಜ್ಞ",
      stepLabel: "ಹಂತ",
      conversationComplete: "ನನ್ನೊಂದಿಗೆ ಈ ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ವೈಯಕ್ತೀಕರಿಸಿದ ಅರಿವಿನ ಆರೋಗ್ಯ ವರದಿಯನ್ನು ರಚಿಸಲು ನನಗೆ ಅವಕಾಶ ನೀಡಿ. ಇದು ಕೇವಲ ಒಂದು ಕ್ಷಣ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ...",
      startNewConversation: "ಹೊಸ ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ",
      analysisTitle: "AI ವಿಶ್ಲೇಷಣೆ ಬಾಕಿ",
      analysisDescription: "ಸುಂದರವಾದ ದೃಶ್ಯ ಒಳನೋಟಗಳೊಂದಿಗೆ ನಿಮ್ಮ ವೈಯಕ್ತೀಕರಿಸಿದ ಅರಿವಿನ ಆರೋಗ್ಯ ವರದಿಯನ್ನು ನೋಡಲು ಸಂಭಾಷಣೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
      cognitiveScore: "ಅರಿವಿನ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
      cognitiveDomains: "ಅರಿವಿನ ಡೊಮೇನ್‌ಗಳು",
      progressTrend: "ಪ್ರಗತಿ ಪ್ರವೃತ್ತಿ",
      riskAssessment: "ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ",
      aiRecommendations: "AI ಶಿಫಾರಸುಗಳು",
      questions: {
        greeting: "ನಮಸ್ಕಾರ! ನಾನು ಡಾ. ವೈದ್ಯ, ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಿಮ್ಮ ಹೆಸರೇನು?",
        mood: "ನಿಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ ಸಂತೋಷವಾಯಿತು! ಇಂದು ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ?",
        memory: "ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ಸ್ಮರಣೆಯಲ್ಲಿ ಯಾವುದೇ ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿದ್ದೀರಾ?",
        attention: "ಕಾರ್ಯಗಳ ಮೇಲೆ ನೀವು ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಬಹುದು?",
        language: "ಕೆಲವೊಮ್ಮೆ ಸರಿಯಾದ ಪದಗಳನ್ನು ಕಂಡುಹಿಡಿಯುವಲ್ಲಿ ನಿಮಗೆ ತೊಂದರೆ ಇದೆಯೇ?",
        navigation: "ಪರಿಚಿತ ಸ್ಥಳಗಳಲ್ಲಿ ಹೋಗುವಲ್ಲಿ ನೀವು ಎಷ್ಟು ಆತ್ಮವಿಶ್ವಾಸ ಅನುಭವಿಸುತ್ತೀರಿ?",
        breakfast: "ಇಂದು ಬೆಳಿಗ್ಗೆ ನೀವು ಉಪಹಾರಕ್ಕೆ ಏನು ತಿಂದಿದ್ದೀರಿ ಎಂದು ಹೇಳಬಹುದೇ?",
        selfAssessment: "ನಿಮ್ಮ ಒಟ್ಟಾರೆ ಅರಿವಿನ ಆರೋಗ್ಯವನ್ನು ನೀವು ಹೇಗೆ ರೇಟ್ ಮಾಡುತ್ತೀರಿ?"
      }
    },
    games: {
      title: "ಅರಿವಿನ ಮೌಲ್ಯಮಾಪನ ಪರೀಕ್ಷೆಗಳು",
      subtitle: "ನಿಮ್ಮ ಅರಿವಿನ ಸಾಮರ್ಥ್ಯಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ಸರಳ, ಕ್ಲಿನಿಕಲ್-ಪ್ರೇರಿತ ಪರೀಕ್ಷೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ",
      description: "ಪ್ರತಿ ಪರೀಕ್ಷೆಯು ಪ್ರವೇಶಿಸಬಹುದಾದಂತೆ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ ಮತ್ತು ಪೂರ್ಣಗೊಳಿಸಲು ಕೇವಲ ಕೆಲವು ನಿಮಿಷಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.",
      infoAlert: "ಈ ಪರೀಕ್ಷೆಗಳು ಆರೋಗ್ಯ ಸೇವಾ ಪೂರೈಕೆದಾರರು ಬಳಸುವ ಕ್ಲಿನಿಕಲ್ ಮೌಲ್ಯಮಾಪನಗಳನ್ನು ಆಧರಿಸಿದೆ. ಅವರು ಬಳಕೆದಾರ-ಸ್ನೇಹಿ ಸ್ವರೂಪದಲ್ಲಿ ಸ್ಮರಣೆ, ಗಮನ ಮತ್ತು ಸಂಸ್ಕರಣಾ ವೇಗವನ್ನು ಅಳೆಯುತ್ತಾರೆ. ಫಲಿತಾಂಶಗಳು ನಿಮ್ಮ ಅರಿವಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಶೈಕ್ಷಣಿಕ ಒಳನೋಟಗಳನ್ನು ಒದಗಿಸುತ್ತವೆ.",
      backToTests: "ಪರೀಕ್ಷೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
      startTest: "ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ",
      completeAssessment: "ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಳಿಸಿ",
      estimatedTime: "ಅಂದಾಜು ಸಮಯ: 6-8 ನಿಮಿಷಗಳು",
      allTestsIncluded: "ಎಲ್ಲಾ ಪರೀಕ್ಷೆಗಳು ಸೇರಿದೆ",
      professionalReport: "ವೃತ್ತಿಪರ ವರದಿ",
      startAssessment: "ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
      readyToBegin: "ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
      completeAllTests: "ಸಮಗ್ರ ಅರಿವಿನ ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ಎಲ್ಲಾ 3 ಪರೀಕ್ಷೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
      sessionProgress: "ಪ್ರಸ್ತುತ ಸೆಷನ್ ಪ್ರಗತಿ",
      gamesCompleted: "ಆಟಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
      overallScore: "ಒಟ್ಟಾರೆ ಸ್ಕೋರ್",
      resetSession: "ಸೆಷನ್ ಮರುಹೊಂದಿಸಿ",
      viewResults: "ಫಲಿತಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      cognitiveAssessment: "ಅರಿವಿನ ಮೌಲ್ಯಮಾಪನ",
      assessmentDisclaimer: "ಈ ಮೌಲ್ಯಮಾಪನವು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮತ್ತು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಬದಲಾಯಿಸಬಾರದು.",
      memoryTest: {
        title: "ಸ್ಮರಣೆ ಪರೀಕ್ಷೆ",
        description: "ಪದಗಳ ಪಟ್ಟಿಯನ್ನು ನೆನಪಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಹಿಂತಿರುಗಿಸಿ"
      },
      attentionTest: {
        title: "ಗಮನ ಪರೀಕ್ಷೆ",
        description: "ನೀವು 'A' ಅಕ್ಷರವನ್ನು ನೋಡಿದಾಗ ಬಟನ್ ಒತ್ತಿ"
      },
      processingTest: {
        title: "ಸಂಸ್ಕರಣಾ ವೇಗ",
        description: "ಸಾಧ್ಯವಾದಷ್ಟು ಬೇಗ ಸರಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ"
      },
      common: {
        tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
        continueToNext: "ಮುಂದಿನ ಪರೀಕ್ಷೆಗೆ ಮುಂದುವರಿಸಿ",
        timeLeft: "ಉಳಿದ ಸಮಯ",
        duration: "ಅವಧಿ",
        level: "ಮಟ್ಟ",
        questions: "ಪ್ರಶ್ನೆಗಳು",
        correct: "ಸರಿ",
        missed: "ತಪ್ಪಿಸಿದ",
        wrongClicks: "ತಪ್ಪು ಕ್ಲಿಕ್‌ಗಳು",
        standard: "ಮಾನಕ"
      }
    },
    analytics: {
      title: "ವಿವರವಾದ ಅರಿವಿನ ವಿಶ್ಲೇಷಣೆ",
      subtitle: "ಸಮಗ್ರ AI-ಚಾಲಿತ ವಿಶ್ಲೇಷಣೆಯಿಂದ",
      domains: {
        memory: "ಸ್ಮರಣೆ",
        attention: "ಗಮನ", 
        language: "ಭಾಷೆ",
        visuospatial: "ದೃಶ್ಯ-ಸ್ಥಾನಿಕ",
        executive: "ಕಾರ್ಯನಿರ್ವಾಹಕ",
        orientation: "ದಿಕ್ಕು"
      },
      benchmarks: {
        ageGroup: "ವಯೋ ಗುಂಪು",
        education: "ಶಿಕ್ಷಣ ಮಟ್ಟ",
        general: "ಸಾಮಾನ್ಯ ಜನಸಂಖ್ಯೆ"
      }
    }
  }
};