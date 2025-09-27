import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, 
  Activity, BarChart3, Download, Share2, Calendar, Clock, User,
  Heart, Shield, Zap, Eye, Ear, Hand, FileText, PieChart,
  LineChart, Radar as RadarIcon, Info, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface DetailedAssessmentData {
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
  riskFactors: {
    modifiable: Array<{name: string; impact: number; status: 'good' | 'moderate' | 'high'}>;
    nonModifiable: Array<{name: string; impact: number}>;
  };
  aiInsights: {
    patternAnalysis: string[];
    predictiveIndicators: string[];
    personalizedAdvice: string[];
  };
  timestamp: Date;
  assessmentId: string;
}

interface DetailedAIAnalyticsProps {
  assessmentData: DetailedAssessmentData | null;
  userProfile?: {
    age: number;
    education: string;
    medicalHistory: string[];
    lifestyle: string[];
  };
  onExport?: () => void;
  onShare?: () => void;
}

export function DetailedAIAnalytics({ 
  assessmentData, 
  userProfile, 
  onExport, 
  onShare 
}: DetailedAIAnalyticsProps) {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Chart colors for consistent theming
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    gradient: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#14B8A6']
  };

  // Enhanced domain data for radar chart
  const enhancedRadarData = assessmentData ? [
    { 
      domain: t('analytics.domains.memory'), 
      score: assessmentData.domainScores.memory,
      benchmark: 75,
      fullName: 'Episodic & Working Memory'
    },
    { 
      domain: t('analytics.domains.attention'), 
      score: assessmentData.domainScores.attention,
      benchmark: 78,
      fullName: 'Sustained & Divided Attention'
    },
    { 
      domain: t('analytics.domains.language'), 
      score: assessmentData.domainScores.language,
      benchmark: 82,
      fullName: 'Language & Communication'
    },
    { 
      domain: t('analytics.domains.visuospatial'), 
      score: assessmentData.domainScores.visuospatial,
      benchmark: 73,
      fullName: 'Visual-Spatial Processing'
    },
    { 
      domain: t('analytics.domains.executive'), 
      score: assessmentData.domainScores.executive,
      benchmark: 76,
      fullName: 'Executive Functions'
    },
    { 
      domain: t('analytics.domains.orientation'), 
      score: assessmentData.domainScores.orientation,
      benchmark: 88,
      fullName: 'Temporal & Spatial Orientation'
    }
  ] : [];

  // Comparison data for benchmarking
  const benchmarkData = assessmentData ? [
    { 
      category: t('analytics.benchmarks.ageGroup'), 
      userScore: assessmentData.overallScore,
      benchmark: assessmentData.benchmarkComparison.ageGroup,
      difference: assessmentData.overallScore - assessmentData.benchmarkComparison.ageGroup
    },
    { 
      category: t('analytics.benchmarks.education'), 
      userScore: assessmentData.overallScore,
      benchmark: assessmentData.benchmarkComparison.educationLevel,
      difference: assessmentData.overallScore - assessmentData.benchmarkComparison.educationLevel
    },
    { 
      category: t('analytics.benchmarks.general'), 
      userScore: assessmentData.overallScore,
      benchmark: assessmentData.benchmarkComparison.general,
      difference: assessmentData.overallScore - assessmentData.benchmarkComparison.general
    }
  ] : [];

  // Risk factors visualization data
  const riskFactorData = assessmentData ? [
    ...assessmentData.riskFactors.modifiable.map(factor => ({
      name: factor.name,
      impact: factor.impact,
      status: factor.status,
      type: 'Modifiable'
    })),
    ...assessmentData.riskFactors.nonModifiable.map(factor => ({
      name: factor.name,
      impact: factor.impact,
      status: 'fixed',
      type: 'Non-Modifiable'
    }))
  ] : [];

  // Cognitive age comparison
  const ageComparisonData = assessmentData && userProfile ? [
    { metric: 'Chronological Age', value: userProfile.age },
    { metric: 'Cognitive Age', value: assessmentData.cognitiveAge },
    { metric: 'Age Group Average', value: assessmentData.benchmarkComparison.ageGroup }
  ] : [];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'moderate': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'critical': return AlertCircle;
      default: return Brain;
    }
  };

  if (!assessmentData) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle>No Assessment Data</CardTitle>
          <CardDescription>
            Complete a cognitive assessment to view detailed analytics
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const RiskIcon = getRiskIcon(assessmentData.riskLevel);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.div 
                  className={`p-4 rounded-2xl ${getRiskLevelColor(assessmentData.riskLevel)} shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                >
                  <RiskIcon className="h-10 w-10" />
                </motion.div>
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {t('analytics.title')}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1 w-1 bg-primary rounded-full"></div>
                      <span className="text-primary font-medium">Dr. Vaidhya Analysis</span>
                      <div className="h-1 w-1 bg-primary rounded-full"></div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <CardDescription className="text-base mt-1">
                      {t('analytics.subtitle')} • {new Date(assessmentData.timestamp).toLocaleDateString()}
                    </CardDescription>
                  </motion.div>
                </div>
              </div>
              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {onExport && (
                  <Button variant="outline" size="sm" onClick={onExport} className="hover:shadow-lg transition-all duration-200">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                )}
                {onShare && (
                  <Button variant="outline" size="sm" onClick={onShare} className="hover:shadow-lg transition-all duration-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </motion.div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Domains
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Risk Factors
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Action Plan
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                  >
                    <CardTitle className="text-4xl font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {assessmentData.overallScore}
                    </CardTitle>
                  </motion.div>
                  <CardDescription className="font-medium">Overall Cognitive Score</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Progress value={assessmentData.overallScore} className="h-3 mb-2" />
                  <motion.p 
                    className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Zap className="h-3 w-3" />
                    {assessmentData.confidence}% AI Confidence
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Risk Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <motion.div 
                    className={`mx-auto p-3 rounded-full w-fit ${getRiskLevelColor(assessmentData.riskLevel)} shadow-lg`}
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
                  >
                    <RiskIcon className="h-8 w-8" />
                  </motion.div>
                  <CardTitle className="text-xl capitalize">
                    {assessmentData.riskLevel} Risk
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Progression Risk: {assessmentData.progressionRisk}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cognitive Age */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
                  >
                    <CardTitle className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {assessmentData.cognitiveAge}
                    </CardTitle>
                  </motion.div>
                  <CardDescription className="font-medium">Cognitive Age (years)</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {userProfile && (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <User className="h-3 w-3" />
                        vs {userProfile.age} chronological
                      </div>
                      <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                        assessmentData.cognitiveAge <= userProfile.age ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {assessmentData.cognitiveAge <= userProfile.age ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {assessmentData.cognitiveAge <= userProfile.age ? 'Better than age' : 'Above chronological age'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Assessment ID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                  >
                    <Clock className="h-10 w-10 mx-auto text-muted-foreground" />
                  </motion.div>
                  <CardTitle className="text-base">Assessment ID</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <div className="font-mono text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      {assessmentData.assessmentId}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(assessmentData.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Radar Chart Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                    <RadarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Cognitive Profile Overview
                    </span>
                    <CardDescription className="mt-1">
                      Your performance across all cognitive domains compared to age-matched benchmarks
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  <motion.div 
                    className="h-96 relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={enhancedRadarData}>
                        <defs>
                          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={chartColors.purple} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <PolarGrid 
                          gridType="polygon" 
                          stroke="currentColor" 
                          strokeOpacity={0.2}
                        />
                        <PolarAngleAxis 
                          dataKey="domain" 
                          tick={{ fontSize: 13, fontWeight: 600 }}
                          className="fill-foreground"
                        />
                        <PolarRadiusAxis
                          angle={0}
                          domain={[0, 100]}
                          tick={{ fontSize: 10 }}
                          className="fill-muted-foreground"
                          strokeOpacity={0.3}
                        />
                        <Radar
                          name="Your Score"
                          dataKey="score"
                          stroke={chartColors.primary}
                          fill="url(#radarGradient)"
                          strokeWidth={3}
                          dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                        />
                        <Radar
                          name="Age Benchmark"
                          dataKey="benchmark"
                          stroke={chartColors.secondary}
                          fill={chartColors.secondary}
                          fillOpacity={0.05}
                          strokeWidth={2}
                          strokeDasharray="8 4"
                          dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 3 }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </motion.div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-lg">Domain Analysis</h4>
                    </div>
                    {enhancedRadarData.map((domain, index) => (
                      <motion.div 
                        key={domain.domain} 
                        className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{domain.fullName}</span>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={domain.score >= 70 ? "default" : domain.score >= 50 ? "secondary" : "destructive"}
                              className="text-xs px-2 py-1"
                            >
                              {domain.score}/100
                            </Badge>
                            <div className={`flex items-center gap-1 text-xs font-medium ${
                              domain.score >= domain.benchmark ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {domain.score >= domain.benchmark ? <TrendingUp className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                              {Math.abs(domain.score - domain.benchmark)}
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={domain.score} className="h-3" />
                          <div 
                            className="absolute top-0 h-3 w-0.5 bg-muted-foreground/40 rounded-full"
                            style={{ left: `${domain.benchmark}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Your Score: {domain.score}</span>
                          <span>Benchmark: {domain.benchmark}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-6">
          <div className="grid gap-6">
            {enhancedRadarData.map((domain, index) => (
              <Card key={domain.domain}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        {domain.fullName}
                      </CardTitle>
                      <CardDescription>
                        Detailed analysis of {domain.domain.toLowerCase()} capabilities
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={domain.score >= 70 ? "default" : domain.score >= 50 ? "secondary" : "destructive"}
                      className="text-lg px-3 py-1"
                    >
                      {domain.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Performance Metrics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Your Score</span>
                          <span className="font-mono">{domain.score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Age Benchmark</span>
                          <span className="font-mono">{domain.benchmark}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Percentile Rank</span>
                          <span className="font-mono">
                            {Math.round((domain.score / 100) * 100)}th
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Clinical Interpretation</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {domain.score >= 80 && (
                          <p className="text-green-600">
                            ✓ Above average performance - cognitive strength
                          </p>
                        )}
                        {domain.score >= 60 && domain.score < 80 && (
                          <p className="text-blue-600">
                            → Average range - within expected limits
                          </p>
                        )}
                        {domain.score >= 40 && domain.score < 60 && (
                          <p className="text-orange-600">
                            ⚠ Below average - may benefit from targeted exercises
                          </p>
                        )}
                        {domain.score < 40 && (
                          <p className="text-red-600">
                            ⚠ Significantly below average - recommend professional evaluation
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={domain.score} className="h-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pattern Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-md">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Pattern Analysis
                      </span>
                      <CardDescription className="mt-1">
                        AI-detected patterns in your cognitive performance
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentData.aiInsights.patternAnalysis.map((pattern, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-900/50 rounded-lg border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm leading-relaxed">{pattern}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Predictive Indicators */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Predictive Indicators
                      </span>
                      <CardDescription className="mt-1">
                        Early indicators identified by machine learning analysis
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentData.aiInsights.predictiveIndicators.map((indicator, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-900/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm leading-relaxed">{indicator}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personalized AI Advice */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <Lightbulb className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                        Dr. Vaidhya's Personalized Insights
                      </span>
                      <CardDescription className="mt-2 text-base">
                        Advanced AI recommendations tailored specifically for your cognitive profile
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-5">
                    {assessmentData.aiInsights.personalizedAdvice.map((advice, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative flex items-start gap-4 p-5 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{advice}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid gap-6">
            {/* Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Performance Benchmarking
                </CardTitle>
                <CardDescription>
                  How your cognitive performance compares to relevant population groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="userScore" fill={chartColors.primary} name="Your Score" />
                      <Bar dataKey="benchmark" fill={chartColors.secondary} name="Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Age Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Age-Related Analysis
                </CardTitle>
                <CardDescription>
                  Cognitive age vs chronological age comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill={chartColors.purple} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Age Analysis Insights</h4>
                    {userProfile && (
                      <>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <p className="text-sm">
                            <strong>Cognitive Age:</strong> {assessmentData.cognitiveAge} years
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {assessmentData.cognitiveAge < userProfile.age 
                              ? `Your cognitive performance is ${userProfile.age - assessmentData.cognitiveAge} years younger than your chronological age`
                              : assessmentData.cognitiveAge === userProfile.age
                              ? 'Your cognitive age matches your chronological age'
                              : `Your cognitive performance is ${assessmentData.cognitiveAge - userProfile.age} years older than your chronological age`
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <p className="text-sm">
                            <strong>Peer Comparison:</strong> {assessmentData.benchmarkComparison.ageGroup}th percentile
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Among people aged {Math.floor(userProfile.age/10)*10}-{Math.floor(userProfile.age/10)*10 + 9}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Factors Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Modifiable Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Heart className="h-5 w-5" />
                  Modifiable Risk Factors
                </CardTitle>
                <CardDescription>
                  Factors you can influence through lifestyle changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessmentData.riskFactors.modifiable.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          factor.status === 'good' ? 'bg-green-500' :
                          factor.status === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium">{factor.name}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {factor.impact}% impact
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {factor.status} status
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Non-Modifiable Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Shield className="h-5 w-5" />
                  Non-Modifiable Risk Factors
                </CardTitle>
                <CardDescription>
                  Genetic and age-related factors to be aware of
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessmentData.riskFactors.nonModifiable.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/10">
                      <span className="text-sm font-medium">{factor.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {factor.impact}% impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factor Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-600" />
                  Risk Factor Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskFactorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, impact }) => `${name}: ${impact}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="impact"
                      >
                        {riskFactorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors.gradient[index % chartColors.gradient.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-8">
          <div className="space-y-8">
            {/* Immediate Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="border-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-950/30 dark:via-pink-950/30 dark:to-rose-950/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                      <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                        Immediate Actions
                      </span>
                      <CardDescription className="text-base mt-1">
                        Priority actions to take right away (Next 1-2 weeks)
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentData.detailedRecommendations.immediate.map((rec, index) => (
                      <motion.div 
                        key={index} 
                        className="group relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative flex items-start gap-4 p-4 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-red-200/50 dark:border-red-800/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                            !
                          </div>
                          <span className="text-sm leading-relaxed">{rec}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Short Term Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="border-0 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/30 dark:via-amber-950/30 dark:to-orange-950/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Short-term Goals
                      </span>
                      <CardDescription className="text-base mt-1">
                        Actions to implement over the coming months (1-3 months)
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {assessmentData.detailedRecommendations.shortTerm.map((rec, index) => (
                      <motion.div 
                        key={index} 
                        className="group relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative flex items-start gap-3 p-4 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{rec}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Long Term Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        Long-term Strategies
                      </span>
                      <CardDescription className="text-base mt-1">
                        Sustainable lifestyle changes for long-term cognitive health (3+ months)
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {assessmentData.detailedRecommendations.longTerm.map((rec, index) => (
                      <motion.div 
                        key={index} 
                        className="group relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative flex items-start gap-3 p-4 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{rec}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Need Professional Guidance?
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Share these results with your healthcare provider for personalized medical advice
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:shadow-lg transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Doctor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}