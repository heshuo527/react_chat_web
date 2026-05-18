import React, { useState, useEffect } from 'react'
import './detail.css'
import { useUserStore } from '../../lib/userStore'
import { useChatStore } from '../../lib/chatStore'
import { api } from '../../lib/api'

const Detail = ({ onBack }) => {
  const { currentUser, logout, updatePrivacySettings } = useUserStore();
  const { user, chatId } = useChatStore();
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [chatSettings, setChatSettings] = useState({
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    notifications: true,
  });
  const [activePopup, setActivePopup] = useState(null); // 当前打开的弹窗
  const isMobile = window.innerWidth <= 768;

  // 隐私设置选项
  const privacyOptions = {
    lastSeen: [
      { value: 'everyone', label: '所有人' },
      { value: 'contacts', label: '我的联系人' },
      { value: 'nobody', label: '无人' },
    ],
    onlineStatus: [
      { value: 'everyone', label: '所有人' },
      { value: 'contacts', label: '我的联系人' },
      { value: 'nobody', label: '无人' },
    ],
  };

  const getPrivacyLabel = (type, value) => {
    const option = privacyOptions[type]?.find(o => o.value === value);
    return option?.label || value;
  };

  const handlePrivacyChange = async (type, value) => {
    const newPrivacy = {
      ...currentUser.privacy,
      [type]: value
    };
    await updatePrivacySettings(newPrivacy);
    setActivePopup(null);
  };

  const handleReadReceiptToggle = async () => {
    const newPrivacy = {
      ...currentUser.privacy,
      readReceipt: !currentUser.privacy?.readReceipt
    };
    await updatePrivacySettings(newPrivacy);
  };

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activePopup && !e.target.closest('.privacy-popup')) {
        setActivePopup(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activePopup]);

  // 获取共享图片和聊天设置
  useEffect(() => {
    if (chatId) {
      api.getChat(chatId).then(chat => {
        if (chat?.messages) {
          const photos = chat.messages
            .filter(m => m.img)
            .slice(-6)
            .reverse();
          setSharedPhotos(photos);
        }
      }).catch(err => console.log('Failed to get shared photos:', err));

      // 获取当前置顶状态
      api.getUserChats(currentUser.id).then(userChats => {
        const chatItem = userChats?.chats?.find(c => c.chatId === chatId);
        if (chatItem) {
          setChatSettings(prev => ({
            ...prev,
            isPinned: chatItem.isPinned || false,
            isMuted: chatItem.isMuted || false,
          }));
        }
      }).catch(err => console.log('Failed to get chat settings:', err));
    }
  }, [chatId, currentUser.id]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleTogglePin = async () => {
    if (!chatId) return;
    
    const newPinned = !chatSettings.isPinned;
    
    try {
      // 获取当前chats
      const userChats = await api.getUserChats(currentUser.id);
      const chats = userChats?.chats || [];
      const chatIndex = chats.findIndex(c => c.chatId === chatId);
      
      if (chatIndex !== -1) {
        chats[chatIndex].isPinned = newPinned;
        await api.updateUserChats(currentUser.id, chats);
        setChatSettings(prev => ({ ...prev, isPinned: newPinned }));
        
        // 触发chats列表更新
        window.dispatchEvent(new CustomEvent('chatsUpdated'));
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const toggleSetting = (setting) => {
    setChatSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleBlock = async () => {
    if (!user) return;
    
    const newBlocked = chatSettings.isBlocked
      ? (currentUser.blocked || []).filter(id => id !== user._id)
      : [...(currentUser.blocked || []), user._id];
    
    try {
      await api.updateUser(currentUser.id, { blocked: newBlocked });
      setChatSettings(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <div className='detail'>
      {isMobile && (
        <button className='back-btn' onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      <div className='user'>
        <div className='avatar-wrapper'>
          <img src={user?.avatar || "./avatar.png"} alt='' className='avatar' />
          {user?.isOnline && <div className='online-indicator' />}
        </div>
        <h2>{user?.username || "用户"}</h2>
        <p className='status'>{user?.isOnline ? '在线' : '离线'}</p>
      </div>

      <div className='info'>
        {/* 聊天设置 */}
        <div className='option'>
          <div className='title' onClick={() => toggleSection('chatSettings')}>
            <span>聊天设置</span>
            <img src={expandedSection === 'chatSettings' ? './arrowUp.png' : './arrowDown.png'} alt='' />
          </div>
          
          {expandedSection === 'chatSettings' && (
            <div className='settings-content'>
              <div className='setting-item' onClick={handleTogglePin}>
                <div className='setting-left'>
                  <img src='./pin.svg' alt='' />
                  <span>置顶聊天</span>
                </div>
                <div className={`toggle ${chatSettings.isPinned ? 'active' : ''}`}>
                  <div className='toggle-dot' />
                </div>
              </div>
              
              <div className='setting-item' onClick={() => toggleSetting('isMuted')}>
                <div className='setting-left'>
                  <img src='./mute.svg' alt='' />
                  <span>静音</span>
                </div>
                <div className={`toggle ${chatSettings.isMuted ? 'active' : ''}`}>
                  <div className='toggle-dot' />
                </div>
              </div>
              
              <div className='setting-item' onClick={() => toggleSetting('notifications')}>
                <div className='setting-left'>
                  <img src='./bell.svg' alt='' />
                  <span>消息通知</span>
                </div>
                <div className={`toggle ${chatSettings.notifications ? 'active' : ''}`}>
                  <div className='toggle-dot' />
                </div>
              </div>
              
              <div className='setting-item danger' onClick={handleBlock}>
                <div className='setting-left'>
                  <img src='./block.svg' alt='' />
                  <span>{chatSettings.isBlocked ? '解除屏蔽' : '屏蔽用户'}</span>
                </div>
                <img src='./arrowRight.svg' alt='' className='arrow' />
              </div>
            </div>
          )}
        </div>

        {/* 隐私与安全 */}
        <div className='option'>
          <div className='title' onClick={() => toggleSection('privacy')}>
            <span>隐私与安全</span>
            <img src={expandedSection === 'privacy' ? './arrowUp.png' : './arrowDown.png'} alt='' />
          </div>
          
          {expandedSection === 'privacy' && (
            <div className='settings-content'>
              <div className='setting-item'>
                <div className='setting-left'>
                  <img src='./lock.svg' alt='' />
                  <span>聊天加密</span>
                </div>
                <span className='badge'>端到端</span>
              </div>
              
              <div className='setting-item' onClick={(e) => { e.stopPropagation(); setActivePopup(activePopup === 'lastSeen' ? null : 'lastSeen'); }}>
                <div className='setting-left'>
                  <img src='./eye.svg' alt='' />
                  <span>最后上线时间</span>
                </div>
                <span className='value'>{getPrivacyLabel('lastSeen', currentUser?.privacy?.lastSeen || 'everyone')}</span>
                {activePopup === 'lastSeen' && (
                  <div className='privacy-popup'>
                    {privacyOptions.lastSeen.map(option => (
                      <div 
                        key={option.value} 
                        className={`privacy-option ${currentUser?.privacy?.lastSeen === option.value ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handlePrivacyChange('lastSeen', option.value); }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className='setting-item' onClick={(e) => { e.stopPropagation(); setActivePopup(activePopup === 'onlineStatus' ? null : 'onlineStatus'); }}>
                <div className='setting-left'>
                  <img src='./status.svg' alt='' />
                  <span>在线状态</span>
                </div>
                <span className='value'>{getPrivacyLabel('onlineStatus', currentUser?.privacy?.onlineStatus || 'everyone')}</span>
                {activePopup === 'onlineStatus' && (
                  <div className='privacy-popup'>
                    {privacyOptions.onlineStatus.map(option => (
                      <div 
                        key={option.value} 
                        className={`privacy-option ${currentUser?.privacy?.onlineStatus === option.value ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handlePrivacyChange('onlineStatus', option.value); }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className='setting-item' onClick={handleReadReceiptToggle}>
                <div className='setting-left'>
                  <img src='./read.svg' alt='' />
                  <span>已读回执</span>
                </div>
                <div className={`toggle ${currentUser?.privacy?.readReceipt !== false ? 'active' : ''}`}>
                  <div className='toggle-dot' />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 共享媒体 */}
        <div className='option'>
          <div className='title' onClick={() => toggleSection('media')}>
            <span>共享图片 ({sharedPhotos.length})</span>
            <img src={expandedSection === 'media' ? './arrowUp.png' : './arrowDown.png'} alt='' />
          </div>
          
          {expandedSection === 'media' && (
            <div className='photos'>
              {sharedPhotos.length > 0 ? (
                sharedPhotos.map((photo, index) => (
                  <div key={index} className='photoItem'>
                    <div className='photoDetail'>
                      <img src={photo.img} alt='' />
                      <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                    </div>
                    <a href={photo.img} download className='icon'>
                      <img src='./download.png' alt='' />
                    </a>
                  </div>
                ))
              ) : (
                <div className='empty-state'>暂无共享图片</div>
              )}
            </div>
          )}
        </div>

        {/* 关于用户 */}
        <div className='option'>
          <div className='title' onClick={() => toggleSection('about')}>
            <span>关于用户</span>
            <img src={expandedSection === 'about' ? './arrowUp.png' : './arrowDown.png'} alt='' />
          </div>
          
          {expandedSection === 'about' && (
            <div className='settings-content'>
              <div className='about-item'>
                <span className='label'>用户名</span>
                <span className='value'>{user?.username || '-'}</span>
              </div>
              <div className='about-item'>
                <span className='label'>邮箱</span>
                <span className='value'>{user?.email || '-'}</span>
              </div>
              <div className='about-item'>
                <span className='label'>用户ID</span>
                <span className='value user-id'>{user?._id || '-'}</span>
              </div>
            </div>
          )}
        </div>

        <button className='danger-btn' onClick={handleBlock}>
          {chatSettings.isBlocked ? '解除屏蔽' : '屏蔽用户'}
        </button>
        <button className='logout' onClick={handleLogout}>注销</button>
      </div>
    </div>
  )
}

export default Detail
