import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { AlertTriangle, Brain, CheckCircle, User, Activity } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { CognitiveTests } from './CognitiveTests';
import { AIAnalysis } from './AIAnalysis';

interface Question {
  id: number;
  question: string;
  category: string;
  options: Array<{ value: string; label: string; score: number }>;
  adaptive?: boolean;
}

interface PersonalInfo {
  age: number;
  education: string;
  healthConditions: string[];
  sleepHours: number;
  exerciseFrequency: string;
}

const baseQuestions: Question[] = [
  {
    id: 1,
    category: "Memory",
    question: "How often do you forget recent conversations or events?",
    options: [
      { value: "never", label: "Never or rarely", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "always", label: "Very often", score: 3 }
    ]
  },
  {
    id: 2,
    category: "Language",
    question: "Do you have difficulty finding the right words when speaking?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 3,
    category: "Memory",
    question: "How often do you misplace items and have trouble retracing steps?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 4,
    category: "Orientation",
    question: "Do you experience confusion about time or place?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 5,
    category: "Executive Function",
    question: "Have you noticed changes in judgment or decision-making abilities?",
    options: [
      { value: "none", label: "No changes", score: 0 },
      { value: "minor", label: "Minor changes", score: 1 },
      { value: "moderate", label: "Moderate changes", score: 2 },
      { value: "significant", label: "Significant changes", score: 3 }
    ]
  },
  {
    id: 6,
    category: "Daily Function",
    question: "Do you have trouble completing familiar tasks at home or work?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 7,
    category: "Behavioral",
    question: "Have others noticed changes in your mood or personality?",
    options: [
      { value: "none", label: "No changes noticed", score: 0 },
      { value: "minor", label: "Minor changes", score: 1 },
      { value: "moderate", label: "Moderate changes", score: 2 },
      { value: "significant", label: "Significant changes", score: 3 }
    ]
  },
  {
    id: 8,
    category: "Social",
    question: "Do you withdraw from social activities or hobbies?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 9,
    category: "Memory",
    question: "How often do you repeat the same question or story?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 10,
    category: "Language",
    question: "Do you have trouble following or joining conversations?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 11,
    category: "Visuospatial",
    question: "Do you have difficulty with visual tasks like reading or recognizing faces?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 12,
    category: "Executive Function",
    question: "How often do you have trouble managing finances or paying bills?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  }
];

const adaptiveQuestions: Question[] = [
  {
    id: 13,
    category: "Memory",
    question: "How often do you forget names of familiar people?",
    adaptive: true,
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 14,
    category: "Orientation",
    question: "Do you get lost in familiar places?",
    adaptive: true,
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ]
  },
  {
    id: 15,
    category: "Behavioral",
    question: "Have you experienced increased anxiety or depression recently?",
    adaptive: true,
    options: [
      { value: "none", label: "No change", score: 0 },
      { value: "mild", label: "Mild increase", score: 1 },
      { value: "moderate", label: "Moderate increase", score: 2 },
      { value: "severe", label: "Severe increase", score: 3 }
    ]
  }
];

