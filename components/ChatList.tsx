import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase.ts';
import { useStore } from '../hooks/useStore.ts';
import { Chat } from '../types.ts';
import Spinner from './Spinner.tsx';
import { useUser } from '@clerk/clerk-react';

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedChat, setSelectedChat } = useStore();
  const { user } = useUser();

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats.');
    } else {
      setChats(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChats();

    const channel = supabase.channel('public:chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchChats]);

  const handleCreateChat = async () => {
    const chatName = prompt('Enter a new chat name:');
    if (chatName && user) {
      const { data, error } = await supabase
        .from('chats')
        .insert({ name: chatName, created_by: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        alert('Failed to create chat.');
      } else if (data) {
        setSelectedChat(data);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col">
       <div className="p-2">
        <button
          onClick={handleCreateChat}
          className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300"
        >
          + New Chat
        </button>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`p-4 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition duration-150 ${
              selectedChat?.id === chat.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''
            }`}
          >
            <div className="font-semibold text-gray-800 dark:text-gray-100">{chat.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Click to open</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
