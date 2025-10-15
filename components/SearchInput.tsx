import React from 'react';
import { MicIcon } from './MicIcon';

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
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-full p-2 shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-300">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : "e.g., Best eco-friendly laptop under $1000..."}
        className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none px-4"
        disabled={isLoading}
      />
      <button
        onClick={onMicClick}
        disabled={isLoading}
        className={`p-2.5 rounded-full transition-colors duration-300 ${isListening ? 'bg-red-500/80 text-white' : 'hover:bg-gray-700'}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
      >
        <MicIcon isListening={isListening} />
      </button>
      <button
        onClick={onSearch}
        disabled={isLoading || isListening}
        className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export default SearchInput;