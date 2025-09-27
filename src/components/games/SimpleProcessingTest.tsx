import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Zap, 
  ArrowLeft, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameScore {
  gameType: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  timestamp: Date;
  domain: 'memory' | 'attention' | 'processing' | 'visuospatial' | 'executive';
}

interface SimpleProcessingTestProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

interface Task {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  startTime: number;
}

const TEST_DURATION = 90; // 90 seconds

export function SimpleProcessingTest({ onComplete, onBack }: SimpleProcessingTestProps) {
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'playing' | 'result'>('setup');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [countdownTime, setCountdownTime] = useState(3);

  const timerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const generateSimpleTask = (id: number): Task => {
    const taskTypes = ['addition', 'comparison', 'matching'];
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    switch (taskType) {
      case 'addition':
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const sum = a + b;
        const wrongAnswers = [
          sum + 1, sum - 1, sum + 2, sum - 2, sum + 3
        ].filter(x => x !== sum && x > 0).slice(0, 3);
        
        const additionOptions = [sum, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        return {
          id,
          question: `${a} + ${b} = ?`,
          options: additionOptions.map(x => x.toString()),
          correctAnswer: additionOptions.indexOf(sum),
          startTime: Date.now()
        };
        
      case 'comparison':
        const num1 = Math.floor(Math.random() * 50) + 10;
        const num2 = Math.floor(Math.random() * 50) + 10;
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        
        return {
          id,
          question: `Which number is larger?`,
          options: [num1.toString(), num2.toString()],
          correctAnswer: num1 === larger ? 0 : 1,
          startTime: Date.now()
        };
        
      case 'matching':
        const colors = ['red', 'blue', 'green', 'yellow'];
        const targetColor = colors[Math.floor(Math.random() * colors.length)];
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        return {
          id,
          question: `Find: ${targetColor}`,
          options: shuffledColors,
          correctAnswer: shuffledColors.indexOf(targetColor),
          startTime: Date.now()
        };
        
      default:
        return generateSimpleTask(id); // Fallback
    }
  };

  const startTest = () => {
    setGameState('countdown');
    setCountdownTime(3);
    
    const countdown = () => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          setGameState('playing');
          startTestLoop();
          return 0;
        }
        return prev - 1;
      });
    };

    countdownTimerRef.current = setInterval(countdown, 1000);
  };

  const startTestLoop = () => {
    setTimeLeft(TEST_DURATION);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setReactionTimes([]);
    setTaskIndex(0);
    
    // Start first task
    const firstTask = generateSimpleTask(0);
    setCurrentTask(firstTask);

    // Game timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (selectedIndex: number) => {
    if (!currentTask || gameState !== 'playing') return;

    const reactionTime = Date.now() - currentTask.startTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setTotalAnswers(prev => prev + 1);

    const isCorrect = selectedIndex === currentTask.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
    }

    // Move to next task
    if (timeLeft > 0) {
      const nextIndex = taskIndex + 1;
      setTaskIndex(nextIndex);
      const nextTask = generateSimpleTask(nextIndex);
      setCurrentTask(nextTask);
    } else {
      endTest();
    }
  };

  const endTest = () => {
    setGameState('result');
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Calculate final metrics
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;

    // Calculate final score (0-100)
    const speedScore = Math.max(0, 100 - (avgReactionTime / 50)); // Faster = better
    const accuracyScore = accuracy;
    const completionScore = (totalAnswers / 60) * 100; // Expect ~1 task per 1.5 seconds
    
    const finalScore = Math.round((speedScore * 0.3) + (accuracyScore * 0.5) + (completionScore * 0.2));

    const gameScore: GameScore = {
      gameType: 'processing',
      score: Math.min(100, finalScore),
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(avgReactionTime),
      difficulty: 'Standard',
      timestamp: new Date(),
      domain: 'processing'
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const resetTest = () => {
    setGameState('setup');
    setCurrentTask(null);
    setTaskIndex(0);
    setTimeLeft(TEST_DURATION);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setReactionTimes([]);
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  const avgReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Processing Speed</CardTitle>
                  <CardDescription className="text-base">
                    Answer simple questions as quickly as possible
                  </CardDescription>
                </div>
              </div>
            </div>
            {gameState === 'playing' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
                <div className="text-sm text-muted-foreground">Time Left</div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Game Status */}
      {gameState === 'playing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{totalAnswers}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(accuracy)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(avgReactionTime)}ms</div>
                <div className="text-sm text-muted-foreground">Avg Speed</div>
              </div>
            </div>
            <Progress value={((TEST_DURATION - timeLeft) / TEST_DURATION) * 100} className="mt-4" />
          </CardContent>
        </Card>
      )}

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
                  <h3 className="text-2xl font-bold">Processing Speed Test</h3>
                  <div className="max-w-xl mx-auto space-y-4 text-left bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6">
                    <h4 className="font-semibold text-lg">Instructions:</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. You'll see simple questions one at a time</p>
                      <p>2. Answer as quickly and accurately as possible</p>
                      <p>3. Questions include simple math, comparisons, and matching</p>
                      <p>4. You have 90 seconds to answer as many as you can</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                      <p className="text-center mb-2"><strong>Example:</strong></p>
                      <div className="text-center space-y-2">
                        <div className="text-xl font-semibold">5 + 3 = ?</div>
                        <div className="flex gap-2 justify-center">
                          <span className="px-3 py-1 bg-gray-100 rounded">7</span>
                          <span className="px-3 py-1 bg-green-100 rounded font-semibold">8</span>
                          <span className="px-3 py-1 bg-gray-100 rounded">9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button size="lg" onClick={startTest} className="bg-gradient-to-r from-orange-500 to-orange-600 text-lg px-8 py-3">
                  <Play className="h-5 w-5 mr-2" />
                  Start Speed Test
                </Button>
              </motion.div>
            )}

            {gameState === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <h3 className="text-xl">Get Ready to Think Fast!</h3>
                <motion.div
                  key={countdownTime}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                  className="text-8xl font-bold text-primary"
                >
                  {countdownTime || 'GO!'}
                </motion.div>
              </motion.div>
            )}

            {gameState === 'playing' && currentTask && (
              <motion.div
                key={`task-${currentTask.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <Badge className="mb-4 bg-orange-100 text-orange-800">
                    Question {totalAnswers + 1}
                  </Badge>
                  <h3 className="text-3xl font-bold mb-6">{currentTask.question}</h3>
                </div>

                <div className={`grid gap-4 max-w-md mx-auto ${
                  currentTask.options.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                }`}>
                  {currentTask.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(index)}
                      className="p-6 text-xl font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Click your answer as quickly as possible
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
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">Speed Test Complete!</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totalAnswers}</div>
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(avgReactionTime)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Speed</div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{score}</div>
                      <div className="text-sm text-muted-foreground">Score</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetTest}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={onBack}>
                    Complete Assessment
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <Zap className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Processing Speed Assessment:</strong> This test measures how quickly you can understand 
          and respond to simple mental tasks. Both speed and accuracy are important for your final score.
        </AlertDescription>
      </Alert>
    </div>
  );
}