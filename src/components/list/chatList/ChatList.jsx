import React, { useState, useEffect } from 'react'
import './chatList.css'

const ChatList = () => {
  return (
    <div className='chatList'>
      <div className='search'>
        <div className='searchBar'>
          <img src='./search.png' alt='' />
          <input type='text' placeholder='搜索' />
        </div>
        <img src='./plus.png' className='add' alt='' />
      </div>
    </div>
  )
}

export default ChatList