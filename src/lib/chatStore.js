import { create } from "zustand";
import { api } from "./api";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: "",
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  incomingCall: null, // 全局来电信息
  callStatus: 'idle', // idle, calling, incoming, active, ended
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    if (user.blocked?.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    } else if (user.blocked?.includes(user._id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },
  changeBlock: () => {
    set((state) => ({
      ...state,
      isCurrentUserBlocked: !state.isCurrentUserBlocked,
    }));
  },
  setIncomingCall: (call) => set({ incomingCall: call }),
  setCallStatus: (status) => set({ callStatus: status }),
  clearIncomingCall: () => set({ incomingCall: null, callStatus: 'idle' }),
}));
