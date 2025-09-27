import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Share2, 
  ArrowLeft,
  Sparkles,
  Target,
  Heart,
  Activity,
  Eye,
  Lightbulb,
  Calendar,
  User,
  BarChart3,
  PieChart,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  Line,
  Area,
  AreaChart
} from 'recharts';

interface ResultsData {
  overallScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  domainScores: {
    memory: number;
    attention: number;
    language: number;
    visuospatial: number;
    executive: number;
    orientation: number;
  };
  cognitiveAge: number;
  progressionRisk: number;
  strengthAreas: string[];
  concernAreas: string[];
  detailedRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  benchmarkComparison: {
    ageGroup: number;
    educationLevel: number;
    general: number;
  };
  timestamp: Date;
  assessmentId: string;
}

interface CognitiveResultsPageProps {
  assessmentData: ResultsData;
  onBackToChat: () => void;
  userProfile?: {
    age: number;
    name?: string;
  };
}

export function CognitiveResultsPage({ 
  assessmentData, 
  onBackToChat, 
  userProfile 
}: CognitiveResultsPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getRiskLevelConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
          label: 'Low Risk',
          description: 'Your cognitive performance is within healthy ranges'
        };
      case 'moderate':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: AlertTriangle,
          label: 'Moderate Risk',
          description: 'Some areas may benefit from attention and lifestyle changes'
        };
      case 'high':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100 dark:bg-orange-950/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: AlertTriangle,
          label: 'Higher Risk',
          description: 'We recommend discussing these results with a healthcare provider'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: Brain,
          label: 'Assessment Complete',
          description: 'Your cognitive health assessment results'
        };
    }
  };

  const riskConfig = getRiskLevelConfig(assessmentData.riskLevel);
  const RiskIcon = riskConfig.icon;

  // Prepare chart data
  const radarData = [
    { domain: 'Memory', score: assessmentData.domainScores.memory, benchmark: 75 },
    { domain: 'Attention', score: assessmentData.domainScores.attention, benchmark: 78 },
    { domain: 'Language', score: assessmentData.domainScores.language, benchmark: 82 },
    { domain: 'Visuospatial', score: assessmentData.domainScores.visuospatial, benchmark: 73 },
    { domain: 'Executive', score: assessmentData.domainScores.executive, benchmark: 76 },
    { domain: 'Orientation', score: assessmentData.domainScores.orientation, benchmark: 88 }
  ];

  const progressData = [
    { name: 'Your Score', value: assessmentData.overallScore, color: '#3B82F6' },
    { name: 'Age Group Average', value: assessmentData.benchmarkComparison.ageGroup, color: '#10B981' },
    { name: 'General Population', value: assessmentData.benchmarkComparison.general, color: '#F59E0B' }
  ];

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
              <Button variant="ghost" onClick={onBackToChat} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Your Cognitive Health Report
                  </h1>
                  <p className="text-muted-foreground">
                    Generated by Dr. Vaidhya • {assessmentData.timestamp.toLocaleDateString()}
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
                      className={`p-4 rounded-2xl ${riskConfig.bgColor} ${riskConfig.borderColor} border-2 shadow-lg`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", duration: 0.8 }}
                    >
                      <RiskIcon className={`h-10 w-10 ${riskConfig.color}`} />
                    </motion.div>
                    <div>
                      <motion.h2 
                        className="text-3xl font-bold mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        {userProfile?.name ? `${userProfile.name}'s` : 'Your'} Cognitive Health Assessment
                      </motion.h2>
                      <motion.p 
                        className="text-muted-foreground text-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        {riskConfig.description}
                      </motion.p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="text-4xl font-mono font-bold text-primary mb-2">
                        {assessmentData.overallScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <div className="text-4xl font-mono font-bold text-purple-600 mb-2">
                        {assessmentData.cognitiveAge}
                      </div>
                      <div className="text-sm text-muted-foreground">Cognitive Age</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.5 }}
                    >
                      <div className="text-4xl font-mono font-bold text-green-600 mb-2">
                        {assessmentData.confidence}%
                      </div>
                      <div className="text-sm text-muted-foreground">AI Confidence</div>
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
                            {assessmentData.overallScore}
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            {riskConfig.label}
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div 
                      className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analysis Tabs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-14 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Domains</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Actions</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cognitive Radar Chart */}
                <Card className="shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Cognitive Profile
                    </CardTitle>
                    <CardDescription>
                      Your performance across key cognitive domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="domain" className="text-sm" />
                          <PolarRadiusAxis angle={0} domain={[0, 100]} className="text-xs" />
                          <Radar
                            name="Your Score"
                            dataKey="score"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.3}
                            strokeWidth={3}
                          />
                          <Radar
                            name="Benchmark"
                            dataKey="benchmark"
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

                {/* Performance Comparison */}
                <Card className="shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Performance Comparison
                    </CardTitle>
                    <CardDescription>
                      How you compare to relevant benchmarks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Concerns */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                {assessmentData.strengthAreas.length > 0 && (
                  <Card className="shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Your Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assessmentData.strengthAreas.map((strength, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="flex items-start gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Areas of Attention */}
                {assessmentData.concernAreas.length > 0 && (
                  <Card className="shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-5 w-5" />
                        Areas for Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assessmentData.concernAreas.map((concern, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="flex items-start gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{concern}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Other tabs would be implemented similarly with enhanced visuals */}
            <TabsContent value="domains" className="space-y-6">
              <div className="grid gap-6">
                {Object.entries(assessmentData.domainScores).map(([domain, score], index) => (
                  <motion.div
                    key={domain}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="capitalize">{domain} Function</CardTitle>
                          <Badge variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}>
                            {score}/100
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Progress value={score} className="h-3 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {score >= 80 && "Excellent performance - above average range"}
                          {score >= 60 && score < 80 && "Good performance - within normal range"}
                          {score >= 40 && score < 60 && "Below average - may benefit from targeted activities"}
                          {score < 40 && "Significant concerns - recommend professional evaluation"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-8">
              {/* Immediate Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Immediate Actions (Next 1-2 weeks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {assessmentData.detailedRecommendations.immediate.map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            !
                          </div>
                          <span className="text-sm leading-relaxed">{action}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Short-term Goals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <Calendar className="h-5 w-5" />
                      Short-term Goals (1-3 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {assessmentData.detailedRecommendations.shortTerm.map((goal, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm"
                        >
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{goal}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Long-term Strategies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                      Long-term Strategies (3+ months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {assessmentData.detailedRecommendations.longTerm.map((strategy, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm"
                        >
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{strategy}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl border-0">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Heart className="h-12 w-12 text-white/90" />
                </div>
                <h2 className="text-2xl font-bold">Take Action for Your Cognitive Health</h2>
                <p className="text-white/90 max-w-2xl mx-auto">
                  Remember, this assessment is for educational purposes only. 
                  For personalized medical advice, please consult with a healthcare professional.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="secondary" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share with Doctor
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