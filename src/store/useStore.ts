import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  gamesPlayed: number;
  badges: string[];
  points: number;
}

export interface Turf {
  id: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  images: string[];
  amenities: string[];
  available: boolean;
}

export interface Match {
  id: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Pro';
  playersNeeded: number;
  currentPlayers: number;
  createdBy: string;
  participants: string[];
}

export interface Message {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface Store {
  // Auth state
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  
  // Turfs state
  turfs: Turf[];
  featuredTurfs: Turf[];
  setTurfs: (turfs: Turf[]) => void;
  setFeaturedTurfs: (turfs: Turf[]) => void;
  
  // Matches state
  matches: Match[];
  upcomingMatches: Match[];
  userMatches: Match[];
  setMatches: (matches: Match[]) => void;
  setUpcomingMatches: (matches: Match[]) => void;
  setUserMatches: (matches: Match[]) => void;
  
  // Chat state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  
  // UI state
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      
      // Turfs state
      turfs: [],
      featuredTurfs: [],
      setTurfs: (turfs) => set({ turfs }),
      setFeaturedTurfs: (turfs) => set({ featuredTurfs: turfs }),
      
      // Matches state
      matches: [],
      upcomingMatches: [],
      userMatches: [],
      setMatches: (matches) => set({ matches }),
      setUpcomingMatches: (matches) => set({ upcomingMatches: matches }),
      setUserMatches: (matches) => set({ userMatches: matches }),
      
      // Chat state
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      
      // UI state
      loading: false,
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'sportsy-storage',
      // Only persist auth-related data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);