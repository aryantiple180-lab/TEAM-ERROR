import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { MapPin, Navigation, Phone, Star, Search } from 'lucide-react';
import { findNearbyHospitals } from '../services/gemini';

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const lat = parseFloat(localStorage.getItem('user_lat') || '0');
        const lng = parseFloat(localStorage.getItem('user_lng') || '0');

        if (lat === 0 && lng === 0) {
          setError('Location not available. Please enable location services.');
          setLoading(false);
          return;
        }

        const places = await findNearbyHospitals(lat, lng);
        setHospitals(places);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch nearby hospitals');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Nearby Hospitals</h1>
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search hospitals, clinics..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Finding nearby facilities...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center">
            <p>{error}</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hospitals found nearby.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hospitals.map((hospital, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight pr-4">{hospital.name}</h3>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-sm font-bold shrink-0">
                    <Star className="w-4 h-4 fill-current" />
                    4.5
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hospital.address}</p>
                
                <div className="flex gap-3">
                  <a 
                    href={hospital.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-2.5 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Navigation className="w-4 h-4" /> Directions
                  </a>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-medium hover:bg-blue-100 transition-colors">
                    <Phone className="w-4 h-4" /> Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
