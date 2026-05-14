import React, { useState } from 'react'
import './userInfo.css'
import { useUserStore } from '../../../lib/userStore';
import { api } from '../../../lib/api';
import upload from '../../../lib/upload';

const UserInfo = ({ onOpenSettings }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, fetchUserInfo, logout } = useUserStore();

  const handleEditClick = () => {
    setAvatar({ file: null, url: currentUser?.avatar || '' });
    setUsername(currentUser?.username || '');
    setShowEditModal(true);
    setShowMoreMenu(false);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      })
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      let imgUrl = currentUser.avatar; // Keep original avatar by default
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      await api.updateUser(currentUser.id, {
        username,
        avatar: imgUrl
      });

      await fetchUserInfo(currentUser.id);
      setShowEditModal(false);
    } catch (error) {
      console.error('Update user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowMoreMenu(false);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  return (
    <div className='userInfo'>
      <div className='user'>
        <img src={currentUser?.avatar || './avatar.png'} alt='' />
        <h2>{currentUser?.username}</h2>
      </div>
      <div className='icons'>
        {showMoreMenu && (
          <div className='moreMenu'>
            <button onClick={handleEditClick}>编辑资料</button>
            <button onClick={handleLogout} className='logoutBtn'>退出登录</button>
          </div>
        )}
        <img src='./more.png' alt='' onClick={handleMoreClick} />
        <img src='./video.png' alt='' />
        <img src='./edit.png' alt='' onClick={handleEditClick} />
      </div>

      {showEditModal && (
        <div className='editModal'>
          <div className='editContent'>
            <h3>编辑个人资料</h3>
            <div className='avatar-edit'>
              <img src={avatar.url || './avatar.png'} alt='' />
              <label htmlFor='avatar-input'>
                <span>更换头像</span>
                <input
                  id='avatar-input'
                  type='file'
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className='form-group'>
              <label>用户名</label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='输入用户名'
              />
            </div>
            <div className='buttons'>
              <button onClick={() => setShowEditModal(false)}>取消</button>
              <button onClick={handleSave} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserInfo
