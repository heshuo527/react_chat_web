import React, { useState, useEffect } from 'react'
import './login.css'
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Login = () => {

  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      })
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);
    console.log('🚀 _ file: Login.jsx:26 _ useÒzrname:', username, email, password);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'user', res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: [],
      })

      await setDoc(doc(db, 'userchats', res.user.uid), {
        chats: [],
      })

      toast.success('创建成功!')
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  };

  return (
    <div className='login'>
      <div className='item'>
        <h2>欢迎回来</h2>
        <form onSubmit={handleLogin}>
          <input type='text' placeholder='Email' name='email' />
          <input type='password' placeholder='Password' name='password' />
          <button>登陆</button>
        </form>
      </div>
      <div className='separator'></div>
      <div className='item'>
        <h2>创建用户</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor='file'>
            <img src={avatar.url || './avatar.png'} alt='' />
            上传头像
          </label>
          <input type='file' id='file' style={{ display: 'none' }} onChange={handleAvatar} />
          <input type='text' placeholder='Username' name='username' />
          <input type='text' placeholder='Email' name='email' />
          <input type='password' placeholder='Password' name='password' />
          <button>注册</button>
        </form>
      </div>
    </div>
  )
}

export default Login