import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, User, Mail, Lock, Heart, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface AuthenticationSystemProps {
  onAuthSuccess: (user: any) => void;
  onClose?: () => void;
}

export function AuthenticationSystem({ onAuthSuccess, onClose }: AuthenticationSystemProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const { language } = useLanguage();

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    preferredLanguage: language
  });

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Fetch user profile
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          onAuthSuccess({
            ...userData.user,
            accessToken: session.access_token
          });
        }
      }
    } catch (error) {
      console.log('Session check error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setLoading(false);
        return;
      }

      if (data.session?.access_token) {
        // Track login
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/track-login`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch full user profile
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const userData = await response.json();
        
        setMessage({ type: 'success', text: `Welcome back, ${userData.user.name || 'User'}!` });
        
        setTimeout(() => {
          onAuthSuccess({
            ...userData.user,
            accessToken: data.session.access_token
          });
        }, 1000);
      }
    } catch (error) {
      console.log('Login error:', error);
      setMessage({ type: 'error', text: 'An error occurred during login. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (signupForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Create account on server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: signupForm.email,
          password: signupForm.password,
          name: signupForm.name,
          age: signupForm.age ? parseInt(signupForm.age) : null,
          preferredLanguage: signupForm.preferredLanguage
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Failed to create account' });
        setLoading(false);
        return;
      }

      // Now sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signupForm.email,
        password: signupForm.password,
      });

      if (error) {
        setMessage({ type: 'error', text: 'Account created but login failed. Please try logging in.' });
        setActiveTab('login');
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: `Welcome to CogniCare, ${signupForm.name}!` });
      
      setTimeout(() => {
        onAuthSuccess({
          id: result.user.id,
          email: result.user.email,
          name: signupForm.name,
          age: signupForm.age ? parseInt(signupForm.age) : null,
          preferred_language: signupForm.preferredLanguage,
          accessToken: data.session?.access_token
        });
      }, 1000);

    } catch (error) {
      console.log('Signup error:', error);
      setMessage({ type: 'error', text: 'An error occurred during registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <Card className="dementia-card shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to CogniCare
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-3">
                Your trusted companion for cognitive health
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert className={`border-2 ${
                message.type === 'success' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' :
                message.type === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                'border-blue-300 bg-blue-50 dark:bg-blue-950/20'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                   message.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-600" /> :
                   <Brain className="h-5 w-5 text-blue-600" />}
                  <AlertDescription className={`text-lg font-medium ${
                    message.type === 'success' ? 'text-green-800 dark:text-green-200' :
                    message.type === 'error' ? 'text-red-800 dark:text-red-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>
                    {message.text}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <TabsTrigger 
                  value="login" 
                  className="text-lg font-semibold py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-lg font-semibold py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 mt-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="dementia-input text-lg"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-lg font-semibold flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="dementia-input text-lg pr-12"
                        placeholder="Enter your password"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dementia-friendly p-2"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="dementia-button w-full mt-6" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="dementia-loading-spinner w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6" />
                        Sign In to CogniCare
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-5 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="signup-name" className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Full Name *
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="dementia-input text-lg"
                      placeholder="Enter your full name"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Email Address *
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="dementia-input text-lg"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="signup-age" className="text-lg font-semibold flex items-center gap-2">
                        <Heart className="h-5 w-5 text-blue-600" />
                        Age
                      </Label>
                      <Input
                        id="signup-age"
                        type="number"
                        min="18"
                        max="120"
                        value={signupForm.age}
                        onChange={(e) => setSignupForm({ ...signupForm, age: e.target.value })}
                        className="dementia-input text-lg"
                        placeholder="Your age"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        Language
                      </Label>
                      <Select 
                        value={signupForm.preferredLanguage} 
                        onValueChange={(value) => setSignupForm({ ...signupForm, preferredLanguage: value })}
                        disabled={loading}
                      >
                        <SelectTrigger className="dementia-input text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-lg font-semibold flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="dementia-input text-lg pr-12"
                        placeholder="Create a secure password"
                        disabled={loading}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dementia-friendly p-2"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="signup-confirm-password" className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Confirm Password *
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="dementia-input text-lg"
                      placeholder="Confirm your password"
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="dementia-button dementia-button-success w-full mt-6" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="dementia-loading-spinner w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Heart className="h-6 w-6" />
                        Join CogniCare Today
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-lg text-muted-foreground">
                🔒 Your data is secure and confidential
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}