import React from 'react';

interface WelcomeProps {
  onExampleClick: (query: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onExampleClick }) => {
  const exampleQueries = [
    "Houses for sale in Doncaster, UK",
    "Eco-friendly running shoes under $100, available in Europe",
    "Find a freelance graphic designer for a logo"
  ];

  return (
    <div className="w-full max-w-4xl text-center animate-fade-in-up">
      <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        Marketplace AI
      </h2>
      <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
        Your universal research assistant for anything on the internet—products, properties, services, and more.
      </p>
      <div className="mt-12">
        <p className="text-slate-500">Try one of these searches:</p>
        <ul className="mt-4 space-y-3">
          {exampleQueries.map((query, index) => (
            <li key={index}>
              <button
                onClick={() => onExampleClick(query)}
                className="text-lg text-violet-400 hover:text-violet-300 transition-colors duration-200 font-mono"
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