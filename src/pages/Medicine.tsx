import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { Pill, Plus, Calendar, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Medicine() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '', frequency: 'daily', startDate: '', endDate: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const storedMeds = localStorage.getItem(`reminders_${user.uid}`);
    if (storedMeds) {
      setMedicines(JSON.parse(storedMeds));
    }
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newMedicine = {
      id: Date.now().toString(),
      userId: user.uid,
      name: newMed.name,
      dosage: newMed.dosage,
      time: newMed.time,
      frequency: newMed.frequency,
      startDate: newMed.startDate,
      endDate: newMed.endDate,
      createdAt: new Date().toISOString()
    };

    const updatedMeds = [...medicines, newMedicine];
    setMedicines(updatedMeds);
    localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updatedMeds));
    
    setShowAdd(false);
    setNewMed({ name: '', dosage: '', time: '', frequency: 'daily', startDate: '', endDate: '' });
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    const updatedMeds = medicines.filter(med => med.id !== id);
    setMedicines(updatedMeds);
    localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updatedMeds));
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <button 
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {showAdd && (
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 mb-6">
            <h3 className="font-bold text-lg mb-4">Add Medicine</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" placeholder="Medicine Name" required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Dosage (e.g. 500mg)" required value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input type="time" required value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <select value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as-needed">As Needed</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input type="date" required value={newMed.startDate} onChange={e => setNewMed({...newMed, startDate: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input type="date" required value={newMed.endDate} onChange={e => setNewMed({...newMed, endDate: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Today's Schedule</h2>
          {medicines.length === 0 && !showAdd && (
            <div className="text-center py-10 text-gray-400">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No medicines added yet.</p>
            </div>
          )}
          {medicines.map(med => (
            <div key={med.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Pill className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{med.name}</h3>
                <p className="text-sm text-gray-500">{med.dosage} • {med.frequency}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg text-sm">{med.time}</span>
                <button 
                  onClick={() => handleDelete(med.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
