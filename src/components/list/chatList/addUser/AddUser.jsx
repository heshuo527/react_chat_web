import React, { useState } from "react";
import "./addUser.css";
import { useUserStore } from '../../../../lib/userStore';
import { api } from '../../../../lib/api';

const AddUser = ({ onAddSuccess, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useUserStore();

  const handleClose = () => {
    if (onClose) onClose();
  };

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
    setError("");
    try {
      await api.sendFriendRequest(currentUser.id, user.id);
      
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
      <button className="closeBtn" onClick={handleClose}>×</button>
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
          {loading ? "发送中..." : "发送好友申请"}
        </button>
      </div>}
    </div>
  );
};

export default AddUser;
