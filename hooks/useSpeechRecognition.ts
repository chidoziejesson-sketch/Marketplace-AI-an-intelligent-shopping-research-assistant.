
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onResult: (result: string) => void;
}

const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    // FIX: Property 'SpeechRecognition' and 'webkitSpeechRecognition' does not exist on type 'Window'. Cast to any to access.
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }
  return undefined;
};

export const useSpeechRecognition = ({ onResult }: SpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // FIX: Cannot find name 'SpeechRecognition'. Use `any` as the type for the ref.
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // FIX: Cannot find name 'SpeechRecognitionEvent'. Use `any` for the event type.
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);

      // Trigger search on final result after a pause
      if (finalTranscript) {
          onResult(finalTranscript.trim());
          stopListening();
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    // FIX: Cannot find name 'SpeechRecognitionErrorEvent'. Use `any` for the event type.
    recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
            setError(event.error);
        }
        setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening, error };
};
