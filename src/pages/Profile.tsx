import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { User, Mail, Phone, HeartPulse, AlertCircle, PhoneCall, LogOut, Edit2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    if (!user) return;
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      const data = JSON.parse(storedProfile);
      setProfile(data);
      setFormData(data);
    } else {
      const defaultProfile = {
        name: user.displayName || 'User',
        email: user.email || '',
        mobile: '',
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    localStorage.setItem('user_profile', JSON.stringify(formData));
    setProfile(formData);
    
    // Sync name with the central user identity
    if (formData.name !== user.displayName) {
      updateUser({ ...user, displayName: formData.name });
    }
    
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!profile) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div className="bg-emerald-600 px-6 pt-12 pb-24 shadow-sm z-10 relative">
        <div className="flex justify-between items-center text-white mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors">
            {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-16 z-20">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-6 relative">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center absolute -top-12 left-1/2 -translate-x-1/2 border-4 border-white shadow-sm">
            <User className="w-12 h-12" />
          </div>
          
          <div className="mt-12 text-center mb-6">
            {isEditing ? (
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="text-xl font-bold text-center border-b-2 border-emerald-500 outline-none w-full max-w-[200px]" />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            )}
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mobile</p>
                {isEditing ? (
                  <input type="text" value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full border-b border-gray-300 outline-none py-1" />
                ) : (
                  <p className="font-medium text-gray-900">{profile.mobile || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Medical Conditions</p>
                {isEditing ? (
                  <input type="text" value={formData.medicalConditions?.join(', ') || ''} onChange={e => setFormData({...formData, medicalConditions: e.target.value.split(',').map((s: string) => s.trim())})} className="w-full border-b border-gray-300 outline-none py-1" placeholder="Comma separated" />
                ) : (
                  <p className="font-medium text-gray-900">{profile.medicalConditions?.join(', ') || 'None'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Allergies</p>
                {isEditing ? (
                  <input type="text" value={formData.allergies?.join(', ') || ''} onChange={e => setFormData({...formData, allergies: e.target.value.split(',').map((s: string) => s.trim())})} className="w-full border-b border-gray-300 outline-none py-1" placeholder="Comma separated" />
                ) : (
                  <p className="font-medium text-gray-900">{profile.allergies?.join(', ') || 'None'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Emergency Contact</p>
                {isEditing ? (
                  <input type="text" value={formData.emergencyContact || ''} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="w-full border-b border-gray-300 outline-none py-1" />
                ) : (
                  <p className="font-medium text-gray-900">{profile.emergencyContact || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-white border border-red-100 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
