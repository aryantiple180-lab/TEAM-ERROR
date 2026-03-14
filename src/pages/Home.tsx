import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNav from '../components/BottomNav';
import { Pill, Activity, MapPin, ShoppingBag, Lightbulb, MessageSquare, Bell, Plus, X } from 'lucide-react';

interface Reminder {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:mm format
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ name: '', dosage: '', time: '' });
  const lastNotifiedMinute = useRef<string>('');

  const features = [
    { path: '/medicine', icon: Pill, label: 'home.medicine', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { path: '/health', icon: Activity, label: 'home.health', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { path: '/hospitals', icon: MapPin, label: 'home.hospitals', color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
    { path: '/order', icon: ShoppingBag, label: 'home.order', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
    { path: '/chatbot', icon: MessageSquare, label: 'home.chatbot', color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
    { path: '#tips', icon: Lightbulb, label: 'home.tips', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
  ];

  useEffect(() => {
    const updateGreeting = () => {
      const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false } as const;
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const hour = parseInt(formatter.format(new Date()), 10);

      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`reminders_${user.uid}`);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    }
  }, [user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const istTimeStr = now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Kolkata', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (istTimeStr !== lastNotifiedMinute.current) {
        reminders.forEach(reminder => {
          if (reminder.time === istTimeStr) {
            // Play sound
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(e => console.log('Audio play failed', e));

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Medicine Reminder', {
                body: `Time to take your medicine: ${reminder.name} ${reminder.dosage ? `(${reminder.dosage})` : ''}`,
                icon: '/vite.svg'
              });
            }
          }
        });
        lastNotifiedMinute.current = istTimeStr;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReminder.name || !newReminder.time) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      ...newReminder
    };

    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updatedReminders));
    
    setNewReminder({ name: '', dosage: '', time: '' });
    setShowReminderModal(false);
    
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const deleteReminder = (id: string) => {
    if (!user) return;
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updatedReminders));
  };

  // Find the next upcoming reminder
  const getNextReminder = () => {
    if (reminders.length === 0) return null;
    
    const now = new Date();
    const currentIstTime = now.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kolkata', 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const upcoming = reminders.filter(r => r.time >= currentIstTime).sort((a, b) => a.time.localeCompare(b.time));
    if (upcoming.length > 0) return upcoming[0];
    
    // If no upcoming today, return the first one tomorrow
    return [...reminders].sort((a, b) => a.time.localeCompare(b.time))[0];
  };

  const nextReminder = getNextReminder();

  const formatTime12Hour = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 pb-8 rounded-b-[32px] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-bold">{user?.displayName || 'User'}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowReminderModal(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative hover:bg-white/30 transition-colors"
              title="Reminder Settings"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-emerald-600"></span>
            </button>
          </div>
        </div>
        
        {/* Medicine Reminder Widget (Only shows if there are reminders) */}
        {nextReminder && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-50 font-medium">Next Medicine</p>
                <p className="text-lg font-bold">{nextReminder.name}</p>
                {nextReminder.dosage && <p className="text-xs text-emerald-100">{nextReminder.dosage}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-50 font-medium">Time</p>
              <p className="text-lg font-bold">{formatTime12Hour(nextReminder.time)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 -mt-4 pt-8 z-0">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                key={idx}
                to={feature.path}
                className={`bg-white p-4 rounded-2xl border ${feature.border} shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3 active:scale-95`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${feature.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="font-semibold text-gray-800 text-sm leading-tight">{t(feature.label)}</span>
              </Link>
            );
          })}
        </div>

        {/* Daily Tip */}
        <div id="tips" className="mt-8 bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Daily Health Tip</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Drink at least 8 glasses of water today to stay hydrated and maintain your energy levels.
          </p>
        </div>
      </div>

      {/* Reminder Settings Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
              <h2 className="text-lg font-bold text-emerald-900">Reminder Settings</h2>
              <button onClick={() => setShowReminderModal(false)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleAddReminder} className="space-y-4 mb-8">
                <h3 className="font-semibold text-gray-900">Add New Reminder</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={newReminder.name}
                    onChange={e => setNewReminder({...newReminder, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Paracetamol"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={newReminder.dosage}
                      onChange={e => setNewReminder({...newReminder, dosage: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 1 Pill"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={newReminder.time}
                      onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                  Add Reminder
                </button>
              </form>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Your Reminders</h3>
                {reminders.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No reminders set.</p>
                ) : (
                  <div className="space-y-2">
                    {reminders.map(reminder => (
                      <div key={reminder.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{reminder.name}</p>
                          <p className="text-xs text-gray-500">{reminder.dosage} • {formatTime12Hour(reminder.time)}</p>
                        </div>
                        <button 
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
