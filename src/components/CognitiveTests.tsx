import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Timer, Brain, Target, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  testName: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  details: any;
}

interface CognitiveTestsProps {
  onComplete: (results: TestResult[]) => void;
}

export function CognitiveTests({ onComplete }: CognitiveTestsProps) {
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);

  const tests = [
    { name: "Memory Recall", component: MemoryRecallTest },
    { name: "Attention & Focus", component: AttentionTest },
    { name: "Processing Speed", component: ProcessingSpeedTest },
    { name: "Pattern Recognition", component: PatternRecognitionTest }
  ];

  const handleTestComplete = (result: TestResult) => {
    const newResults = [...results, result];
    setResults(newResults);
    
    if (currentTest < tests.length - 1) {
      setCurrentTest(prev => prev + 1);
      setIsTestActive(false);
    } else {
      onComplete(newResults);
    }
  };

  const CurrentTestComponent = tests[currentTest].component;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3>Interactive Cognitive Tests</h3>
        <p className="text-muted-foreground">
          Complete {tests.length} interactive tests to assess different cognitive functions
        </p>
        <Progress value={((currentTest + (isTestActive ? 1 : 0)) / tests.length) * 100} className="mt-4" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {tests[currentTest].name}
              </CardTitle>
              <CardDescription>
                Test {currentTest + 1} of {tests.length}
              </CardDescription>
            </div>
            <Badge variant="outline">{((currentTest / tests.length) * 100).toFixed(0)}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CurrentTestComponent onComplete={handleTestComplete} isActive={isTestActive} setIsActive={setIsTestActive} />
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">{result.testName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {result.timeSpent}s
                    </span>
                  </div>
                  <Badge variant={result.score / result.maxScore > 0.7 ? "default" : "secondary"}>
                    {result.score}/{result.maxScore}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemoryRecallTest({ onComplete, isActive, setIsActive }: { onComplete: (result: TestResult) => void; isActive: boolean; setIsActive: (active: boolean) => void }) {
  const [phase, setPhase] = useState<'instructions' | 'memorize' | 'recall' | 'results'>('instructions');
  const [words] = useState(['APPLE', 'CHAIR', 'OCEAN', 'GUITAR', 'WINDOW', 'PURPLE', 'MOUNTAIN', 'CANDLE']);
  const [userInput, setUserInput] = useState('');
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [startTime, setStartTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (phase === 'memorize' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && phase === 'memorize') {
      setPhase('recall');
      setTimeRemaining(60);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, timeRemaining]);

  const startTest = () => {
    setPhase('memorize');
    setIsActive(true);
    setStartTime(Date.now());
    setTimeRemaining(30);
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      const word = userInput.trim().toUpperCase();
      if (!recalledWords.includes(word)) {
        setRecalledWords(prev => [...prev, word]);
      }
      setUserInput('');
    }
  };

  const finishRecall = () => {
    const correctWords = recalledWords.filter(word => words.includes(word));
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    onComplete({
      testName: "Memory Recall",
      score: correctWords.length,
      maxScore: words.length,
      timeSpent,
      details: {
        correctWords,
        incorrectWords: recalledWords.filter(word => !words.includes(word)),
        totalRecalled: recalledWords.length
      }
    });
  };

  if (phase === 'instructions') {
    return (
      <div className="text-center space-y-4">
        <div className="p-6 bg-muted/50 rounded-lg">
          <h4 className="mb-3">Memory Recall Test Instructions</h4>
          <div className="space-y-2 text-sm text-left max-w-md mx-auto">
            <p>• You will see 8 words for 30 seconds</p>
            <p>• Try to memorize as many as possible</p>
            <p>• After 30 seconds, type the words you remember</p>
            <p>• You have 60 seconds to recall the words</p>
          </div>
        </div>
        <Button onClick={startTest}>Start Memory Test</Button>
      </div>
    );
  }

  if (phase === 'memorize') {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer className="h-5 w-5" />
          <span>Memorize these words: {timeRemaining}s</span>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {words.map((word, index) => (
            <div key={index} className="p-3 bg-primary/10 rounded-lg text-lg font-medium">
              {word}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Study these words carefully</p>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Timer className="h-5 w-5" />
            <span>Time remaining: {timeRemaining}s</span>
          </div>
          <p>Type the words you remember (one at a time)</p>
        </div>

        <form onSubmit={handleWordSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter a word..."
            className="flex-1 px-3 py-2 border rounded-lg"
            autoFocus
          />
          <Button type="submit">Add</Button>
        </form>

        {recalledWords.length > 0 && (
          <div className="max-w-md mx-auto">
            <p className="text-sm mb-2">Words recalled ({recalledWords.length}):</p>
            <div className="flex flex-wrap gap-2">
              {recalledWords.map((word, index) => (
                <Badge 
                  key={index} 
                  variant={words.includes(word) ? "default" : "destructive"}
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Button onClick={finishRecall}>Finish Test</Button>
        </div>
      </div>
    );
  }

  return null;
}

function AttentionTest({ onComplete, isActive, setIsActive }: { onComplete: (result: TestResult) => void; isActive: boolean; setIsActive: (active: boolean) => void }) {
  const [phase, setPhase] = useState<'instructions' | 'active' | 'complete'>('instructions');
  const [targetColor, setTargetColor] = useState('red');
  const [currentColor, setCurrentColor] = useState('blue');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500', 
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  const startTest = () => {
    setPhase('active');
    setIsActive(true);
    setStartTime(Date.now());
    setTargetColor(colors[Math.floor(Math.random() * colors.length)]);
    
    intervalRef.current = setInterval(() => {
      setCurrentColor(colors[Math.floor(Math.random() * colors.length)]);
      setAttempts(prev => prev + 1);
    }, 1500);

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase('complete');
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        testName: "Attention & Focus",
        score,
        maxScore: Math.max(attempts, 1),
        timeSpent,
        details: { accuracy: attempts > 0 ? score / attempts : 0 }
      });
    }, 30000);
  };

  const handleClick = () => {
    if (currentColor === targetColor) {
      setScore(prev => prev + 1);
    }
  };

  if (phase === 'instructions') {
    return (
      <div className="text-center space-y-4">
        <div className="p-6 bg-muted/50 rounded-lg">
          <h4 className="mb-3">Attention & Focus Test Instructions</h4>
          <div className="space-y-2 text-sm text-left max-w-md mx-auto">
            <p>• A colored circle will appear and change colors</p>
            <p>• Click ONLY when you see the target color</p>
            <p>• Test lasts 30 seconds</p>
            <p>• Stay focused and respond quickly</p>
          </div>
        </div>
        <Button onClick={startTest}>Start Attention Test</Button>
      </div>
    );
  }

  if (phase === 'active') {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <p>Click when you see: <span className="font-medium uppercase">{targetColor}</span></p>
          <div className="flex justify-center">
            <button
              onClick={handleClick}
              className={`w-32 h-32 rounded-full ${colorClasses[currentColor as keyof typeof colorClasses]} transition-all duration-200 hover:scale-105`}
            />
          </div>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>Score: {score}</span>
            <span>Attempts: {attempts}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ProcessingSpeedTest({ onComplete, isActive, setIsActive }: { onComplete: (result: TestResult) => void; isActive: boolean; setIsActive: (active: boolean) => void }) {
  const [phase, setPhase] = useState<'instructions' | 'active' | 'complete'>('instructions');
  const [currentProblem, setCurrentProblem] = useState(0);
  const [problems, setProblems] = useState<Array<{question: string, answer: number, options: number[]}>>([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const generateProblems = () => {
    const newProblems = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const operation = Math.random() > 0.5 ? '+' : '-';
      const answer = operation === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
      const question = `${Math.max(a, b)} ${operation} ${Math.min(a, b)}`;
      
      const options = [answer];
      while (options.length < 4) {
        const wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
        if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }
      options.sort(() => Math.random() - 0.5);
      
      newProblems.push({ question, answer, options });
    }
    setProblems(newProblems);
  };

  const startTest = () => {
    generateProblems();
    setPhase('active');
    setIsActive(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (selectedAnswer === problems[currentProblem].answer) {
      setScore(prev => prev + 1);
    }
    
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        testName: "Processing Speed",
        score,
        maxScore: problems.length,
        timeSpent,
        details: { averageTimePerProblem: timeSpent / problems.length }
      });
    }
  };

  if (phase === 'instructions') {
    return (
      <div className="text-center space-y-4">
        <div className="p-6 bg-muted/50 rounded-lg">
          <h4 className="mb-3">Processing Speed Test Instructions</h4>
          <div className="space-y-2 text-sm text-left max-w-md mx-auto">
            <p>• Solve 10 simple math problems as quickly as possible</p>
            <p>• Click the correct answer for each problem</p>
            <p>• Work as fast as you can while staying accurate</p>
          </div>
        </div>
        <Button onClick={startTest}>Start Processing Speed Test</Button>
      </div>
    );
  }

  if (phase === 'active' && problems.length > 0) {
    const problem = problems[currentProblem];
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Problem {currentProblem + 1} of {problems.length}
          </p>
          <div className="text-3xl font-mono">{problem.question} = ?</div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {problem.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleAnswer(option)}
                className="text-lg py-3"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function PatternRecognitionTest({ onComplete, isActive, setIsActive }: { onComplete: (result: TestResult) => void; isActive: boolean; setIsActive: (active: boolean) => void }) {
  const [phase, setPhase] = useState<'instructions' | 'active' | 'complete'>('instructions');
  const [currentPattern, setCurrentPattern] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const patterns = [
    { sequence: [1, 2, 3, 4], answer: 5, options: [5, 6, 7, 8] },
    { sequence: [2, 4, 6, 8], answer: 10, options: [9, 10, 11, 12] },
    { sequence: [1, 4, 9, 16], answer: 25, options: [20, 25, 30, 35] },
    { sequence: [3, 6, 9, 12], answer: 15, options: [13, 15, 17, 19] },
    { sequence: [1, 1, 2, 3, 5], answer: 8, options: [6, 7, 8, 9] }
  ];

  const startTest = () => {
    setPhase('active');
    setIsActive(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (selectedAnswer === patterns[currentPattern].answer) {
      setScore(prev => prev + 1);
    }
    
    if (currentPattern < patterns.length - 1) {
      setCurrentPattern(prev => prev + 1);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        testName: "Pattern Recognition",
        score,
        maxScore: patterns.length,
        timeSpent,
        details: { patternTypes: ['arithmetic', 'geometric', 'fibonacci'] }
      });
    }
  };

  if (phase === 'instructions') {
    return (
      <div className="text-center space-y-4">
        <div className="p-6 bg-muted/50 rounded-lg">
          <h4 className="mb-3">Pattern Recognition Test Instructions</h4>
          <div className="space-y-2 text-sm text-left max-w-md mx-auto">
            <p>• Look at each number sequence</p>
            <p>• Find the pattern and predict the next number</p>
            <p>• Select the correct answer from the options</p>
          </div>
        </div>
        <Button onClick={startTest}>Start Pattern Test</Button>
      </div>
    );
  }

  if (phase === 'active') {
    const pattern = patterns[currentPattern];
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pattern {currentPattern + 1} of {patterns.length}
          </p>
          <div className="text-xl font-mono">
            {pattern.sequence.join(', ')}, ?
          </div>
          <p className="text-sm text-muted-foreground">What comes next?</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {pattern.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleAnswer(option)}
                className="text-lg py-3"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}