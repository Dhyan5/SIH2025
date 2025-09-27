import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Bot, 
  User, 
  Send, 
  RotateCcw,
  Brain,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { AIAnalyticsGenerator } from './AIAnalyticsGenerator';
import { ChatLanguageSelector } from './ChatLanguageSelector';
import { 
  MULTILINGUAL_ASSESSMENT_QUESTIONS, 
  MULTILINGUAL_RESPONSES, 
  MULTILINGUAL_UI_TEXT,
  AssessmentQuestion
} from './MultilingualConversationData';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationState {
  phase: 'greeting' | 'assessment' | 'followup' | 'complete';
  questionsAsked: string[];
  userResponses: Record<string, string>;
  assessmentProgress: number;
}

type ChatLanguage = 'en' | 'hi' | 'kn';



export function ConversationalChatbot({ onAssessmentComplete }: { onAssessmentComplete?: (data: any) => void }) {
  const [chatLanguage, setChatLanguage] = useState<ChatLanguage | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'greeting',
    questionsAsked: [],
    userResponses: {},
    assessmentProgress: 0
  });
  const [showAnalysisPrompt, setShowAnalysisPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    // Start with greeting after language is selected
    if (messages.length === 0 && chatLanguage) {
      setTimeout(() => {
        const greetingOptions = MULTILINGUAL_RESPONSES[chatLanguage].greeting;
        const selectedGreeting = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
        addMessage('ai', selectedGreeting);
      }, 1000);
    }
  }, [chatLanguage]);

  const addMessage = (sender: 'ai' | 'user', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    let response = '';
    let newState = { ...conversationState };

    // Store user response
    if (conversationState.phase === 'assessment' && conversationState.questionsAsked.length > 0) {
      const currentQuestionId = conversationState.questionsAsked[conversationState.questionsAsked.length - 1];
      newState.userResponses[currentQuestionId] = userMessage;
    } else if (conversationState.phase === 'greeting') {
      newState.userResponses['initial_concern'] = userMessage;
    }

    switch (conversationState.phase) {
      case 'greeting':
        response = generateGreetingResponse(userMessage);
        newState.phase = 'assessment';
        break;

      case 'assessment':
        response = generateAssessmentResponse(userMessage, newState);
        break;

      case 'followup':
        response = generateFollowupResponse(userMessage, newState);
        break;

      case 'complete':
        response = generateCompleteResponse(userMessage);
        break;
    }

    setConversationState(newState);
    setIsTyping(false);
    addMessage('ai', response);

    // Check if assessment is complete
    if (chatLanguage && newState.questionsAsked.length >= MULTILINGUAL_ASSESSMENT_QUESTIONS[chatLanguage].length && newState.phase === 'assessment') {
      setTimeout(() => {
        setShowAnalysisPrompt(true);
        addMessage('ai', MULTILINGUAL_RESPONSES[chatLanguage].completionMessage);
        newState.phase = 'complete';
        setConversationState(newState);
      }, 2000);
    }
  };

  const generateGreetingResponse = (userMessage: string): string => {
    if (!chatLanguage) return '';
    
    const responses = MULTILINGUAL_RESPONSES[chatLanguage];
    const encouragement = responses.encouragingResponses[Math.floor(Math.random() * responses.encouragingResponses.length)];
    
    // Get first question from the multilingual questions
    const assessmentQuestions = MULTILINGUAL_ASSESSMENT_QUESTIONS[chatLanguage];
    const firstQuestion = assessmentQuestions[0];
    
    return `${encouragement}${firstQuestion.question}`;
  };

  const generateAssessmentResponse = (userMessage: string, state: ConversationState): string => {
    if (!chatLanguage) return '';
    
    const assessmentQuestions = MULTILINGUAL_ASSESSMENT_QUESTIONS[chatLanguage];
    const responses = MULTILINGUAL_RESPONSES[chatLanguage];
    const remainingQuestions = assessmentQuestions.filter(q => !state.questionsAsked.includes(q.id));
    
    if (remainingQuestions.length === 0) {
      return responses.completionMessage;
    }

    // Select next question based on conversation flow
    const nextQuestion = remainingQuestions[0];
    state.questionsAsked.push(nextQuestion.id);
    state.assessmentProgress = (state.questionsAsked.length / assessmentQuestions.length) * 100;

    const encouragement = responses.encouragingResponses[Math.floor(Math.random() * responses.encouragingResponses.length)];
    
    return `${encouragement}${nextQuestion.question}`;
  };

  const generateFollowupResponse = (userMessage: string, state: ConversationState): string => {
    if (!chatLanguage) return '';
    return MULTILINGUAL_RESPONSES[chatLanguage].followupTransition;
  };

  const generateCompleteResponse = (userMessage: string): string => {
    if (!chatLanguage) return '';
    const responses = MULTILINGUAL_RESPONSES[chatLanguage];
    return responses.encouragingResponses[0] + "Based on our conversation, I have enough information to provide you with meaningful insights about your cognitive health.";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    const userMessage = inputValue;
    setInputValue('');
    
    generateAIResponse(userMessage);
  };

  const handleGenerateAnalysis = () => {
    if (onAssessmentComplete) {
      // Generate detailed assessment data based on conversation
      const assessmentData = AIAnalyticsGenerator.generateDetailedAnalytics(
        conversationState.userResponses,
        {
          age: 45, // This would be collected during conversation
          education: 'graduate',
          medicalHistory: [],
          lifestyle: []
        }
      );
      
      onAssessmentComplete(assessmentData);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationState({
      phase: 'greeting',
      questionsAsked: [],
      userResponses: {},
      assessmentProgress: 0
    });
    setShowAnalysisPrompt(false);
    
    if (chatLanguage) {
      setTimeout(() => {
        const greetingOptions = MULTILINGUAL_RESPONSES[chatLanguage].greeting;
        const selectedGreeting = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
        addMessage('ai', selectedGreeting);
      }, 500);
    }
  };

  const handleLanguageSelect = (language: ChatLanguage) => {
    setChatLanguage(language);
    setConversationState({
      phase: 'greeting',
      questionsAsked: [],
      userResponses: {},
      assessmentProgress: 0
    });
  };

  const handleBackToLanguageSelect = () => {
    setChatLanguage(null);
    setMessages([]);
    setConversationState({
      phase: 'greeting',
      questionsAsked: [],
      userResponses: {},
      assessmentProgress: 0
    });
    setShowAnalysisPrompt(false);
  };

  // Show language selector if no language is chosen
  if (!chatLanguage) {
    return <ChatLanguageSelector onLanguageSelect={handleLanguageSelect} />;
  }

  const uiText = MULTILINGUAL_UI_TEXT[chatLanguage];
  const assessmentQuestions = MULTILINGUAL_ASSESSMENT_QUESTIONS[chatLanguage];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col shadow-xl border-2 dark:border-border/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
        <CardHeader className="flex-shrink-0 border-b dark:border-border/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToLanguageSelect} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="ring-2 ring-primary/20 h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {uiText.doctorName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {uiText.specialization}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {conversationState.phase === 'assessment' && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${conversationState.assessmentProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(conversationState.assessmentProgress)}%
                  </span>
                </div>
              )}
              <Badge variant="outline" className="border-primary/30 text-primary">
                {uiText.stepLabel} {Math.min(conversationState.questionsAsked.length + 1, assessmentQuestions.length)}/{assessmentQuestions.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetConversation} className="hover:bg-muted/50">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full chat-container">
              <div className="p-6 space-y-6 min-h-full">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className={message.sender === 'ai' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                          : 'bg-gradient-to-br from-green-500 to-teal-500 text-white'
                        }>
                          {message.sender === 'ai' ? (
                            <Bot className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`max-w-[75%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 shadow-md ${
                          message.sender === 'ai' 
                            ? 'bg-white dark:bg-gray-800 border border-border/50' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/20'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-border/50 shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-primary/60 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-primary/60 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-primary/60 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{uiText.aiThinking}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Analysis Prompt */}
                {showAnalysisPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800 max-w-md">
                      <CardContent className="pt-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-full">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2">{uiText.analysisTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {uiText.analysisDescription}
                        </p>
                        <Button 
                          onClick={handleGenerateAnalysis}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {uiText.generateReport}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          {!showAnalysisPrompt && (
            <div className="flex-shrink-0 p-6 border-t bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={uiText.typingPlaceholder}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50 transition-colors"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3 mr-1" />
                {uiText.supportiveConversation}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}