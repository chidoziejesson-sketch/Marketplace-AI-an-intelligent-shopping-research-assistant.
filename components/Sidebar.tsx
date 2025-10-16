import React from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { CogIcon } from './icons/CogIcon';

interface SidebarProps {
  onNewSearch: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewSearch, onOpenSettings }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 p-4 border-r border-slate-800">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
          Marketplace AI
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your universal research assistant.</p>
      </div>
      <nav>
        <ul className='space-y-2'>
          <li>
            <button
              onClick={onNewSearch}
              className="flex items-center gap-3 w-full text-left p-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <TrashIcon />
              <span>New Search</span>
            </button>
          </li>
          <li>
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-3 w-full text-left p-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <CogIcon />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="mt-auto text-xs text-slate-500 text-center">
        <p>© {new Date().getFullYear()} Marketplace AI</p>
      </div>
    </aside>
  );
};

export default Sidebar;
