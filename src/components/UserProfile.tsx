import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Brain, 
  User, 
  Mail, 
  Calendar, 
  Languages, 
  Activity, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Settings, 
  LogOut,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface UserProfileProps {
  user: any;
  onUserUpdate: (updatedUser: any) => void;
  onLogout: () => void;
}

export function UserProfile({ user, onUserUpdate, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { t, setLanguage } = useLanguage();

  const [editForm, setEditForm] = useState({
    name: user.name || '',
    age: user.age?.toString() || '',
    preferred_language: user.preferred_language || 'en'
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name,
          age: editForm.age ? parseInt(editForm.age) : null,
          preferred_language: editForm.preferred_language
        })
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = {
          ...user,
          name: editForm.name,
          age: editForm.age ? parseInt(editForm.age) : null,
          preferred_language: editForm.preferred_language
        };
        
        onUserUpdate(updatedUser);
        setLanguage(editForm.preferred_language);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.log('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLanguageName = (code: string) => {
    const languages = {
      'en': 'English',
      'hi': 'हिंदी (Hindi)',
      'kn': 'ಕನ್ನಡ (Kannada)'
    };
    return languages[code as keyof typeof languages] || code;
  };

  const assessmentCount = user.assessment_history?.length || 0;
  const loginCount = user.login_count || 0;
  const lastAssessment = user.last_assessment;
  const memberSince = user.signup_date;

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={`border-2 ${
          message.type === 'success' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' :
          'border-red-300 bg-red-50 dark:bg-red-950/20'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? 
              <CheckCircle className="h-5 w-5 text-green-600" /> :
              <Brain className="h-5 w-5 text-red-600" />
            }
            <AlertDescription className={`text-lg font-medium ${
              message.type === 'success' ? 'text-green-800 dark:text-green-200' :
              'text-red-800 dark:text-red-200'
            }`}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Profile Information Card */}
      <Card className="dementia-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg">
                <User className="h-12 w-12 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-blue-600">
                  {user.name || 'CogniCare User'}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                  Your CogniCare Profile
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="dementia-button dementia-button-warning"
                  disabled={loading}
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    className="dementia-button dementia-button-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="dementia-loading-spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: user.name || '',
                        age: user.age?.toString() || '',
                        preferred_language: user.preferred_language || 'en'
                      });
                      setMessage(null);
                    }}
                    variant="outline"
                    className="dementia-button border-gray-300"
                    disabled={loading}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    Full Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="dementia-input text-lg"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-age" className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Age
                  </Label>
                  <Input
                    id="edit-age"
                    type="number"
                    min="18"
                    max="120"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="dementia-input text-lg"
                    placeholder="Your age"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Languages className="h-5 w-5 text-blue-600" />
                  Preferred Language
                </Label>
                <Select 
                  value={editForm.preferred_language} 
                  onValueChange={(value) => setEditForm({ ...editForm, preferred_language: value })}
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
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">Email</p>
                    <p className="text-xl text-gray-700 dark:text-gray-300">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-lg font-semibold text-green-800 dark:text-green-200">Age</p>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      {user.age ? `${user.age} years old` : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                  <Languages className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">Language</p>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      {getLanguageName(user.preferred_language)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-teal-950/20 rounded-xl">
                  <Clock className="h-8 w-8 text-teal-600" />
                  <div>
                    <p className="text-lg font-semibold text-teal-800 dark:text-teal-200">Member Since</p>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      {formatDate(memberSince)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <Card className="dementia-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Your CogniCare Activity
          </CardTitle>
          <CardDescription className="text-lg">
            Track your progress and engagement with CogniCare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">{assessmentCount}</p>
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Assessments Completed
              </p>
              <Badge variant="secondary" className="mt-2 text-sm">
                {assessmentCount > 0 ? 'Great progress!' : 'Ready to start?'}
              </Badge>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-2xl">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">{loginCount}</p>
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                Total Visits
              </p>
              <Badge variant="secondary" className="mt-2 text-sm">
                {loginCount > 5 ? 'Regular user' : 'Getting started'}
              </Badge>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-bold text-purple-600 mb-2">
                {lastAssessment ? formatDate(lastAssessment) : 'None yet'}
              </p>
              <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                Last Assessment
              </p>
              <Badge variant="secondary" className="mt-2 text-sm">
                {lastAssessment ? 'Stay consistent!' : 'Take your first test'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="dementia-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-6 bg-red-50 dark:bg-red-950/20 rounded-xl border-2 border-red-200 dark:border-red-800">
            <div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                Sign Out of CogniCare
              </h3>
              <p className="text-lg text-red-600 dark:text-red-300">
                You can always sign back in anytime to continue your cognitive health journey
              </p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="dementia-button bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}