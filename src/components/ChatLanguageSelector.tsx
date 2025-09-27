import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Globe, Languages, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatLanguageSelectorProps {
  onLanguageSelect: (language: 'en' | 'hi' | 'kn') => void;
}

export function ChatLanguageSelector({ onLanguageSelect }: ChatLanguageSelectorProps) {
  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      nativeName: 'English',
      description: 'Have a conversation in English',
      flag: '🇺🇸',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      code: 'hi' as const,
      name: 'Hindi',
      nativeName: 'हिंदी',
      description: 'हिंदी में बातचीत करें',
      flag: '🇮🇳',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      code: 'kn' as const,
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      description: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ',
      flag: '🏛️',
      gradient: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 shadow-xl border-2 dark:border-border/50">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <Languages className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Language
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Select your preferred language to chat with Dr. Vaidhya. The AI will understand and respond in your chosen language throughout the conversation.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            <div className="grid md:grid-cols-3 gap-6">
              {languages.map((language, index) => (
                <motion.div
                  key={language.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                >
                  <Card 
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50 group"
                    onClick={() => onLanguageSelect(language.code)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="text-4xl mb-3">{language.flag}</div>
                      <CardTitle className="text-xl">{language.name}</CardTitle>
                      <div className="text-lg text-muted-foreground font-medium">
                        {language.nativeName}
                      </div>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        {language.description}
                      </p>
                      <Button 
                        className={`w-full bg-gradient-to-r ${language.gradient} hover:opacity-90 text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Dr. Vaidhya is multilingual and will adapt to your language choice</span>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  Natural Language Processing
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Cultural Context Aware
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Regional Medical Terms
                </Badge>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}