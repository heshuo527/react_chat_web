import { create } from "zustand";
import { api } from "./api";

export const useUserStore = create((set, get) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const user = await api.getUserInfo(uid);
      set({ currentUser: user, isLoading: false });
    } catch (error) {
      console.log('fetchUserInfo error:', error);
      set({ currentUser: null, isLoading: false });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ currentUser: data.user, isLoading: false });
      return data;
    } catch (error) {
      console.log('login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await api.register(userData);
      api.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ currentUser: data.user, isLoading: false });
      return data;
    } catch (error) {
      console.log('register error:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => {
    api.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ currentUser: null, isLoading: false });
  },
  updatePrivacySettings: async (privacySettings) => {
    const { currentUser } = get();
    if (!currentUser?.id) return;
    try {
      await api.updateUser(currentUser.id, { privacy: privacySettings });
      set((state) => ({
        currentUser: { ...state.currentUser, privacy: privacySettings }
      }));
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  },
}));
