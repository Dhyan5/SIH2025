import { DetailedAssessmentData } from './DetailedAIAnalytics';

interface ConversationData {
  [key: string]: string;
}

interface UserProfile {
  age?: number;
  education?: string;
  medicalHistory?: string[];
  lifestyle?: string[];
}

export class AIAnalyticsGenerator {
  private static calculateDomainScore(responses: ConversationData, domain: string): number {
    // Simulated domain-specific scoring based on responses
    const baseScore = 75;
    const variation = Math.random() * 30 - 15; // ±15 points variation
    
    // Adjust based on specific responses
    let adjustment = 0;
    
    switch (domain) {
      case 'memory':
        if (responses.recentMemory?.length > 10) adjustment += 10;
        if (responses.selfAssessment?.includes('poor')) adjustment -= 15;
        break;
      case 'attention':
        if (responses.attention?.includes('difficult')) adjustment -= 10;
        if (responses.attention?.includes('focused')) adjustment += 10;
        break;
      case 'language':
        if (responses.language?.includes('often')) adjustment -= 12;
        if (responses.language?.includes('never')) adjustment += 15;
        break;
      case 'visuospatial':
        if (responses.navigation?.includes('confused')) adjustment -= 15;
        if (responses.navigation?.includes('confident')) adjustment += 10;
        break;
      case 'executive':
        if (responses.selfAssessment?.includes('excellent')) adjustment += 12;
        if (responses.selfAssessment?.includes('poor')) adjustment -= 10;
        break;
      case 'orientation':
        // Generally high unless specific issues mentioned
        adjustment += 5;
        break;
    }
    
    return Math.max(20, Math.min(100, Math.round(baseScore + variation + adjustment)));
  }

  private static determineRiskLevel(overallScore: number, age: number): 'low' | 'moderate' | 'high' | 'critical' {
    // Age-adjusted risk assessment
    const ageAdjustment = age > 65 ? -5 : age > 50 ? -2 : 0;
    const adjustedScore = overallScore + ageAdjustment;
    
    if (adjustedScore >= 80) return 'low';
    if (adjustedScore >= 65) return 'moderate';
    if (adjustedScore >= 45) return 'high';
    return 'critical';
  }

  private static generateInsights(
    domainScores: any, 
    responses: ConversationData, 
    userProfile: UserProfile
  ) {
    const insights = {
      patternAnalysis: [] as string[],
      predictiveIndicators: [] as string[],
      personalizedAdvice: [] as string[]
    };

    // Pattern Analysis
    if (domainScores.attention > 80) {
      insights.patternAnalysis.push('Strong sustained attention capabilities detected');
    }
    if (domainScores.memory < 60) {
      insights.patternAnalysis.push('Memory performance patterns suggest potential for improvement');
    }
    if (responses.recentMemory?.length > 20) {
      insights.patternAnalysis.push('Detailed memory recall indicates good episodic memory function');
    }

    // Predictive Indicators
    if (userProfile.education === 'graduate') {
      insights.predictiveIndicators.push('Higher education level provides cognitive reserve protection');
    }
    if (userProfile.age && userProfile.age < 50) {
      insights.predictiveIndicators.push('Young age provides natural protection against cognitive decline');
    }
    if (userProfile.lifestyle?.includes('exercise')) {
      insights.predictiveIndicators.push('Regular exercise habit supports long-term brain health');
    }

    // Personalized Advice
    if (domainScores.memory < 70) {
      insights.personalizedAdvice.push('Focus on memory training exercises like spaced repetition and mnemonics');
    }
    if (domainScores.attention < 70) {
      insights.personalizedAdvice.push('Practice mindfulness meditation to improve attention and focus');
    }
    if (userProfile.age && userProfile.age > 50) {
      insights.personalizedAdvice.push('Prioritize cardiovascular health to support brain function');
    }
    if (!userProfile.lifestyle?.includes('social')) {
      insights.personalizedAdvice.push('Increase social engagement to support cognitive resilience');
    }

    return insights;
  }

  private static generateRecommendations(
    riskLevel: string, 
    domainScores: any, 
    userProfile: UserProfile
  ) {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[]
    };

