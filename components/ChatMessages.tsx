import React from 'react';
import type { ChatMessage, GeminiResponse } from '../types';
import ProductCard from './ProductCard';
import SourceList from './SourceList';
import WebSources from './WebSources';
import { SpeakerIcon } from './SpeakerIcon';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

// Component for displaying the user's message
export const UserMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex justify-end">
    <div className="bg-violet-600 text-white rounded-lg rounded-br-none p-3 max-w-2xl">
      <p>{content}</p>
    </div>
  </div>
);

// Component for displaying the bot's response
interface BotResponseProps {
  response: ChatMessage;
}
export const BotResponse: React.FC<BotResponseProps> = ({ response }) => {
  const { isSpeaking, speak, cancel } = useSpeechSynthesis();
  
  if (response.isLoading || !response.content || typeof response.content === 'string') {
    return null; // or a loading skeleton for the bot message
  }

  const result = response.content as GeminiResponse;
  const groundingSources = response.groundingSources || [];

  const hasResults = result.products.length > 0 || result.sources.length > 0;

  return (
    <div className="flex justify-start">
      <div className="bg-slate-800 rounded-lg rounded-bl-none p-4 max-w-4xl w-full animate-fade-in space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Summary</h2>
            <button onClick={() => isSpeaking ? cancel() : speak(result.summary)} aria-label={isSpeaking ? 'Stop speaking' : 'Read summary aloud'}>
              <SpeakerIcon isSpeaking={isSpeaking} />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
        </div>

        {result.products.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">Products & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {result.sources.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">Recommended Marketplaces</h2>
              <SourceList sources={result.sources} />
            </div>
          )}
          
          {groundingSources.length > 0 && (
             <WebSources sources={groundingSources} />
          )}
        </div>
        
         {!hasResults && (
            <div className="text-center py-10">
              <p className="text-slate-400">No specific products or sources were found for your query.</p>
              <p className="text-slate-500 text-sm mt-2">Try being more specific or broadening your search terms.</p>
            </div>
        )}
      </div>
    </div>
  );
};