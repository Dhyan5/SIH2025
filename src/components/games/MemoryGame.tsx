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
  Pause, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
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

interface MemoryGameProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

interface SequenceItem {
  id: number;
  color: string;
  active: boolean;
}

const COLORS = [
  { name: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
  { name: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
  { name: 'yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  { name: 'purple', bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { name: 'orange', bg: 'bg-orange-500', hover: 'hover:bg-orange-600' }
];

const DIFFICULTY_LEVELS = [
  { name: 'Easy', sequenceLength: 3, timePerItem: 1200, colors: 4, adaptiveThreshold: 0.8 },
  { name: 'Medium', sequenceLength: 4, timePerItem: 1000, colors: 5, adaptiveThreshold: 0.75 },
  { name: 'Hard', sequenceLength: 5, timePerItem: 800, colors: 6, adaptiveThreshold: 0.7 },
  { name: 'Expert', sequenceLength: 6, timePerItem: 700, colors: 6, adaptiveThreshold: 0.65 },
  { name: 'Master', sequenceLength: 7, timePerItem: 600, colors: 6, adaptiveThreshold: 0.6 }
];

export function MemoryGame({ onComplete, onBack }: MemoryGameProps) {
  const [gameState, setGameState] = useState<'setup' | 'showing' | 'waiting' | 'playing' | 'result'>('setup');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [lives, setLives] = useState(3);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [errorPattern, setErrorPattern] = useState<number[]>([]);
  const [memorySpan, setMemorySpan] = useState(3);
  const maxRounds = 15;

  const timeoutRef = useRef<NodeJS.Timeout>();

  const difficulty = DIFFICULTY_LEVELS[currentLevel];
  const gameColors = COLORS.slice(0, difficulty.colors);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const generateSequence = () => {
    const currentLength = adaptiveMode ? memorySpan : difficulty.sequenceLength;
    const newSequence: number[] = [];
    
    // Prevent immediate repetitions and ensure some complexity
    let lastColor = -1;
    for (let i = 0; i < currentLength; i++) {
      let nextColor;
      do {
        nextColor = Math.floor(Math.random() * difficulty.colors);
      } while (nextColor === lastColor && difficulty.colors > 2);
      
      newSequence.push(nextColor);
      lastColor = nextColor;
    }
    return newSequence;
  };

  const startGame = () => {
    setGameState('showing');
    setGameStartTime(Date.now());
    setScore(0);
    setRound(1);
    setLives(3);
    setReactionTimes([]);
    startRound();
  };

  const startRound = () => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setUserSequence([]);
    setCurrentStep(0);
    setShowingIndex(-1);
    setRoundStartTime(Date.now());
    
    showSequence(newSequence);
  };

  const showSequence = (seq: number[]) => {
    setGameState('showing');
    let index = 0;

    const showNext = () => {
      if (index < seq.length) {
        setShowingIndex(seq[index]);
        
        timeoutRef.current = setTimeout(() => {
          setShowingIndex(-1);
          timeoutRef.current = setTimeout(() => {
            index++;
            showNext();
          }, 200);
        }, difficulty.timePerItem);
      } else {
        setGameState('playing');
        setRoundStartTime(Date.now());
      }
    };

    // Initial delay
    timeoutRef.current = setTimeout(showNext, 1000);
  };

  const handleColorClick = (colorIndex: number) => {
    if (gameState !== 'playing') return;

    const reactionTime = Date.now() - roundStartTime;
    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);

    // Check if this step is correct
    if (colorIndex === sequence[currentStep]) {
      setCurrentStep(currentStep + 1);
      
      // Track consecutive correct responses
      setConsecutiveCorrect(prev => prev + 1);
      setConsecutiveErrors(0);
      
      // Check if sequence is complete
      if (newUserSequence.length === sequence.length) {
        // Round completed successfully
        const roundScore = calculateRoundScore(reactionTime, sequence.length);
        setScore(score + roundScore);
        setReactionTimes([...reactionTimes, reactionTime]);
        
        // Adaptive difficulty adjustment
        if (adaptiveMode && consecutiveCorrect >= 2) {
          setMemorySpan(prev => Math.min(8, prev + 1));
          setConsecutiveCorrect(0);
        }
        
        if (round >= maxRounds) {
          endGame(true);
        } else {
          setRound(round + 1);
          // Dynamic difficulty progression
          if (round % 4 === 0 && currentLevel < DIFFICULTY_LEVELS.length - 1) {
            const accuracy = (score / (round * 150)) * 100;
            if (accuracy > difficulty.adaptiveThreshold * 100) {
              setCurrentLevel(currentLevel + 1);
            }
          }
          setTimeout(startRound, 1500);
        }
      }
    } else {
      // Wrong color - record error pattern and lose a life
      const newLives = lives - 1;
      setLives(newLives);
      setReactionTimes([...reactionTimes, reactionTime]);
      setErrorPattern([...errorPattern, currentStep]);
      setConsecutiveErrors(prev => prev + 1);
      setConsecutiveCorrect(0);
      
      // Adaptive difficulty adjustment (make easier)
      if (adaptiveMode && consecutiveErrors >= 2) {
        setMemorySpan(prev => Math.max(2, prev - 1));
        setConsecutiveErrors(0);
      }
      
      if (newLives <= 0) {
        endGame(false);
      } else {
        // Restart this round with slight delay for feedback
        setTimeout(startRound, 2000);
      }
    }
  };

  const calculateRoundScore = (reactionTime: number, sequenceLength: number): number => {
    const baseScore = 100;
    
    // Time bonus (faster response = higher score)
    const optimalTime = sequenceLength * 500; // 500ms per item is optimal
    const timeBonus = Math.max(0, 100 - Math.max(0, (reactionTime - optimalTime) / 50));
    
    // Length bonus (longer sequences worth more)
    const lengthBonus = sequenceLength * 20;
    
    // Difficulty multiplier
    const difficultyMultiplier = (currentLevel + 1) * 0.5 + 1;
    
    // Consistency bonus (fewer errors = higher score)
    const consistencyBonus = Math.max(0, 50 - (errorPattern.length * 10));
    
    return Math.round((baseScore + timeBonus + lengthBonus + consistencyBonus) * difficultyMultiplier);
  };

  const endGame = (completed: boolean) => {
    setGameState('result');
    
    const totalTime = Date.now() - gameStartTime;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    // More sophisticated scoring algorithm
    const correctRounds = round - errorPattern.length - (3 - lives);
    const accuracy = Math.round((correctRounds / round) * 100);
    
    // Working memory span assessment
    const maxSpanReached = memorySpan;
    const spanScore = Math.min(100, (maxSpanReached / 8) * 100); // 8 is max span
    
    // Reaction time score (normalized)
    const reactionScore = Math.max(0, 100 - (avgReactionTime / 50));
    
    // Consistency score (fewer errors = better)
    const consistencyScore = Math.max(0, 100 - (errorPattern.length * 10));
    
    // Adaptive performance score
    const adaptiveScore = adaptiveMode ? 
      Math.min(100, (consecutiveCorrect / round) * 100) : 50;
    
    // Weighted final score
    const finalScore = Math.round(
      (spanScore * 0.3) + 
      (accuracy * 0.25) + 
      (reactionScore * 0.2) + 
      (consistencyScore * 0.15) + 
      (adaptiveScore * 0.1)
    );

    const gameScore: GameScore = {
      gameType: 'memory',
      score: Math.min(100, finalScore),
      accuracy,
      reactionTime: avgReactionTime,
      difficulty: `${difficulty.name} (Span: ${maxSpanReached})`,
      timestamp: new Date(),
      domain: 'memory'
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentLevel(0);
    setScore(0);
    setRound(1);
    setLives(3);
    setReactionTimes([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Memory Challenge</CardTitle>
                  <CardDescription>
                    Watch the sequence, then repeat it back in the correct order
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
                <div className="text-lg font-bold">Round {round}</div>
                <div className="text-sm text-muted-foreground">of {maxRounds}</div>
              </div>
              <div>
                <div className="text-lg font-bold">{difficulty.name}</div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div>
                <div className="text-lg font-bold flex justify-center gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < lives ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Lives</div>
              </div>
              <div>
                <div className="text-lg font-bold">{sequence.length}</div>
                <div className="text-sm text-muted-foreground">Sequence Length</div>
              </div>
            </div>
            <Progress value={(round / maxRounds) * 100} className="mt-4" />
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
                    <p>1. Watch carefully as colors light up in sequence</p>
                    <p>2. After the sequence ends, click the colors in the same order</p>
                    <p>3. Sequences get longer and faster as you progress</p>
                    <p>4. You have 3 lives - lose one for each mistake</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Play className="h-5 w-5 mr-2" />
                    Start Memory Challenge
                  </Button>
                </div>
              </motion.div>
            )}

            {(gameState === 'showing' || gameState === 'playing') && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {gameState === 'showing' ? 'Watch the Sequence' : 'Repeat the Sequence'}
                  </h3>
                  <Badge variant={gameState === 'showing' ? 'default' : 'secondary'}>
                    Step {currentStep + 1} of {sequence.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {gameColors.map((color, index) => (
                    <motion.button
                      key={index}
                      className={`
                        h-20 w-20 rounded-xl transition-all duration-200 shadow-lg
                        ${color.bg} ${gameState === 'playing' ? color.hover : ''}
                        ${showingIndex === index ? 'scale-110 ring-4 ring-white shadow-2xl' : ''}
                        ${gameState !== 'playing' ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                      `}
                      onClick={() => handleColorClick(index)}
                      disabled={gameState !== 'playing'}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: showingIndex === index ? 1.1 : 1,
                        boxShadow: showingIndex === index 
                          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(255, 255, 255, 0.8)' 
                          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  ))}
                </div>

                {userSequence.length > 0 && gameState === 'playing' && (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Your sequence:</div>
                    <div className="flex justify-center gap-2">
                      {userSequence.map((colorIndex, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded ${gameColors[colorIndex].bg}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
                    <div className="p-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">Game Complete!</h3>
                  
                  <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                    <div>
                      <div className="text-2xl font-bold text-primary">{score}</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{round - 1}</div>
                      <div className="text-sm text-muted-foreground">Rounds Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {reactionTimes.length > 0 
                          ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
                          : 0}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Reaction</div>
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
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Memory Assessment:</strong> This game tests your short-term memory, working memory, 
          and attention span. Better performance indicates stronger memory consolidation abilities.
        </AlertDescription>
      </Alert>
    </div>
  );
}