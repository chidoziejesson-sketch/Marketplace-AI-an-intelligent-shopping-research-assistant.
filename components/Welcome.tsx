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
    <div className="w-full max-w-4xl text-center animate-fade-in">
      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100">
        I'm Marketplace AI, your universal research assistant.
      </h2>
      <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
        I can help you find anything that can be bought on the internet—products, properties, services, and more.
      </p>
      <div className="mt-12">
        <p className="text-slate-500">Try one of these searches:</p>
        <ul className="mt-4 space-y-3">
          {exampleQueries.map((query, index) => (
            <li key={index}>
              <button
                onClick={() => onExampleClick(query)}
                className="text-lg text-violet-300 font-mono hover:text-violet-200 transition-colors duration-200"
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