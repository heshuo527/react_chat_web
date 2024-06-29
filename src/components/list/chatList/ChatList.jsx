import React, { useState, useEffect } from 'react'
import './chatList.css'

const ChatList = () => {
  const [addModal, setAddModal] = useState(false);
  return (
    <div className='chatList'>
      <div className='search'>
        <div className='searchBar'>
          <img src='./search.png' alt='' />
          <input type='text' placeholder='搜索' />
        </div>
        <img src={addModal ? './minus.png' : './plus.png'} className='add' alt='' onClick={() => setAddModal(pre => !pre)} />
      </div>
      <div className='item'>
        <img src='./avatar.png' alt='' />
        <div className='texts'>
          <span>张三</span>
          <p>你好</p>
        </div>
      </div>
      <div className='item'>
        <img src='./avatar.png' alt='' />
        <div className='texts'>
          <span>张三</span>
          <p>你好</p>
        </div>
      </div>
      <div className='item'>
        <img src='./avatar.png' alt='' />
        <div className='texts'>
          <span>张三</span>
          <p>你好</p>
        </div>
      </div>
      <div className='item'>
        <img src='./avatar.png' alt='' />
        <div className='texts'>
          <span>张三</span>
          <p>你好</p>
        </div>
      </div>
      <div className='item'>
        <img src='./avatar.png' alt='' />
        <div className='texts'>
          <span>张三</span>
          <p>你好</p>
        </div>
      </div>
    </div>
  )
}

export default ChatList