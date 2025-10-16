import React from 'react';
import type { ChatMessage } from '../types';
import { UserMessage, BotResponse } from './ChatMessages';

interface ChatHistoryProps {
    history: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
    return (
        <div className="space-y-6">
            {history.map((message) => (
                <div key={message.id} className="animate-fade-in-up">
                    {message.role === 'user' && <UserMessage message={message.content as string} />}
                    {message.role === 'model' && <BotResponse message={message} />}
                </div>
            ))}
        </div>
    );
};

export default ChatHistory;