export function AssessmentQuiz() {
  const [phase, setPhase] = useState<'demographics' | 'questionnaire' | 'cognitive' | 'analysis'>('demographics');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    age: 0,
    education: '',
    healthConditions: [],
    sleepHours: 0,
    exerciseFrequency: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<Question[]>(baseQuestions);
  const [cognitiveTestResults, setCognitiveTestResults] = useState<any[]>([]);

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    setAnswers(newAnswers);

    // AI-powered adaptive questioning
    if (currentQuestion === questions.length - 1) {
      const additionalQuestions = getAdaptiveQuestions(newAnswers);
      if (additionalQuestions.length > 0) {
        setQuestions(prev => [...prev, ...additionalQuestions]);
      }
    }
  };

  const getAdaptiveQuestions = (currentAnswers: Record<number, string>): Question[] => {
    const additional: Question[] = [];
    const totalScore = calculateScore(currentAnswers);
    
    // Add adaptive questions based on responses
    if (totalScore > 8) { // Higher concern responses
      const memoryAnswers = Object.entries(currentAnswers).filter(([id]) => {
        const q = questions.find(qu => qu.id === parseInt(id));
        return q?.category === 'Memory';
      });
      
      if (memoryAnswers.some(([, answer]) => ['often', 'always', 'moderate', 'significant'].includes(answer))) {
        const memoryAdaptive = adaptiveQuestions.find(q => q.id === 13);
        if (memoryAdaptive && !additional.find(q => q.id === memoryAdaptive.id)) {
          additional.push(memoryAdaptive);
        }
      }

      const orientationAnswers = Object.entries(currentAnswers).filter(([id]) => {
        const q = questions.find(qu => qu.id === parseInt(id));
        return q?.category === 'Orientation';
      });
      
      if (orientationAnswers.some(([, answer]) => ['often', 'sometimes', 'moderate', 'significant'].includes(answer))) {
        const orientationAdaptive = adaptiveQuestions.find(q => q.id === 14);
        if (orientationAdaptive && !additional.find(q => q.id === orientationAdaptive.id)) {
          additional.push(orientationAdaptive);
        }
      }

      const behavioralAdaptive = adaptiveQuestions.find(q => q.id === 15);
      if (behavioralAdaptive && !additional.find(q => q.id === behavioralAdaptive.id)) {
        additional.push(behavioralAdaptive);
      }
    }

    return additional;
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setPhase('cognitive');
    }
  };

  const calculateScore = (answersToUse = answers) => {
    return questions.reduce((total, question) => {
      const answer = answersToUse[question.id];
      const option = question.options.find(opt => opt.value === answer);
      return total + (option?.score || 0);
    }, 0);
  };

  const getResultInterpretation = (score: number) => {
    if (score <= 5) {
      return {
        level: "Low Risk",
        color: "text-green-600",
        icon: CheckCircle,
        message: "Your responses suggest low risk for cognitive concerns. Continue maintaining a healthy lifestyle."
      };
    } else if (score <= 12) {
      return {
        level: "Moderate Risk",
        color: "text-yellow-600",
        icon: AlertTriangle,
        message: "Your responses suggest some cognitive concerns. Consider discussing these with a healthcare provider."
      };
    } else {
      return {
        level: "Higher Risk",
        color: "text-red-600",
        icon: AlertTriangle,
        message: "Your responses suggest significant cognitive concerns. We strongly recommend consulting with a healthcare professional."
      };
    }
  };

  const resetQuiz = () => {
    setPhase('demographics');
    setPersonalInfo({
      age: 0,
      education: '',
      healthConditions: [],
      sleepHours: 0,
      exerciseFrequency: ''
    });
    setCurrentQuestion(0);
    setAnswers({});
    setQuestions(baseQuestions);
    setCognitiveTestResults([]);
  };

  const handleDemographicsComplete = () => {
    if (personalInfo.age && personalInfo.education) {
      setPhase('questionnaire');
    }
  };

  const handleCognitiveTestsComplete = (results: any[]) => {
    setCognitiveTestResults(results);
    setPhase('analysis');
  };

  const handleHealthConditionChange = (condition: string, checked: boolean) => {
    setPersonalInfo(prev => ({
      ...prev,
      healthConditions: checked 
        ? [...prev.healthConditions, condition]
        : prev.healthConditions.filter(c => c !== condition)
    }));
  };

  // Demographics Phase
  if (phase === 'demographics') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            This information helps us provide more accurate analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={personalInfo.age || ''}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep">Hours of sleep per night</Label>
              <Input
                id="sleep"
                type="number"
                placeholder="7"
                value={personalInfo.sleepHours || ''}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, sleepHours: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education Level</Label>
            <Select onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, education: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="some-college">Some College</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="graduate">Graduate Degree</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise Frequency</Label>
            <Select onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, exerciseFrequency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="How often do you exercise?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="rarely">Rarely (1-2 times/month)</SelectItem>
                <SelectItem value="sometimes">Sometimes (1-2 times/week)</SelectItem>
                <SelectItem value="regularly">Regularly (3-4 times/week)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Health Conditions (check all that apply)</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Diabetes', 'High Blood Pressure', 'Heart Disease', 'Depression', 'Anxiety', 'Sleep Disorders'].map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={personalInfo.healthConditions.includes(condition)}
                    onCheckedChange={(checked) => handleHealthConditionChange(condition, checked as boolean)}
                  />
                  <Label htmlFor={condition} className="text-sm">{condition}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleDemographicsComplete} 
            className="w-full"
            disabled={!personalInfo.age || !personalInfo.education}
          >
            Continue to Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Cognitive Tests Phase
  if (phase === 'cognitive') {
    return <CognitiveTests onComplete={handleCognitiveTestsComplete} />;
  }

  // AI Analysis Phase
  if (phase === 'analysis') {
    const questionnaireResults = {
      score: calculateScore(),
      maxScore: questions.length * 3,
      categoryBreakdown: getCategoryBreakdown()
    };

    return (
      <AIAnalysis 
        questionnaireResults={questionnaireResults}
        cognitiveTestResults={cognitiveTestResults}
        personalInfo={personalInfo}
      />
    );
  }

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, {score: number, maxScore: number}> = {};
    
    questions.forEach(question => {
      const answer = answers[question.id];
      const option = question.options.find(opt => opt.value === answer);
      const score = option?.score || 0;
      
      if (!breakdown[question.category]) {
        breakdown[question.category] = { score: 0, maxScore: 0 };
      }
      breakdown[question.category].score += score;
      breakdown[question.category].maxScore += 3;
    });
    
    return breakdown;
  };

  // Questionnaire Phase
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Cognitive Symptom Assessment</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        {currentQ.category && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              {currentQ.category}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-4">{currentQ.question}</h3>
          {currentQ.adaptive && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <Brain className="h-4 w-4 inline mr-1" />
              AI-suggested follow-up question based on your responses
            </div>
          )}
          <RadioGroup
            value={answers[currentQ.id] || ""}
            onValueChange={handleAnswer}
          >
            {currentQ.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={!answers[currentQ.id]}
          >
            {currentQuestion === questions.length - 1 ? "Start Cognitive Tests" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}