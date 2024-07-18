import React, { useState, useEffect } from 'react'
import './login.css'
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload';

const Login = () => {

  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      })
    }
  };

  /**
   * 用户登陆
   * @param {*} e 
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);
      await signInWithEmailAndPassword(auth, email, password);

    } catch (error) {
      console.log('🚀 _ file: Login.jsx:41 _ error:', error);
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建用户
   * @param {*} e 
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, 'user', res.user.uid), {
        username,
        email,
        avatar: imgUrl,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login'>
      <div className='item'>
        <h2>欢迎回来</h2>
        <form onSubmit={handleLogin}>
          <input type='text' placeholder='Email' name='email' />
          <input type='password' placeholder='Password' name='password' />
          <button disabled={loading}>{loading ? '加载中' : '登陆'}</button>
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
          <button disabled={loading}>{loading ? '加载中' : '注册'}</button>
        </form>
      </div>
    </div>
  )
}

export default Login