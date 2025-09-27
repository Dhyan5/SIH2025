import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Brain, 
  ArrowLeft, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Clock,
  Volume2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

interface GameScore {
  gameType: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  timestamp: Date;
  domain: 'memory' | 'attention' | 'processing' | 'visuospatial' | 'executive';
}

interface SimpleMemoryTestProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

// Simple, common words for memory testing
const WORD_LISTS = [
  ['apple', 'chair', 'phone', 'book', 'water'],
  ['house', 'flower', 'music', 'happy', 'dog'],
  ['tree', 'pencil', 'smile', 'car', 'sun'],
  ['bird', 'table', 'green', 'friend', 'walk'],
  ['cat', 'window', 'blue', 'laugh', 'food']
];

export function SimpleMemoryTest({ onComplete, onBack }: SimpleMemoryTestProps) {
  const { t } = useLanguage();
  const [gameState, setGameState] = useState<'setup' | 'learning' | 'distraction' | 'recall' | 'result'>('setup');
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [userRecall, setUserRecall] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState(1);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showingWord, setShowingWord] = useState(-1);

  const timerRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTest = () => {
    const wordList = WORD_LISTS[Math.floor(Math.random() * WORD_LISTS.length)];
    setCurrentWords(wordList);
    setGameState('learning');
    setStartTime(Date.now());
    showWords(wordList);
  };

  const showWords = (words: string[]) => {
    let index = 0;
    
    const showNext = () => {
      if (index < words.length) {
        setShowingWord(index);
        timerRef.current = setTimeout(() => {
          setShowingWord(-1);
          timerRef.current = setTimeout(() => {
            index++;
            showNext();
          }, 500); // Pause between words
        }, 2000); // Show each word for 2 seconds
      } else {
        // Start distraction task
        setGameState('distraction');
        setTimeLeft(30);
        startDistraction();
      }
    };

    showNext();
  };

  const startDistraction = () => {
    // Simple distraction task - count backwards from 30
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('recall');
          if (inputRef.current) {
            inputRef.current.focus();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleWordSubmit = () => {
    if (currentInput.trim()) {
      const normalizedInput = currentInput.trim().toLowerCase();
      setUserRecall(prev => [...prev, normalizedInput]);
      setCurrentInput('');
      
      // Auto-submit after 5 words or when user presses enter on empty input
      if (userRecall.length >= 4) {
        setTimeout(calculateResults, 500);
      }
    } else if (userRecall.length > 0) {
      // Submit with current recalls
      calculateResults();
    }
  };

  const calculateResults = () => {
    setGameState('result');
    
    // Calculate score based on correct recalls
    const correctWords = userRecall.filter(word => 
      currentWords.some(originalWord => 
        originalWord.toLowerCase() === word.toLowerCase()
      )
    );
    
    const accuracy = (correctWords.length / currentWords.length) * 100;
    const totalTime = Date.now() - startTime;
    
    // Score calculation: accuracy is primary factor
    const finalScore = Math.round(accuracy);
    
    const gameScore: GameScore = {
      gameType: 'memory',
      score: finalScore,
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(totalTime / 1000), // Convert to seconds for display
      difficulty: 'Standard',
      timestamp: new Date(),
      domain: 'memory'
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const resetTest = () => {
    setGameState('setup');
    setCurrentWords([]);
    setUserRecall([]);
    setCurrentInput('');
    setTimeLeft(0);
    setPhase(1);
    setScore(0);
    setTotalCorrect(0);
    setShowingWord(-1);
    
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWordSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('games.backToTests')}
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t('games.memoryTest.title')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('games.memoryTest.description')}
                  </CardDescription>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Area */}
      <Card className="min-h-[400px]">
        <CardContent className="pt-8">
          <AnimatePresence mode="wait">
            {gameState === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">{t('games.memoryTest.instructions.title')}</h3>
                  <div className="max-w-xl mx-auto space-y-4 text-left bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6">
                    <h4 className="font-semibold text-lg">Instructions:</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. {t('games.memoryTest.instructions.step1')}</p>
                      <p>2. {t('games.memoryTest.instructions.step2')}</p>
                      <p>3. {t('games.memoryTest.instructions.step3')}</p>
                      <p>4. {t('games.memoryTest.instructions.step4')}</p>
                    </div>
                  </div>
                </div>
                
                <Button size="lg" onClick={startTest} className="bg-gradient-to-r from-blue-500 to-blue-600 text-lg px-8 py-3">
                  <Play className="h-5 w-5 mr-2" />
                  {t('games.startTest')}
                </Button>
              </motion.div>
            )}

            {gameState === 'learning' && (
              <motion.div
                key="learning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('games.memoryTest.phases.learning')}</h3>
                  <Badge variant="outline" className="text-sm">
                    Word {showingWord + 1} of {currentWords.length}
                  </Badge>
                </div>

                <div className="flex justify-center items-center min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {showingWord >= 0 && (
                      <motion.div
                        key={showingWord}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="text-6xl font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-12 py-8 rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-800"
                      >
                        {currentWords[showingWord]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-muted-foreground">
                  {t('games.memoryTest.instructions.step2')}
                </p>
              </motion.div>
            )}

            {gameState === 'distraction' && (
              <motion.div
                key="distraction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('games.memoryTest.phases.distraction')}</h3>
                  <p className="text-muted-foreground">
                    Count backwards from 30 in your head
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="text-8xl font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-8 py-4 rounded-2xl">
                    {timeLeft}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  This helps clear your immediate memory
                </p>
              </motion.div>
            )}

            {gameState === 'recall' && (
              <motion.div
                key="recall"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">{t('games.memoryTest.phases.recall')}</h3>
                  <p className="text-muted-foreground">
                    Type one word and press Enter. Don't worry about the order.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('games.memoryTest.prompts.enterWord')}</label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder={t('games.memoryTest.prompts.typeWord')}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleWordSubmit} 
                      disabled={!currentInput.trim()}
                      className="flex-1"
                    >
                      {t('games.memoryTest.prompts.addWord')}
                    </Button>
                    <Button 
                      onClick={calculateResults}
                      variant="outline"
                      disabled={userRecall.length === 0}
                    >
                      {t('games.memoryTest.prompts.finish')}
                    </Button>
                  </div>

                  {userRecall.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-2">{t('games.memoryTest.prompts.wordsEntered')}</p>
                      <div className="flex flex-wrap gap-2">
                        {userRecall.map((word, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {userRecall.length}/5 {t('games.memoryTest.prompts.progress')} • Press Enter to add each word
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">{t('games.memoryTest.results.complete')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-lg mx-auto">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {userRecall.filter(word => 
                          currentWords.some(orig => orig.toLowerCase() === word.toLowerCase())
                        ).length}
                      </div>
                      <div className="text-sm text-muted-foreground">{t('games.memoryTest.results.correctWords')}</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((userRecall.filter(word => 
                          currentWords.some(orig => orig.toLowerCase() === word.toLowerCase())
                        ).length / currentWords.length) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">{t('games.memoryTest.results.accuracy')}</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{currentWords.length}</div>
                      <div className="text-sm text-muted-foreground">{t('games.memoryTest.results.totalWords')}</div>
                    </div>
                  </div>

                  <div className="text-left max-w-md mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium mb-2">{t('games.memoryTest.results.originalWords')}</p>
                    <div className="flex flex-wrap gap-2">
                      {currentWords.map((word, index) => (
                        <Badge 
                          key={index} 
                          variant={userRecall.some(recall => recall.toLowerCase() === word.toLowerCase()) ? "default" : "outline"}
                          className="text-sm"
                        >
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetTest}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('games.common.tryAgain')}
                  </Button>
                  <Button onClick={onBack}>
                    {t('games.common.continueToNext')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Memory Assessment:</strong> This test measures your ability to learn and recall new information, 
          similar to tests used by healthcare providers. It's normal if you don't remember all the words.
        </AlertDescription>
      </Alert>
    </div>
  );
}