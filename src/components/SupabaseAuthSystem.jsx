import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Heart, Languages, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function SupabaseAuthSystem({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  // Sign In Form
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  // Sign Up Form
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    preferredLanguage: 'en'
  });

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Fetch user profile from server
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInForm.email || !signInForm.password) {
      setMessage({ type: 'error', text: 'Please enter both email and password' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password,
      });

      if (error) {
        let errorMessage = 'Sign in failed. Please check your credentials.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link.';
        }
        setMessage({ type: 'error', text: errorMessage });
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

        if (response.ok) {
          const userData = await response.json();
          setMessage({ type: 'success', text: `Welcome back, ${userData.user.name || 'User'}! 🎉` });
          
          setTimeout(() => {
            onAuthSuccess({
              ...userData.user,
              accessToken: data.session.access_token
            });
          }, 1500);
        } else {
          // Fallback if profile fetch fails
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'User',
            accessToken: data.session.access_token
          });
        }
      }
    } catch (error) {
      console.log('Sign in error:', error);
      setMessage({ type: 'error', text: 'An error occurred during sign in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!signUpForm.name || !signUpForm.email || !signUpForm.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (signUpForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // First create the user account on our server
      const serverResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: signUpForm.email,
          password: signUpForm.password,
          name: signUpForm.name,
          age: signUpForm.age ? parseInt(signUpForm.age) : null,
          preferredLanguage: signUpForm.preferredLanguage
        })
      });

      const serverResult = await serverResponse.json();

      if (!serverResponse.ok) {
        let errorMessage = serverResult.error || 'Failed to create account';
        if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        setMessage({ type: 'error', text: errorMessage });
        setLoading(false);
        return;
      }

      // Now sign in the user automatically
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signUpForm.email,
        password: signUpForm.password,
      });

      if (error) {
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Please sign in with your credentials.' 
        });
        setActiveTab('signin');
        setSignInForm({ email: signUpForm.email, password: '' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: `Welcome to CogniCare, ${signUpForm.name}! 🎉` });
      
      setTimeout(() => {
        onAuthSuccess({
          id: serverResult.user.id,
          email: serverResult.user.email,
          name: signUpForm.name,
          age: signUpForm.age ? parseInt(signUpForm.age) : null,
          preferred_language: signUpForm.preferredLanguage,
          accessToken: data.session?.access_token
        });
      }, 1500);

    } catch (error) {
      console.log('Sign up error:', error);
      setMessage({ type: 'error', text: 'An error occurred during registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        setMessage({ 
          type: 'error', 
          text: 'Google sign-in is not configured yet. Please use email/password for now.' 
        });
      }
    } catch (error) {
      console.log('Google sign-in error:', error);
      setMessage({ type: 'error', text: 'Google sign-in failed. Please try email/password instead.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4 pattern-dots">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="dementia-card auth-card shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl user-status-online">
                <Brain className="h-16 w-16 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to CogniCare
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground mt-4">
                Your trusted companion for cognitive health
              </CardDescription>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="secure-indicator"
            >
              <Shield className="inline-block h-5 w-5 mr-2" />
              Secure & Confidential
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-8">
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`dementia-alert ${
                  message.type === 'success' ? 'dementia-alert-success' : 
                  message.type === 'error' ? 'dementia-alert-warning' : 
                  'dementia-alert-info'
                }`}
              >
                <div className="flex items-center gap-3">
                  {message.type === 'success' ? 
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /> :
                    message.type === 'error' ? 
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" /> :
                    <Brain className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  }
                  <div>
                    <strong className="text-lg">
                      {message.type === 'success' ? 'Success!' : 
                       message.type === 'error' ? 'Error' : 'Info'}
                    </strong>
                    <p className="mt-1 text-base">{message.text}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <TabsTrigger 
                  value="signin" 
                  className="text-lg font-semibold py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  🔐 Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-lg font-semibold py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  ✨ Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-6 mt-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="signin-email" className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                      className="auth-input dementia-input text-lg"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="signin-password" className="text-lg font-semibold flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                        className="auth-input dementia-input text-lg pr-12"
                        placeholder="Enter your password"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="dementia-button w-full mt-8 login-button"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="dementia-loading-spinner w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-xl">Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6" />
                        <span className="text-xl">Sign In to CogniCare</span>
                      </div>
                    )}
                  </Button>
                </form>

                {/* Google Sign In Button */}
                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    variant="outline"
                    className="w-full mt-4 dementia-button bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-5 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="signup-name" className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Full Name *
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpForm.name}
                      onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                      className="auth-input dementia-input text-lg"
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
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      className="auth-input dementia-input text-lg"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="signup-age" className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Age
                      </Label>
                      <Input
                        id="signup-age"
                        type="number"
                        min="18"
                        max="120"
                        value={signUpForm.age}
                        onChange={(e) => setSignUpForm({ ...signUpForm, age: e.target.value })}
                        className="auth-input dementia-input text-lg"
                        placeholder="Your age"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Languages className="h-5 w-5 text-blue-600" />
                        Language
                      </Label>
                      <Select 
                        value={signUpForm.preferredLanguage} 
                        onValueChange={(value) => setSignUpForm({ ...signUpForm, preferredLanguage: value })}
                        disabled={loading}
                      >
                        <SelectTrigger className="auth-input dementia-input text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="hi">🇮🇳 हिंदी (Hindi)</SelectItem>
                          <SelectItem value="kn">🇮🇳 ಕನ್ನಡ (Kannada)</SelectItem>
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
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        className="auth-input dementia-input text-lg pr-12"
                        placeholder="Create a secure password"
                        disabled={loading}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                      className="auth-input dementia-input text-lg"
                      placeholder="Confirm your password"
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="dementia-button dementia-button-success w-full mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="dementia-loading-spinner w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-xl">Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Heart className="h-6 w-6" />
                        <span className="text-xl">Join CogniCare Today</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <p className="text-lg text-muted-foreground">
                  🔒 Your data is encrypted and secure
                </p>
                <p className="text-sm text-muted-foreground">
                  CogniCare uses enterprise-grade security to protect your health information
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}