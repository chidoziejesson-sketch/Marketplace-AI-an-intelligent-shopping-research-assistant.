import React from 'react';
import type { GroundingSource } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface WebSourcesProps {
  sources: GroundingSource[];
}

const WebSources: React.FC<WebSourcesProps> = ({ sources }) => {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-300 mb-3">
        Information Sourced From The Web:
      </h3>
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-sm text-violet-400/80 hover:text-violet-300 hover:underline transition-colors flex items-center"
            >
              <span>{source.title}</span>
              <ExternalLinkIcon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebSources;