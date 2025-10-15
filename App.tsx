
import React, { useState, useCallback } from 'react';
import type { ApiResponse } from './types';
import { generateMarketplaceResponse } from './services/geminiService';
import SearchInput from './components/SearchInput';
import ProductCard from './components/ProductCard';
import SourceList from './components/SourceList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Welcome from './components/Welcome';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await generateMarketplaceResponse(searchQuery);
      setApiResponse(response);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response from Gemini. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExampleClick = useCallback((query: string) => {
    setUserInput(query);
    handleSearch(query);
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Marketplace AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">Your AI-powered shopping companion</p>
        </header>

        <main>
          <div className="max-w-3xl mx-auto">
            <SearchInput
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onSearch={() => handleSearch(userInput)}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-10">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            
            {!isLoading && !error && !apiResponse && <Welcome onExampleClick={handleExampleClick} />}

            {apiResponse && (
              <div className="space-y-12">
                <div>
                  <h2 className="text-2xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">Assistant's Response</h2>
                  <p className="text-gray-300 leading-relaxed bg-gray-800/50 p-4 rounded-lg">{apiResponse.textResponse}</p>
                </div>

                {apiResponse.products && apiResponse.products.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">Recommended Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {apiResponse.products.map((product, index) => (
                        <ProductCard key={index} product={product} />
                      ))}
                    </div>
                  </div>
                )}
                
                {apiResponse.ecommerceSources && apiResponse.ecommerceSources.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">E-commerce Sources</h2>
                    <SourceList sources={apiResponse.ecommerceSources} />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;