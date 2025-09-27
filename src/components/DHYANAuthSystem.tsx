import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Eye, EyeOff, Lock, Mail, User, Shield, Heart, Brain, CheckCircle, AlertCircle, Loader2, KeyRound, Fingerprint, Globe } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DHYANAuthSystemProps {
  onAuthSuccess: (userData: any) => void;
}

interface FormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  general?: string;
}

export function DHYANAuthSystem({ onAuthSuccess }: DHYANAuthSystemProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          accessToken: session.access_token
        };
        onAuthSuccess(userData);
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Name validation for sign up
    if (isSignUp) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters long';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (isSignUp) {
        // Enhanced sign up with server integration
        console.log('Creating DHYAN account...');
        
        // First create user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.toLowerCase(),
          password: formData.password,
          options: {
            data: {
              name: formData.name.trim(),
              platform: 'DHYAN',
              created_via: 'dhyan_auth_system'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create profile on server
          try {
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/signup`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                email: formData.email.toLowerCase(),
                password: formData.password,
                name: formData.name.trim()
              })
            });

            if (!response.ok) {
              console.warn('Server profile creation failed, but user created successfully');
            }
          } catch (serverError) {
            console.warn('Server integration error:', serverError);
          }

          setSuccessMessage('Account created successfully! Signing you in...');
          // Auto sign in after successful registration
          setTimeout(() => handleSignIn(), 1500);
        }
      } else {
        // Enhanced sign in
        await handleSignIn();
      }
    } catch (error: any) {
      console.error('DHYAN Authentication error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log('Signing in to DHYAN...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase(),
        password: formData.password
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Track login on server
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/track-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
            }
          });
        } catch (trackError) {
          console.warn('Login tracking failed:', trackError);
        }

        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          accessToken: data.session.access_token,
          platform: 'DHYAN'
        };
        
        setSuccessMessage(`Welcome back to DHYAN, ${userData.name}! Loading your dashboard...`);
        setTimeout(() => onAuthSuccess(userData), 1200);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDemoLogin = async (userType: 'patient' | 'doctor') => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const demoCredentials = {
        patient: { 
          email: 'patient@dhyan.demo', 
          password: 'demo123456', 
          name: 'Alex Patient',
          displayName: 'Demo Patient Account' 
        },
        doctor: { 
          email: 'doctor@dhyan.demo', 
          password: 'demo123456', 
          name: 'Dr. Sarah Johnson',
          displayName: 'Demo Doctor Account'
        }
      };

      const credentials = demoCredentials[userType];
      
      setSuccessMessage(`Initializing ${credentials.displayName}...`);
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (!signInError && signInData.user && signInData.session) {
        // Track demo login
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/track-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${signInData.session.access_token}`
            }
          });
        } catch (trackError) {
          console.warn('Demo login tracking failed:', trackError);
        }

        const userData = {
          id: signInData.user.id,
          email: signInData.user.email,
          name: credentials.name,
          accessToken: signInData.session.access_token,
          userType: userType,
          isDemo: true,
          platform: 'DHYAN'
        };
        
        setSuccessMessage(`Welcome ${credentials.name}! Experience DHYAN's features...`);
        setTimeout(() => onAuthSuccess(userData), 1800);
      } else {
        // If sign in fails, create demo account
        console.log(`Creating ${userType} demo account...`);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: { 
              name: credentials.name,
              user_type: userType,
              is_demo: true,
              platform: 'DHYAN'
            }
          }
        });

        if (!signUpError && signUpData.user) {
          setSuccessMessage(`Creating ${credentials.displayName}...`);
          // Auto sign in after creation
          setTimeout(() => handleDemoLogin(userType), 2000);
        } else {
          throw signUpError || new Error(`Failed to create ${userType} demo account`);
        }
      }
    } catch (error: any) {
      console.error('DHYAN Demo login error:', error);
      setErrors({ general: `Demo login failed. Please try again or use the regular sign-in option.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 pattern-dots opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        {/* Main Auth Card */}
        <div className="login-form-container rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-lg">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1758691463110-697a814b2033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWRpY2FsJTIwdGVjaG5vbG9neSUyMGJyYWluJTIwc2NhbnxlbnwxfHx8fDE3NTg4NzgyNjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="DHYAN Brain Health Platform"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to DHYAN
            </h1>
            <p className="text-gray-600 text-lg">
              {isSignUp ? 'Create your cognitive health account' : 'Continue your cognitive health journey'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium">{errors.general}</p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`auth-input w-full pl-12 pr-4 ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`auth-input w-full pl-12 pr-4 ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`auth-input w-full pl-12 pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`auth-input w-full pl-12 pr-12 ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-button w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setSuccessMessage('');
                setFormData({ email: '', password: '', name: '', confirmPassword: '' });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
                <span style={{ fontSize: '16px' }}>🌐</span>
                Experience DHYAN Instantly
              </h4>
              <p className="text-sm text-gray-600">Try our demo accounts - no registration required</p>
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                disabled={isLoading}
                className="demo-account-button w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Patient Demo</div>
                    <div className="text-xs opacity-90">Experience cognitive health tools</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                disabled={isLoading}
                className="demo-account-button w-full h-14 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1758691463198-dc663b8a64e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwcHJvZmVzc2lvbmFsJTIwZG9jdG9yJTIwY29uc3VsdGF0aW9ufGVufDF8fHx8MTc1ODg3ODI2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt=""
                      style={{
                        width: '20px',
                        height: '20px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Healthcare Professional</div>
                    <div className="text-xs opacity-90">Advanced analytics & tools</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                <span style={{ fontSize: '12px', marginRight: '4px' }}>🔑</span>
                Demo accounts are pre-configured with sample data for immediate exploration
              </p>
            </div>
          </div>

          {/* Enhanced Security Notice */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 text-sm mb-2">Enterprise Security</h4>
                  <div className="space-y-1 text-green-700 text-xs">
                    <p className="flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" />
                      End-to-end encryption for all health data
                    </p>
                    <p className="flex items-center gap-2">
                      <KeyRound className="w-3 h-3" />
                      HIPAA-compliant data protection
                    </p>
                    <p className="flex items-center gap-2">
                      <ImageWithFallback 
                        src="https://images.unsplash.com/photo-1740908900906-a51032597559?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwc2VjdXJpdHklMjBkaWdpdGFsJTIwcHJvdGVjdGlvbnxlbnwxfHx8fDE3NTg4NzgyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt=""
                        style={{
                          width: '12px',
                          height: '12px',
                          objectFit: 'cover',
                          borderRadius: '2px'
                        }}
                      />
                      Secure cloud infrastructure by Supabase
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Platform Info */}
            <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                Powered by <span className="font-semibold text-blue-600">DHYAN BrainPath</span> • 
                Cognitive Health Platform • <span className="font-semibold">Secure & Private</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}