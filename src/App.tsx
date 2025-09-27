import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  Brain, 
  AlertTriangle, 
  MessageCircle,
  Activity,
  Target,
  Shield,
  Heart,
  Stethoscope
} from 'lucide-react';

import { AssessmentQuiz } from './components/AssessmentQuiz';
import { EducationSection } from './components/EducationSection';
import { ResourcesSection } from './components/ResourcesSection';
import { ConversationalChatbot } from './components/ConversationalChatbot';
import { CognitiveResultsPage } from './components/CognitiveResultsPage';
import { CognitiveGames } from './components/CognitiveGames';
import { DetailedAIAnalytics } from './components/DetailedAIAnalytics';
import { AuthSystem } from './components/AuthSystem';
import { UserSession } from './components/UserSession';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { supabase } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';
import { ErrorBoundary } from './components/ErrorBoundary';

interface UserSession {
  username: string;
  userType: 'patient' | 'admin' | 'guest';
  loginTime: Date;
  id?: string;
  email?: string;
  name?: string;
  accessToken?: string;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { t } = useLanguage();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check localStorage first (fastest option)
        const savedSession = localStorage.getItem('brainpath-session');
        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession);
            const sessionAge = Date.now() - new Date(sessionData.loginTime).getTime();
            const ONE_DAY = 24 * 60 * 60 * 1000;
            
            if (sessionAge < ONE_DAY) {
              const restoredSession = {
                ...sessionData,
                loginTime: new Date(sessionData.loginTime)
              };
              console.log('Restored session from localStorage:', restoredSession.name);
              setUserSession(restoredSession);
              setIsLoading(false);
              return;
            } else {
              console.log('Session expired, removing from localStorage');
              localStorage.removeItem('brainpath-session');
            }
          } catch (parseError) {
            console.warn('Failed to parse saved session:', parseError);
            localStorage.removeItem('brainpath-session');
          }
        }

        // Only check Supabase session if no valid localStorage session
        try {
          if (supabase && supabase.auth && typeof supabase.auth.getSession === 'function') {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const { data: { session }, error } = await supabase.auth.getSession();
            clearTimeout(timeoutId);
            
            if (session && session.user) {
              const userData = {
                id: session.user.id,
                username: session.user.email || 'user@brainpath.com',
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                userType: session.user.email?.includes('admin') ? 'admin' : 'patient',
                loginTime: new Date(),
                accessToken: session.access_token
              };
              console.log('Restored session from Supabase:', userData.name);
              setUserSession(userData);
              
              const sessionForStorage = {
                ...userData,
                loginTime: userData.loginTime.toISOString()
              };
              localStorage.setItem('brainpath-session', JSON.stringify(sessionForStorage));
            }
          }
        } catch (supabaseError) {
          if (supabaseError.name === 'AbortError') {
            console.warn('Supabase session check timed out');
          } else {
            console.warn('Supabase session check failed:', supabaseError);
          }
          // Don't throw - just continue without session
        }
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('brainpath-session');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(results);
    setShowResults(true);
  };

  const handleBackToChat = () => {
    setShowResults(false); 
    setAssessmentResults(null);
    setActiveTab("chatbot");
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase if not a demo account
      if (userSession && !userSession.isDemoAccount) {
        try {
          await supabase.auth.signOut();
        } catch (supabaseError) {
          console.warn('Supabase signout failed:', supabaseError);
          // Continue with local logout even if Supabase fails
        }
      }
      
      // Clear local storage
      localStorage.removeItem('brainpath-session');
      localStorage.removeItem('brainpath-language');
      
      // Reset state
      setUserSession(null);
      setActiveTab("overview");
      setShowResults(false);
      setAssessmentResults(null);
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear state even if cleanup fails
      setUserSession(null);
      setActiveTab("overview");
      setShowResults(false);
      setAssessmentResults(null);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    try {
      const currentTime = new Date();
      const sessionData: UserSession = {
        id: userData.id,
        username: userData.email || userData.username || 'user@brainpath.com',
        email: userData.email,
        name: userData.name || 'User',
        userType: userData.email?.includes('admin') ? 'admin' : 'patient',
        loginTime: currentTime,
        accessToken: userData.accessToken
      };

      setUserSession(sessionData);  
      
      const sessionForStorage = {
        ...sessionData,
        loginTime: currentTime.toISOString() 
      };
      localStorage.setItem('brainpath-session', JSON.stringify(sessionForStorage));
    } catch (error) {
      console.error('Auth success handling error:', error);
      setUserSession({
        username: userData.email || 'user@brainpath.com',
        userType: 'patient',
        loginTime: new Date()
      });
    }
  };

  const getUserDisplayName = () => {
    if (!userSession) return "User";
    if (userSession.name && userSession.name !== 'User') {
      return userSession.name;
    }
    const emailPart = userSession.username.split('@')[0];
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).replace('.', ' ');
  };

  const getUserTypeLabel = () => {
    switch (userSession?.userType) {
      case 'admin': 
        return t('auth.administrator');
      case 'patient': 
        return t('auth.patientUser');
      case 'guest': 
        return t('auth.guestUser');
      default: 
        return t('auth.user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('header.title')}</h2>
          <p className="text-sm text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return <AuthSystem onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{t('header.title')}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
            <UserSession 
              userSession={userSession}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6" />
              <h2 className="text-xl font-semibold">
                {t('auth.welcomeBack')}, {getUserDisplayName()}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <Shield className="w-4 h-4" />
              <p className="text-sm">
                {getUserTypeLabel()} • {t('auth.sessionStarted')} {
                  userSession.loginTime instanceof Date 
                    ? userSession.loginTime.toLocaleTimeString()
                    : new Date(userSession.loginTime).toLocaleTimeString()
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-800 font-semibold mb-2">{t('disclaimer.title')}</h3>
              <p className="text-amber-700 text-sm leading-relaxed">{t('disclaimer.content')}</p>
            </div>
          </div>
        </div>

        {showResults && assessmentResults ? (
          <CognitiveResultsPage 
            assessmentData={assessmentResults}
            onBackToChat={handleBackToChat}
            userProfile={{ age: 45, name: getUserDisplayName() }}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          {!showResults && (
            <div className="mb-12">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`group relative p-8 text-left transition-all duration-300 ${
                      activeTab === 'overview' 
                        ? 'bg-blue-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-blue-200`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        activeTab === 'overview' ? 'bg-white/20' : 'bg-blue-100'
                      }`}>
                        <Heart className={`w-8 h-8 ${
                          activeTab === 'overview' ? 'text-white' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('navigation.overview')}</h3>
                        <p className={`text-sm ${
                          activeTab === 'overview' ? 'text-blue-100' : 'text-gray-500'
                        }`}>Get started with your health journey</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('chatbot')}
                    className={`group relative p-8 text-left transition-all duration-300 ${
                      activeTab === 'chatbot' 
                        ? 'bg-green-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-green-200`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        activeTab === 'chatbot' ? 'bg-white/20' : 'bg-green-100'
                      }`}>
                        <MessageCircle className={`w-8 h-8 ${
                          activeTab === 'chatbot' ? 'text-white' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('navigation.aiChat')}</h3>
                        <p className={`text-sm ${
                          activeTab === 'chatbot' ? 'text-green-100' : 'text-gray-500'
                        }`}>Talk with our AI health assistant</p>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setActiveTab('games')}
                    className={`group relative p-6 text-left transition-all duration-300 ${
                      activeTab === 'games' 
                        ? 'bg-purple-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-purple-200`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex p-3 rounded-full mb-3 ${
                        activeTab === 'games' ? 'bg-white/20' : 'bg-purple-100'
                      }`}>
                        <Target className={`w-6 h-6 ${
                          activeTab === 'games' ? 'text-white' : 'text-purple-600'
                        }`} />
                      </div>
                      <h3 className="font-semibold mb-2">{t('games.title')}</h3>
                      <p className={`text-sm ${
                        activeTab === 'games' ? 'text-purple-100' : 'text-gray-500'
                      }`}>Brain training activities</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('assessment')}
                    className={`group relative p-6 text-left transition-all duration-300 ${
                      activeTab === 'assessment' 
                        ? 'bg-orange-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-orange-200`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex p-3 rounded-full mb-3 ${
                        activeTab === 'assessment' ? 'bg-white/20' : 'bg-orange-100'
                      }`}>
                        <Stethoscope className={`w-6 h-6 ${
                          activeTab === 'assessment' ? 'text-white' : 'text-orange-600'
                        }`} />
                      </div>
                      <h3 className="font-semibold mb-2">{t('navigation.assessment')}</h3>
                      <p className={`text-sm ${
                        activeTab === 'assessment' ? 'text-orange-100' : 'text-gray-500'
                      }`}>Complete health assessment</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`group relative p-6 text-left transition-all duration-300 ${
                      activeTab === 'analytics' 
                        ? 'bg-indigo-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-200`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex p-3 rounded-full mb-3 ${
                        activeTab === 'analytics' ? 'bg-white/20' : 'bg-indigo-100'
                      }`}>
                        <Activity className={`w-6 h-6 ${
                          activeTab === 'analytics' ? 'text-white' : 'text-indigo-600'
                        }`} />
                      </div>
                      <h3 className="font-semibold mb-2">{t('analytics.title')}</h3>
                      <p className={`text-sm ${
                        activeTab === 'analytics' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>View detailed results</p>
                    </div>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setActiveTab('education')}
                    className={`group relative p-8 text-left transition-all duration-300 ${
                      activeTab === 'education' 
                        ? 'bg-teal-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-teal-200`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        activeTab === 'education' ? 'bg-white/20' : 'bg-teal-100'
                      }`}>
                        <Brain className={`w-8 h-8 ${
                          activeTab === 'education' ? 'text-white' : 'text-teal-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('navigation.education')}</h3>
                        <p className={`text-sm ${
                          activeTab === 'education' ? 'text-teal-100' : 'text-gray-500'
                        }`}>Learn about brain health and dementia</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('resources')}
                    className={`group relative p-8 text-left transition-all duration-300 ${
                      activeTab === 'resources' 
                        ? 'bg-rose-600 text-white shadow-xl' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                    } focus:outline-none focus:ring-4 focus:ring-rose-200`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        activeTab === 'resources' ? 'bg-white/20' : 'bg-rose-100'
                      }`}>
                        <Shield className={`w-8 h-8 ${
                          activeTab === 'resources' ? 'text-white' : 'text-rose-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('navigation.resources')}</h3>
                        <p className={`text-sm ${
                          activeTab === 'resources' ? 'text-rose-100' : 'text-gray-500'
                        }`}>Find helpful resources and support</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          <TabsContent value="overview">
            <div className="space-y-8">
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex gap-2 mb-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium rounded">
                        {t('overview.hero.badge')}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded ${
                        userSession?.userType === 'admin' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getUserTypeLabel()}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('overview.hero.title')}
                    </h2>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {t('overview.hero.description')}
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setActiveTab("chatbot")} 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('overview.hero.startAiChat')}
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab("games")} 
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
                      >
                        <Target className="w-4 h-4" />
                        {t('games.startTest')}
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab("assessment")} 
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all"
                      >
                        <Stethoscope className="w-4 h-4" />
                        {t('overview.hero.fullAssessment')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl flex items-center justify-center">
                    <Heart className="w-16 h-16 text-blue-500" />
                  </div>
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-600 mb-2">{t('overview.stats.worldwideTitle')}</h3>
                    <p className="text-sm text-gray-600">{t('overview.stats.worldwideDesc')}</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-600 mb-2">{t('overview.stats.detectionTitle')}</h3>
                    <p className="text-sm text-gray-600">{t('overview.stats.detectionDesc')}</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-amber-600 mb-2">{t('overview.stats.supportTitle')}</h3>
                    <p className="text-sm text-gray-600">{t('overview.stats.supportDesc')}</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('overview.features.title')}</h2>
                  <p className="text-gray-600">{t('overview.features.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveTab("chatbot")}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('overview.features.aiChatTitle')}</h3>
                    <p className="text-sm text-gray-600">{t('overview.features.aiChatDesc')}</p>
                  </div>
                  
                  <div 
                    className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveTab("games")}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('games.title')}</h3>
                    <p className="text-sm text-gray-600">{t('games.description')}</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('overview.cta.title')}</h2>
                  <p className="text-gray-600 mb-4">{t('overview.cta.description')}</p>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    <button 
                      onClick={() => setActiveTab("chatbot")} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t('overview.hero.startAiChat')}
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("games")} 
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      <Target className="w-4 h-4" />
                      {t('games.startTest')}
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("assessment")} 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all"
                    >
                      <Stethoscope className="w-4 h-4" />
                      {t('overview.hero.fullAssessment')}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="chatbot">
            <ConversationalChatbot 
              onAssessmentComplete={handleAssessmentComplete}
            />
          </TabsContent>

          <TabsContent value="games">
            <CognitiveGames />
          </TabsContent>

          <TabsContent value="assessment">
            <AssessmentQuiz />
          </TabsContent>

          <TabsContent value="analytics">
            <DetailedAIAnalytics 
              assessmentData={{
                overallScore: 78,
                riskLevel: 'low',
                confidence: 87,
                domainScores: {
                  memory: 75,
                  attention: 82,
                  language: 78,
                  visuospatial: 74,
                  executive: 80,
                  orientation: 85
                },
                cognitiveAge: 42,
                progressionRisk: 15,
                strengthAreas: [
                  'Strong attention and focus abilities',
                  'Excellent orientation and temporal awareness',
                  'Good executive function capabilities'
                ],
                concernAreas: [
                  'Slight decline in visuospatial processing',
                  'Memory performance could benefit from targeted exercises'
                ],
                detailedRecommendations: {
                  immediate: [
                    'Maintain regular sleep schedule (7-9 hours)',
                    'Continue current physical exercise routine',
                    'Consider memory training exercises'
                  ],
                  shortTerm: [
                    'Engage in cognitive training programs',
                    'Social activities to maintain cognitive stimulation',
                    'Regular monitoring every 6 months'
                  ],
                  longTerm: [
                    'Maintain healthy lifestyle practices',
                    'Regular medical check-ups',
                    'Consider consultation with neurologist if changes occur'
                  ]
                },
                benchmarkComparison: {
                  ageGroup: 76,
                  educationLevel: 80,
                  general: 72
                },
                riskFactors: {
                  modifiable: [
                    { name: 'Physical Exercise', impact: 15, status: 'good' },
                    { name: 'Social Engagement', impact: 12, status: 'good' },
                    { name: 'Sleep Quality', impact: 10, status: 'moderate' },
                    { name: 'Stress Management', impact: 8, status: 'moderate' }
                  ],
                  nonModifiable: [
                    { name: 'Age Factor', impact: 5 },
                    { name: 'Genetic Predisposition', impact: 3 }
                  ]
                },
                aiInsights: {
                  patternAnalysis: [
                    'Strong performance in executive functions indicates good cognitive control',
                    'Attention scores are above average for age group',
                    'Memory patterns suggest normal age-related changes'
                  ],
                  predictiveIndicators: [
                    'Current trajectory suggests stable cognitive function',
                    'Risk factors are well-managed',
                    'No significant red flags detected'
                  ],
                  personalizedAdvice: [
                    'Continue current lifestyle practices',
                    'Focus on memory enhancement activities',
                    'Consider incorporating more challenging cognitive tasks'
                  ]
                },
                timestamp: new Date(),
                assessmentId: 'DEMO-12345678'
              }}
              userProfile={{
                age: 45,
                education: 'graduate',
                medicalHistory: ['hypertension'],
                lifestyle: ['regular exercise', 'social activities']
              }}
              onExport={() => {
                console.log('Exporting detailed analytics report...');
                alert('PDF export feature will be available soon!');
              }}
              onShare={() => {
                console.log('Sharing analytics with healthcare provider...');
                alert('Share feature will be available soon!');
              }}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationSection />
          </TabsContent>

          <TabsContent value="resources">
            <ResourcesSection />
          </TabsContent>
          </Tabs>
        )}
      </div>

      <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">{t('header.title')}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{t('footer.description')}</p>
          
          <div className="flex justify-center gap-4 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-800">{t('footer.privacy')}</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">{t('footer.terms')}</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App component with all the context providers
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}