
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { HistoryIcon } from './icons/HistoryIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectQuery }) => {
  const { history, clearHistory } = useSearchHistory();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (query: string) => {
    onSelectQuery(query);
    setSearchTerm('');
    onClose();
  };
  
  const handleClearHistory = () => {
    clearHistory();
  };
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);
  
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-20" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10 mx-4 overflow-hidden animate-fade-in-down">
        <div className="flex items-center p-4 border-b border-slate-700">
          <SearchIcon />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none px-4"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredHistory.length > 0 ? (
            <ul>
              {filteredHistory.map((item, index) => (
                <li key={index} 
                    onClick={() => handleSelect(item)}
                    className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors">
                  <HistoryIcon />
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
             <div className="p-8 text-center text-slate-500">
                {history.length === 0 ? "No search history." : "No results found."}
             </div>
          )}
        </div>
        {history.length > 0 && (
           <div className="p-2 bg-slate-800/50 border-t border-slate-700 flex justify-end">
             <button onClick={handleClearHistory} className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 p-2 rounded-md transition-colors">
                <TrashIcon />
                Clear History
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;
