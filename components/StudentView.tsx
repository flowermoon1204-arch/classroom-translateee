import React, { useState, useEffect, useRef } from 'react';
import { Volume2, MessageCircle, Send, Radio, User, Mic } from 'lucide-react';
import { SUPPORTED_LANGUAGES, Language } from '../types';
import { storageService } from '../services/storage';
import { translateText, generateSpeech, translateToEnglish } from '../services/gemini';

export const StudentView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  
  // Real-time state
  const [lastProcessedText, setLastProcessedText] = useState<string>('');
  const [currentTranslation, setCurrentTranslation] = useState<string>('Waiting for teacher to speak...');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Audio Playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Question State
  const [questionInput, setQuestionInput] = useState('');
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  useEffect(() => {
    if (!hasJoined || !selectedLang) return;

    // Listen for storage events (simulating socket broadcast)
    const checkForUpdates = async () => {
        const segment = storageService.getLastSegment();
        
        // If new text and different from last processed
        if (segment && segment.text !== lastProcessedText && segment.text.length > lastProcessedText.length) {
            // We only process the *new* part to avoid re-translating the whole history for this demo
            // But for simplicity in this artifact, we just translate the whole current segment if it changed significantly
            // or if it's a new segment ID. 
            // Better logic: Debounce.
            
            const textToProcess = segment.text;
            setLastProcessedText(textToProcess);
            
            setIsProcessing(true);
            
            // 1. Translate
            const translated = await translateText(textToProcess, selectedLang.name);
            setCurrentTranslation(translated);

            // 2. TTS
            // Only play if it's a significant update or final, to avoid audio spam on every character
            if (segment.isFinal || textToProcess.length % 50 === 0) { 
               playAudio(translated, selectedLang.ttsVoiceName);
            }
            
            setIsProcessing(false);
        }
    };

    // Polling interval for smoother update checking in absence of real sockets
    const interval = setInterval(checkForUpdates, 1000);
    return () => clearInterval(interval);
  }, [hasJoined, selectedLang, lastProcessedText]);

  const playAudio = async (text: string, voiceName?: string) => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        setIsPlayingAudio(true);
        const audioBuffer = await generateSpeech(text, voiceName);
        if (audioBuffer) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlayingAudio(false);
            source.start(0);
        } else {
            setIsPlayingAudio(false);
        }
    } catch (e) {
        console.error("Audio playback failed", e);
        setIsPlayingAudio(false);
    }
  };

  const handleJoin = () => {
    if (roomCodeInput.length >= 4 && selectedLang) {
        setHasJoined(true);
        // Initialize Audio Context on user interaction
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } else {
        alert("Please enter a room code and select a language.");
    }
  };

  const handleSendQuestion = async () => {
    if (!questionInput.trim() || !selectedLang) return;
    
    setIsSendingQuestion(true);
    
    // Translate question to English for the teacher
    const englishText = await translateToEnglish(questionInput, selectedLang.name);
    
    storageService.postQuestion({
        id: Date.now().toString(),
        language: selectedLang.name,
        originalText: questionInput,
        translatedText: englishText,
        studentName: "Student",
        timestamp: Date.now()
    });

    setQuestionInput('');
    setIsSendingQuestion(false);
    alert("Question sent to teacher!");
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-slate-100 p-8 space-y-8">
           <div className="text-center">
               <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <User className="w-8 h-8 text-emerald-600" />
               </div>
               <h2 className="text-2xl font-bold text-slate-800">Join Classroom</h2>
               <p className="text-slate-500 mt-2">Enter the code provided by your teacher.</p>
           </div>

           <div className="space-y-4">
               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Room Code</label>
                   <input 
                      type="text" 
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. A7X2B9"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-mono text-center text-lg tracking-widest uppercase transition-all"
                   />
               </div>

               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Select Your Language</label>
                   <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                       {SUPPORTED_LANGUAGES.map(lang => (
                           <button
                             key={lang.code}
                             onClick={() => setSelectedLang(lang)}
                             className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                                 selectedLang?.code === lang.code
                                 ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                                 : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                             }`}
                           >
                               <span>{lang.flag}</span>
                               <span>{lang.name}</span>
                           </button>
                       ))}
                   </div>
               </div>
           </div>

           <button 
             onClick={handleJoin}
             className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all transform active:scale-95"
           >
               Join Class
           </button>
           
           <button onClick={onBack} className="w-full py-2 text-slate-400 text-sm hover:text-slate-600">
               Cancel
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    &larr;
                </button>
                <div>
                    <h1 className="font-bold text-slate-800">Room {roomCodeInput}</h1>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Connection
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <span className="text-xl">{selectedLang?.flag}</span>
                <span className="text-sm font-medium text-slate-700">{selectedLang?.name}</span>
            </div>
        </header>

        {/* Main Listening Area */}
        <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8">
            
            {/* Visualizer / Status */}
            <div className="relative">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isPlayingAudio ? 'bg-emerald-100 scale-110' : 'bg-slate-100'}`}>
                    {isPlayingAudio ? (
                        <>
                            <div className="absolute w-full h-full rounded-full border-4 border-emerald-200 animate-ping opacity-20"></div>
                            <Volume2 className="w-16 h-16 text-emerald-600" />
                        </>
                    ) : (
                        <Radio className="w-16 h-16 text-slate-300" />
                    )}
                </div>
            </div>

            {/* Translation Text */}
            <div className="w-full text-center space-y-4">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[200px] flex items-center justify-center flex-col">
                    {isProcessing && (
                         <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 animate-pulse">Translating...</span>
                    )}
                    <p className={`text-xl md:text-2xl font-medium leading-relaxed transition-opacity duration-300 ${isProcessing ? 'opacity-50' : 'opacity-100 text-slate-800'}`}>
                        "{currentTranslation}"
                    </p>
                </div>
                <p className="text-sm text-slate-400">Audio plays automatically via Gemini TTS</p>
            </div>

        </main>

        {/* Question Input Footer */}
        <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
            <div className="max-w-2xl mx-auto">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder={`Ask a question in ${selectedLang?.name}...`}
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
                    />
                    <button 
                        onClick={handleSendQuestion}
                        disabled={isSendingQuestion || !questionInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </footer>
    </div>
  );
};