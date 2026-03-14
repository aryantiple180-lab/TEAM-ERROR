import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { Activity, Heart, Droplets, Scale, Footprints, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Health() {
  const [healthData, setHealthData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bp');
  const [showAdd, setShowAdd] = useState(false);
  const [newValue, setNewValue] = useState('');
  const { user } = useAuth();

  const metrics = [
    { id: 'bp', label: 'Blood Pressure', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'hr', label: 'Heart Rate', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'sugar', label: 'Blood Sugar', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'weight', label: 'Weight', icon: Scale, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  useEffect(() => {
    if (!user) return;
    const storedData = localStorage.getItem(`healthData_${user.uid}`);
    if (storedData) {
      const allData = JSON.parse(storedData);
      const filteredData = allData.filter((d: any) => d.type === activeTab);
      // Sort by date desc
      filteredData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHealthData(filteredData.reverse()); // For chart
    } else {
      setHealthData([]);
    }
  }, [activeTab, user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newValue) return;
    
    const newRecord = {
      id: Date.now().toString(),
      userId: user.uid,
      type: activeTab,
      value: Number(newValue),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const storedData = localStorage.getItem(`healthData_${user.uid}`);
    let allData = storedData ? JSON.parse(storedData) : [];
    allData.push(newRecord);
    localStorage.setItem(`healthData_${user.uid}`, JSON.stringify(allData));

    const filteredData = allData.filter((d: any) => d.type === activeTab);
    filteredData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHealthData(filteredData.reverse());

    setShowAdd(false);
    setNewValue('');
  };

  const chartData = healthData.map((d, i) => ({
    name: `Day ${i + 1}`,
    value: d.value
  }));

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Health Tracker</h1>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {metrics.map(m => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  isActive ? `${m.bg} ${m.color} font-bold border-2 border-current` : 'bg-gray-100 text-gray-500 border-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Progress</h2>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="mb-6 flex gap-3">
              <input 
                type="number" 
                placeholder="Enter value" 
                value={newValue} 
                onChange={e => setNewValue(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700">Save</button>
            </form>
          )}

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={{r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 mb-3">Recent Records</h3>
          {[...healthData].reverse().map(d => (
            <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics.find(m => m.id === activeTab)?.bg} ${metrics.find(m => m.id === activeTab)?.color}`}>
                  {React.createElement(metrics.find(m => m.id === activeTab)?.icon || Activity, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{d.value}</p>
                  <p className="text-xs text-gray-500">
                    {d.date?.toDate ? d.date.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
