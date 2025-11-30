import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Use refs to track state inside the effect closures without triggering re-runs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Sync the ref with the state so event handlers access the latest value
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      // Iterate through results starting from the current result index
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      // Only update if we have a final transcript to avoid clearing state with empty interim updates
      if (finalTranscript) {
         setText(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      // 'aborted' error often happens when stop() is called. 
      // If we intended to stop (isListeningRef is false), ignore it.
      if (event.error === 'aborted') {
        if (isListeningRef.current) {
            // If we didn't intend to stop, it might be a focus issue, but we'll let onend handle restart if needed.
            console.warn("Speech recognition aborted unexpectedly");
        }
        return;
      }

      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };
    
    recognition.onend = () => {
      // If we are still supposed to be listening, try to restart
      if (isListeningRef.current) {
         try {
            recognition.start();
         } catch (e) {
            // Ignore errors if it fails to restart immediately
         }
      }
    };

    recognitionRef.current = recognition;

    // Cleanup function to stop recognition when component unmounts
    return () => {
      recognition.onend = null; // Remove onend to prevent auto-restart logic during unmount
      recognition.stop();
    };
  }, []); // Run once on mount

  const startListening = useCallback(() => {
    setText('');
    setIsListening(true);
    isListeningRef.current = true;
    try {
        recognitionRef.current?.start();
    } catch (e) {
        // Ignore if already started
        console.log("Speech recognition already started");
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    try {
        recognitionRef.current?.stop();
    } catch (e) { 
        console.log("Speech recognition already stopped");
    }
  }, []);

  return { text, isListening, startListening, stopListening };
};