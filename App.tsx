import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ApiResponse, ChatMessage, Command } from './types';
import { generateMarketplaceResponse } from './services/geminiService';
import SearchInput from './components/SearchInput';
import ProductCard from './components/ProductCard';
import SourceList from './components/SourceList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Welcome from './components/Welcome';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { SpeakerIcon } from './components/SpeakerIcon';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import { TrashIcon } from './components/icons/TrashIcon';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import { SoundWaveIcon } from './components/icons/SoundWaveIcon';
import { MicIcon } from './components/MicIcon';
import { StopIcon } from './components/StopIcon';

const BotResponse: React.FC<{
  response: ApiResponse;
  onToggleSpeak: () => void;
  isSpeaking: boolean;
}> = ({ response, onToggleSpeak, isSpeaking }) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-start mb-4 gap-4">
          <p className="text-gray-300 leading-relaxed flex-1 whitespace-pre-wrap">{response.textResponse}</p>
          {response.textResponse && (
            <button
              onClick={onToggleSpeak}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label={isSpeaking ? "Stop reading response" : "Read response aloud"}
            >
              <SpeakerIcon isSpeaking={isSpeaking} />
            </button>
          )}
        </div>
      </div>

      {response.imageGenerationErrors && response.imageGenerationErrors.length > 0 && (
         <div className="space-y-2">
          <h3 className="text-xl font-semibold text-yellow-400">Image Generation Notice</h3>
           {response.imageGenerationErrors.map((imgError, index) => (
             <div key={index} className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg" role="alert">
               <p>{imgError}</p>
             </div>
           ))}
         </div>
       )}

      {response.products && response.products.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">Recommended Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {response.products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      )}
      
      {response.ecommerceSources && response.ecommerceSources.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">E-commerce Sources</h2>
          <SourceList sources={response.ecommerceSources} />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { speak, cancel, isSpeaking } = useSpeechSynthesis();
  
  const handleSendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query
    };

    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    cancel();
    setSpeakingMessageId(null);

    try {
      const response = await generateMarketplaceResponse(query);
      const modelMessage: ChatMessage = {
        id: `gemini-${Date.now()}`,
        role: 'model',
        content: response,
      };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorContent = `Failed to get response from Gemini. ${errorMessage}`;
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'error',
        content: errorContent,
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, cancel]);

  const {
    isListening,
    startListening,
    stopListening,
    error: recognitionError,
  } = useSpeechRecognition({
    onResult: (result: string) => {
      handleSendMessage(result);
    },
  });
  
  useEffect(() => {
    if (recognitionError) {
      setError(`Voice recognition error: ${recognitionError}`);
    }
  }, [recognitionError]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsPaletteOpen(open => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setError(null);
      startListening();
    }
  };

  const getLastModelMessage = (): ChatMessage | null => {
      for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].role === 'model') {
          return chatHistory[i];
        }
      }
      return null;
  }

  const commands: Command[] = [
    {
      id: 'clear-chat',
      name: 'Clear Chat History',
      action: () => setChatHistory([]),
      icon: <TrashIcon />,
    },
    {
      id: 'copy-response',
      name: 'Copy Last Response',
      action: () => {
        const lastMessage = getLastModelMessage();
        if(lastMessage) {
            const lastResponse = lastMessage.content as ApiResponse;
            navigator.clipboard.writeText(lastResponse.textResponse);
        }
      },
      icon: <ClipboardIcon />,
    },
    {
        id: 'read-response',
        name: isSpeaking ? 'Stop Reading' : 'Read Last Response',
        action: () => {
            const lastMessage = getLastModelMessage();
            if(!lastMessage) return;

            const lastResponse = lastMessage.content as ApiResponse;
            if (speakingMessageId === lastMessage.id) {
                cancel();
            } else if (lastResponse?.textResponse) {
                speak(lastResponse.textResponse, {
                    onStart: () => setSpeakingMessageId(lastMessage.id),
                    onEnd: () => setSpeakingMessageId(null),
                });
            }
        },
        icon: <SoundWaveIcon />,
    },
    {
        id: 'toggle-mic',
        name: isListening ? 'Stop Voice Search' : 'Start Voice Search',
        action: handleMicClick,
        icon: isListening ? <StopIcon /> : <MicIcon />,
    }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)}
        commands={commands}
      />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 space-y-6">
          {chatHistory.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <Welcome onExampleClick={handleSendMessage} />
            </div>
          )}
          {chatHistory.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-purple-600 text-white p-3 rounded-lg max-w-xl shadow-md">
                    {msg.content as string}
                  </div>
                </div>
              );
            }
            if (msg.role === 'model') {
              const response = msg.content as ApiResponse;
              const isCurrentlySpeaking = speakingMessageId === msg.id;
              
              const handleToggleSpeak = () => {
                  if (isCurrentlySpeaking) {
                      cancel();
                  } else {
                      speak(response.textResponse, {
                          onStart: () => setSpeakingMessageId(msg.id),
                          onEnd: () => setSpeakingMessageId(null),
                      });
                  }
              };
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="bg-gray-800 p-4 rounded-lg max-w-full w-full lg:w-4/5 shadow-md border border-gray-700">
                      <BotResponse response={response} onToggleSpeak={handleToggleSpeak} isSpeaking={isCurrentlySpeaking}/>
                  </div>
                </div>
              );
            }
            if (msg.role === 'error') {
               return <ErrorMessage key={msg.id} message={msg.content as string} />;
            }
            return null;
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                <LoadingSpinner />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>
        
        <footer className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex-shrink-0">
          <div className="max-w-3xl mx-auto space-y-4">
            {error && <ErrorMessage message={error} />}
            <SearchInput
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onSearch={() => handleSendMessage(userInput)}
              isLoading={isLoading}
              isListening={isListening}
              onMicClick={handleMicClick}
            />
             <div className="text-center text-xs text-gray-500">
                Pro Tip: Press{' '}
                <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700 border border-gray-600 rounded-md">Ctrl</kbd>{' '}
                +{' '}
                <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700 border border-gray-600 rounded-md">K</kbd>{' '}
                to open the command palette.
              </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;