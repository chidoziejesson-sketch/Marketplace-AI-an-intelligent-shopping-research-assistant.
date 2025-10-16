import React from 'react';
import type { ChatMessage, GeminiResponse, GroundingSource } from '../types';
import ProductCard from './ProductCard';
import SourceList from './SourceList';
import WebSources from './WebSources';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerIcon } from './SpeakerIcon';
import LoadingSpinner from './LoadingSpinner';

// Component for displaying the user's message
export const UserMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-end">
    <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-2xl rounded-br-none p-4 max-w-2xl shadow-lg">
      <p>{message}</p>
    </div>
  </div>
);

// Component for displaying the AI model's response
export const BotResponse: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const { isSpeaking, speak, cancel } = useSpeechSynthesis();
  
  const result = message.content as GeminiResponse;
  const groundingSources = message.groundingSources || [];
  const isLoading = message.isLoading || false;

  const products = result.products || [];
  const sources = result.sources || [];
  const displaySummary = result.summary;

  const hasContent = products.length > 0 || sources.length > 0 || displaySummary;

  if (isLoading && !hasContent) {
    return (
        <div className="flex justify-start">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl rounded-bl-none p-4 max-w-2xl w-full">
                <LoadingSpinner />
            </div>
        </div>
    );
  }

  return (
    <div className="flex justify-start">
        <div className="relative bg-gradient-to-br from-slate-700/60 to-slate-800/60 p-[1px] rounded-2xl rounded-bl-none max-w-4xl w-full shadow-lg">
          <div className="bg-slate-800/70 backdrop-blur-md rounded-[15px] p-4 space-y-6">
            {displaySummary && (
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold text-slate-100">AI Overview</h3>
                  <button onClick={() => isSpeaking ? cancel() : speak(displaySummary)} aria-label={isSpeaking ? 'Stop speaking' : 'Read summary aloud'}>
                    <SpeakerIcon isSpeaking={isSpeaking} />
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {displaySummary}
                  {isLoading && <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse"></span>}
                </p>
              </div>
            )}

            {products.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-4">Products & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={index} product={product} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {sources.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-4">Recommended Marketplaces</h3>
                  <SourceList sources={sources} />
                </div>
              )}

              {groundingSources.length > 0 && (
                <WebSources sources={groundingSources} />
              )}
            </div>
          </div>
        </div>
    </div>
  );
};