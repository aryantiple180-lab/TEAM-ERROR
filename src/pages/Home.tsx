import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNav from '../components/BottomNav';
import { Pill, Activity, MapPin, ShoppingBag, Lightbulb, MessageSquare, Bell, Settings, X } from 'lucide-react';

interface Reminder {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:mm format
  startDate?: string;
  endDate?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    ringtone: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    volume: 1.0
  });
  const [activeAlarm, setActiveAlarm] = useState<{name: string, dosage: string, audio: HTMLAudioElement} | null>(null);
  const [countdown, setCountdown] = useState<string>('');
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

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`reminders_${user.uid}`);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
      const storedSettings = localStorage.getItem(`notification_settings_${user.uid}`);
      if (storedSettings) {
        setNotificationSettings(JSON.parse(storedSettings));
      }
      const storedNotif = localStorage.getItem(`notifications_enabled_${user.uid}`);
      if (storedNotif !== null) {
        setNotificationsEnabled(JSON.parse(storedNotif));
      }
    }
  }, [user]);

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
    
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // Filter reminders that are active today
    const activeReminders = reminders.filter(r => {
      if (r.startDate && r.startDate > todayStr) return false;
      if (r.endDate && r.endDate < todayStr) return false;
      // For weekly, we could check day of week, but let's keep it simple for now or implement if needed
      return true;
    });

    if (activeReminders.length === 0) return null;

    const upcoming = activeReminders.filter(r => r.time >= currentIstTime).sort((a, b) => a.time.localeCompare(b.time));
    if (upcoming.length > 0) return upcoming[0];
    
    // If no upcoming today, return the first one tomorrow
    return [...activeReminders].sort((a, b) => a.time.localeCompare(b.time))[0];
  };

  const nextReminder = getNextReminder();

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
      
      // Update countdown
      if (nextReminder) {
        const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const reminderDate = new Date(istNow);
        const [remHour, remMin] = nextReminder.time.split(':').map(Number);
        reminderDate.setHours(remHour, remMin, 0, 0);
        
        if (reminderDate < istNow) {
          reminderDate.setDate(reminderDate.getDate() + 1);
        }
        
        const diffMs = reminderDate.getTime() - istNow.getTime();
        if (diffMs <= 0) {
          setCountdown('0 minutes 0 seconds');
        } else {
          const diffSecs = Math.floor(diffMs / 1000);
          const hours = Math.floor(diffSecs / 3600);
          const minutes = Math.floor((diffSecs % 3600) / 60);
          const seconds = diffSecs % 60;
          
          let countdownStr = '';
          if (hours > 0) countdownStr += `${hours} hours `;
          countdownStr += `${minutes} minutes ${seconds} seconds`;
          setCountdown(countdownStr);
        }
      } else {
        setCountdown('');
      }

      if (istTimeStr !== lastNotifiedMinute.current) {
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        
        reminders.forEach(reminder => {
          // Check if reminder is active today
          if (reminder.startDate && reminder.startDate > todayStr) return;
          if (reminder.endDate && reminder.endDate < todayStr) return;

          if (reminder.time === istTimeStr) {
            // Play sound
            if (notificationsEnabled) {
              const audio = new Audio(notificationSettings.ringtone);
              audio.volume = notificationSettings.volume;
              audio.loop = true;
              audio.play().catch(e => console.log('Audio play failed', e));

              // Stop audio after 25 seconds automatically
              setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                setActiveAlarm(prev => prev?.audio === audio ? null : prev);
              }, 25000);

              // Show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Medicine Reminder', {
                  body: `Time to take your medicine: ${reminder.name} ${reminder.dosage ? `(${reminder.dosage})` : ''}`,
                  icon: '/vite.svg'
                });
              }
              
              setActiveAlarm({ name: reminder.name, dosage: reminder.dosage, audio });
            } else {
              // Just show the modal without sound if notifications are disabled
              setActiveAlarm({ name: reminder.name, dosage: reminder.dosage, audio: new Audio() });
            }
          }
        });
        lastNotifiedMinute.current = istTimeStr;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, notificationSettings, nextReminder, notificationsEnabled]);





  const formatTime12Hour = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  const stopAlarm = () => {
    if (activeAlarm?.audio) {
      activeAlarm.audio.pause();
      activeAlarm.audio.currentTime = 0;
    }
    setActiveAlarm(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative">
      {/* Active Alarm Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-bounce-slight text-center p-8">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Bell className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Time for Medicine!</h2>
            <p className="text-xl font-semibold text-emerald-600 mb-1">{activeAlarm.name}</p>
            {activeAlarm.dosage && <p className="text-gray-500 mb-8">{activeAlarm.dosage}</p>}
            
            <button 
              onClick={stopAlarm}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Stop Alarm
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 pb-8 rounded-b-[32px] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-bold">{user?.displayName || 'User'}</h1>
            <p className="text-emerald-50 text-xs mt-1 opacity-90">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowNotificationSettings(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative hover:bg-white/30 transition-colors"
              title="Notification Settings"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-emerald-600"></span>
            </button>
            <Link 
              to="/settings"
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative hover:bg-white/30 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Medicine Reminder Widget (Only shows if there are reminders) */}
        {nextReminder && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
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
            {countdown && (
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <p className="text-sm font-medium text-emerald-50">Next Reminder In: {countdown}</p>
              </div>
            )}
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



      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
              <h2 className="text-xl font-bold text-emerald-900">Notification Settings</h2>
              <button onClick={() => setShowNotificationSettings(false)} className="p-2 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Ringtone Settings</label>
                <select 
                  value={notificationSettings.ringtone.startsWith('blob:') ? 'custom' : notificationSettings.ringtone}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      document.getElementById('custom-ringtone-upload')?.click();
                    } else {
                      const newSettings = { ...notificationSettings, ringtone: e.target.value };
                      setNotificationSettings(newSettings);
                      if (user) localStorage.setItem(`notification_settings_${user.uid}`, JSON.stringify(newSettings));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="https://actions.google.com/sounds/v1/alarms/beep_short.ogg">Default Beep</option>
                  <option value="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg">Digital Chime</option>
                  <option value="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg">Alarm Clock</option>
                  <option value="https://actions.google.com/sounds/v1/alarms/dosimeter_alarm.ogg">Gentle Alert</option>
                  <option value="custom">Choose from device...</option>
                </select>
                {notificationSettings.ringtone.startsWith('blob:') && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">Custom ringtone selected</p>
                )}
                <input 
                  type="file" 
                  id="custom-ringtone-upload" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      const newSettings = { ...notificationSettings, ringtone: url };
                      setNotificationSettings(newSettings);
                      if (user) localStorage.setItem(`notification_settings_${user.uid}`, JSON.stringify(newSettings));
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Volume: {Math.round(notificationSettings.volume * 100)}%</label>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={notificationSettings.volume}
                  onChange={(e) => {
                    const newSettings = { ...notificationSettings, volume: parseFloat(e.target.value) };
                    setNotificationSettings(newSettings);
                    if (user) localStorage.setItem(`notification_settings_${user.uid}`, JSON.stringify(newSettings));
                  }}
                  className="w-full accent-emerald-600"
                />
              </div>

              <button 
                onClick={() => {
                  const audio = new Audio(notificationSettings.ringtone);
                  audio.volume = notificationSettings.volume;
                  audio.play().catch(e => console.log('Preview failed', e));
                }}
                className="w-full bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                Preview Sound
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alarm Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden text-center p-8 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Time to take your medicine</h2>
            <p className="text-lg text-emerald-600 font-bold mb-1">{activeAlarm.name}</p>
            {activeAlarm.dosage && <p className="text-gray-500 mb-8">{activeAlarm.dosage}</p>}
            
            <button 
              onClick={() => setActiveAlarm(null)}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              I've taken it
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
