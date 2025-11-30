import React from 'react';
import { Mic, Headphones, GraduationCap } from 'lucide-react';

interface HomePageProps {
  onSelectRole: (role: 'TEACHER' | 'STUDENT') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12 text-center">
        
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-full shadow-lg">
                <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            Classroom Voice Translator
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Real-time voice translation for inclusive classrooms. <br/>
            <span className="font-medium text-indigo-600">Teachers speak</span>, 
            <span className="font-medium text-emerald-600"> students hear</span> in their native language through their earbuds.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <button
            onClick={() => onSelectRole('TEACHER')}
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-indigo-50 p-4 rounded-full mb-4 group-hover:bg-indigo-100 transition-colors">
              <Mic className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Teacher Broadcast</h2>
            <p className="text-slate-500 text-sm">Start a class session and broadcast your voice with real-time translation.</p>
          </button>

          <button
            onClick={() => onSelectRole('STUDENT')}
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-emerald-50 p-4 rounded-full mb-4 group-hover:bg-emerald-100 transition-colors">
              <Headphones className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Listener</h2>
            <p className="text-slate-500 text-sm">Join a class room code and listen in your preferred language.</p>
          </button>
        </div>
        
        <div className="pt-8 text-slate-400 text-sm">
            Powered by Google Gemini API
        </div>
      </div>
    </div>
  );
};