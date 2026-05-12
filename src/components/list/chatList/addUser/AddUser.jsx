import React, { useState } from "react";
import "./addUser.css";
import { useUserStore } from '../../../../lib/userStore';
import { api } from '../../../../lib/api';

const AddUser = ({ onAddSuccess }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setUser(null);
    const formData = new FormData(e.target);
    const username = formData.get("username");

    if (!username.trim()) return;

    try {
      const users = await api.getAllUsers();
      const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (foundUser) {
        setUser(foundUser);
      } else {
        setError("用户不存在");
      }
    } catch (error) {
      console.log("Search user error:", error);
      setError("搜索失败");
    }
  };

  const handleAddUser = async () => {
    if (!user || !currentUser) return;

    setLoading(true);
    try {
      // Check if chat already exists
      const existingChats = await api.getUserChats(currentUser.id);
      const existingChat = (existingChats.chats || []).find(c => c.receiverId === user.id);
      
      if (existingChat) {
        setError("已经是好友了");
        setLoading(false);
        return;
      }

      // Create new chat
      const chat = await api.getOrCreateChat(currentUser.id, user.id);

      const chatDetailsForCurrentUser = {
        chatId: chat._id,
        lastMessage: '',
        receiverId: user.id,
        updatedAt: Date.now()
      };

      // Update current user's chat list
      const currentUserChats = await api.getUserChats(currentUser.id);
      const currentUserChatsList = currentUserChats.chats || [];
      currentUserChatsList.push(chatDetailsForCurrentUser);
      await api.updateUserChats(currentUser.id, currentUserChatsList);

      // Notify parent to refresh
      if (onAddSuccess) {
        onAddSuccess();
      }

      // Reset state and close
      setUser(null);
      setError("");
      
    } catch (error) {
      console.log('Add user error:', error);
      setError("添加失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="输入用户名搜索" name="username" />
        <button type="submit">搜索</button>
      </form>
      {error && <p className="error">{error}</p>}
      {user && <div className="user">
        <div className="detail">
          <img src={user.avatar || "./avatar.png"} alt="" />
          <span>{user.username}</span>
        </div>
        <button onClick={handleAddUser} disabled={loading}>
          {loading ? "添加中..." : "添加好友"}
        </button>
      </div>}
    </div>
  );
};

export default AddUser;
