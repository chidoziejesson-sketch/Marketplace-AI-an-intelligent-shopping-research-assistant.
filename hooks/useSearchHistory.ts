
import { useState, useCallback, useEffect } from 'react';

const HISTORY_STORAGE_KEY = 'marketplace-ai-search-history';
const MAX_HISTORY_SIZE = 20;

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load search history from localStorage', error);
      setHistory([]);
    }
  }, []);

  const addSearchTerm = useCallback((term: string) => {
    if (!term || term.trim() === '') return;
    const newHistory = [
      term,
      ...history.filter((item) => item.toLowerCase() !== term.toLowerCase()),
    ].slice(0, MAX_HISTORY_SIZE);

    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history to localStorage', error);
    }
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history from localStorage', error);
    }
  }, []);

  return { history, addSearchTerm, clearHistory };
};
