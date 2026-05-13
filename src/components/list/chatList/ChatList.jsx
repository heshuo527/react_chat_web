import React, { useState, useEffect } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { api } from "../../../lib/api";

const ChatList = () => {
  const [addModal, setAddModal] = useState(false);
  const [chats, setChats] = useState([]);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchChats = async () => {
      try {
        const userChats = await api.getUserChats(currentUser.id);
        const items = userChats.chats || [];

        const promises = items
          .filter(item => item.receiverId)  // Filter out invalid items
          .map(async (item) => {
            const user = await api.getUserInfo(item.receiverId);
            return { ...item, user };
          });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error('Fetch chats error:', error);
      }
    };

    fetchChats();

    // Poll for new chats every 3 seconds
    const interval = setInterval(fetchChats, 3000);

    // Listen for chats updates (e.g., when friend request is accepted)
    const handleChatsUpdated = () => {
      fetchChats();
    };

    window.addEventListener('chatsUpdated', handleChatsUpdated);
    return () => {
      window.removeEventListener('chatsUpdated', handleChatsUpdated);
      clearInterval(interval);
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    try {
      const userChats = await api.getUserChats(currentUser.id);
      const chats = userChats.chats || [];
      const chatIndex = chats.findIndex((p) => p.chatId === chat.chatId);

      if (chatIndex !== -1) {
        chats[chatIndex].isSeen = true;
        chats[chatIndex].unreadCount = 0;
        await api.updateUserChats(currentUser.id, chats);
      }

      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log("Select chat error:", error);
    }
  };

  const handleAddSuccess = () => {
    // Refresh chats list after adding a friend
    const refreshChats = async () => {
      try {
        const userChats = await api.getUserChats(currentUser.id);
        const items = userChats.chats || [];

        const promises = items
          .filter(item => item.receiverId)  // Filter out invalid items
          .map(async (item) => {
            const user = await api.getUserInfo(item.receiverId);
            return { ...item, user };
          });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error('Refresh chats error:', error);
      }
    };
    refreshChats();
    setAddModal(false);
  };

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
          <div className="avatarContainer">
            <img src={chat.user?.avatar || "./avatar.png"} alt="" />
            {!chat.isSeen && chat.unreadCount > 0 && (
              <span className="unreadBadge">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span>
            )}
          </div>
          <div className="texts">
            <span>{chat.user?.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addModal && <AddUser onAddSuccess={handleAddSuccess} onClose={() => setAddModal(false)} />}
    </div>
  );
};

export default ChatList;
