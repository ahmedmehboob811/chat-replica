import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../services/supabase.ts';
import { useStore } from '../hooks/useStore.ts';

const MessageInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { selectedChat } = useStore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fix: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout.
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const channelRef = useRef(selectedChat ? supabase.channel(`typing:${selectedChat.id}`) : null);

  useEffect(() => {
    // Re-initialize channel if selectedChat changes
    if (selectedChat) {
        if(channelRef.current && channelRef.current.topic !== `typing:${selectedChat.id}`) {
            channelRef.current.unsubscribe();
        }
        channelRef.current = supabase.channel(`typing:${selectedChat.id}`);
        channelRef.current.subscribe();
    }
    return () => {
        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }
    }
  }, [selectedChat]);


  const handleTyping = () => {
    if (channelRef.current?.state === 'joined') {
      channelRef.current.track({ is_typing: true, profile: { id: user?.id, full_name: user?.fullName, avatar_url: user?.imageUrl }});
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current?.state === 'joined') {
          channelRef.current.track({ is_typing: false, profile: { id: user?.id, full_name: user?.fullName, avatar_url: user?.imageUrl }});
        }
      }, 3000);
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedChat || !user) return;

    const { error } = await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      user_id: user.id,
      content: content.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    } else {
      setContent('');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channelRef.current?.state === 'joined') {
        channelRef.current.track({ is_typing: false, profile: { id: user?.id, full_name: user?.fullName, avatar_url: user?.imageUrl }});
      }
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedChat || !user) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${selectedChat.id}/${fileName}`;

    setIsUploading(true);
    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      alert('Failed to upload image.');
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    const { error: messageError } = await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      user_id: user.id,
      image_url: data.publicUrl,
    });
    
    setIsUploading(false);
    if (messageError) {
      console.error('Error sending image message:', messageError);
      alert('Failed to send image message.');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
         <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {isUploading ? (
            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          )}
        </button>
        <input
          type="text"
          value={content}
          onChange={(e) => { setContent(e.target.value); handleTyping(); }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="p-2 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
