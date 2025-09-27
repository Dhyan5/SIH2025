import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Puzzle, 
  ArrowLeft, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Brain,
  Target,
  Zap
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

interface ExecutiveFunctionGameProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

interface StroopTask {
  id: number;
  word: string;
  color: string;
  taskType: 'word' | 'color';
  correctAnswer: string;
  startTime: number;
  isCongruent: boolean;
  isInhibitionTrial: boolean; // Requires response inhibition
}

interface TowerTask {
  id: number;
  startState: number[][];
  goalState: number[][];
  moves: number;
  startTime: number;
  difficulty: number; // 0-2 index into TOWER_DIFFICULTIES
  optimalMoves: number;
  timeLimit: number;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const COLOR_CLASSES = {
  red: 'text-red-500',
  blue: 'text-blue-500', 
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500'
};

const TOTAL_STROOP_TASKS = 30; // More trials for better inhibition measurement
const TOWER_DIFFICULTIES = [
  { disks: 3, minMoves: 7, timeLimit: 120000 },
  { disks: 4, minMoves: 15, timeLimit: 180000 },
  { disks: 5, minMoves: 31, timeLimit: 300000 }
];

export function ExecutiveFunctionGame({ onComplete, onBack }: ExecutiveFunctionGameProps) {
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'stroop' | 'tower' | 'result'>('setup');
  const [currentTask, setCurrentTask] = useState<StroopTask | TowerTask | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [countdownTime, setCountdownTime] = useState(3);
  const [currentPhase, setCurrentPhase] = useState<'stroop' | 'tower'>('stroop');
  const [stroopTasks, setStroopTasks] = useState<StroopTask[]>([]);
  const [towerStates, setTowerStates] = useState<number[][]>([[], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const countdownTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const generateStroopTasks = (): StroopTask[] => {
    const tasks: StroopTask[] = [];
    
    for (let i = 0; i < TOTAL_TASKS / 2; i++) {
      const word = COLORS[Math.floor(Math.random() * COLORS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const taskType = Math.random() > 0.5 ? 'word' : 'color';
      const correctAnswer = taskType === 'word' ? word : color;
      
      tasks.push({
        id: i,
        word,
        color,
        taskType,
        correctAnswer,
        startTime: 0
      });
    }
    
    return tasks;
  };

  const generateTowerTask = (): TowerTask => {
    // Simple 3-disk Tower of Hanoi starting position
    const startState = [[3, 2, 1], [], []];
    const goalState = [[], [], [3, 2, 1]];
    
    return {
      id: TOTAL_TASKS / 2,
      startState,
      goalState,
      moves: 0,
      startTime: Date.now()
    };
  };

  const startGame = () => {
    setGameState('countdown');
    setCountdownTime(3);
    
    const countdown = () => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          setGameState('stroop');
          startStroopPhase();
          return 0;
        }
        return prev - 1;
      });
    };

    countdownTimerRef.current = setInterval(countdown, 1000);
  };

  const startStroopPhase = () => {
    const tasks = generateStroopTasks();
    setStroopTasks(tasks);
    setTaskIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setReactionTimes([]);
    setCurrentPhase('stroop');
    
    // Start first task
    const firstTask = { ...tasks[0], startTime: Date.now() };
    setCurrentTask(firstTask);
  };

  const startTowerPhase = () => {
    setCurrentPhase('tower');
    setGameState('tower');
    const towerTask = generateTowerTask();
    setCurrentTask(towerTask);
    setTowerStates([[3, 2, 1], [], []]);
    setMoves(0);
    setSelectedPeg(null);
  };

  const handleStroopAnswer = (answer: string) => {
    const task = currentTask as StroopTask;
    if (!task || gameState !== 'stroop') return;

    const reactionTime = Date.now() - task.startTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = answer === task.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const timeBonus = Math.max(0, 150 - Math.floor(reactionTime / 20));
      setScore(prev => prev + 100 + timeBonus);
    }

    // Move to next task
    const nextIndex = taskIndex + 1;
    if (nextIndex < stroopTasks.length) {
      setTaskIndex(nextIndex);
      const nextTask = { ...stroopTasks[nextIndex], startTime: Date.now() };
      setCurrentTask(nextTask);
    } else {
      startTowerPhase();
    }
  };

