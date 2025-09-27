import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Activity } from 'lucide-react';

interface AIAnalysisProps {
  questionnaireResults: any;
  cognitiveTestResults: any[];
  personalInfo: {
    age: number;
    education: string;
    healthConditions: string[];
  };
}

interface CognitiveProfile {
  overallScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  domainScores: {
    memory: number;
    attention: number;
    processing: number;
    pattern: number;
  };
}

export function AIAnalysis({ questionnaireResults, cognitiveTestResults, personalInfo }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<CognitiveProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis with realistic processing time
    const analyzeResults = () => {
      setTimeout(() => {
        const profile = generateCognitiveProfile();
        setAnalysis(profile);
        setIsAnalyzing(false);
      }, 3000);
    };

    analyzeResults();
  }, [questionnaireResults, cognitiveTestResults, personalInfo]);

  const generateCognitiveProfile = (): CognitiveProfile => {
    // Calculate domain scores from cognitive tests
    const testScores = cognitiveTestResults.reduce((acc, test) => {
      const percentage = (test.score / test.maxScore) * 100;
      switch (test.testName) {
        case 'Memory Recall':
          acc.memory = percentage;
          break;
        case 'Attention & Focus':
          acc.attention = percentage;
          break;
        case 'Processing Speed':
          acc.processing = percentage;
          break;
        case 'Pattern Recognition':
          acc.pattern = percentage;
          break;
      }
      return acc;
    }, { memory: 0, attention: 0, processing: 0, pattern: 0 });

    // Calculate questionnaire impact
    const questionnaireScore = questionnaireResults?.score || 0;
    const maxQuestionnaireScore = questionnaireResults?.maxScore || 24;
    const questionnairePercentage = ((maxQuestionnaireScore - questionnaireScore) / maxQuestionnaireScore) * 100;

    // Weighted overall score (cognitive tests 70%, questionnaire 30%)
    const cognitiveAverage = Object.values(testScores).reduce((a, b) => a + b, 0) / 4;
    const overallScore = Math.round((cognitiveAverage * 0.7) + (questionnairePercentage * 0.3));

    // Age-adjusted scoring
    const ageAdjustment = calculateAgeAdjustment(personalInfo.age);
    const adjustedScore = Math.min(100, Math.round(overallScore + ageAdjustment));

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high';
    if (adjustedScore >= 75) riskLevel = 'low';
    else if (adjustedScore >= 50) riskLevel = 'moderate';
    else riskLevel = 'high';

    // Generate insights
    const strengths = generateStrengths(testScores, questionnaireScore);
    const concerns = generateConcerns(testScores, questionnaireScore, personalInfo);
    const recommendations = generateRecommendations(riskLevel, testScores, personalInfo);

    return {
      overallScore: adjustedScore,
      riskLevel,
      strengths,
      concerns,
      recommendations,
      domainScores: testScores
    };
  };

  const calculateAgeAdjustment = (age: number): number => {
    // Age-based cognitive performance adjustments
    if (age < 50) return 0;
    if (age < 65) return 5;
    if (age < 75) return 10;
    return 15;
  };

  const generateStrengths = (testScores: any, questionnaireScore: number): string[] => {
    const strengths = [];
    
    if (testScores.memory >= 80) strengths.push("Excellent memory retention and recall abilities");
    if (testScores.attention >= 80) strengths.push("Strong sustained attention and focus");
    if (testScores.processing >= 80) strengths.push("Fast and accurate information processing");
    if (testScores.pattern >= 80) strengths.push("Superior pattern recognition and logical reasoning");
    
    if (questionnaireScore <= 3) strengths.push("Few self-reported cognitive concerns");
    if (personalInfo.education === 'graduate') strengths.push("Higher education may provide cognitive reserve");
    
    if (strengths.length === 0) {
      strengths.push("Completion of comprehensive assessment shows cognitive awareness");
    }
    
    return strengths;
  };

  const generateConcerns = (testScores: any, questionnaireScore: number, personalInfo: any): string[] => {
    const concerns = [];
    
    if (testScores.memory < 60) concerns.push("Memory performance below expected range");
    if (testScores.attention < 60) concerns.push("Attention and focus may need improvement");
    if (testScores.processing < 60) concerns.push("Processing speed slower than typical");
    if (testScores.pattern < 60) concerns.push("Pattern recognition abilities show room for improvement");
    
    if (questionnaireScore > 12) concerns.push("Multiple self-reported cognitive symptoms");
    if (personalInfo.healthConditions?.includes('cardiovascular')) {
      concerns.push("Cardiovascular conditions may impact cognitive health");
    }
    
    return concerns;
  };

  const generateRecommendations = (riskLevel: string, testScores: any, personalInfo: any): string[] => {
    const recommendations = [];
    
    // Universal recommendations
    recommendations.push("Maintain regular physical exercise (150 minutes/week)");
    recommendations.push("Follow a Mediterranean-style diet rich in omega-3s");
    recommendations.push("Engage in regular social activities and mental stimulation");
    
    // Risk-level specific recommendations
    if (riskLevel === 'high') {
      recommendations.push("Schedule comprehensive neurological evaluation within 2-4 weeks");
      recommendations.push("Consider cognitive rehabilitation programs");
    } else if (riskLevel === 'moderate') {
      recommendations.push("Discuss results with primary care physician within 1-2 months");
      recommendations.push("Monitor cognitive changes with regular self-assessments");
    }
    
    // Domain-specific recommendations
    if (testScores.memory < 70) {
      recommendations.push("Practice memory exercises like word lists and name-face associations");
    }
    if (testScores.attention < 70) {
      recommendations.push("Try mindfulness meditation and attention training exercises");
    }
    if (testScores.processing < 70) {
      recommendations.push("Engage in timed puzzles and quick decision-making games");
    }
    
    // Age-specific recommendations
    if (personalInfo.age > 65) {
      recommendations.push("Consider annual cognitive screenings");
      recommendations.push("Ensure adequate sleep (7-9 hours) and manage stress");
    }
    
    return recommendations.slice(0, 6); // Limit to 6 recommendations
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin">
              <Brain className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle>AI Analysis in Progress</CardTitle>
          <CardDescription>
            Our AI system is analyzing your results using advanced cognitive assessment algorithms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing cognitive test results...</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Analyzing response patterns...</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Applying age-adjusted norms...</span>
              <span>⟳</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Generating personalized recommendations...</span>
              <span>⋯</span>
            </div>
          </div>
          <Progress value={65} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'moderate': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return Brain;
    }
  };

  const RiskIcon = getRiskIcon(analysis.riskLevel);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Results */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <RiskIcon className={`h-16 w-16 ${getRiskColor(analysis.riskLevel)}`} />
          </div>
          <CardTitle>AI-Powered Cognitive Analysis</CardTitle>
          <CardDescription>
            Comprehensive assessment based on your performance and responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-mono">{analysis.overallScore}/100</div>
            <div className={`text-xl ${getRiskColor(analysis.riskLevel)}`}>
              {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk Profile
            </div>
          </div>

          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              This score represents your cognitive performance relative to age-matched peers, 
              combining objective test results with self-reported symptoms.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Domain Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cognitive Domain Analysis
          </CardTitle>
          <CardDescription>
            Performance breakdown by cognitive function
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analysis.domainScores).map(([domain, score]) => (
            <div key={domain} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="capitalize font-medium">{domain}</span>
                <Badge variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}>
                  {Math.round(score)}%
                </Badge>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Cognitive Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Concerns */}
      {analysis.concerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Areas of Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated suggestions based on your specific profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Important actions to take based on your assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.riskLevel === 'high' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Your results suggest seeking professional medical evaluation promptly. 
                Contact your healthcare provider to discuss these findings.
              </AlertDescription>
            </Alert>
          )}
          
          {analysis.riskLevel === 'moderate' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Consider discussing these results with your healthcare provider at your next appointment 
                or schedule a consultation within the next month.
              </AlertDescription>
            </Alert>
          )}

          {analysis.riskLevel === 'low' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your cognitive performance is within expected ranges. Continue healthy lifestyle practices 
                and consider annual cognitive health check-ups.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}