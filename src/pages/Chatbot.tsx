import React, { useState, useRef, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { Send, Bot, Smile, Frown, Meh, Heart } from 'lucide-react';
import { getGemini } from '../services/gemini';
import { useAuth } from '../contexts/AuthContext';

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Hello! I am your Mental Health AI Assistant. How are you feeling today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodSaved, setMoodSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const storedMoods = localStorage.getItem(`moods_${user.uid}`);
    if (storedMoods) {
      const moods = JSON.parse(storedMoods);
      // Check if mood was saved today
      const today = new Date().toDateString();
      const hasTodayMood = moods.some((m: any) => new Date(m.date).toDateString() === today);
      setMoodSaved(hasTodayMood);
    }
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const genAI = getGemini();
      const chat = genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a compassionate, professional, and supportive Mental Health AI Chatbot. Provide helpful advice on stress, anxiety, sleep problems, diet, exercise, and general wellness. Suggest breathing exercises, meditation tips, and healthy lifestyle recommendations. Do not provide medical diagnoses or prescribe medication. Always encourage users to seek professional help for severe issues.'
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I am here to help.' }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const saveMood = async (mood: string) => {
    if (!user) return;
    
    const newMood = {
      id: Date.now().toString(),
      userId: user.uid,
      mood,
      date: new Date().toISOString()
    };

    const storedMoods = localStorage.getItem(`moods_${user.uid}`);
    let allMoods = storedMoods ? JSON.parse(storedMoods) : [];
    allMoods.push(newMood);
    localStorage.setItem(`moods_${user.uid}`, JSON.stringify(allMoods));

    setMoodSaved(true);
    setMessages(prev => [...prev, { role: 'model', text: `I've noted that you're feeling ${mood} today. How can I support you?` }]);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Wellness AI</h1>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
          </p>
        </div>
      </div>

      {!moodSaved && (
        <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex flex-col items-center">
          <p className="text-sm text-indigo-800 font-medium mb-3">How are you feeling today?</p>
          <div className="flex gap-4">
            <button onClick={() => saveMood('happy')} className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-100 text-emerald-500"><Smile className="w-6 h-6" /></button>
            <button onClick={() => saveMood('okay')} className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-100 text-amber-500"><Meh className="w-6 h-6" /></button>
            <button onClick={() => saveMood('sad')} className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-100 text-blue-500"><Frown className="w-6 h-6" /></button>
            <button onClick={() => saveMood('loved')} className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-100 text-rose-500"><Heart className="w-6 h-6" /></button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-sm' 
                : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 rounded-bl-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-100 pb-safe">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600 shrink-0 shadow-md shadow-emerald-200"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
