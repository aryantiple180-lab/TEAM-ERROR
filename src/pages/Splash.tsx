import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Splash() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-emerald-600 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        <div className="bg-white p-4 rounded-full shadow-lg mb-6">
          <HeartPulse className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">{t('app.title')}</h1>
        <p className="text-emerald-100 text-lg text-center">{t('app.tagline')}</p>
      </motion.div>
      
      {/* Background decoration */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-96 h-96 bg-white rounded-full blur-3xl -z-0"
      />
    </div>
  );
}
