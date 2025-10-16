import React, { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Using a library for unique IDs

// Components
import Sidebar from './components/Sidebar';
import SearchInput from './components/SearchInput';
import Welcome from './components/Welcome';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import { UserMessage, BotResponse } from './components/ChatMessages';


// Hooks
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useSearchHistory } from './hooks/useSearchHistory';

// Services
import { sendMessageAndStreamResponse } from './services/geminiService';

// Types
import type { ChatMessage } from './types';


function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  const { preferences, savePreferences } = useUserPreferences();
  const { addSearchTerm } = useSearchHistory();
  const chatEndRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);


  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    addSearchTerm(messageText);
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
    };
    
    // Add user message and a loading placeholder for the bot
    setChatHistory(prev => [...prev, userMessage, { id: uuidv4(), role: 'model', content: { summary: '...', products: [], sources: [] }, isLoading: true }]);
    setCurrentQuery('');
    
    try {
      // Create a new bot message object to stream into
      const botMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: { summary: '', products: [], sources: [] },
        groundingSources: [],
      };

      // Replace the loading placeholder with the new bot message shell
      setChatHistory(prev => [...prev.slice(0, -1), botMessage]);

      const stream = sendMessageAndStreamResponse(messageText, preferences);
      
      for await (const { text, sources } of stream) {
        // Update the content of the last message in the history (which is our bot message)
        setChatHistory(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            try {
              // Attempt to parse the streaming text as JSON
              const parsedContent = JSON.parse(text);
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: parsedContent, groundingSources: sources }
              ];
            } catch (e) {
              // If parsing fails, it's likely incomplete. Update the summary for streaming effect.
              const currentContent = lastMessage.content;
              // FIX: Spread types may only be created from object types.
              // Added a type guard to ensure `lastMessage.content` is an object before using the spread operator.
              if (typeof currentContent === 'object' && currentContent !== null) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: { ...currentContent, summary: text }, groundingSources: sources }
                ];
              }
            }
          }
          return prev;
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
       // Remove the loading placeholder on error
      setChatHistory(prev => prev.filter(msg => !(msg.role === 'model' && msg.isLoading)));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, preferences, addSearchTerm]);

  const { isListening, startListening, stopListening, error: speechError } = useSpeechRecognition({
    onResult: (transcript) => {
      handleSendMessage(transcript);
    },
  });
  
  useEffect(() => {
    if (speechError) {
      setError(`Speech Recognition Error: ${speechError}`);
    }
  }, [speechError]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setCurrentQuery('');
      startListening();
    }
  };

  const handleNewSearch = () => {
    setChatHistory([]);
    setError(null);
  };

  const handleExampleClick = (exampleQuery: string) => {
    handleSendMessage(exampleQuery);
  };
  
  const handleSelectQueryFromPalette = (selectedQuery: string) => {
    handleSendMessage(selectedQuery);
  };
  
  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar onNewSearch={handleNewSearch} onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6">
          {chatHistory.length === 0 && !isLoading && !error && <Welcome onExampleClick={handleExampleClick} />}
          
          {chatHistory.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'user' && <UserMessage content={msg.content as string} />}
              {msg.role === 'model' && <BotResponse response={msg} />}
            </div>
          ))}

          {isLoading && chatHistory[chatHistory.length-1]?.role === 'model' && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800">
           <div className="w-full max-w-7xl mx-auto">
             <SearchInput
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onSearch={() => handleSendMessage(currentQuery)}
              isLoading={isLoading}
              isListening={isListening}
              onMicClick={handleMicClick}
            />
           </div>
        </div>
      </main>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentPreferences={preferences}
        onSave={(newPrefs) => {
          savePreferences(newPrefs);
          setIsSettingsOpen(false);
        }}
      />
      
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectQuery={handleSelectQueryFromPalette}
      />
    </div>
  );
}

export default App;
