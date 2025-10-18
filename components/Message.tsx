import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Message as MessageType } from '../types.ts';
import Avatar from './Avatar.tsx';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { user } = useUser();
  const isCurrentUser = message.user_id === user?.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && <Avatar user={message.profiles} />}
      <div className={`flex flex-col max-w-xs md:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">{message.profiles.full_name}</span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-indigo-500 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-md'
          }`}
        >
          {message.content && <p className="text-sm">{message.content}</p>}
          {message.image_url && (
            <a href={message.image_url} target="_blank" rel="noopener noreferrer">
              <img src={message.image_url} alt="Uploaded content" className="mt-2 rounded-lg max-w-full h-auto" />
            </a>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1">{formatDate(message.created_at)}</span>
      </div>
    </div>
  );
};

export default Message;
