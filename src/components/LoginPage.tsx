import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLoginSuccess: (userCredentials: { username: string; userType: 'patient' | 'admin' | 'guest' }) => void;
}

// Demo credentials - in a real app, these would be validated against a secure backend
const DEMO_CREDENTIALS = {
  // Patient accounts
  'patient@cognicare.com': { password: 'patient123', type: 'patient' as const, name: 'Demo Patient' },
  'john.doe@email.com': { password: 'demo123', type: 'patient' as const, name: 'John Doe' },
  'mary.smith@email.com': { password: 'secure123', type: 'patient' as const, name: 'Mary Smith' },
  
  // Admin account
  'admin@cognicare.com': { password: 'admin123', type: 'admin' as const, name: 'CogniCare Admin' },
  
  // Guest account
  'guest@cognicare.com': { password: 'guest123', type: 'guest' as const, name: 'Guest User' }
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    const userAccount = DEMO_CREDENTIALS[credentials.username.toLowerCase() as keyof typeof DEMO_CREDENTIALS];
    
    if (userAccount && userAccount.password === credentials.password) {
      setSuccess(true);
      setError(null);
      
      // Success animation delay
      setTimeout(() => {
        onLoginSuccess({
          username: credentials.username,
          userType: userAccount.type
        });
      }, 1500);
    } else {
      setError('Invalid username or password. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (username: string) => {
    const account = DEMO_CREDENTIALS[username as keyof typeof DEMO_CREDENTIALS];
    setCredentials({
      username,
      password: account.password
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-4 border-green-300">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-green-600 mb-4"
            >
              Welcome to CogniCare! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Login successful. Preparing your personalized experience...
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-6 h-2 bg-green-200 rounded-full overflow-hidden"
            >
              <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4 pattern-dots">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
                Secure & Confidential Login
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="dementia-alert dementia-alert-warning"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Login Error</strong>
                      <p className="mt-1 text-base">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-xl font-semibold flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-600" />
                    Email Address
                  </Label>
                  <Input
                    id="username"
                    type="email"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="auth-input dementia-input text-xl py-6"
                    placeholder="Enter your email address"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-xl font-semibold flex items-center gap-3">
                    <Lock className="h-6 w-6 text-blue-600" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="auth-input dementia-input text-xl py-6 pr-16"
                      placeholder="Enter your password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
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
                      <div className="dementia-loading-spinner w-8 h-8 border-3 border-white/30 border-t-white"></div>
                      <span className="text-xl">Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8" />
                      <span className="text-xl">Sign In to CogniCare</span>
                    </div>
                  )}
                </Button>
              </motion.form>

              {/* Demo Accounts Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="border-t border-gray-200 dark:border-gray-700 pt-8"
              >
                <h3 className="text-xl font-bold text-center mb-6 text-gray-700 dark:text-gray-300">
                  Demo Accounts - Click to Try
                </h3>
                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('patient@cognicare.com')}
                    className="p-4 text-left bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-all hover:transform hover:scale-[1.02]"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-blue-800 dark:text-blue-200">Patient Account</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">patient@cognicare.com</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin@cognicare.com')}
                    className="p-4 text-left bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-all hover:transform hover:scale-[1.02]"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-purple-800 dark:text-purple-200">Admin Account</p>
                        <p className="text-sm text-purple-600 dark:text-purple-300">admin@cognicare.com</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('guest@cognicare.com')}
                    className="p-4 text-left bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border-2 border-green-200 dark:border-green-800 hover:border-green-400 transition-all hover:transform hover:scale-[1.02]"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-green-800 dark:text-green-200">Guest Account</p>
                        <p className="text-sm text-green-600 dark:text-green-300">guest@cognicare.com</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="text-lg text-muted-foreground">
                  🔒 Your data is encrypted and secure
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  CogniCare uses enterprise-grade security to protect your health information
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}