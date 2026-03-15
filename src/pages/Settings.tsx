import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNav from '../components/BottomNav';
import { 
  ArrowLeft, 
  History, 
  Bell, 
  Globe, 
  Phone, 
  Shield, 
  HelpCircle, 
  Info, 
  Star,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reminders, setReminders] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<{name: string, phone: string}[]>([]);
  const [newContact, setNewContact] = useState({name: '', phone: ''});
  const [showAddContact, setShowAddContact] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: "Hello! I'm your AI health assistant. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      const storedReminders = localStorage.getItem(`reminders_${user.uid}`);
      if (storedReminders) setReminders(JSON.parse(storedReminders));

      const storedContacts = localStorage.getItem(`emergency_contacts_${user.uid}`);
      if (storedContacts) setEmergencyContacts(JSON.parse(storedContacts));
      
      const storedNotif = localStorage.getItem(`notifications_enabled_${user.uid}`);
      if (storedNotif !== null) setNotificationsEnabled(JSON.parse(storedNotif));
    }
  }, [user]);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const updated = [...emergencyContacts, newContact];
      setEmergencyContacts(updated);
      if (user) localStorage.setItem(`emergency_contacts_${user.uid}`, JSON.stringify(updated));
      setNewContact({name: '', phone: ''});
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
    if (user) localStorage.setItem(`emergency_contacts_${user.uid}`, JSON.stringify(updated));
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm a simulated AI assistant. In a real app, I would connect to a backend service to provide health guidance based on your query." 
      }]);
    }, 1000);
  };

  const handleToggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    if (user) localStorage.setItem(`notifications_enabled_${user.uid}`, JSON.stringify(newVal));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Medical Reminder History</h3>
            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm text-center py-4">No history available yet.</p>
                </div>
              ) : (
                reminders.map(reminder => {
                  const now = new Date();
                  const currentIstTime = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
                  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                  
                  let isUpcoming = false;
                  if (reminder.endDate && reminder.endDate < todayStr) {
                    isUpcoming = false;
                  } else if (reminder.startDate && reminder.startDate > todayStr) {
                    isUpcoming = true;
                  } else {
                    isUpcoming = reminder.time > currentIstTime;
                  }

                  return (
                    <div key={reminder.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{reminder.name}</p>
                        <p className="text-sm text-gray-500">{reminder.dosage} • {reminder.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${isUpcoming ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Notification Settings</h3>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Enable Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={handleToggleNotifications} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Language Settings</h3>
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
              {['en', 'hi', 'mr'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center justify-between ${
                    language === lang ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                  {language === lang && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 'emergency':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Emergency Contacts</h3>
            <div className="space-y-3 mb-4">
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${contact.phone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100">
                      <Phone className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleRemoveContact(idx)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {showAddContact ? (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                <input type="text" placeholder="Contact Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
                <input type="tel" placeholder="Phone Number" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddContact(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Cancel</button>
                  <button onClick={handleAddContact} className="flex-1 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Save</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddContact(true)} className="w-full py-3 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition-colors">
                + Add Emergency Contact
              </button>
            )}
            
            {emergencyContacts.length > 0 && (
              <button onClick={() => alert('SOS Alert sent to all emergency contacts!')} className="w-full mt-6 py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                ACTIVATE SOS
              </button>
            )}
          </div>
        );
      case 'privacy':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Privacy & Security</h3>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
              <button className="w-full text-left py-2 text-gray-700 font-medium border-b border-gray-100">Change Password</button>
              <button className="w-full text-left py-2 text-gray-700 font-medium border-b border-gray-100">Privacy Controls</button>
              <button className="w-full text-left py-2 text-red-600 font-medium">Delete Account</button>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4">AI Help & Support</h3>
            <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-emerald-50 text-emerald-800 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask a question..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" 
                />
                <button onClick={handleSendChat} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">Send</button>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">About Application</h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <span className="text-3xl">🏥</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900">HealthCare App</h4>
              <p className="text-gray-500 mb-4">Version 1.0.0</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                A comprehensive healthcare application designed to help you manage your medical reminders, track your health, and access emergency services quickly and efficiently.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (activeTab) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto pb-20">
          {renderContent()}
        </div>
        <BottomNav />
      </div>
    );
  }

  const menuItems = [
    { id: 'history', icon: History, label: 'Medical Reminder History', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'notifications', icon: Bell, label: 'Notification Settings', color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'language', icon: Globe, label: 'Language Settings', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'emergency', icon: Phone, label: 'Emergency Contacts', color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'privacy', icon: Shield, label: 'Privacy & Security', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support (AI)', color: 'text-violet-500', bg: 'bg-violet-50' },
    { id: 'about', icon: Info, label: 'About Application', color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Rate Our App</h3>
          <p className="text-sm text-gray-500 mb-4">Enjoying the app? Please rate us with 5 stars to support us.</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  setTimeout(() => {
                    alert('Thank you for rating! Redirecting to App Store...');
                    window.open('https://play.google.com/store/apps', '_blank');
                  }, 500);
                }}
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white text-red-600 font-bold py-4 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
