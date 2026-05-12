import React, { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });

  const [loading, setLoading] = useState(false);
  const { login, register } = useUserStore();

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      })
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);
      await login(email, password);
      toast.success('登录成功!');
    } catch (error) {
      console.log('Login error:', error);
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      let imgUrl = '';
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      await register({
        username,
        email,
        password,
        avatar: imgUrl,
      });

      toast.success('创建成功!');
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