    // Immediate recommendations based on risk level
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.immediate.push('Schedule comprehensive neurological evaluation within 1-2 weeks');
      recommendations.immediate.push('Begin daily physical exercise routine immediately');
      recommendations.immediate.push('Implement stress reduction techniques');
    } else if (riskLevel === 'moderate') {
      recommendations.immediate.push('Discuss results with primary care physician within 1 month');
      recommendations.immediate.push('Start regular exercise program (150 minutes/week)');
    } else {
      recommendations.immediate.push('Continue current healthy lifestyle practices');
      recommendations.immediate.push('Maintain regular physical activity');
    }

    // Short-term recommendations
    recommendations.shortTerm.push('Adopt Mediterranean-style diet rich in omega-3 fatty acids');
    recommendations.shortTerm.push('Engage in regular social activities and community involvement');
    recommendations.shortTerm.push('Establish consistent sleep schedule (7-9 hours nightly)');
    
    if (domainScores.memory < 70) {
      recommendations.shortTerm.push('Begin structured memory training program');
    }
    if (domainScores.attention < 70) {
      recommendations.shortTerm.push('Practice attention and concentration exercises');
    }

    // Long-term recommendations
    recommendations.longTerm.push('Maintain lifelong learning and intellectual engagement');
    recommendations.longTerm.push('Build and sustain strong social networks');
    recommendations.longTerm.push('Continue regular cognitive health monitoring');
    recommendations.longTerm.push('Manage cardiovascular and metabolic health');

    if (userProfile.age && userProfile.age > 60) {
      recommendations.longTerm.push('Consider annual comprehensive cognitive assessments');
    }

    return recommendations;
  }

  public static generateDetailedAnalytics(
    conversationData: ConversationData,
    userProfile: UserProfile = {}
  ): DetailedAssessmentData {
    const age = userProfile.age || 45;
    
    // Calculate domain scores
    const domainScores = {
      memory: this.calculateDomainScore(conversationData, 'memory'),
      attention: this.calculateDomainScore(conversationData, 'attention'),
      language: this.calculateDomainScore(conversationData, 'language'),
      visuospatial: this.calculateDomainScore(conversationData, 'visuospatial'),
      executive: this.calculateDomainScore(conversationData, 'executive'),
      orientation: this.calculateDomainScore(conversationData, 'orientation')
    };

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(domainScores).reduce((sum, score) => sum + score, 0) / 6
    );

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore, age);

    // Calculate cognitive age
    const cognitiveAge = Math.max(
      25, 
      age - Math.floor((overallScore - 70) / 2)
    );

    // Generate AI insights
    const aiInsights = this.generateInsights(domainScores, conversationData, userProfile);

    // Generate recommendations
    const detailedRecommendations = this.generateRecommendations(riskLevel, domainScores, userProfile);

    // Calculate benchmarks (simulated population data)
    const benchmarkComparison = {
      ageGroup: Math.round(75 + (Math.random() * 10 - 5)),
      educationLevel: userProfile.education === 'graduate' ? 
        Math.round(78 + (Math.random() * 8 - 4)) : 
        Math.round(70 + (Math.random() * 10 - 5)),
      general: Math.round(72 + (Math.random() * 8 - 4))
    };

    // Generate risk factors
    const riskFactors = {
      modifiable: [
        { 
          name: 'Physical Activity Level', 
          impact: 25, 
          status: userProfile.lifestyle?.includes('exercise') ? 'good' : 'moderate' as 'good' | 'moderate' | 'high'
        },
        { 
          name: 'Social Engagement', 
          impact: 20, 
          status: userProfile.lifestyle?.includes('social') ? 'good' : 'moderate' as 'good' | 'moderate' | 'high'
        },
        { 
          name: 'Diet Quality', 
          impact: 18, 
          status: 'moderate' as 'good' | 'moderate' | 'high'
        },
        { 
          name: 'Sleep Quality', 
          impact: 15, 
          status: conversationData.selfAssessment?.includes('excellent') ? 'good' : 'moderate' as 'good' | 'moderate' | 'high'
        },
        { 
          name: 'Stress Management', 
          impact: 12, 
          status: 'moderate' as 'good' | 'moderate' | 'high'
        }
      ],
      nonModifiable: [
        { name: 'Age Factor', impact: Math.min(40, Math.max(10, age - 30)) },
        { name: 'Genetic Predisposition', impact: 25 },
        { name: 'Education Level', impact: userProfile.education === 'graduate' ? 10 : 20 }
      ]
    };

    return {
      overallScore,
      riskLevel,
      confidence: 82 + Math.floor(Math.random() * 15),
      domainScores,
      cognitiveAge,
      progressionRisk: Math.max(5, Math.min(40, 100 - overallScore)),
      strengthAreas: [
        'Comprehensive assessment completion shows good cognitive awareness',
        ...(domainScores.attention > 75 ? ['Strong sustained attention capabilities'] : []),
        ...(domainScores.orientation > 80 ? ['Excellent temporal and spatial orientation'] : []),
        ...(domainScores.language > 75 ? ['Good language and communication skills'] : [])
      ],
      concernAreas: [
        ...(domainScores.memory < 65 ? ['Memory performance below expected range'] : []),
        ...(domainScores.visuospatial < 65 ? ['Visuospatial processing may need attention'] : []),
        ...(domainScores.executive < 65 ? ['Executive function capabilities show room for improvement'] : [])
      ],
      detailedRecommendations,
      benchmarkComparison,
      riskFactors,
      aiInsights,
      timestamp: new Date(),
      assessmentId: `VA-${Date.now().toString().slice(-8)}`
    };
  }
}