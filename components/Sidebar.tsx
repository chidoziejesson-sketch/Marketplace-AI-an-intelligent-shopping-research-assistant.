import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-72 bg-gray-950 p-6 flex-shrink-0 border-r border-gray-800 hidden md:flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Marketplace AI Chat
        </h1>
        <p className="mt-2 text-sm text-gray-400">Your AI-powered shopping companion</p>
      </div>
      <div className="flex-grow"></div>
      <div className="mt-8 text-xs text-gray-600 flex-shrink-0">
        <p>&copy; {new Date().getFullYear()} Marketplace AI</p>
      </div>
    </aside>
  );
};

export default Sidebar;
