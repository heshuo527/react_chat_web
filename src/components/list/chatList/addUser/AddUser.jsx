import React, { useState, useEffect } from 'react'
import './addUser.css'

const AddUser = () => {
  return (
    <div className='addUser'>
      <form>
        <input type='text' placeholder='Username' name='username' />
        <button>Search</button>
      </form>
      <div className='user'>
        <div className='detail'>
          <img src='./avatar.png' alt='' />
          <span>李四</span>
        </div>
        <button>添加用户</button>
      </div>
    </div>
  )
}

export default AddUser