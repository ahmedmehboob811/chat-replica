import { create } from 'zustand';
import { Chat } from '../types.ts';

interface AppState {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));
