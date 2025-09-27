import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Target,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../../contexts/LanguageContext";

interface GameScore {
  gameType: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  timestamp: Date;
  domain:
    | "memory"
    | "attention"
    | "processing"
    | "visuospatial"
    | "executive";
}

interface SimpleAttentionTestProps {
  onComplete: (score: GameScore) => void;
  onBack: () => void;
}

const TEST_DURATION = 60; // 1 minute test
const TARGET_LETTER = "A";

export function SimpleAttentionTest({
  onComplete,
  onBack,
}: SimpleAttentionTestProps) {
  const [gameState, setGameState] = useState<
    "setup" | "countdown" | "playing" | "result"
  >("setup");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [currentLetter, setCurrentLetter] = useState("");
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>(
    [],
  );
  const [letterStartTime, setLetterStartTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(3);
  const [lettersShown, setLettersShown] = useState(0);

  const timerRef = useRef<NodeJS.Timeout>();
  const letterTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (letterTimerRef.current)
        clearTimeout(letterTimerRef.current);
      if (countdownTimerRef.current)
        clearInterval(countdownTimerRef.current);
    };
  }, []);

  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
  ];

  const startTest = () => {
    setGameState("countdown");
    setCountdownTime(3);

    const countdown = () => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          setGameState("playing");
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
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setReactionTimes([]);
    setLettersShown(0);

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

    // Start showing letters
    showNextLetter();
  };

  const showNextLetter = () => {
    if (gameState !== "playing") return;

    // 30% chance for target letter 'A'
    const isTarget = Math.random() < 0.3;
    const letter = isTarget
      ? TARGET_LETTER
      : letters[
          Math.floor(Math.random() * (letters.length - 1)) + 1
        ];

    setCurrentLetter(letter);
    setLetterStartTime(Date.now());
    setLettersShown((prev) => prev + 1);

    // Remove letter after 1.5 seconds if not clicked
    letterTimerRef.current = setTimeout(() => {
      if (letter === TARGET_LETTER) {
        setMisses((prev) => prev + 1);
      }

      setCurrentLetter("");

      // Show next letter after a brief pause
      setTimeout(() => {
        showNextLetter();
      }, 500);
    }, 1500);
  };

  const handleLetterClick = () => {
    if (!currentLetter || gameState !== "playing") return;

    const reactionTime = Date.now() - letterStartTime;
    setReactionTimes((prev) => [...prev, reactionTime]);

    if (currentLetter === TARGET_LETTER) {
      // Correct hit
      setHits((prev) => prev + 1);
      setScore((prev) => prev + 10);
    } else {
      // False alarm
      setFalseAlarms((prev) => prev + 1);
    }

    // Clear current letter and continue
    setCurrentLetter("");
    if (letterTimerRef.current) {
      clearTimeout(letterTimerRef.current);
    }

    // Show next letter after brief pause
    setTimeout(() => {
      showNextLetter();
    }, 200);
  };

  const endTest = () => {
    setGameState("result");

    if (timerRef.current) clearInterval(timerRef.current);
    if (letterTimerRef.current)
      clearTimeout(letterTimerRef.current);
    if (countdownTimerRef.current)
      clearInterval(countdownTimerRef.current);

    // Calculate final metrics
    const totalTargets = hits + misses;
    const totalResponses = hits + falseAlarms;
    const accuracy =
      totalResponses > 0 ? (hits / totalResponses) * 100 : 0;
    const sensitivity =
      totalTargets > 0 ? (hits / totalTargets) * 100 : 0;
    const avgReactionTime =
      reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) /
          reactionTimes.length
        : 0;

    // Calculate final score (0-100)
    const accuracyScore = accuracy;
    const sensitivityScore = sensitivity;
    const speedScore = Math.max(0, 100 - avgReactionTime / 20); // Faster = better

    const finalScore = Math.round(
      accuracyScore * 0.4 +
        sensitivityScore * 0.4 +
        speedScore * 0.2,
    );

    const gameScore: GameScore = {
      gameType: "attention",
      score: Math.min(100, finalScore),
      accuracy: Math.round(accuracy),
      reactionTime: Math.round(avgReactionTime),
      difficulty: "Standard",
      timestamp: new Date(),
      domain: "attention",
    };

    setTimeout(() => onComplete(gameScore), 2000);
  };

  const resetTest = () => {
    setGameState("setup");
    setTimeLeft(TEST_DURATION);
    setCurrentLetter("");
    setScore(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setReactionTimes([]);
    setLettersShown(0);

    if (timerRef.current) clearInterval(timerRef.current);
    if (letterTimerRef.current)
      clearTimeout(letterTimerRef.current);
    if (countdownTimerRef.current)
      clearInterval(countdownTimerRef.current);
  };

  const accuracy =
    hits + falseAlarms > 0
      ? (hits / (hits + falseAlarms)) * 100
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    Attention Test
                  </CardTitle>
                  <CardDescription className="text-base">
                    Press the button when you see the letter 'A'
                  </CardDescription>
                </div>
              </div>
            </div>
            {gameState === "playing" && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {timeLeft}s
                </div>
                <div className="text-sm text-muted-foreground">
                  Time Left
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Game Status */}
      {gameState === "playing" && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {hits}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {misses}
                </div>
                <div className="text-sm text-muted-foreground">
                  Missed
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {falseAlarms}
                </div>
                <div className="text-sm text-muted-foreground">
                  Wrong Clicks
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {Math.round(accuracy)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Accuracy
                </div>
              </div>
            </div>
            <Progress
              value={
                ((TEST_DURATION - timeLeft) / TEST_DURATION) *
                100
              }
              className="mt-4"
            />
          </CardContent>
        </Card>
      )}

      {/* Test Area */}
      <Card className="min-h-[400px]">
        <CardContent className="pt-8">
          <AnimatePresence mode="wait">
            {gameState === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">
                    Attention Test
                  </h3>
                  <div className="max-w-xl mx-auto space-y-4 text-left bg-green-50 dark:bg-green-950/20 rounded-lg p-6">
                    <h4 className="font-semibold text-lg">
                      Instructions:
                    </h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>
                        1. Letters will appear one at a time on
                        the screen
                      </p>
                      <p>
                        2. Click the button ONLY when you see
                        the letter{" "}
                        <strong className="text-green-600 text-xl">
                          'A'
                        </strong>
                      </p>
                      <p>3. Ignore all other letters</p>
                      <p>4. Try to be both fast and accurate</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border text-center">
                      <div className="text-6xl font-bold text-green-600 mb-2">
                        A
                      </div>
                      <p className="text-sm">
                        Click when you see this letter!
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={startTest}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-lg px-8 py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Attention Test
                </Button>
              </motion.div>
            )}

            {gameState === "countdown" && (
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
                  {countdownTime || "GO!"}
                </motion.div>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8"
              >
                <div className="flex justify-center items-center min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {currentLetter && (
                      <motion.div
                        key={currentLetter}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className={`text-8xl font-bold p-8 rounded-2xl shadow-lg border-4 ${
                          currentLetter === TARGET_LETTER
                            ? "text-green-600 bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-700"
                            : "text-gray-600 bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                        }`}
                      >
                        {currentLetter}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleLetterClick}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white text-xl px-12 py-6 h-auto"
                  >
                    <Target className="h-6 w-6 mr-3" />
                    Click for 'A'
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    Only click when you see the letter 'A'
                  </p>
                </div>
              </motion.div>
            )}

            {gameState === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold">
                    Attention Test Complete!
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {hits}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Correct Hits
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(accuracy)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Accuracy
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reactionTimes.length > 0
                          ? Math.round(
                              reactionTimes.reduce(
                                (a, b) => a + b,
                                0,
                              ) / reactionTimes.length,
                            )
                          : 0}
                        ms
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Response
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {lettersShown}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Letters Shown
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetTest}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={onBack}>
                    Continue to Next Test
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
          <strong>Attention Assessment:</strong> This test
          measures your ability to stay focused and respond only
          to specific targets. It's similar to tests used to
          assess sustained attention in clinical settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}