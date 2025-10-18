import React, { useEffect } from 'react';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { supabase } from './services/supabase.ts';
import Auth from './components/Auth.tsx';
import Sidebar from './components/Sidebar.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import { useStore } from './hooks/useStore.ts';

const App: React.FC = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const selectedChat = useStore((state) => state.selectedChat);

  useEffect(() => {
    const setSupabaseAuth = async () => {
      if (user) {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: '' // Clerk handles refresh
          });
          
          // Upsert user profile
          const { data, error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: user.fullName || user.emailAddresses[0].emailAddress,
              avatar_url: user.imageUrl,
            });

          if (error) {
            console.error('Error upserting profile:', error);
          }
        }
      }
    };

    setSupabaseAuth();
  }, [user, getToken]);

  return (
    <div className="h-screen w-screen flex flex-col text-gray-800 dark:text-gray-200">
      <SignedOut>
        <Auth />
      </SignedOut>
      <SignedIn>
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar />
          <div className={`flex-1 flex flex-col transition-transform duration-300 ease-in-out md:transform-none ${selectedChat ? 'transform-none' : 'transform-translateX-full md:transform-none'}`}>
             <ChatWindow />
          </div>
        </div>
      </SignedIn>
    </div>
  );
};

export default App;
