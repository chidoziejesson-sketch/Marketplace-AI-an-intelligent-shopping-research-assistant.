import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Command } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = useMemo(() => 
    commands.filter(command =>
      command.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [commands, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
      // Timeout to allow the input to be rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeCommand = filteredCommands[activeIndex];
        if (activeCommand) {
          activeCommand.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeIndex, filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-20" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 mx-4">
        <div className="flex items-center p-3 border-b border-gray-700">
            <SearchIcon />
            <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none ml-3"
            />
        </div>
        <ul className="p-2 max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  index === activeIndex ? 'bg-purple-600/40' : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                    <span className="text-gray-400">{command.icon}</span>
                    <span className="text-gray-200">{command.name}</span>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">No commands found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
