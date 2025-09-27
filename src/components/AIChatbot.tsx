import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bot, 
  User, 
  Send, 
  BarChart3, 
  Brain, 
  Lightbulb, 
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { DetailedAIAnalytics } from './DetailedAIAnalytics';
import { AIAnalyticsGenerator } from './AIAnalyticsGenerator';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  isTyping?: boolean;
}

interface AssessmentData {
  cognitiveScore: number;
  domainScores: {
    memory: number;
    attention: number;
    language: number;
    visuospatial: number;
    executive: number;
    orientation: number;
  };
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

interface DetailedAssessmentData {
  overallScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  domainScores: {
    memory: number;
    attention: number;
    language: number;
    visuospatial: number;
    executive: number;
    orientation: number;
  };
  cognitiveAge: number;
  progressionRisk: number;
  strengthAreas: string[];
  concernAreas: string[];
  detailedRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  benchmarkComparison: {
    ageGroup: number;
    educationLevel: number;
    general: number;
  };
  riskFactors: {
    modifiable: Array<{name: string; impact: number; status: 'good' | 'moderate' | 'high'}>;
    nonModifiable: Array<{name: string; impact: number}>;
  };
  aiInsights: {
    patternAnalysis: string[];
    predictiveIndicators: string[];
    personalizedAdvice: string[];
  };
  timestamp: Date;
  assessmentId: string;
}

const getConversationFlow = (t: any) => [
  {
    question: t('chatbot.questions.greeting'),
    type: "text",
    key: "name"
  },
  {
    question: t('chatbot.questions.mood'),
    type: "options",
    options: [
      t('chatbot.options.mood.great'),
      t('chatbot.options.mood.good'),
      t('chatbot.options.mood.okay'),
      t('chatbot.options.mood.notGood'),
      t('chatbot.options.mood.tired')
    ],
    key: "mood"
  },
  {
    question: t('chatbot.questions.memory'),
    type: "options", 
    options: [
      t('chatbot.options.memory.noChanges'),
      t('chatbot.options.memory.minor'),
      t('chatbot.options.memory.moderate'),
      t('chatbot.options.memory.significant')
    ],
    key: "memory"
  },
  {
    question: t('chatbot.questions.attention'),
    type: "options",
    options: [
      t('chatbot.options.attention.veryWell'),
      t('chatbot.options.attention.prettyWell'),
      t('chatbot.options.attention.struggle'),
      t('chatbot.options.attention.distracted'),
      t('chatbot.options.attention.difficult')
    ],
    key: "attention"
  },
  {
    question: t('chatbot.questions.language'),
    type: "options",
    options: [
      t('chatbot.options.language.never'),
      t('chatbot.options.language.rarely'),
      t('chatbot.options.language.sometimes'),
      t('chatbot.options.language.often'),
      t('chatbot.options.language.veryOften')
    ],
    key: "language"
  },
  {
    question: t('chatbot.questions.navigation'),
    type: "options",
    options: [
      t('chatbot.options.navigation.veryConfident'),
      t('chatbot.options.navigation.mostlyConfident'),
      t('chatbot.options.navigation.unsure'),
      t('chatbot.options.navigation.confused'),
      t('chatbot.options.navigation.uncertain')
    ],
    key: "navigation"
  },
  {
    question: t('chatbot.questions.breakfast'),
    type: "text",
    key: "recentMemory"
  },
  {
    question: t('chatbot.questions.selfAssessment'),
    type: "options",
    options: [
      t('chatbot.options.selfAssessment.excellent'),
      t('chatbot.options.selfAssessment.good'),
      t('chatbot.options.selfAssessment.fair'),
      t('chatbot.options.selfAssessment.poor'),
      t('chatbot.options.selfAssessment.veryPoor')
    ],
    key: "selfAssessment"
  }
];

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationData, setConversationData] = useState<Record<string, string>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [detailedAssessmentData, setDetailedAssessmentData] = useState<DetailedAssessmentData | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      });
    }
  };

  useEffect(() => {
    // Only scroll to bottom if we're near the bottom or if it's a new message
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    // Start conversation
    if (messages.length === 0) {
      const conversationFlow = getConversationFlow(t);
      setTimeout(() => {
        addMessage('ai', conversationFlow[0].question, conversationFlow[0].options);
      }, 1000);
    }
  }, [t]);

  const addMessage = (sender: 'ai' | 'user', content: string, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date(),
      options: sender === 'ai' ? options : undefined
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const conversationFlow = getConversationFlow(t);
    // Add user message
    addMessage('user', inputValue);
    
    // Store response
    const currentQuestion = conversationFlow[currentStep];
    setConversationData(prev => ({
      ...prev,
      [currentQuestion.key]: inputValue
    }));

    setInputValue('');
    processNextStep();
  };

  const handleOptionSelect = (option: string) => {
    // Add user message
    addMessage('user', option);
    
    const conversationFlow = getConversationFlow(t);
    // Store response
    const currentQuestion = conversationFlow[currentStep];
    setConversationData(prev => ({
      ...prev,
      [currentQuestion.key]: option
    }));

    processNextStep();
  };

  const processNextStep = () => {
    setIsTyping(true);
    const conversationFlow = getConversationFlow(t);
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (currentStep + 1 < conversationFlow.length) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        const nextQuestion = conversationFlow[nextStep];
        
        setTimeout(() => {
          addMessage('ai', nextQuestion.question, nextQuestion.options);
        }, 500);
      } else {
        // Conversation complete
        setTimeout(() => {
          addMessage('ai', t('chatbot.conversationComplete'));
          generateAnalysis();
        }, 500);
      }
    }, 1000);
  };

  const generateAnalysis = () => {
    setTimeout(() => {
      // Generate detailed assessment data using AI Analytics Generator
      const detailedData = AIAnalyticsGenerator.generateDetailedAnalytics(
        conversationData,
        {
          age: 45, // This would come from user input in a real implementation
          education: 'graduate',
          medicalHistory: [],
          lifestyle: ['exercise', 'social']
        }
      );

      const basicData: AssessmentData = {
        cognitiveScore: detailedData.overallScore,
        domainScores: detailedData.domainScores,
        riskLevel: detailedData.riskLevel as 'low' | 'moderate' | 'high',
        recommendations: [
          t('chatbot.recommendations.exercise'),
          t('chatbot.recommendations.socialConnections'),
          t('chatbot.recommendations.mentalExercises'),
          t('chatbot.recommendations.sleep'),
          t('chatbot.recommendations.screenings')
        ]
      };
      
      setAssessmentData(basicData);
      setDetailedAssessmentData(detailedData);
      setShowAnalysis(true);
    }, 2000);
  };

  const resetConversation = () => {
    setMessages([]);
    setCurrentStep(0);
    setIsTyping(false);
    setConversationData({});
    setShowAnalysis(false);
    setAssessmentData(null);
    setDetailedAssessmentData(null);
    setShowDetailedView(false);
    
    const conversationFlow = getConversationFlow(t);
    setTimeout(() => {
      addMessage('ai', conversationFlow[0].question, conversationFlow[0].options);
    }, 500);
  };

  const conversationFlow = getConversationFlow(t);
  const currentQuestion = conversationFlow[currentStep];
  const canType = currentQuestion?.type === 'text' && !isTyping && !showAnalysis;
  const hasOptions = currentQuestion?.type === 'options' && !isTyping && !showAnalysis;

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const radarData = assessmentData ? [
    { domain: 'Memory', score: assessmentData.domainScores.memory },
    { domain: 'Attention', score: assessmentData.domainScores.attention },
    { domain: 'Language', score: assessmentData.domainScores.language },
    { domain: 'Visuospatial', score: assessmentData.domainScores.visuospatial },
    { domain: 'Executive', score: assessmentData.domainScores.executive },
    { domain: 'Orientation', score: assessmentData.domainScores.orientation }
  ] : [];

  const barData = assessmentData ? Object.entries(assessmentData.domainScores).map(([key, value], index) => ({
    domain: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fill: chartColors[index]
  })) : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] flex flex-col shadow-lg border-2 dark:border-border/50 dark:shadow-2xl">
            <CardHeader className="flex-shrink-0 border-b dark:border-border/50 bg-muted/20 dark:bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 dark:bg-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{t('chatbot.doctorName')}</CardTitle>
                    <CardDescription>{t('chatbot.specialization')}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {t('chatbot.stepLabel')} {Math.min(currentStep + 1, conversationFlow.length)}/{conversationFlow.length}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={resetConversation} className="hover:bg-muted/50">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages Container - Fixed Height with Internal Scroll */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full chat-container">
                  <div className="p-4 space-y-4 min-h-full">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className={message.sender === 'ai' ? 'bg-primary/10' : 'bg-secondary'}>
                              {message.sender === 'ai' ? (
                                <Bot className="h-4 w-4 text-primary" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                            <div className={`rounded-lg px-3 py-2 shadow-sm ${
                              message.sender === 'ai' 
                                ? 'bg-muted/70 dark:bg-muted/50 text-foreground border border-border/50' 
                                : 'bg-primary text-primary-foreground shadow-primary/20'
                            }`}>
                              {message.content}
                            </div>
                            
                            {/* Options */}
                            {message.options && message.sender === 'ai' && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {message.options.map((option, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={!hasOptions}
                                    className="text-xs w-full justify-start hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-border/50 hover:border-primary/50 hover:shadow-sm"
                                  >
                                    {option}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-1">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-2 h-2 bg-primary/60 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-primary/60 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-primary/60 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              {canType && (
                <div className="flex-shrink-0 p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your response..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!showAnalysis ? (
            <Card className="shadow-lg h-fit">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-2 bg-primary/10 rounded-full w-fit mb-2">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{t('chatbot.analysisTitle')}</CardTitle>
                <CardDescription className="text-xs">
                  {t('chatbot.analysisDescription')}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            assessmentData && (
              <div className="space-y-4">
                {/* Analysis Toggle */}
                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Dr. Vaidhya's Analysis</CardTitle>
                      <Button 
                        variant={showDetailedView ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setShowDetailedView(!showDetailedView)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {showDetailedView ? 'Quick View' : 'Detailed View'}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {!showDetailedView ? (
                  <>
                    {/* Cognitive Score */}
                    <Card className="shadow-lg">
                      <CardHeader className="text-center pb-3">
                        <div className="mx-auto p-2 bg-blue-100 dark:bg-blue-950/30 rounded-full w-fit mb-1">
                          <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-xl">
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            {assessmentData.cognitiveScore}
                          </motion.span>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </CardTitle>
                        <CardDescription className="text-xs">{t('chatbot.cognitiveScore')}</CardDescription>
                      </CardHeader>
                    </Card>

                    {/* Domain Radar Chart */}
                    <Card className="shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          {t('chatbot.cognitiveDomains')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 8 }} />
                              <PolarRadiusAxis
                                angle={0}
                                domain={[0, 100]}
                                tick={{ fontSize: 6 }}
                              />
                              <Radar
                                dataKey="score"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    <Card className="shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          {t('chatbot.aiRecommendations')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {assessmentData.recommendations.slice(0, 4).map((rec, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  /* Detailed Analytics Panel */
                  <div className="max-h-[600px] overflow-y-auto">
                    <DetailedAIAnalytics 
                      assessmentData={detailedAssessmentData}
                      userProfile={{
                        age: 45, // This would come from user input
                        education: 'graduate',
                        medicalHistory: [],
                        lifestyle: []
                      }}
                      onExport={() => console.log('Export PDF')}
                      onShare={() => console.log('Share results')}
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}