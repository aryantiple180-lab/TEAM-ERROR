import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Globe2 } from 'lucide-react';

export default function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = async (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    if (user) {
      const storedProfile = localStorage.getItem('user_profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.language = lang;
        localStorage.setItem('user_profile', JSON.stringify(profile));
      }
    }
    navigate('/location');
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-white justify-center">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-500 mb-6">
          <Globe2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('lang.select')}</h2>
        <p className="text-gray-500">Choose your preferred language</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('en')}
          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
            language === 'en' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'
          }`}
        >
          <span className="text-lg font-medium text-gray-900">English</span>
          <span className="text-sm text-gray-500">English</span>
        </button>

        <button
          onClick={() => handleSelect('hi')}
          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
            language === 'hi' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'
          }`}
        >
          <span className="text-lg font-medium text-gray-900">हिंदी</span>
          <span className="text-sm text-gray-500">Hindi</span>
        </button>

        <button
          onClick={() => handleSelect('mr')}
          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
            language === 'mr' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'
          }`}
        >
          <span className="text-lg font-medium text-gray-900">मराठी</span>
          <span className="text-sm text-gray-500">Marathi</span>
        </button>
      </div>
    </div>
  );
}
