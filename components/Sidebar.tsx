import React from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import ChatList from './ChatList.tsx';
import { useStore } from '../hooks/useStore.ts';

const Sidebar: React.FC = () => {
  const { user } = useUser();
  const selectedChat = useStore((state) => state.selectedChat);
  
  return (
    <div className={`w-full md:w-1/3 lg:w-1/4 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{user?.fullName || 'User'}</h2>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
        Supabase Chat
      </footer>
    </div>
  );
};

export default Sidebar;
