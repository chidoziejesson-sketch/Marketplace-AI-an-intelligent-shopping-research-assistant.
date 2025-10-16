import React, { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Components
import Welcome from './components/Welcome';
import ErrorMessage from './components/ErrorMessage';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';

// Hooks
import { useUserPreferences } from './hooks/useUserPreferences';
import { useSearchHistory } from './hooks/useSearchHistory';

// Services
import { sendMessageAndStreamResponse } from './services/geminiService';

// Types
import type { GeminiResponse, ChatMessage } from './types';


/**
 * Extracts a JSON object from a string. It's robust against markdown code blocks
 * and other surrounding text.
 * @param str The string to search within.
 * @returns The parsed JSON object, or null if no valid JSON is found.
 */
function extractJson(str: string): GeminiResponse | null {
  // Regex to find JSON within a ```json ... ``` markdown block
  const markdownRegex = /```json\s*([\s\S]*?)\s*```/;
  const markdownMatch = str.match(markdownRegex);

  let jsonStr: string | null = null;

  if (markdownMatch && markdownMatch[1]) {
    // If we find a markdown block, use its content
    jsonStr = markdownMatch[1];
  } else {
    // Otherwise, fall back to finding the first and last curly braces
    const firstBracket = str.indexOf('{');
    const lastBracket = str.lastIndexOf('}');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonStr = str.substring(firstBracket, lastBracket + 1);
    }
  }
  
  if (!jsonStr) {
      return null;
  }

  try {
    return JSON.parse(jsonStr) as GeminiResponse;
  } catch (error) {
    console.error("Failed to parse extracted JSON:", error);
    return null;
  }
}

function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  const { preferences, savePreferences } = useUserPreferences();
  const { addSearchTerm } = useSearchHistory();
  const chatContainerRef = useRef<HTMLDivElement>(null);


  const handleSendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    addSearchTerm(query);

    const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: query };
    const botMessagePlaceholder: ChatMessage = { 
      id: uuidv4(), 
      role: 'model', 
      content: { summary: '', products: [], sources: [] },
      isLoading: true 
    };

    setChatHistory(prev => [...prev, userMessage, botMessagePlaceholder]);
    
    try {
      const stream = sendMessageAndStreamResponse(query, preferences);
      let accumulatedText = "";

      for await (const { text, sources } of stream) {
        accumulatedText = text;
        
        setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMessage = newHistory[newHistory.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
                lastMessage.content = { ...lastMessage.content as GeminiResponse, summary: text };
                lastMessage.groundingSources = sources;
            }
            return newHistory;
        });
      }

      const finalJson = extractJson(accumulatedText);
      
      setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
              if (finalJson) {
                lastMessage.content = finalJson;
              } else {
                lastMessage.content = { summary: accumulatedText, products: [], sources: [] };
              }
              lastMessage.isLoading = false;
          }
          return newHistory;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
       setChatHistory(prev => prev.slice(0, -1)); // Remove the placeholder on error
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, preferences, addSearchTerm]);

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
  
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);


  const handleNewChat = () => {
    setChatHistory([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <main 
        ref={chatContainerRef} 
        className={`flex-1 overflow-y-auto p-4 md:p-6 ${chatHistory.length === 0 ? 'flex items-center justify-center' : ''}`}
      >
        {chatHistory.length === 0 && !isLoading && !error ? (
            <Welcome onExampleClick={handleSendMessage} />
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            {error && <ErrorMessage message={error} />}
            <ChatHistory history={chatHistory} />
          </div>
        )}
      </main>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
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
        onSelectQuery={handleSendMessage}
      />
    </div>
  );
}

export default App;