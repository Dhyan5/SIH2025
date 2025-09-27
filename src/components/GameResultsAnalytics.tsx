import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Trophy, 
  Brain, 
  TrendingUp, 
  Target,
  Clock,
  Award,
  Download,
  Share2,
  RotateCcw,
  ArrowLeft,
  Star,
  Activity,
  Eye,
  Zap,
  Puzzle
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface GameScore {
  gameType: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  timestamp: Date;
  domain: 'memory' | 'attention' | 'processing' | 'visuospatial' | 'executive';
}

interface GameSession {
  id: string;
  scores: GameScore[];
  overallScore: number;
  completedGames: number;
  totalGames: number;
  timestamp: Date;
  duration: number;
}

interface GameResultsAnalyticsProps {
  session: GameSession;
  onStartNewSession: () => void;
  onBackToGames: () => void;
}

const DOMAIN_INFO = {
  memory: {
    title: 'Memory',
    icon: Brain,
    color: 'from-blue-500 to-purple-500',
    description: 'Short-term and working memory abilities'
  },
  attention: {
    title: 'Attention',
    icon: Target,
    color: 'from-green-500 to-teal-500',
    description: 'Sustained and selective attention capabilities'
  },
  processing: {
    title: 'Processing Speed',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    description: 'Speed of cognitive processing and decision making'
  },
  visuospatial: {
    title: 'Visuospatial',
    icon: Eye,
    color: 'from-purple-500 to-pink-500',
    description: 'Spatial reasoning and visual processing'
  },
  executive: {
    title: 'Executive Function',
    icon: Puzzle,
    color: 'from-red-500 to-pink-500',
    description: 'Cognitive flexibility and problem-solving'
  }
};

export function GameResultsAnalytics({ session, onStartNewSession, onBackToGames }: GameResultsAnalyticsProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', description: 'Outstanding performance' };
    if (score >= 80) return { level: 'Very Good', color: 'text-blue-600', description: 'Above average performance' };
    if (score >= 70) return { level: 'Good', color: 'text-yellow-600', description: 'Average performance' };
    if (score >= 60) return { level: 'Fair', color: 'text-orange-600', description: 'Below average performance' };
    return { level: 'Needs Improvement', color: 'text-red-600', description: 'Consider practice and lifestyle changes' };
  };

  const overallPerformance = getPerformanceLevel(session.overallScore);

  // Prepare chart data
  const domainData = session.scores.map(score => ({
    domain: DOMAIN_INFO[score.domain].title,
    score: score.score,
    accuracy: score.accuracy,
    speed: Math.max(0, 100 - (score.reactionTime / 50))
  }));

  const comparisonData = session.scores.map(score => ({
    game: score.gameType.charAt(0).toUpperCase() + score.gameType.slice(1),
    yourScore: score.score,
    averageScore: 75, // Simulated average
    optimal: 90
  }));

  const avgReactionTime = session.scores.reduce((sum, score) => sum + score.reactionTime, 0) / session.scores.length;
  const avgAccuracy = session.scores.reduce((sum, score) => sum + score.accuracy, 0) / session.scores.length;

  const strengthAreas = session.scores
    .filter(score => score.score >= 80)
    .map(score => DOMAIN_INFO[score.domain].title);

  const improvementAreas = session.scores
    .filter(score => score.score < 70)
    .map(score => DOMAIN_INFO[score.domain].title);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBackToGames}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Cognitive Games Results
                  </h1>
                  <p className="text-muted-foreground">
                    Session completed • {session.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section with Overall Score */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 shadow-2xl border-0">
            <CardContent className="pt-8 pb-8">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", duration: 0.8 }}
                    >
                      <Trophy className="h-10 w-10 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2 
                        className="text-3xl font-bold mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        Cognitive Assessment Complete!
                      </motion.h2>
                      <motion.p 
                        className={`text-lg font-medium ${overallPerformance.color}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        {overallPerformance.level} Performance • {overallPerformance.description}
                      </motion.p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="text-3xl font-mono font-bold text-primary mb-2">
                        {session.overallScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <div className="text-3xl font-mono font-bold text-green-600 mb-2">
                        {Math.round(avgAccuracy)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.5 }}
                    >
                      <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                        {Math.round(avgReactionTime)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Speed</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    >
                      <div className="text-3xl font-mono font-bold text-purple-600 mb-2">
                        {formatDuration(session.duration)}
                      </div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </motion.div>
                  </div>
                </div>
                
                <motion.div 
                  className="flex justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                >
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1 shadow-2xl">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {session.overallScore}
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            {overallPerformance.level}
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div 
                      className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Domains</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Comparison</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cognitive Profile Radar */}
                <Card className="shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Cognitive Profile
                    </CardTitle>
                    <CardDescription>
                      Your performance across cognitive domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={domainData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="domain" className="text-sm" />
                          <PolarRadiusAxis angle={0} domain={[0, 100]} className="text-xs" />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.3}
                            strokeWidth={3}
                          />
                          <Radar
                            name="Accuracy"
                            dataKey="accuracy"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Game Scores */}
                <Card className="shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Game Performance
                    </CardTitle>
                    <CardDescription>
                      Individual game scores and accuracy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {session.scores.map((score, index) => {
                        const domain = DOMAIN_INFO[score.domain];
                        const IconComponent = domain.icon;
                        const performance = getPerformanceLevel(score.score);
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${domain.color}`}>
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{domain.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {score.accuracy}% accuracy • {score.reactionTime}ms avg
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{score.score}</div>
                              <Badge variant="outline" className={performance.color}>
                                {performance.level}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Areas for Improvement */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                {strengthAreas.length > 0 && (
                  <Card className="shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Star className="h-5 w-5" />
                        Your Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {strengthAreas.map((area, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                          >
                            <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{area}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Areas for Improvement */}
                {improvementAreas.length > 0 && (
                  <Card className="shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <TrendingUp className="h-5 w-5" />
                        Areas for Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {improvementAreas.map((area, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                          >
                            <Target className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{area}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Other tabs would contain domain analysis, comparisons, and detailed insights */}
            <TabsContent value="domains" className="space-y-6">
              <div className="grid gap-6">
                {session.scores.map((score, index) => {
                  const domain = DOMAIN_INFO[score.domain];
                  const IconComponent = domain.icon;
                  const performance = getPerformanceLevel(score.score);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="shadow-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${domain.color}`}>
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <CardTitle>{domain.title}</CardTitle>
                                <CardDescription>{domain.description}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className={performance.color}>
                              {score.score}/100
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Progress value={score.score} className="h-3 mb-4" />
                          <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                              <div className="font-medium">{score.score}</div>
                              <div className="text-muted-foreground">Score</div>
                            </div>
                            <div>
                              <div className="font-medium">{score.accuracy}%</div>
                              <div className="text-muted-foreground">Accuracy</div>
                            </div>
                            <div>
                              <div className="font-medium">{score.reactionTime}ms</div>
                              <div className="text-muted-foreground">Avg Speed</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl border-0">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Award className="h-12 w-12 text-white/90" />
                </div>
                <h2 className="text-2xl font-bold">Great Job on Completing the Assessment!</h2>
                <p className="text-white/90 max-w-2xl mx-auto">
                  Regular cognitive training can help maintain and improve your mental abilities. 
                  Consider repeating these games weekly to track your progress over time.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="secondary" size="lg" onClick={onStartNewSession}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Session
                  </Button>
                  <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}