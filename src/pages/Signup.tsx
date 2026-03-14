import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('');
      return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(val)) {
      setEmailError('Please enter a valid Gmail address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateMobile = (val: string) => {
    if (!val) {
      setMobileError('');
      return false;
    }
    if (!/^\d{10}$/.test(val)) {
      setMobileError('Mobile number must be exactly 10 digits.');
      return false;
    }
    setMobileError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*]).{8,16}$/.test(val)) {
      setPasswordError('Password must be 8–16 characters and include uppercase, lowercase, number, and special character.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (val: string, pass: string) => {
    if (!val) {
      setConfirmPasswordError('');
      return false;
    }
    if (val !== pass) {
      setConfirmPasswordError('Passwords do not match. Please try again.');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobile(val);
    validateMobile(val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    validatePassword(val);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, val);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    validateConfirmPassword(val, password);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isMobileValid = validateMobile(mobile);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isEmailValid || !isMobileValid || !isPasswordValid || !isConfirmPasswordValid || !firstName || !lastName) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Mock signup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = {
        uid: 'mock-uid-' + Date.now(),
        email,
        displayName: `${firstName} ${lastName}`
      };

      // Save initial profile data to localStorage
      localStorage.setItem('user_profile', JSON.stringify({
        uid: mockUser.uid,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        mobile,
        language: 'en',
        createdAt: new Date().toISOString(),
      }));

      setSuccessMessage('Signup successful. Please login to continue.');
      
      // Navigate to login after a short delay so user can see the message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-white justify-center overflow-y-auto">
      <div className="text-center mb-8 mt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('auth.signup')}</h2>
        <p className="text-gray-500 mt-2">{t('app.title')}</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      {successMessage && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4 text-sm font-medium">{successMessage}</div>}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="First Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Last Name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'} focus:ring-2 outline-none transition-all`}
              placeholder="Enter your Gmail address"
            />
          </div>
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.mobile')}</label>
          <div className="relative">
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={mobile}
              onChange={handleMobileChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${mobileError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'} focus:ring-2 outline-none transition-all`}
              placeholder="10-digit mobile number"
            />
          </div>
          {mobileError && <p className="text-red-500 text-xs mt-1">{mobileError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={handlePasswordChange}
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'} focus:ring-2 outline-none transition-all`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${confirmPasswordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'} focus:ring-2 outline-none transition-all`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !!emailError || !!mobileError || !!passwordError || !!confirmPasswordError || !email || !mobile || !password || !confirmPassword || !firstName || !lastName}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? '...' : t('auth.signup')}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 pb-6">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
