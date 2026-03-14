import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Pill, MessageSquare, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/health', icon: Activity, label: 'Health' },
    { path: '/medicine', icon: Pill, label: 'Meds' },
    { path: '/chatbot', icon: MessageSquare, label: 'AI Chat' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="bg-white border-t border-gray-100 flex justify-around items-center py-3 px-6 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = path === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-50' : ''}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
