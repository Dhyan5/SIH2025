import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Eye, 
  ArrowLeft, 
  Play, 
  RotateCcw,
  CheckCircle2,
  RotateCw,
  Move3D
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

interface VisuospatialGameProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

interface RotationTask {
  id: number;
  originalShape: number[][];
  rotatedShape: number[][];
  options: number[][][];
  correctAnswer: number;
  rotation: number;
  startTime: number;
  isMirrorTask: boolean;
  complexity: number; // 1-3 based on rotation angle and shape complexity
  hasDistractorMirror: boolean; // Whether one option is a mirror image
}

const SHAPES = [
  // L-shapes (different orientations)
  [[1, 0, 0], [1, 0, 0], [1, 1, 0]],
  [[1, 1, 0], [1, 0, 0], [1, 0, 0]],
  // T-shapes
  [[1, 1, 1], [0, 1, 0], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  // Z-shapes
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  // Complex shapes
  [[1, 0, 1], [1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 0], [1, 0, 1]],
  // Asymmetric shapes for mirror detection
  [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
  [[1, 1, 1], [0, 0, 1], [0, 0, 1]]
];

const ROTATIONS = [60, 90, 120, 180, 240, 270, 300];
const TOTAL_TASKS = 20; // More tasks for better assessment

export function VisuospatialGame({ onComplete, onBack }: VisuospatialGameProps) {
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'playing' | 'result'>('setup');
  const [currentTask, setCurrentTask] = useState<RotationTask | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [countdownTime, setCountdownTime] = useState(3);
  const [tasks, setTasks] = useState<RotationTask[]>([]);
  const [rotationAccuracy, setRotationAccuracy] = useState<{[key: number]: {correct: number, total: number}}>({});
  const [mirrorErrors, setMirrorErrors] = useState(0);
  const [spatialWorkingMemory, setSpatialWorkingMemory] = useState(100);

  const countdownTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const rotateMatrix = (matrix: number[][], degrees: number): number[][] => {
    let result = matrix.map(row => [...row]);
    
    // Handle non-90 degree rotations with approximation
    const normalizedDegrees = degrees % 360;
    const rotations90 = Math.round(normalizedDegrees / 90);
    
    for (let i = 0; i < rotations90; i++) {
      const rows = result.length;
      const cols = result[0].length;
      const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rotated[c][rows - 1 - r] = result[r][c];
        }
      }
      result = rotated;
    }
    
    return result;
  };

  const mirrorMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => [...row].reverse());
  };

  const getShapeComplexity = (shape: number[][]): number => {
    const filled = shape.flat().filter(cell => cell === 1).length;
    const asymmetry = checkAsymmetry(shape);
    return filled <= 4 ? 1 : filled <= 7 ? 2 : 3 + (asymmetry ? 1 : 0);
  };

  const checkAsymmetry = (shape: number[][]): boolean => {
    const mirrored = mirrorMatrix(shape);
    return JSON.stringify(shape) !== JSON.stringify(mirrored);
  };

  const generateDistractors = (correctShape: number[][], originalShape: number[][], isMirrorTask: boolean): {options: number[][][], hasDistractorMirror: boolean} => {
    const distractors: number[][][] = [];
    let hasDistractorMirror = false;
    
    // Add correct answer
    distractors.push(correctShape);
    
    // Add mirror image as distractor (50% chance)
    if (isMirrorTask || Math.random() > 0.5) {
      const mirroredCorrect = mirrorMatrix(correctShape);
      if (JSON.stringify(mirroredCorrect) !== JSON.stringify(correctShape)) {
        distractors.push(mirroredCorrect);
        hasDistractorMirror = true;
      }
    }
    
    // Generate wrong rotations and transformations
    while (distractors.length < 4) {
      let wrongShape: number[][];
      
      if (Math.random() > 0.7) {
        // Sometimes use a completely different base shape
        const wrongBaseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const wrongRotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
        wrongShape = rotateMatrix(wrongBaseShape, wrongRotation);
      } else {
        // Use wrong rotation of original shape
        const wrongRotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
        wrongShape = rotateMatrix(originalShape, wrongRotation);
        
        // Sometimes mirror it too
        if (Math.random() > 0.6) {
          wrongShape = mirrorMatrix(wrongShape);
        }
      }
      
      // Check if this distractor is different from existing ones
      const isDifferent = !distractors.some(existing => 
        JSON.stringify(existing) === JSON.stringify(wrongShape)
      );
      
      if (isDifferent) {
        distractors.push(wrongShape);
      }
    }
    
    // Shuffle the options
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    
    return { options: distractors, hasDistractorMirror };
  };

  const generateTasks = (): RotationTask[] => {
    const generatedTasks: RotationTask[] = [];
    
    for (let i = 0; i < TOTAL_TASKS; i++) {
      const originalShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
      const isMirrorTask = i % 4 === 0; // Every 4th task includes mirror challenges
      
      let rotatedShape: number[][];
      if (isMirrorTask && Math.random() > 0.5) {
        // Sometimes the "correct" answer is actually the mirror
        rotatedShape = mirrorMatrix(rotateMatrix(originalShape, rotation));
      } else {
        rotatedShape = rotateMatrix(originalShape, rotation);
      }
      
      const { options, hasDistractorMirror } = generateDistractors(rotatedShape, originalShape, isMirrorTask);
      const correctAnswer = options.findIndex(option => 
        JSON.stringify(option) === JSON.stringify(rotatedShape)
      );
      
      const complexity = getShapeComplexity(originalShape) + 
        (rotation % 90 !== 0 ? 1 : 0) + // Non-90 degree rotations are harder
        (hasDistractorMirror ? 1 : 0);  // Mirror distractors increase difficulty
      
      generatedTasks.push({
        id: i,
        originalShape,
        rotatedShape,
        options,
        correctAnswer,
        rotation,
        startTime: 0,
        isMirrorTask,
        complexity: Math.min(5, complexity),
        hasDistractorMirror
      });
    }
    
    return generatedTasks;
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
    setScore(0);
    setCorrectAnswers(0);
    setReactionTimes([]);
    setTaskIndex(0);
    
    // Start first task
    const firstTask = { ...generatedTasks[0], startTime: Date.now() };
    setCurrentTask(firstTask);
  };

  const handleAnswer = (selectedIndex: number) => {
    if (!currentTask || gameState !== 'playing') return;

    const reactionTime = Date.now() - currentTask.startTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = selectedIndex === currentTask.correctAnswer;
    
    // Track rotation-specific accuracy
    setRotationAccuracy(prev => ({
      ...prev,
      [currentTask.rotation]: {
        correct: (prev[currentTask.rotation]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[currentTask.rotation]?.total || 0) + 1
      }
    }));
    
    // Check for mirror confusion errors
    if (!isCorrect && currentTask.hasDistractorMirror) {
      const selectedShape = currentTask.options[selectedIndex];
      const mirroredCorrect = mirrorMatrix(currentTask.rotatedShape);
      if (JSON.stringify(selectedShape) === JSON.stringify(mirroredCorrect)) {
        setMirrorErrors(prev => prev + 1);
      }
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      // Sophisticated scoring based on task complexity
      const baseScore = 100;
      const complexityBonus = currentTask.complexity * 25;
      
      // Time bonus adjusted for task difficulty
      const optimalTime = 2000 + (currentTask.complexity * 1000);
      const timeBonus = Math.max(0, 150 - Math.max(0, (reactionTime - optimalTime) / 50));
      
      // Rotation difficulty bonus
      const rotationBonus = currentTask.rotation % 90 !== 0 ? 30 : 0;
      
      // Mirror task bonus
      const mirrorBonus = currentTask.isMirrorTask ? 20 : 0;
      
      setScore(prev => prev + baseScore + complexityBonus + timeBonus + rotationBonus + mirrorBonus);
    }

    // Update spatial working memory score
    const currentAccuracy = (correctAnswers + (isCorrect ? 1 : 0)) / (taskIndex + 1);
    setSpatialWorkingMemory(Math.round(currentAccuracy * 100));

    // Move to next task
    const nextIndex = taskIndex + 1;
    if (nextIndex < tasks.length) {
      setTaskIndex(nextIndex);
      const nextTask = { ...tasks[nextIndex], startTime: Date.now() };
      setCurrentTask(nextTask);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameState('result');
    
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Calculate comprehensive metrics
    const accuracy = (correctAnswers / TOTAL_TASKS) * 100;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;

    // Mental rotation ability analysis
    const rotationPerformance = Object.entries(rotationAccuracy).map(([angle, data]) => ({
      angle: parseInt(angle),
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      difficulty: Math.abs(parseInt(angle) - 180) // Distance from easiest (180°)
    }));
    
    // Spatial working memory (complexity handling)
    const complexityHandling = tasks.reduce((acc, task) => {
      const taskResult = task.id < taskIndex ? 
        (correctAnswers >= task.id ? 1 : 0) : 0;
      acc[task.complexity] = (acc[task.complexity] || 0) + taskResult;
      return acc;
    }, {} as {[key: number]: number});
    
    // Mirror discrimination ability
    const mirrorDiscrimination = tasks.filter(t => t.isMirrorTask).length > 0 ?
      Math.max(0, 100 - (mirrorErrors / tasks.filter(t => t.isMirrorTask).length) * 50) : 100;
    
    // Response time consistency for spatial tasks
    const rtVariance = reactionTimes.length > 1 ? 
      Math.sqrt(reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - avgReactionTime, 2), 0) / reactionTimes.length) : 0;
    const spatialConsistency = Math.max(0, 100 - (rtVariance / 100));
    
    // Mental rotation speed (normalized by difficulty)
    const rotationSpeed = rotationPerformance.length > 0 ?
      rotationPerformance.reduce((sum, perf) => sum + (100 / (1 + perf.difficulty * 0.1)), 0) / rotationPerformance.length : 50;
    
    // Visuospatial working memory capacity
    const workingMemoryCapacity = Object.keys(complexityHandling).length > 0 ?
      Object.entries(complexityHandling).reduce((sum, [level, correct]) => 
        sum + (correct * parseInt(level)), 0) / Object.keys(complexityHandling).length : 50;
    
    // Weighted final score reflecting multiple visuospatial components
    const finalScore = Math.round(
      (accuracy * 0.25) +              // Overall accuracy
      (mirrorDiscrimination * 0.20) +  // Mirror/rotation discrimination
      (rotationSpeed * 0.20) +         // Mental rotation speed
      (workingMemoryCapacity * 0.15) + // Visuospatial working memory
      (spatialConsistency * 0.10) +    // Response consistency
      (spatialWorkingMemory * 0.10)    // Sustained spatial performance
    );

    const gameScore: GameScore = {
      gameType: 'visuospatial',
      score: Math.min(100, finalScore),
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(avgReactionTime),
      difficulty: `3D Rotation (Mirror errors: ${mirrorErrors})`,
      timestamp: new Date(),
      domain: 'visuospatial'
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
    setTasks([]);
    
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  const renderShape = (shape: number[][], size: number = 40) => {
    return (
      <div className="inline-flex flex-col gap-1 p-2">
        {shape.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`w-${size/10} h-${size/10} border border-gray-300 ${
                  cell ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'
                }`}
                style={{ width: `${size/10}px`, height: `${size/10}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const accuracy = taskIndex > 0 ? (correctAnswers / taskIndex) * 100 : 0;
  const avgReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Spatial Navigator</CardTitle>
                  <CardDescription>
                    Mentally rotate shapes and find the matching orientation
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
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
            </div>
            <Progress value={(taskIndex / TOTAL_TASKS) * 100} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Game Area */}
      <Card className="min-h-[500px]">
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
                    <p>🔄 Look at the shape on the left and imagine rotating it</p>
                    <p>🎯 Find which of the 4 options matches the rotated shape</p>
                    <p>🧠 Use mental rotation - no pen and paper needed!</p>
                    <p>⚡ Work quickly but accurately for the best score</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium mb-2">Example:</h4>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Original</div>
                        {renderShape([[1, 0], [1, 1]], 30)}
                      </div>
                      <RotateCw className="h-6 w-6 text-blue-500" />
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Rotated 90°</div>
                        {renderShape([[1, 1], [1, 0]], 30)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Play className="h-5 w-5 mr-2" />
                    Start Spatial Test
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
                <h3 className="text-xl">Prepare Your Spatial Mind!</h3>
                <motion.div
                  key={countdownTime}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                  className="text-8xl font-bold text-primary"
                >
                  {countdownTime || 'ROTATE!'}
                </motion.div>
              </motion.div>
            )}

            {gameState === 'playing' && currentTask && (
              <motion.div
                key={`task-${currentTask.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Badge className="mb-4 bg-purple-100 text-purple-800">
                    <RotateCw className="h-4 w-4 mr-1" />
                    Mental Rotation
                  </Badge>
                  <h3 className="text-xl font-bold mb-4">
                    Find the rotated version of this shape:
                  </h3>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-muted-foreground mb-2">Original Shape</div>
                    <div className="scale-150">
                      {renderShape(currentTask.originalShape)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Rotated {currentTask.rotation}°
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {currentTask.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(index)}
                      className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">Option {index + 1}</div>
                        <div className="scale-125">
                          {renderShape(option)}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Question {taskIndex + 1} of {TOTAL_TASKS}
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
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">Spatial Test Complete!</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    <div>
                      <div className="text-2xl font-bold text-primary">{score}</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((correctAnswers / TOTAL_TASKS) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(avgReactionTime)}ms
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
                    Continue to Next Game
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
        <Eye className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800 dark:text-purple-200">
          <strong>Visuospatial Assessment:</strong> This game tests your ability to mentally manipulate 
          3D objects and understand spatial relationships. Strong performance indicates good spatial 
          reasoning and visuospatial processing abilities.
        </AlertDescription>
      </Alert>
    </div>
  );
}