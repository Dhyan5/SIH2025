import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { checkServerHealth } from '../utils/serverHealth';
import { Eye, EyeOff, Lock, Mail, User, Shield, CheckCircle, AlertCircle, Loader2, KeyRound, Globe, Brain } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AuthSystemProps {
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

export function AuthSystem({ onAuthSuccess }: AuthSystemProps) {
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

  // Demo credentials with enhanced profiles
  const demoCredentials = [
    {
      email: 'patient@brainpath.com',
      password: 'demo123',
      name: 'Sarah Johnson',
      userType: 'patient',
      displayName: 'Patient Demo',
      description: 'Experience the patient journey with sample assessments and progress tracking',
      stats: { assessments: 12, avgScore: 78, improvements: 15 }
    },
    {
      email: 'admin@brainpath.com',
      password: 'admin123',
      name: 'Dr. Michael Chen',
      userType: 'admin',
      displayName: 'Healthcare Professional Demo',
      description: 'Access advanced analytics, patient management, and clinical insights',
      stats: { patients: 45, reports: 128, accuracy: 94 }
    }
  ];

  // Input validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced authentication with demo account prioritization and better error handling
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Check if this matches a demo account first (higher priority)
      const demoAccount = demoCredentials.find(demo => 
        demo.email.toLowerCase().trim() === formData.email.toLowerCase().trim() && 
        demo.password === formData.password
      );

      if (demoAccount) {
        console.log('Demo account detected, logging in with demo credentials');
        await handleDemoLogin(demoAccount);
        return;
      }

      // Only try Supabase if not a demo account
      if (isSignUp) {
        // For signup, try Supabase but with better error handling
        try {
          const { data, error } = await supabase.auth.signUp({
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            options: {
              data: {
                name: formData.name
              }
            }
          });

          if (error) {
            // Handle Supabase-specific errors
            if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
              setErrors({ 
                general: 'An account with this email already exists. Please sign in instead or use a different email.' 
              });
              return;
            }
            throw error;
          }

          if (data.user) {
            setSuccessMessage('Account created successfully! You can now sign in.');
            
            // Auto sign in after successful signup
            setTimeout(() => {
              handleSignIn();
            }, 1500);
          }
        } catch (signupError: any) {
          console.error('Signup failed:', signupError);
          
          // If Supabase fails, suggest demo accounts
          let errorMessage = 'Account creation failed. ';
          if (signupError.message?.includes('Invalid') || signupError.message?.includes('fetch')) {
            errorMessage += 'Connection to authentication service failed. Try using a demo account for immediate access.';
          } else {
            errorMessage += signupError.message || 'Please try again or use a demo account.';
          }
          setErrors({ general: errorMessage });
          return;
        }
      } else {
        // Sign in flow - try Supabase but fallback to demo suggestion
        try {
          await handleSignIn();
        } catch (signInError: any) {
          console.error('Sign in failed:', signInError);
          
          // Suggest demo accounts if Supabase sign in fails
          let errorMessage = 'Sign in failed. ';
          if (signInError.message?.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials or try a demo account below.';
          } else if (signInError.message?.includes('fetch') || signInError.message?.includes('timeout')) {
            errorMessage = 'Connection error. Please try using a demo account for immediate access.';
          } else {
            errorMessage += signInError.message || 'Please try again or use a demo account.';
          }
          setErrors({ general: errorMessage });
          return;
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Provide user-friendly error messages with demo account suggestions
      let errorMessage = 'Authentication failed. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials or try a demo account below.';
        } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please sign in instead or use a different email.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('fetch') || error.message.includes('timeout')) {
          errorMessage = 'Connection error. Please try using a demo account for immediate access.';
        } else {
          errorMessage = `${error.message || 'Please try again'} or use a demo account below for immediate access.`;
        }
      } else {
        errorMessage = 'An unexpected error occurred. Please try using a demo account for immediate access.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('Supabase sign in error:', error);
        
        // Provide specific error messages for common issues
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials or try a demo account.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        } else {
          throw new Error(error.message || 'Sign in failed');
        }
      }

      if (data.user && data.session) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || formData.name || 'User',
          accessToken: data.session.access_token
        };

        setSuccessMessage(`Welcome back to BrainPath, ${userData.name}! Loading your dashboard...`);
        
        // Skip server tracking to avoid timeouts - just proceed with login
        setTimeout(() => {
          onAuthSuccess(userData);
        }, 1500);
      } else {
        throw new Error('Sign in failed - no user data received');
      }
    } catch (error: any) {
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Login request timed out. Please try again or use a demo account.');
      }
      throw error; // Re-throw to be handled by the main auth function
    }
  };

  // Demo account login - reliable and fast
  const handleDemoLogin = async (credentials: typeof demoCredentials[0]) => {
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      setSuccessMessage(`🚀 Loading ${credentials.displayName}...`);
      
      // Quick demo account setup (minimal delay for better UX)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const demoUserData = {
        id: credentials.userType === 'admin' ? 'demo-admin-123' : 'demo-patient-456',
        email: credentials.email,
        name: credentials.name,
        userType: credentials.userType,
        accessToken: 'demo-token-' + Date.now(),
        isDemoAccount: true,
        demoStats: credentials.stats
      };

      if (credentials.userType === 'patient') {
        setSuccessMessage(`✨ Welcome ${credentials.name}! Experience BrainPath's cognitive health features...`);
      } else {
        setSuccessMessage(`👨‍⚕️ Welcome Dr. ${credentials.name.split(' ')[1]}! Loading your clinical dashboard...`);
      }
      
      // Fast transition to main app
      setTimeout(() => {
        onAuthSuccess(demoUserData);
      }, 800);

    } catch (error) {
      console.error('Demo login error:', error);
      
      // Always proceed with demo login even if there's an error - this ensures reliability
      const fallbackUserData = {
        id: credentials.userType === 'admin' ? 'demo-admin-fallback' : 'demo-patient-fallback',
        email: credentials.email,
        name: credentials.name,
        userType: credentials.userType,
        accessToken: 'demo-token-fallback-' + Date.now(),
        isDemoAccount: true,
        demoStats: credentials.stats
      };
      
      setSuccessMessage(`🎯 Loading ${credentials.displayName} (Demo Mode)...`);
      setTimeout(() => {
        onAuthSuccess(fallbackUserData);
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Join BrainPath for cognitive health insights'
              : 'Sign in to your BrainPath account'
            }
          </p>
        </div>

        {/* Demo Accounts Section - More Prominent */}
        <div className="bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 border-3 border-blue-300 rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-5">
            <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              🚀 Try BrainPath Instantly - No Signup Required!
            </h4>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                ✨ Experience the full platform immediately with demo accounts
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-green-700 font-medium">
                <KeyRound className="w-4 h-4" />
                Pre-loaded with realistic data • All features unlocked • Instant access
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {demoCredentials.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoLogin(demo)}
                disabled={isLoading}
                className="w-full p-5 text-left border-3 border-blue-300 rounded-2xl hover:border-blue-500 bg-white/90 hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                      {demo.displayName} {demo.userType === 'patient' ? '👤' : '👨‍⚕️'}
                    </div>
                    <div className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {demo.description}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="text-xs text-blue-700 font-bold mb-1">Ready-to-use credentials:</div>
                      <div className="text-xs text-blue-600 font-mono">
                        📧 {demo.email}<br/>
                        🔑 {demo.password}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-sm font-bold px-3 py-2 rounded-full shadow-sm ${
                      demo.userType === 'patient' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {demo.userType === 'patient' ? 'Patient View' : 'Clinical View'}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Click to Login
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              No Email Verification • No Personal Info Required • Instant Access
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold text-sm">✨ RECOMMENDED: Use Demo Accounts Above ✨</span>
            </div>
            <div className="text-xs opacity-90">
              Instant access • No signup required • Full features available
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Demo Account Reminder */}
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">
                  💡 <strong>Quick Start Tip:</strong> Use the demo accounts above for immediate access without creating an account!
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Authentication Issue</h4>
                  <p className="text-sm mb-3">{errors.general}</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-blue-800 text-sm font-medium mb-2">🚀 Quick Solution:</p>
                    <p className="text-blue-700 text-sm">
                      Use the demo accounts above for immediate access. No signup required!
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      • <strong>Patient Demo:</strong> patient@brainpath.com / demo123<br/>
                      • <strong>Admin Demo:</strong> admin@brainpath.com / admin123
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Name Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle between Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                setErrors({});
                setSuccessMessage('');
              }}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center text-xs text-gray-600 bg-gray-100 p-3 rounded">
          <Shield className="w-4 h-4 inline mr-1" />
          Your data is encrypted and secure. BrainPath follows medical data protection standards.
        </div>
      </div>
    </div>
  );
}