  const handlePegClick = (pegIndex: number) => {
    if (selectedPeg === null) {
      // Select a peg to move from
      if (towerStates[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      // Move disk to selected peg
      if (selectedPeg === pegIndex) {
        // Deselect
        setSelectedPeg(null);
      } else {
        // Attempt move
        const newStates = [...towerStates];
        const fromPeg = newStates[selectedPeg];
        const toPeg = newStates[pegIndex];
        
        // Check if move is valid (can only place smaller disk on larger)
        if (fromPeg.length > 0 && (toPeg.length === 0 || fromPeg[fromPeg.length - 1] < toPeg[toPeg.length - 1])) {
          const disk = fromPeg.pop()!;
          toPeg.push(disk);
          setTowerStates(newStates);
          setMoves(prev => prev + 1);
          
          // Check if solved
          if (newStates[2].length === 3 && newStates[2].join(',') === '1,2,3') {
            const task = currentTask as TowerTask;
            const reactionTime = Date.now() - task.startTime;
            setReactionTimes(prev => [...prev, reactionTime]);
            
            // Score based on efficiency (minimum moves is 7 for 3 disks)
            const efficiency = Math.max(0, 100 - ((moves + 1 - 7) * 10));
            const timeBonus = Math.max(0, 500 - Math.floor(reactionTime / 100));
            setScore(prev => prev + efficiency + timeBonus);
            setCorrectAnswers(prev => prev + 1);
            
            endGame();
          }
        }
        setSelectedPeg(null);
      }
    }
  };

  const endGame = () => {
    setGameState('result');
    
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Calculate final metrics
    const totalTasks = stroopTasks.length + 1; // Stroop tasks + tower task
    const accuracy = (correctAnswers / totalTasks) * 100;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;

    // Calculate final score (0-100)
    const accuracyScore = accuracy;
    const speedScore = Math.max(0, 100 - (avgReactionTime / 40));
    
    const finalScore = Math.round((accuracyScore * 0.6) + (speedScore * 0.4));

    const gameScore: GameScore = {
      gameType: 'executive',
      score: Math.min(100, finalScore),
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(avgReactionTime),
      difficulty: 'Hard',
      timestamp: new Date(),
      domain: 'executive'
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentTask(null);
    setTaskIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setReactionTimes([]);
    setCurrentPhase('stroop');
    setTowerStates([[], [], []]);
    setMoves(0);
    setSelectedPeg(null);
    
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  const renderDisk = (size: number) => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400'];
    const widths = ['w-16', 'w-12', 'w-8'];
    
    return (
      <div className={`h-6 ${widths[size - 1]} ${colors[size - 1]} rounded-lg border-2 border-gray-600 mx-auto`} />
    );
  };

  const renderTowerPeg = (pegIndex: number) => {
    const peg = towerStates[pegIndex];
    const isSelected = selectedPeg === pegIndex;
    
    return (
      <div 
        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => handlePegClick(pegIndex)}
      >
        <div className="flex flex-col-reverse items-center gap-1 h-32">
          {peg.map((disk, index) => (
            <div key={index}>
              {renderDisk(disk)}
            </div>
          ))}
          <div className="w-1 h-24 bg-gray-600 absolute"></div>
          <div className="w-20 h-2 bg-gray-600 rounded"></div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-2">
          Peg {pegIndex + 1}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                  <Puzzle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Strategy Mastermind</CardTitle>
                  <CardDescription>
                    Test executive function with cognitive flexibility and problem-solving
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
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">
                  {currentPhase === 'stroop' ? `${taskIndex + 1}/${stroopTasks.length}` : 'Tower'}
                </div>
                <div className="text-sm text-muted-foreground">Task</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {currentPhase === 'tower' ? moves : '--'}
                </div>
                <div className="text-sm text-muted-foreground">Tower Moves</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {reactionTimes.length > 0 
                    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
                    : 0}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
            </div>
            <Progress 
              value={currentPhase === 'stroop' 
                ? (taskIndex / stroopTasks.length) * 50 
                : 50 + ((correctAnswers > stroopTasks.length ? 50 : 0))
              } 
              className="mt-4" 
            />
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
                  <h3 className="text-2xl font-bold">Executive Function Challenge</h3>
                  <div className="max-w-2xl mx-auto space-y-3 text-muted-foreground">
                    <p><strong>Phase 1: Stroop Test</strong> - Name the COLOR of the word, not the word itself</p>
                    <p><strong>Phase 2: Tower of Hanoi</strong> - Move all disks to the rightmost peg</p>
                    <p>🧠 Tests cognitive flexibility, inhibition, and problem-solving</p>
                    <p>⚡ Both speed and accuracy matter for your final score</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto mt-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Stroop Test</div>
                      <div className="text-sm text-muted-foreground">Cognitive Flexibility</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <Puzzle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium">Tower Puzzle</div>
                      <div className="text-sm text-muted-foreground">Problem Solving</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-red-500 to-pink-500">
                    <Play className="h-5 w-5 mr-2" />
                    Start Executive Test
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
                <h3 className="text-xl">Prepare Your Executive Functions!</h3>
                <motion.div
                  key={countdownTime}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                  className="text-8xl font-bold text-primary"
                >
                  {countdownTime || 'THINK!'}
                </motion.div>
              </motion.div>
            )}

            {gameState === 'stroop' && currentTask && (
              <motion.div
                key={`stroop-${(currentTask as StroopTask).id}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Badge className="mb-4 bg-blue-100 text-blue-800">
                    <Brain className="h-4 w-4 mr-1" />
                    Stroop Test - Phase 1
                  </Badge>
                  <h3 className="text-xl font-bold mb-4">
                    Name the COLOR of this word:
                  </h3>
                </div>

                <div className="text-center mb-8">
                  <div 
                    className={`text-8xl font-bold ${COLOR_CLASSES[(currentTask as StroopTask).color as keyof typeof COLOR_CLASSES]}`}
                  >
                    {(currentTask as StroopTask).word.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
                  {COLORS.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className={`h-16 ${COLOR_CLASSES[color as keyof typeof COLOR_CLASSES]} border-2 hover:scale-105 transition-all duration-200`}
                      onClick={() => handleStroopAnswer(color)}
                    >
                      <div className="text-center">
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                          color === 'red' ? 'bg-red-500' :
                          color === 'blue' ? 'bg-blue-500' :
                          color === 'green' ? 'bg-green-500' :
                          color === 'yellow' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        <div className="text-xs capitalize">{color}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Task {taskIndex + 1} of {stroopTasks.length} • Click the COLOR, not the word!
                </div>
              </motion.div>
            )}

            {gameState === 'tower' && (
              <motion.div
                key="tower"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Badge className="mb-4 bg-purple-100 text-purple-800">
                    <Puzzle className="h-4 w-4 mr-1" />
                    Tower of Hanoi - Phase 2
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Move all disks to the rightmost peg
                  </h3>
                  <p className="text-muted-foreground">
                    Rules: Only move one disk at a time, never place a larger disk on a smaller one
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                  {[0, 1, 2].map((pegIndex) => renderTowerPeg(pegIndex))}
                </div>

                <div className="text-center space-y-2">
                  <div className="text-lg font-medium">Moves: {moves}</div>
                  <div className="text-sm text-muted-foreground">
                    Minimum possible moves: 7 • {selectedPeg !== null ? 'Click destination peg' : 'Click a peg to select disk'}
                  </div>
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
                    <div className="p-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">Executive Function Complete!</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    <div>
                      <div className="text-2xl font-bold text-primary">{score}</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{moves}</div>
                      <div className="text-sm text-muted-foreground">Tower Moves</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {reactionTimes.length > 0 
                          ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
                          : 0}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Time</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetGame}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                  <Button onClick={onBack}>
                    Continue to Results
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <Puzzle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>Executive Function Assessment:</strong> This multi-phase game tests cognitive flexibility, 
          inhibitory control, and problem-solving abilities. Strong performance indicates good executive 
          control and mental adaptability.
        </AlertDescription>
      </Alert>
    </div>
  );
}