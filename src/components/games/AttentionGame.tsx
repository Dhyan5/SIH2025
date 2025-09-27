import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Target, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
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

interface AttentionGameProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  isTarget: boolean;
  isClicked: boolean;
  timestamp: number;
}

const GAME_DURATION = 120; // seconds - longer for better vigilance testing
const TARGET_PROBABILITY = 0.25; // 25% chance for target (more realistic)
const DISTRACTOR_PROBABILITY = 0.75; // 75% chance for distractor
const MIN_SPAWN_INTERVAL = 800; // Minimum time between targets
const MAX_SPAWN_INTERVAL = 2500; // Maximum time between targets
const TARGET_LIFETIME = 2500; // How long targets stay visible

export function AttentionGame({ onComplete, onBack }: AttentionGameProps) {
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'playing' | 'paused' | 'result'>('setup');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [nextTargetId, setNextTargetId] = useState(0);
  const [gameArea, setGameArea] = useState({ width: 600, height: 400 });
  const [countdownTime, setCountdownTime] = useState(3);
  const [vigilanceDecline, setVigilanceDecline] = useState<number[]>([]);
  const [sustainedAttentionScore, setSustainedAttentionScore] = useState(100);
  const [timeBlocks, setTimeBlocks] = useState<{hits: number, misses: number, falseAlarms: number}[]>([]);
  const [currentBlock, setCurrentBlock] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const targetTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateGameArea = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setGameArea({ width: rect.width, height: rect.height });
      }
    };

    updateGameArea();
    window.addEventListener('resize', updateGameArea);
    
    return () => {
      window.removeEventListener('resize', updateGameArea);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

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
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setReactionTimes([]);
    setTargets([]);
    setNextTargetId(0);

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

    // Start spawning targets
    spawnTarget();
  };

  const spawnTarget = () => {
    if (gameState !== 'playing') return;

    const isTarget = Math.random() < TARGET_PROBABILITY;
    const margin = 60;
    
    // Ensure targets don't overlap with existing ones
    let attempts = 0;
    let x, y;
    do {
      x = margin + Math.random() * (gameArea.width - 2 * margin);
      y = margin + Math.random() * (gameArea.height - 2 * margin);
      attempts++;
    } while (attempts < 10 && targets.some(t => 
      Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2) < 80
    ));
    
    const newTarget: Target = {
      id: nextTargetId,
      x,
      y,
      isTarget,
      isClicked: false,
      timestamp: Date.now()
    };

    setTargets(prev => [...prev, newTarget]);
    setNextTargetId(prev => prev + 1);

    // Remove target after delay
    setTimeout(() => {
      setTargets(prev => {
        const updatedTargets = prev.map(t => 
          t.id === newTarget.id && !t.isClicked
            ? { ...t, isClicked: true }
            : t
        );
        
        // Check for miss and update vigilance tracking
        const target = prev.find(t => t.id === newTarget.id);
        if (target && target.isTarget && !target.isClicked) {
          setMisses(prev => prev + 1);
          
          // Track vigilance decline over time
          const gameProgress = (GAME_DURATION - timeLeft) / GAME_DURATION;
          setVigilanceDecline(prevDecline => [...prevDecline, gameProgress]);
        }
        
        return updatedTargets;
      });

      // Remove from DOM after animation
      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== newTarget.id));
      }, 500);
    }, TARGET_LIFETIME);

    // Dynamic spawn interval based on performance
    const currentAccuracy = hits + falseAlarms > 0 ? hits / (hits + falseAlarms) : 1;
    const difficultyMultiplier = Math.max(0.7, Math.min(1.3, 2 - currentAccuracy));
    const baseInterval = MIN_SPAWN_INTERVAL + Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);
    const nextDelay = baseInterval * difficultyMultiplier;
    
    targetTimerRef.current = setTimeout(spawnTarget, nextDelay);
  };

  const handleTargetClick = (target: Target) => {
    if (target.isClicked || gameState !== 'playing') return;

    const reactionTime = Date.now() - target.timestamp;
    setReactionTimes(prev => [...prev, reactionTime]);

    setTargets(prev => 
      prev.map(t => 
        t.id === target.id 
          ? { ...t, isClicked: true }
          : t
      )
    );

    if (target.isTarget) {
      // Correct hit
      setHits(prev => prev + 1);
      setScore(prev => prev + 100);
    } else {
      // False alarm
      setFalseAlarms(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 50));
    }
  };

  const endGame = () => {
    setGameState('result');
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Calculate advanced metrics
    const totalTargets = hits + misses;
    const totalClicks = hits + falseAlarms;
    const accuracy = totalClicks > 0 ? (hits / totalClicks) * 100 : 0;
    const sensitivity = totalTargets > 0 ? (hits / totalTargets) * 100 : 0; // d-prime approximation
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;

    // Vigilance decrement analysis
    const vigilanceDecrement = vigilanceDecline.length > 5 ? 
      Math.max(0, 100 - (vigilanceDecline.length * 5)) : 100;
    
    // Sustained attention coefficient
    const sustainedAttention = Math.max(0, 100 - (misses * 8) - (falseAlarms * 5));
    
    // Response time consistency (lower variance = better)
    const rtVariance = reactionTimes.length > 1 ? 
      Math.sqrt(reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - avgReactionTime, 2), 0) / reactionTimes.length) : 0;
    const consistencyScore = Math.max(0, 100 - (rtVariance / 20));
    
    // False alarm rate penalty
    const falseAlarmRate = totalClicks > 0 ? (falseAlarms / totalClicks) * 100 : 0;
    const inhibitionScore = Math.max(0, 100 - (falseAlarmRate * 2));

    // Weighted final score reflecting multiple attention components
    const finalScore = Math.round(
      (sensitivity * 0.25) +        // Target detection ability
      (accuracy * 0.20) +           // Overall accuracy
      (sustainedAttention * 0.20) + // Sustained attention
      (vigilanceDecrement * 0.15) + // Vigilance maintenance
      (consistencyScore * 0.10) +   // Response consistency
      (inhibitionScore * 0.10)      // Response inhibition
    );

    const gameScore: GameScore = {
      gameType: 'attention',
      score: Math.min(100, finalScore),
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(avgReactionTime),
      difficulty: `Vigilance (Sensitivity: ${Math.round(sensitivity)}%)`,
      timestamp: new Date(),
      domain: 'attention'
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const pauseGame = () => {
    setGameState('paused');
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
  };

  const resumeGame = () => {
    setGameState('playing');
    
    // Resume game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Resume target spawning
    spawnTarget();
  };

  const resetGame = () => {
    setGameState('setup');
    setTargets([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setReactionTimes([]);
    setNextTargetId(0);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  const accuracy = (hits + falseAlarms) > 0 ? (hits / (hits + falseAlarms)) * 100 : 0;
  const avgReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Focus Master</CardTitle>
                  <CardDescription>
                    Click on blue circles, ignore red ones. Test your sustained attention!
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
                <div className="text-lg font-bold text-green-600">{hits}</div>
                <div className="text-sm text-muted-foreground">Hits</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{misses}</div>
                <div className="text-sm text-muted-foreground">Misses</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{falseAlarms}</div>
                <div className="text-sm text-muted-foreground">False Alarms</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(accuracy)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
            <Progress value={((GAME_DURATION - timeLeft) / GAME_DURATION) * 100} className="mt-4" />
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
                    <p>🎯 <strong>Click BLUE circles</strong> as quickly as possible</p>
                    <p>🚫 <strong>Ignore RED circles</strong> - clicking them costs points</p>
                    <p>⚡ You have 90 seconds to get the highest score</p>
                    <p>🎪 Circles appear randomly and disappear after 2 seconds</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-green-500 to-teal-500">
                    <Play className="h-5 w-5 mr-2" />
                    Start Focus Test
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
                <h3 className="text-xl">Get Ready!</h3>
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

            {(gameState === 'playing' || gameState === 'paused') && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Target (Click!)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm">Distractor (Ignore!)</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={gameState === 'playing' ? pauseGame : resumeGame}
                  >
                    {gameState === 'playing' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>

                <div
                  ref={gameAreaRef}
                  className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-crosshair"
                  style={{ minHeight: '400px' }}
                >
                  {gameState === 'paused' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-bold mb-2">Game Paused</h3>
                        <Button onClick={resumeGame}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Game
                        </Button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {targets.map((target) => (
                      <motion.button
                        key={target.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: target.isClicked ? 0 : 1, 
                          opacity: target.isClicked ? 0 : 1 
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute w-12 h-12 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110 ${
                          target.isTarget 
                            ? 'bg-blue-500 hover:bg-blue-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        style={{
                          left: target.x - 24,
                          top: target.y - 24,
                        }}
                        onClick={() => handleTargetClick(target)}
                        disabled={target.isClicked || gameState !== 'playing'}
                      />
                    ))}
                  </AnimatePresence>

                  {targets.length === 0 && gameState === 'playing' && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p>Stay focused... targets incoming!</p>
                      </div>
                    </div>
                  )}
                </div>

                {avgReactionTime > 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Average reaction time: {Math.round(avgReactionTime)}ms
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
                    <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold">Attention Test Complete!</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    <div>
                      <div className="text-2xl font-bold text-primary">{score}</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{hits}</div>
                      <div className="text-sm text-muted-foreground">Correct Hits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(avgReactionTime)}ms
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
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <Target className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Attention Assessment:</strong> This game measures sustained attention, selective focus, 
          and response inhibition. Better scores indicate stronger attention control and vigilance abilities.
        </AlertDescription>
      </Alert>
    </div>
  );
}