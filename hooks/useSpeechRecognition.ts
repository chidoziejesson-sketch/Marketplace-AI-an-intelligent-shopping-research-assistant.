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

  // Use a ref for the onResult callback to prevent stale closures in the useEffect.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // This effect should only run once to set up the recognition object.
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
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
      
      // Update transcript for UI feedback
      setTranscript(finalTranscript + interimTranscript);

      // When a final result is available, trigger the search.
      // The recognition will stop itself since `continuous` is false, which then fires `onend`.
      if (finalTranscript) {
        onResultRef.current(finalTranscript.trim());
      }
    };
    
    // This is the single source of truth for when listening has stopped.
    recognition.onend = () => {
      setIsListening(false);
    };

    // FIX: Cannot find name 'SpeechRecognitionErrorEvent'. Use `any` for the event type.
    recognition.onerror = (event: any) => {
      if (event.error && event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
      // The 'onend' event will also fire after an error, which handles setting isListening to false.
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup when the component unmounts.
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array ensures this runs only once.

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      // Manually stop listening. This will trigger the `onend` event handler.
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening, error };
};