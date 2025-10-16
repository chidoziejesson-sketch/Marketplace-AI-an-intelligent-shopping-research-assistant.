import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string, options?: SpeakOptions) => {
    if (synthRef.current) {
      // If already speaking, cancel the current utterance before starting a new one.
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => {
        setIsSpeaking(true);
        options?.onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        options?.onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
        options?.onEnd?.(); // Also call onEnd on error
      };

      synthRef.current.speak(utterance);
    }
  }, []);

  const cancel = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      // The `onend` event on the utterance will fire, which handles state changes.
    }
  }, []);

  // Cancel speech on component unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return { isSpeaking, speak, cancel };
};