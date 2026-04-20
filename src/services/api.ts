import axios from 'axios';
import { Turf, Match, Message, User, useStore } from '../store/useStore';

// In development, Vite proxies /api → http://localhost:3001
// In production, Express serves both the API and the static build
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // ── Auth APIs ──────────────────────────────────────────────
  async login(credentials: any): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/users/login', credentials);
    return data;
  },

  async signup(userData: any): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/users/signup', userData);
    return data;
  },

  // ── Turf APIs ──────────────────────────────────────────────
  async getFeaturedTurfs(): Promise<Turf[]> {
    const { data } = await api.get('/turfs/featured');
    return data;
  },

  async getAllTurfs(): Promise<Turf[]> {
    const { data } = await api.get('/turfs');
    return data;
  },

  async getTurfById(id: string): Promise<Turf | null> {
    try {
      const { data } = await api.get(`/turfs/${id}`);
      return data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  // ── Match APIs ─────────────────────────────────────────────
  async getUpcomingMatches(): Promise<Match[]> {
    const { data } = await api.get('/matches');
    return data;
  },

  async createMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const { data } = await api.post('/matches', match);
    return data;
  },

  async joinMatch(matchId: string, userId: string): Promise<boolean> {
    const { data } = await api.post(`/matches/${matchId}/join`, { userId });
    return !!data;
  },

  // ── Booking APIs ───────────────────────────────────────────
  async createBooking(booking: { turfId: string; date: string; time: string; userId?: string }): Promise<boolean> {
    const { data } = await api.post('/bookings', booking);
    return !!data;
  },

  // ── Chat APIs ──────────────────────────────────────────────
  async getMessages(matchId: string): Promise<Message[]> {
    const { data } = await api.get(`/messages/${matchId}`);
    return data;
  },

  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const { data } = await api.post('/messages', message);
    return data;
  },
};