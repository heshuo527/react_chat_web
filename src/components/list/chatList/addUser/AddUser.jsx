import React, { useState } from "react";
import "./addUser.css";
import { useUserStore } from '../../../../lib/userStore';
import { api } from '../../../../lib/api';

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const users = await api.getAllUsers();
      const foundUser = users.find(u => u.username === username);
      if (foundUser) {
        setUser(foundUser);
      }
    } catch (error) {
      console.log("Search user error:", error);
    }
  };

  const handleAddUser = async () => {
    if (!user || !currentUser) return;

    try {
      // Create or get existing chat
      const chat = await api.getOrCreateChat(currentUser.id, user.id);

      const chatDetailsForUser = {
        chatId: chat._id,
        lastMessage: '',
        receiverId: user.id,
        updatedAt: Date.now()
      };

      const chatDetailsForCurrentUser = {
        chatId: chat._id,
        lastMessage: '',
        receiverId: currentUser.id,
        updatedAt: Date.now()
      };

      // Get existing user chats
      const userChats = await api.getUserChats(user.id);
      const currentUserChats = await api.getUserChats(currentUser.id);

      // Update user's chat list
      const userChatsList = userChats.chats || [];
      if (!userChatsList.find(c => c.chatId === chat._id)) {
        userChatsList.push(chatDetailsForUser);
        await api.updateUserChats(user.id, userChatsList);
      }

      // Update current user's chat list
      const currentUserChatsList = currentUserChats.chats || [];
      if (!currentUserChatsList.find(c => c.chatId === chat._id)) {
        currentUserChatsList.push(chatDetailsForCurrentUser);
        await api.updateUserChats(currentUser.id, currentUserChatsList);
      }

    } catch (error) {
      console.log('Add user error:', error);
    }
  }

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && <div className="user">
        <div className="detail">
          <img src={user.avatar || "./avatar.png"} alt="" />
          <span>{user.username}</span>
        </div>
        <button onClick={handleAddUser}>添加用户</button>
      </div>}
    </div>
  );
};

export default AddUser;
