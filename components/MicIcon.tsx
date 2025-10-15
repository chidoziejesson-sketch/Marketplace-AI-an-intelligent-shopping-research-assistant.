import React from 'react';

interface MicIconProps {
  isListening: boolean;
}

export const MicIcon: React.FC<MicIconProps> = ({ isListening }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm-1 4a4 4 0 108 0V4a4 4 0 10-8 0v4zM10 15a1 1 0 001-1v-2.065a5.034 5.034 0 003-4.22V4a1 1 0 10-2 0v3.714A3.033 3.033 0 0110 11a3.033 3.033 0 01-2-1.286V4a1 1 0 10-2 0v3.714a5.034 5.034 0 003 4.22V14a1 1 0 001 1z" 
      clipRule="evenodd" 
    />
    <path d="M4.5 9.5a.5.5 0 01.5.5v1a5 5 0 0010 0v-1a.5.5 0 011 0v1a6 6 0 01-5 5.92V18h1.5a.5.5 0 010 1h-4a.5.5 0 010-1H8v-1.58A6 6 0 013 11.5v-1a.5.5 0 01.5-.5z" />
  </svg>
);
