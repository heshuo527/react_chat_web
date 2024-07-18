import { bundlerModuleNameResolver } from "typescript";
import { create } from "zustand";
import { db } from "./firebase";
import { getDoc, doc } from "firebase/firestore";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: "",
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // isCurrentUserBlocked
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    } else if (user.blocked.includes(user.id)) {
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
}));
