import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Navigation } from 'lucide-react';

export default function LocationSetup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAllowLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('user_lat', position.coords.latitude.toString());
          localStorage.setItem('user_lng', position.coords.longitude.toString());
          setLoading(false);
          navigate('/');
        },
        (error) => {
          console.error('Error getting location', error);
          setLoading(false);
          // Fallback or show error
          alert('Could not get location. Please enter manually.');
        }
      );
    } else {
      setLoading(false);
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleManualLocation = () => {
    // In a real app, this would open a search modal or input
    const zip = prompt('Enter your ZIP code or City:');
    if (zip) {
      localStorage.setItem('user_location_manual', zip);
      navigate('/');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-white justify-center">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 mb-6 relative">
          <MapPin className="w-12 h-12" />
          <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('loc.allow')}</h2>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
          {t('loc.desc')}
        </p>
      </div>

      <div className="space-y-4 w-full max-w-sm mx-auto">
        <button
          onClick={handleAllowLocation}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          <Navigation className="w-5 h-5" />
          {loading ? '...' : t('loc.allow')}
        </button>

        <button
          onClick={handleManualLocation}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          {t('loc.manual')}
        </button>
      </div>
      
      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-gray-400 hover:text-gray-600 text-sm font-medium"
      >
        Skip for now
      </button>
    </div>
  );
}
