import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../hooks/useStore.ts';
import { supabase } from '../services/supabase.ts';
import { Message as MessageType, Profile } from '../types.ts';
import Message from './Message.tsx';
import MessageInput from './MessageInput.tsx';
import Spinner from './Spinner.tsx';
import { useUser } from '@clerk/clerk-react';

// Fix: Define the type for the presence state payload to resolve typing errors.
interface TypingPresence {
  is_typing: boolean;
  profile: Profile;
}

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat } = useStore();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Profile[]>([]);
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchMessages = useCallback(async (chatId: number) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages.');
    } else {
      setMessages(data as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    } else {
        setMessages([]);
    }
  }, [selectedChat, fetchMessages]);

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (!selectedChat || !user) return;
    
    const messageChannel = supabase.channel(`public:messages:chat_id=eq.${selectedChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, async (payload) => {
        const newMessageId = payload.new.id;
        const { data, error } = await supabase
          .from('messages')
          .select('*, profiles(*)')
          .eq('id', newMessageId)
          .single();
        
        if (error) {
          console.error('Error fetching new message:', error);
        } else if (data) {
          setMessages((prevMessages) => [...prevMessages, data as any]);
        }
      })
      .subscribe();

    const typingChannel = supabase.channel(`typing:${selectedChat.id}`);

    typingChannel
      .on('presence', { event: 'sync' }, () => {
          const newState = typingChannel.presenceState<TypingPresence>();
          // Fix: Cast to TypingPresence[] to address type inference issue with presence state.
          const typing = (Object.values(newState).flat() as TypingPresence[]).filter(u => u.is_typing).map(u => u.profile);
          setTypingUsers(typing);
      })
      .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
              await typingChannel.track({ is_typing: false, profile: { id: user.id, full_name: user.fullName, avatar_url: user.imageUrl } });
          }
      });

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [selectedChat, user]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Select a chat</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by selecting a chat or creating a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center shadow-sm">
        <button onClick={() => setSelectedChat(null)} className="md:hidden mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? <div className="flex justify-center items-center h-full"><Spinner /></div> : 
        error ? <div className="text-red-500">{error}</div> :
        messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>
       {typingUsers.length > 0 && (
         <div className="px-4 pb-2 text-sm text-gray-500 dark:text-gray-400 italic">
           {typingUsers.map(u => u.full_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
         </div>
       )}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
