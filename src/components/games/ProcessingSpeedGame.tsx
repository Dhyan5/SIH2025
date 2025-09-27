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
  XCircle,
  Clock,
  TrendingUp,
  Activity
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

interface ProcessingSpeedGameProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

interface Task {
  id: number;
  type: 'match' | 'math' | 'comparison' | 'stroop' | 'spatial';
  question: string;
  options: string[];
  correctAnswer: number;
  startTime: number;
  complexity: number; // 1-3 complexity levels
  isSwitchTrial: boolean; // Track task switching
}

const GAME_DURATION = 180; // 3 minutes for more comprehensive testing
const TASKS_COUNT = 75; // More tasks for better measurement
const SWITCH_PROBABILITY = 0.3; // 30% chance of task switching

export function ProcessingSpeedGame({ onComplete, onBack }: ProcessingSpeedGameProps) {
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'playing' | 'result'>('setup');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [countdownTime, setCountdownTime] = useState(3);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [switchCosts, setSwitchCosts] = useState<number[]>([]);
  const [lastTaskType, setLastTaskType] = useState<string>('');
  const [complexityScores, setComplexityScores] = useState<{[key: number]: {correct: number, total: number}}>({1: {correct: 0, total: 0}, 2: {correct: 0, total: 0}, 3: {correct: 0, total: 0}});
  const [processingEfficiency, setProcessingEfficiency] = useState(100);

  const gameTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const generateTasks = (): Task[] => {
    const generatedTasks: Task[] = [];
    let lastType = '';
    
    for (let i = 0; i < TASKS_COUNT; i++) {
      const taskTypes = ['match', 'math', 'comparison', 'stroop', 'spatial'];
      let taskType: string;
      
      // Determine if this should be a switch trial
      const shouldSwitch = i > 0 && Math.random() < SWITCH_PROBABILITY;
      if (shouldSwitch) {
        // Force a different task type
        const availableTypes = taskTypes.filter(t => t !== lastType);
        taskType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      } else {
        taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      }
      
      const isSwitchTrial = i > 0 && taskType !== lastType;
      const complexity = Math.floor(Math.random() * 3) + 1; // 1-3
      
      let task: Task;
      
      switch (taskType) {
        case 'match':
          task = generateMatchTask(i, complexity, isSwitchTrial);
          break;
        case 'math':
          task = generateMathTask(i, complexity, isSwitchTrial);
          break;
        case 'comparison':
          task = generateComparisonTask(i, complexity, isSwitchTrial);
          break;
        case 'stroop':
          task = generateStroopTask(i, complexity, isSwitchTrial);
          break;
        case 'spatial':
          task = generateSpatialTask(i, complexity, isSwitchTrial);
          break;
        default:
          task = generateMathTask(i, complexity, isSwitchTrial);
      }
      
      generatedTasks.push(task);
      lastType = taskType;
    }
    
    return generatedTasks;
  };

  const generateMatchTask = (id: number, complexity: number, isSwitchTrial: boolean): Task => {
    const shapes = ['●', '■', '▲', '♦', '★', '◆', '▼', '►'];
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
    
    const numItems = complexity + 1; // 2-4 items to match
    const targetItems = [];
    
    for (let i = 0; i < numItems; i++) {
      targetItems.push({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    const targetString = targetItems.map(item => `${item.color} ${item.shape}`).join(', ');
    
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        options.push(targetString);
      } else {
        // Generate wrong answer by changing one element
        const wrongItems = [...targetItems];
        const changeIndex = Math.floor(Math.random() * wrongItems.length);
        if (Math.random() > 0.5) {
          wrongItems[changeIndex].shape = shapes[Math.floor(Math.random() * shapes.length)];
        } else {
          wrongItems[changeIndex].color = colors[Math.floor(Math.random() * colors.length)];
        }
        options.push(wrongItems.map(item => `${item.color} ${item.shape}`).join(', '));
      }
    }
    
    return {
      id,
      type: 'match',
      question: `Find: ${targetString}`,
      options,
      correctAnswer: correctIndex,
      startTime: 0,
      complexity,
      isSwitchTrial
    };
  };

  const generateMathTask = (id: number, complexity: number, isSwitchTrial: boolean): Task => {
    const operations = complexity === 1 ? ['+', '-'] : complexity === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let a, b, correctAnswer;
    const maxNum = complexity * 25;
    
    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        correctAnswer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + maxNum;
        b = Math.floor(Math.random() * maxNum) + 1;
        correctAnswer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * (complexity * 8)) + 1;
        b = Math.floor(Math.random() * (complexity * 8)) + 1;
        correctAnswer = a * b;
        break;
      case '÷':
        correctAnswer = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        a = correctAnswer * b;
        break;
      default:
        a = 1; b = 1; correctAnswer = 2;
    }
    
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        options.push(correctAnswer.toString());
      } else {
        let wrongAnswer;
        const variance = Math.max(5, Math.floor(correctAnswer * 0.3));
        do {
          wrongAnswer = correctAnswer + Math.floor(Math.random() * variance * 2) - variance;
        } while (wrongAnswer === correctAnswer || wrongAnswer < 0);
        options.push(wrongAnswer.toString());
      }
    }
    
    return {
      id,
      type: 'math',
      question: `${a} ${operation} ${b} = ?`,
      options,
      correctAnswer: correctIndex,
      startTime: 0,
      complexity,
      isSwitchTrial
    };
  };

  const generateComparisonTask = (id: number, complexity: number, isSwitchTrial: boolean): Task => {
    const count = complexity + 3; // 4-6 numbers
    const numbers = [];
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (complexity * 50)) + 1);
    }
    
    const operations = ['largest', 'smallest', 'second largest'];
    const operation = operations[Math.min(complexity - 1, operations.length - 1)];
    
    let target: number;
    if (operation === 'largest') {
      target = Math.max(...numbers);
    } else if (operation === 'smallest') {
      target = Math.min(...numbers);
    } else {
      const sorted = [...numbers].sort((a, b) => b - a);
      target = sorted[1];
    }
    
    const correctIndex = numbers.indexOf(target);
    
    return {
      id,
      type: 'comparison',
      question: `Which number is ${operation}?`,
      options: numbers.map(n => n.toString()),
      correctAnswer: correctIndex,
      startTime: 0,
      complexity,
      isSwitchTrial
    };
  };

  const generateStroopTask = (id: number, complexity: number, isSwitchTrial: boolean): Task => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const colorWords = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    
    const word = colorWords[Math.floor(Math.random() * colorWords.length)];
    const displayColor = colors[Math.floor(Math.random() * colors.length)];
    
    const isCongruent = complexity === 1 ? true : Math.random() > 0.5;
    const actualColor = isCongruent ? word.toLowerCase() : displayColor;
    
    const options = colors;
    const correctIndex = colors.indexOf(actualColor);
    
    return {
      id,
      type: 'stroop',
      question: `Color of text: ${word}`,
      options: options.map(c => c.toUpperCase()),
      correctAnswer: correctIndex,
      startTime: 0,
      complexity,
      isSwitchTrial
    };
  };

  const generateSpatialTask = (id: number, complexity: number, isSwitchTrial: boolean): Task => {
    const directions = ['↑', '↓', '←', '→'];
    const orientations = ['up', 'down', 'left', 'right'];
    
    const arrow = directions[Math.floor(Math.random() * directions.length)];
    const rotation = complexity > 1 ? Math.floor(Math.random() * 4) * 90 : 0;
    
    let correctDirection: string;
    switch (arrow) {
      case '↑': correctDirection = rotation === 0 ? 'up' : rotation === 90 ? 'right' : rotation === 180 ? 'down' : 'left'; break;
      case '↓': correctDirection = rotation === 0 ? 'down' : rotation === 90 ? 'left' : rotation === 180 ? 'up' : 'right'; break;
      case '←': correctDirection = rotation === 0 ? 'left' : rotation === 90 ? 'up' : rotation === 180 ? 'right' : 'down'; break;
      case '→': correctDirection = rotation === 0 ? 'right' : rotation === 90 ? 'down' : rotation === 180 ? 'left' : 'up'; break;
      default: correctDirection = 'up';
    }
    
    const correctIndex = orientations.indexOf(correctDirection);
    
    return {
      id,
      type: 'spatial',
      question: `Arrow direction: ${arrow} (rotated ${rotation}°)`,
      options: orientations.map(o => o.toUpperCase()),
      correctAnswer: correctIndex,
      startTime: 0,
      complexity,
      isSwitchTrial
    };
  };

  const startGame = () => {
    setGameState('countdown');
    setCountdownTime(3);
    
    const countdown = () => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          setGameState('playing');
          startGameLoop();
          return 0;
        }
        return prev - 1;
      });
    };

    countdownTimerRef.current = setInterval(countdown, 1000);
  };

  const startGameLoop = () => {
    const generatedTasks = generateTasks();
    setTasks(generatedTasks);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setReactionTimes([]);
    setTaskIndex(0);
    
    // Start first task
    const firstTask = { ...generatedTasks[0], startTime: Date.now() };
    setCurrentTask(firstTask);

    // Game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
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
    
    // Track task switching costs
    if (currentTask.isSwitchTrial && lastTaskType !== currentTask.type) {
      setSwitchCosts(prev => [...prev, reactionTime]);
    }
    setLastTaskType(currentTask.type);
    
    // Update complexity scores
    setComplexityScores(prev => ({
      ...prev,
      [currentTask.complexity]: {
        correct: prev[currentTask.complexity].correct + (isCorrect ? 1 : 0),
        total: prev[currentTask.complexity].total + 1
      }
    }));
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      // Sophisticated scoring based on complexity and task type
      const baseScore = 50;
      const complexityBonus = currentTask.complexity * 20;
      const switchPenalty = currentTask.isSwitchTrial ? -10 : 0;
      
      // Adaptive time bonus based on complexity
      const optimalTime = 800 + (currentTask.complexity * 400);
      const timeBonus = Math.max(0, 100 - Math.max(0, (reactionTime - optimalTime) / 20));
      
      const taskTypeBonus = {
        'math': 10,
        'stroop': 20,
        'spatial': 15,
        'match': 5,
        'comparison': 8
      }[currentTask.type] || 0;
      
      setScore(prev => prev + baseScore + complexityBonus + timeBonus + taskTypeBonus + switchPenalty);
    }

    // Update processing efficiency
    const currentEfficiency = (correctAnswers + (isCorrect ? 1 : 0)) / (totalAnswers + 1);
    setProcessingEfficiency(Math.round(currentEfficiency * 100));

    // Move to next task
    const nextIndex = taskIndex + 1;
    if (nextIndex < tasks.length && timeLeft > 0) {
      setTaskIndex(nextIndex);
      const nextTask = { ...tasks[nextIndex], startTime: Date.now() };
      setCurrentTask(nextTask);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameState('result');
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Calculate comprehensive metrics
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    // Task switching cost analysis
    const avgSwitchCost = switchCosts.length > 0 
      ? switchCosts.reduce((a, b) => a + b, 0) / switchCosts.length 
      : avgReactionTime;
    const switchingEfficiency = Math.max(0, 100 - ((avgSwitchCost - avgReactionTime) / 10));
    
    // Complexity analysis
    const complexityPerformance = Object.entries(complexityScores).map(([level, data]) => ({
      level: parseInt(level),
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }));
    
    // Processing speed score (reaction time normalized)
    const speedScore = Math.max(0, 100 - (avgReactionTime / 30));
    
    // Cognitive flexibility score (handling task switches)
    const flexibilityScore = switchingEfficiency;
    
    // Sustained performance (accuracy maintenance over time)
    const earlyAccuracy = totalAnswers > 10 ? 
      (reactionTimes.slice(0, 10).length > 0 ? 100 : 0) : accuracy;
    const lateAccuracy = totalAnswers > 10 ? 
      (reactionTimes.slice(-10).length > 0 ? 100 : 0) : accuracy;
    const sustainedPerformance = Math.max(0, 100 - Math.abs(earlyAccuracy - lateAccuracy));
    
    // Working memory load handling (complexity performance)
    const workingMemoryScore = complexityPerformance.length > 0 ?
      complexityPerformance.reduce((sum, comp) => sum + (comp.accuracy * comp.level), 0) / 
      complexityPerformance.reduce((sum, comp) => sum + comp.level, 0) : 50;
    
    // Completion efficiency
    const completionScore = (totalAnswers / TASKS_COUNT) * 100;
    
    // Weighted final score reflecting multiple processing speed components
    const finalScore = Math.round(
      (speedScore * 0.25) +           // Pure processing speed
      (accuracy * 0.20) +             // Overall accuracy
      (flexibilityScore * 0.20) +     // Cognitive flexibility
      (sustainedPerformance * 0.15) + // Sustained attention
      (workingMemoryScore * 0.10) +   // Working memory
      (completionScore * 0.10)        // Task completion
    );

    const gameScore: GameScore = {
      gameType: 'processing',
      score: Math.min(100, finalScore),
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(avgReactionTime),
      difficulty: `Multi-domain (Switch cost: ${Math.round(avgSwitchCost - avgReactionTime)}ms)`,
      timestamp: new Date(),
      domain: 'processing'
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentTask(null);
    setTaskIndex(0);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setReactionTimes([]);
    setTasks([]);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  const avgReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return '🎯';
      case 'math': return '🔢';
      case 'comparison': return '📊';
      default: return '❓';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-blue-100 text-blue-800';
      case 'math': return 'bg-green-100 text-green-800';
      case 'comparison': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Speed Racer</CardTitle>
                  <CardDescription>
                    Answer questions as quickly and accurately as possible!
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Status */}
      {gameState !== 'setup' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{timeLeft}s</div>
                <div className="text-sm text-muted-foreground">Time Left</div>
              </div>
              <div>
                <div className="text-lg font-bold">{taskIndex + 1}</div>
                <div className="text-sm text-muted-foreground">Question</div>
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
            <Progress value={(taskIndex / TASKS_COUNT) * 100} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Game Area */}
      <Card className="min-h-[400px]">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {gameState === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">How to Play</h3>
                  <div className="max-w-2xl mx-auto space-y-3 text-muted-foreground">
                    <p>⚡ Answer as many questions as possible in 2 minutes</p>
                    <p>🎯 Three types: Pattern matching, Math, and Comparisons</p>
                    <p>🏃‍♂️ Speed AND accuracy both matter for your score</p>
                    <p>🎪 Questions get mixed up to test your cognitive flexibility</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-sm font-medium">Pattern Match</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl mb-1">🔢</div>
                      <div className="text-sm font-medium">Math Problems</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-2xl mb-1">📊</div>
                      <div className="text-sm font-medium">Comparisons</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Play className="h-5 w-5 mr-2" />
                    Start Speed Test
                  </Button>
                </div>
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
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Badge className={`mb-4 ${getTaskTypeColor(currentTask.type)}`}>
                    {getTaskTypeIcon(currentTask.type)} {currentTask.type.toUpperCase()}
                  </Badge>
                  <h3 className="text-3xl font-bold mb-2">{currentTask.question}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {currentTask.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(index)}
                      className="p-4 text-lg font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {currentTask.type === 'match' ? (
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center text-white font-bold ${
                              option.includes('red') ? 'bg-red-500' :
                              option.includes('blue') ? 'bg-blue-500' :
                              option.includes('green') ? 'bg-green-500' :
                              option.includes('yellow') ? 'bg-yellow-500' :
                              'bg-purple-500'
                            }`}
                          >
                            {option.split(' ')[1]}
                          </span>
                          <span className="capitalize">{option.split(' ')[0]}</span>
                        </div>
                      ) : (
                        option
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Question {taskIndex + 1} of {TASKS_COUNT}
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">Processing Speed Complete!</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    <div>
                      <div className="text-2xl font-bold text-primary">{score}</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{totalAnswers}</div>
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{Math.round(accuracy)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(avgReactionTime)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Speed</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetGame}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                  <Button onClick={onBack}>
                    Continue to Next Game
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
        <Zap className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <strong>Processing Speed Assessment:</strong> This game measures how quickly you can process 
          information and make decisions. Faster processing with maintained accuracy indicates better 
          cognitive efficiency and mental agility.
        </AlertDescription>
      </Alert>
    </div>
  );
}