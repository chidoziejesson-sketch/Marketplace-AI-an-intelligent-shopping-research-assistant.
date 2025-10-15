
import React from 'react';
import type { EcommerceSource } from '../types';

interface SourceListProps {
  sources: EcommerceSource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <ul className="space-y-4">
        {sources.map((source, index) => (
          <li key={index} className="p-4 bg-gray-800 rounded-md border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-gray-100">{source.platform}</h4>
                <p className="text-sm text-gray-400">{source.region}</p>
              </div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
              >
                Visit Site &rarr;
              </a>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Specialties:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {source.specialties.map((spec, i) => (
                  <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{spec}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourceList;
