import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  Target, 
  Clock, 
  Gamepad2, 
  Trophy, 
  Star,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Award,
  Zap,
  Eye,
  Puzzle,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SimpleMemoryTest } from './games/SimpleMemoryTest';
import { SimpleAttentionTest } from './games/SimpleAttentionTest';
import { SimpleProcessingTest } from './games/SimpleProcessingTest';
import { GameResultsAnalytics } from './GameResultsAnalytics';
import { useLanguage } from '../contexts/LanguageContext';

interface GameScore {
  gameType: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  timestamp: Date;
  domain: 'memory' | 'attention' | 'processing' | 'visuospatial' | 'executive';
}

interface GameSession {
  id: string;
  scores: GameScore[];
  overallScore: number;
  completedGames: number;
  totalGames: number;
  timestamp: Date;
  duration: number;
}

export function CognitiveGames() {
  const { t } = useLanguage();
  
  // Safe translation function with fallbacks
  const safeT = (key: string, fallback?: string) => {
    try {
      const translation = t(key);
      return translation === key ? (fallback || key) : translation;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return fallback || key;
    }
  };

  const getCognitiveGames = () => [
    {
      id: 'memory',
      title: safeT('games.memoryTest.title', 'Memory Test'),
      description: safeT('games.memoryTest.description', 'Remember and recall word lists'),
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      domain: 'memory',
      estimatedTime: '2-3 min',
      difficulty: safeT('games.common.standard', 'Standard'),
      skills: ['Word Memory', 'Recall', 'Recognition']
    },
    {
      id: 'attention',
      title: safeT('games.attentionTest.title', 'Attention Test'),
      description: safeT('games.attentionTest.description', 'Stay focused and respond to targets'),
      icon: Target,
      color: 'from-green-500 to-green-600',
      domain: 'attention',
      estimatedTime: '2 min',
      difficulty: 'Simple',
      skills: ['Sustained Attention', 'Response Time']
    },
    {
      id: 'processing',
      title: safeT('games.processingTest.title', 'Processing Speed'),
      description: safeT('games.processingTest.description', 'Complete mental tasks quickly'),
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      domain: 'processing',
      estimatedTime: '90 sec',
      difficulty: 'Easy',
      skills: ['Mental Speed', 'Quick Thinking']
    }
  ];
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const startSession = () => {
    const newSession: GameSession = {
      id: `session-${Date.now()}`,
      scores: [],
      overallScore: 0,
      completedGames: 0,
      totalGames: getCognitiveGames().length,
      timestamp: new Date(),
      duration: 0
    };
    setGameSession(newSession);
    setSessionStartTime(new Date());
    setShowResults(false);
  };

  const startGame = (gameId: string) => {
    setCurrentGame(gameId);
  };

  const handleGameComplete = (score: GameScore) => {
    if (!gameSession) return;

    const updatedScores = [...gameScores, score];
    const updatedSession = {
      ...gameSession,
      scores: updatedScores,
      completedGames: updatedScores.length,
      overallScore: calculateOverallScore(updatedScores)
    };

    setGameScores(updatedScores);
    setGameSession(updatedSession);
    setCurrentGame(null);

    // Check if all games completed
    if (updatedScores.length >= getCognitiveGames().length) {
      completeSession(updatedSession);
    }
  };

  const calculateOverallScore = (scores: GameScore[]): number => {
    if (scores.length === 0) return 0;
    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    return Math.round(totalScore / scores.length);
  };

  const completeSession = (session: GameSession) => {
    if (sessionStartTime) {
      const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      const finalSession = { ...session, duration };
      setGameSession(finalSession);
    }
    setShowResults(true);
  };

  const resetSession = () => {
    setGameSession(null);
    setCurrentGame(null);
    setGameScores([]);
    setShowResults(false);
    setSessionStartTime(null);
  };

  const getGameComponent = (gameId: string) => {
    switch (gameId) {
      case 'memory':
        return <SimpleMemoryTest onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />;
      case 'attention':
        return <SimpleAttentionTest onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />;
      case 'processing':
        return <SimpleProcessingTest onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />;
      default:
        return null;
    }
  };

  const isGameCompleted = (gameId: string) => {
    return gameScores.some(score => score.gameType === gameId);
  };

  const getGameScore = (gameId: string) => {
    return gameScores.find(score => score.gameType === gameId);
  };

  // Show individual game
  if (currentGame) {
    return getGameComponent(currentGame);
  }

  // Show session results
  if (showResults && gameSession) {
    return (
      <GameResultsAnalytics 
        session={gameSession}
        onStartNewSession={resetSession}
        onBackToGames={() => setShowResults(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl">
            <Brain className="h-16 w-16 text-white" />
          </div>
        </div>
        <h1 className="dementia-heading">
          {safeT('games.title', 'Cognitive Assessment')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {safeT('games.description', 'Complete these simple tests to assess your cognitive abilities')}
        </p>
        
        <div className="dementia-alert dementia-alert-info max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <Brain className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <strong className="text-xl">{safeT('games.infoAlert', 'About these tests:')}</strong>
              <p className="mt-3 text-lg leading-relaxed">{safeT('games.subtitle', 'Take simple, clinically-inspired tests to assess your cognitive abilities')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Game Session Status */}
      {gameSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <div>
                    <CardTitle>{t('games.sessionProgress')}</CardTitle>
                    <CardDescription>
                      {gameSession.completedGames} {t('common.of')} {gameSession.totalGames} {t('games.gamesCompleted')}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {gameSession.overallScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">{t('games.overallScore')}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={(gameSession.completedGames / gameSession.totalGames) * 100} className="h-3" />
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={resetSession}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('games.resetSession')}
                </Button>
                {gameSession.completedGames === gameSession.totalGames && (
                  <Button onClick={() => setShowResults(true)}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('games.viewResults')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tests Grid */}
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {getCognitiveGames().map((game, index) => {
          const IconComponent = game.icon;
          const isCompleted = isGameCompleted(game.id);
          const gameScore = getGameScore(game.id);
          
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
            >
              <div className={`dementia-card card-hover motor-friendly ${
                isCompleted ? 'test-success' : ''
              }`}>
                
                <div className="text-center pb-6">
                  <div className="flex justify-center mb-6">
                    <div className={`p-6 rounded-3xl bg-gradient-to-br ${game.color} shadow-xl`}>
                      <IconComponent className="h-14 w-14 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-4">{game.title}</h3>
                  <p className="text-lg leading-relaxed px-4 text-muted-foreground">
                    {game.description}
                  </p>
                  
                  {isCompleted && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div className="dementia-feedback dementia-feedback-positive py-2 px-4 text-lg">
                        Score: {gameScore?.score}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-lg">Duration: {game.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Activity className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-lg">Level: {game.difficulty}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!gameSession) {
                        startSession();
                      }
                      startGame(game.id);
                    }}
                    className={`dementia-button dementia-friendly ${
                      isCompleted ? 'dementia-button-success' : 'comfortable-button-primary'
                    }`}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 mr-3" />
                        {safeT('games.completed', 'Completed')}
                      </>
                    ) : (
                      <>
                        <Play className="h-6 w-6 mr-3" />
                        {safeT('games.startTest', 'Start Test')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Start Section */}
      {!gameSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="dementia-card gentle-pulse text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {safeT('games.readyToBegin', 'Ready to Begin?')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {safeT('games.completeAllTests', 'Complete all 3 tests for a comprehensive cognitive assessment')}
              </p>
            </div>
            <button 
              onClick={startSession}
              className="dementia-button dementia-button-success dementia-friendly mb-6"
            >
              <Trophy className="h-6 w-6 mr-3" />
              {safeT('games.startAssessment', 'Start Assessment')}
            </button>
            <div className="text-lg text-muted-foreground space-y-2">
              <p><strong>⏱️ {safeT('games.estimatedTime', 'Estimated time')}:</strong> 6-8 {safeT('common.minutes', 'minutes')}</p>
              <p><strong>✅ {safeT('games.allTestsIncluded', 'All tests included')}</strong> • <strong>📊 {safeT('games.professionalReport', 'Professional report')}</strong></p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Information Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>{safeT('games.cognitiveAssessment', 'Cognitive Assessment')}:</strong> {safeT('games.assessmentDisclaimer', 'These tests are simplified versions of clinical assessments used by healthcare providers. They measure important cognitive abilities and provide insights about your mental performance. Results are for educational purposes only and should not replace professional evaluation.')}
        </AlertDescription>
      </Alert>
    </div>
  );
}