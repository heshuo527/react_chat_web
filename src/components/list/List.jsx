import React, { useState, useEffect } from 'react'
import './list.css'
import UserInfo from './userInfo/UserInfo'
import ChatList from './chatList/ChatList'
import FriendRequests from './friendRequests/FriendRequests'
import { api } from '../../lib/api';
import { useUserStore } from '../../lib/userStore';

const List = ({ onOpenSettings }) => {
  const [hasFriendRequests, setHasFriendRequests] = useState(false);
  const { currentUser } = useUserStore();

  const handleRequestAccepted = async () => {
    // Refresh chats after accepting a friend request
    if (currentUser?.id) {
      try {
        await api.getUserChats(currentUser.id);
        // Trigger ChatList refresh via event
        window.dispatchEvent(new CustomEvent('chatsUpdated'));
      } catch (error) {
        console.error('Refresh chats error:', error);
      }
    }
  };

  return (
    <div className='list'>
      <UserInfo onOpenSettings={onOpenSettings} />
      <ChatList />
      <FriendRequests onRequestAccepted={handleRequestAccepted} />
    </div>
  )
}

export default List