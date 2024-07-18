import React, { useState, useEffect } from 'react'
import './userInfo.css'
import { useUserStore } from '../../../lib/userStore';

const UserInfo = () => {

  const { currentUser } = useUserStore();
  console.log('🚀 _ file: UserInfo.jsx:8 _ currentUser:', currentUser);
  return (
    <div className='userInfo'>
      <div className='user'>
        <img src={currentUser.avatar || './avatar.png'} alt='' />
        <h2>{currentUser.username}</h2>
      </div>
      <div className='icons'>
        <img src='./more.png' alt='' />
        <img src='./video.png' alt='' />
        <img src='./edit.png' alt='' />
      </div>
    </div>
  )
}

export default UserInfo