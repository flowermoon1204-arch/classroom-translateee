import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Users, Copy, MessageSquare, Radio, CheckCircle, ChevronRight, Settings } from 'lucide-react';
import { SUPPORTED_LANGUAGES, StudentQuestion } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { storageService } from '../services/storage';

export const TeacherDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [roomCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const { isListening, startListening, stopListening, text: transcript } = useSpeechRecognition();
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [activeLanguages, setActiveLanguages] = useState<Set<string>>(new Set());
  const [studentCount, setStudentCount] = useState(0);

  // Sync questions from storage
  useEffect(() => {
    storageService.clearSession(); // Clean start for demo
    
    // Initial fetch
    setQuestions(storageService.getQuestions());

    const handleStorageChange = () => {
      setQuestions(storageService.getQuestions());
      // Simulate student count based on activity or just random for demo
      const qCount = storageService.getQuestions().length;
      if (qCount > 0) setStudentCount(Math.max(1, qCount + Math.floor(Math.random() * 2)));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Broadcast transcript when it updates
  useEffect(() => {
    if (transcript) {
      storageService.broadcastSegment(transcript, true);
    }
  }, [transcript]);

  const toggleLanguage = (code: string) => {
    const next = new Set(activeLanguages);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setActiveLanguages(next);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert(`Copied: ${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 font-medium text-sm flex items-center">
                 &larr; Home
             </button>
             <div className="h-6 w-px bg-slate-200"></div>
             <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Radio className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                Teacher Broadcast
             </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room Code</span>
                <span className="font-mono text-lg font-bold text-indigo-600 tracking-wider">{roomCode}</span>
                <button onClick={copyRoomCode} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-5 h-5" />
                <span className="font-medium">{studentCount} online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Controls & Broadcasting */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Broadcast Control */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${isListening ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse' : 'bg-slate-100'}`}></div>
                    
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isListening ? 'Broadcasting Now' : 'Ready to Broadcast'}
                        </h2>
                        <p className="text-slate-500">
                            {isListening ? 'Your voice is being translated in real-time.' : 'Click the microphone to start the lesson.'}
                        </p>
                    </div>

                    <button 
                        onClick={isListening ? stopListening : startListening}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                            isListening 
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200 scale-110' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                    >
                        {isListening ? (
                            <Mic className="w-10 h-10 text-white animate-pulse" />
                        ) : (
                            <MicOff className="w-10 h-10 text-white" />
                        )}
                    </button>

                    <div className="w-full bg-slate-50 rounded-xl p-4 min-h-[100px] border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Live Transcript (English)</span>
                        <p className="text-slate-700 text-lg leading-relaxed">
                            {transcript || <span className="text-slate-400 italic">Speak to see transcript here...</span>}
                        </p>
                    </div>
                </div>

                {/* Target Languages */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-500" />
                            Target Languages
                        </h3>
                        <span className="text-sm text-slate-500">{activeLanguages.size} selected</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => toggleLanguage(lang.code)}
                                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                    activeLanguages.has(lang.code)
                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${activeLanguages.has(lang.code) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {activeLanguages.has(lang.code) && (
                                    <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Setup Guide */}
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                     <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        📋 Quick Setup
                     </h3>
                     <ol className="space-y-3">
                         {[
                             "Click the Copy button next to the room code to share with students",
                             "Select which languages your students need above",
                             "Click the big microphone to start broadcasting",
                             "Speak normally - translations happen automatically!"
                         ].map((step, idx) => (
                             <li key={idx} className="flex items-start gap-3 text-indigo-800 text-sm">
                                 <span className="flex-shrink-0 w-5 h-5 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                     {idx + 1}
                                 </span>
                                 <span>{step}</span>
                             </li>
                         ))}
                     </ol>
                </div>

            </div>

            {/* Right Column: Questions & Status */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Questions Feed */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[600px] flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            Student Questions
                        </h3>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            {questions.length}
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {questions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                <p>No questions yet.</p>
                                <p className="text-sm mt-1">Students can ask questions in their language.</p>
                            </div>
                        ) : (
                            questions.map((q) => (
                                <div key={q.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                            Student ({q.language})
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(q.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-slate-800 font-medium text-sm mb-1">{q.translatedText}</p>
                                    <p className="text-slate-400 text-xs italic border-t border-slate-200 pt-1 mt-2">
                                        Original: "{q.originalText}"
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Connected Status Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-2">Connected Students</h3>
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${studentCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-2xl font-bold text-slate-900">{studentCount}</span>
                        <span className="text-slate-500">online</span>
                    </div>
                    {studentCount === 0 && (
                        <p className="text-sm text-slate-400 mt-2">No students connected yet. Share the room code to get started.</p>
                    )}
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};