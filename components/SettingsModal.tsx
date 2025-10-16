import React, { useState, useEffect } from 'react';
import type { UserPreferences } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: UserPreferences;
  onSave: (newPreferences: UserPreferences) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentPreferences, onSave }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(currentPreferences);

  useEffect(() => {
    if (isOpen) {
      setPrefs(currentPreferences);
    }
  }, [isOpen, currentPreferences]);

  const handleSave = () => {
    onSave(prefs);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10 mx-4">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <p className="mt-1 text-sm text-slate-400">Personalize your assistant's responses.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-300">Language</label>
            <input
              id="language"
              type="text"
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              placeholder="e.g., en-US"
            />
          </div>
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-slate-300">Region</label>
            <input
              id="region"
              type="text"
              value={prefs.region}
              onChange={(e) => setPrefs({ ...prefs, region: e.target.value })}
              className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              placeholder="e.g., USA"
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-300">Currency</label>
            <input
              id="currency"
              type="text"
              value={prefs.currency}
              onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
              className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              placeholder="e.g., USD"
            />
          </div>
        </div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;