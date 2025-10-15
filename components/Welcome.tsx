
import React from 'react';

interface WelcomeProps {
  onExampleClick: (query: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onExampleClick }) => {
  const exampleQueries = [
    "Latest iPhone shipped to Nigeria",
    "Eco-friendly running shoes under $100, available in Europe",
    "Popular Korean skincare with the best reviews"
  ];

  return (
    <div className="text-center p-8 bg-gray-800/30 rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-200">I'm Marketplace AI, your shopping research assistant.</h2>
      <p className="mt-2 text-gray-400">
        I can help you find any product from any online store worldwide. Just tell me what you're looking for.
      </p>
      <div className="mt-6">
        <p className="text-gray-500">Try one of these searches:</p>
        <ul className="mt-2 space-y-2">
          {exampleQueries.map((query, index) => (
            <li key={index}>
              <button
                onClick={() => onExampleClick(query)}
                className="text-purple-400/80 font-mono hover:text-purple-300 hover:bg-purple-900/20 px-3 py-1 rounded-md transition-colors duration-200"
              >
                "{query}"
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Welcome;