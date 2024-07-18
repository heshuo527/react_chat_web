import React, { useState, useEffect } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";

import { db } from "../../../lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [addModal, setAddModal] = useState(false);
  const [chats, setChats] = useState([]);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "user", item.receiverId);
          const useDocSnap = await getDoc(userDocRef);
          const user = useDocSnap.data();
          return { ...item, user };
        });

        const chantData = await Promise.all(promises);
        setChats(chantData.sort((a, b) => b.updateAt - a.updateAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((p) => {
      const { user, ...rest } = p;
      return rest;
    });

    const chatIndex = userChats.findIndex((p) => p.chatId === chat.chatId);
    console.log('🚀 _ file: ChatList.jsx:47 _ chatIndex:', chatIndex);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log("🚀 _ file: ChatList.jsx:58 _ error:", error);
    }

    // const userChatsRef = doc(db, "userchats", currentUser.id);
    // const userChantsSnapshot = await getDoc(userChatsRef);

    // if (userChantsSnapshot.exists()) {
    //   const userChatsData = userChantsSnapshot.data();
    //   const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

    //   userChatsData.chats[chatIndex].lastMessage = text;
    //   userChatsData.chats[chatIndex].isSeen = true;

    //   await updateDoc(userChatsRef, {
    //     chats: userChatsData.chats,
    //   });
    // }
  };

  console.log('chats:::::', chats);

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="搜索" />
        </div>
        <img
          src={addModal ? "./minus.png" : "./plus.png"}
          className="add"
          alt=""
          onClick={() => setAddModal((pre) => !pre)}
        />
      </div>
      {chats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img src={chat.user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{chat.user?.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addModal && <AddUser />}
    </div>
  );
};

export default ChatList;
