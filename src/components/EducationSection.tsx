import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Clock, Users, AlertTriangle, Heart, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function EducationSection() {
  const { t } = useLanguage();

  const warningSignsData = [
    {
      title: t('education.warningSigns.memoryLoss.title'),
      description: t('education.warningSigns.memoryLoss.description'),
      icon: Brain
    },
    {
      title: t('education.warningSigns.languageProblems.title'),
      description: t('education.warningSigns.languageProblems.description'),
      icon: Users
    },
    {
      title: t('education.warningSigns.timeConfusion.title'),
      description: t('education.warningSigns.timeConfusion.description'),
      icon: Clock
    },
    {
      title: t('education.warningSigns.poorJudgment.title'),
      description: t('education.warningSigns.poorJudgment.description'),
      icon: AlertTriangle
    },
    {
      title: t('education.warningSigns.moodChanges.title'),
      description: t('education.warningSigns.moodChanges.description'),
      icon: Heart
    },
    {
      title: t('education.warningSigns.dailyTaskDifficulties.title'),
      description: t('education.warningSigns.dailyTaskDifficulties.description'),
      icon: Activity
    }
  ];

  const riskFactors = [
    { 
      name: t('education.riskFactors.age.name'), 
      description: t('education.riskFactors.age.description')
    },
    { 
      name: t('education.riskFactors.genetics.name'), 
      description: t('education.riskFactors.genetics.description')
    },
    { 
      name: t('education.riskFactors.heartHealth.name'), 
      description: t('education.riskFactors.heartHealth.description')
    },
    { 
      name: t('education.riskFactors.headTrauma.name'), 
      description: t('education.riskFactors.headTrauma.description')
    },
    { 
      name: t('education.riskFactors.education.name'), 
      description: t('education.riskFactors.education.description')
    },
    { 
      name: t('education.riskFactors.lifestyle.name'), 
      description: t('education.riskFactors.lifestyle.description')
    }
  ];

  const preventionTips = [
    { 
      title: t('education.prevention.physicalActivity.title'), 
      description: t('education.prevention.physicalActivity.description')
    },
    { 
      title: t('education.prevention.healthyDiet.title'), 
      description: t('education.prevention.healthyDiet.description')
    },
    { 
      title: t('education.prevention.socialConnections.title'), 
      description: t('education.prevention.socialConnections.description')
    },
    { 
      title: t('education.prevention.mentalStimulation.title'), 
      description: t('education.prevention.mentalStimulation.description')
    },
    { 
      title: t('education.prevention.healthConditions.title'), 
      description: t('education.prevention.healthConditions.description')
    },
    { 
      title: t('education.prevention.qualitySleep.title'), 
      description: t('education.prevention.qualitySleep.description')
    }
  ];
  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Warning Signs */}
      <section className="dementia-card bg-gradient-to-br from-purple-50 to-indigo-50 border-l-4 border-l-purple-600 p-8 bg-[rgba(100,65,65,0)]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[rgba(255,255,255,1)] mb-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-purple-700" />
            {t('education.warningSignsTitle')}
          </h2>
          <p className="text-lg text-[rgba(211,217,226,1)] leading-relaxed font-medium">
            {t('education.warningSignsDescription')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warningSignsData.map((sign, index) => {
            const IconComponent = sign.icon;
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl border border-purple-300">
                      <IconComponent className="h-7 w-7 text-purple-700" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 leading-tight">{sign.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-gray-800 leading-relaxed font-medium">{sign.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Risk Factors */}
      <section className="dementia-card bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-l-amber-500 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[rgba(249,251,255,1)] mb-4 flex items-center gap-3">
            <Brain className="w-8 h-8 text-amber-600" />
            {t('education.riskFactorsTitle')}
          </h2>
          <p className="text-lg text-[rgba(205,205,209,1)] leading-relaxed font-medium">
            {t('education.riskFactorsDescription')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {riskFactors.map((factor, index) => (
            <div key={index} className="flex gap-4 p-6 bg-white border-2 border-amber-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-amber-400">
              <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{factor.name}</h4>
                <p className="text-base text-gray-800 leading-relaxed font-medium">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prevention */}
      <section className="dementia-card bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[rgba(255,255,255,1)] mb-4 flex items-center gap-3">
            <Heart className="w-8 h-8 text-green-600" />
            {t('education.preventionTitle')}
          </h2>
          <p className="text-lg text-[rgba(223,230,237,1)] leading-relaxed font-medium">
            {t('education.preventionDescription')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {preventionTips.map((tip, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  {tip.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-800 leading-relaxed font-medium">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Types of Dementia */}
      <section className="dementia-card bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[rgba(255,255,255,1)] mb-4 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            {t('education.dementiaTypesTitle')}
          </h2>
          <p className="text-lg text-[rgba(200,206,215,1)] leading-relaxed font-medium">
            {t('education.dementiaTypesDescription')}
          </p>
        </div>
        <div className="space-y-6">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 bg-white">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <CardTitle className="text-2xl font-bold text-gray-900">{t('education.dementiaTypes.alzheimers.title')}</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 text-sm">{t('education.dementiaTypes.alzheimers.badge')}</Badge>
              </div>
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {t('education.dementiaTypes.alzheimers.description')}
              </p>
            </CardHeader>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{t('education.dementiaTypes.vascular.title')}</CardTitle>
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {t('education.dementiaTypes.vascular.description')}
              </p>
            </CardHeader>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{t('education.dementiaTypes.lewyBody.title')}</CardTitle>
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {t('education.dementiaTypes.lewyBody.description')}
              </p>
            </CardHeader>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{t('education.dementiaTypes.frontotemporal.title')}</CardTitle>
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {t('education.dementiaTypes.frontotemporal.description')}
              </p>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="dementia-alert dementia-alert-info bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 p-6 rounded-xl">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-blue-700 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-[rgba(250,251,255,1)] mb-3">Important Medical Notice</h3>
            <p className="text-base text-[rgba(219,221,231,1)] leading-relaxed font-medium">
              This information is for educational purposes only and should not replace professional medical advice. 
              If you notice any concerning symptoms, please consult with a healthcare provider for proper evaluation and diagnosis.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}