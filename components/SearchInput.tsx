import React from 'react';
import { MicIcon } from './MicIcon';
import { StopIcon } from './StopIcon';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  isLoading: boolean;
  isListening: boolean;
  onMicClick: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSearch, isLoading, isListening, onMicClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && value.trim()) {
      e.preventDefault(); // Prevents form submission in case it's wrapped in one
      onSearch();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-full p-2 shadow-lg focus-within:ring-2 focus-within:ring-violet-500 transition-all duration-300">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : "e.g., Best eco-friendly laptop under $1000..."}
        className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none px-4"
        disabled={isLoading}
      />
      <button
        onClick={onMicClick}
        disabled={isLoading}
        className={`p-2.5 rounded-full transition-colors duration-300 ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'hover:bg-slate-700'}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? <StopIcon /> : <MicIcon />}
      </button>
      <button
        onClick={onSearch}
        disabled={isLoading || isListening || !value.trim()}
        className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-full hover:from-violet-600 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        Search
      </button>
    </div>
  );
};

export default SearchInput;