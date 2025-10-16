import React, { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicIcon } from './MicIcon';
import { StopIcon } from './StopIcon';
import { CogIcon } from './icons/CogIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ChatInputProps {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onNewChat, onOpenSettings }) => {
  const [inputValue, setInputValue] = useState('');

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputValue(transcript);
      onSendMessage(transcript);
    },
  });
  
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4 sm:px-6 sm:pb-6 bg-slate-900 sticky bottom-0 z-10">
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex items-end gap-2 bg-slate-800 rounded-xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-violet-500 transition-all duration-300">
           <button
              onClick={onNewChat}
              className="p-2.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title="New Chat"
            >
              <TrashIcon />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title="Settings"
            >
              <CogIcon />
            </button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none px-4 resize-none max-h-40"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => isListening ? stopListening() : startListening()}
            disabled={isLoading}
            className={`p-2.5 rounded-full transition-colors duration-300 ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'hover:bg-slate-700'}`}
            aria-label={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || isListening || !inputValue.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-lg hover:from-violet-600 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
