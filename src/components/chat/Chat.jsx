import React, { useState, useEffect } from 'react'
import './chat.css'
import EmojiPicker from 'emoji-picker-react'

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleEmoji = (e) => {
    console.log('eeee', e);
    setText((pre) => `${pre}${e.emoji}`);
    setOpen(false);
  };

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img src='./avatar.png' alt='' />
          <div className='texts'>
            <span>女神</span>
            <p>得不到回应的山谷不值得一跃</p>
          </div>
        </div>
        <div className='icons'>
          <img src='./phone.png' alt='' />
          <img src='./video.png' alt='' />
          <img src='./info.png' alt='' />
        </div>
      </div>
      <div className='center'>
        <div className='message own'>
          <div className='texts'>
            <p>
              你好!!我是电话手机客户端手机客户端升级的黑科技时代开始的开始看的,多久是多久开始打卡好.
            </p>
            <span>1 分钟</span>
          </div>
        </div>
        <div className='message'>
          <img src='./avatar.png' />
          <div className='texts'>
            <p>
              你好!!我是电话手机客户端手机客户端升级的黑科技时代开始的开始看的,多久是多久开始打卡好.
            </p>
            <span>1 分钟</span>
          </div>
        </div>
        <div className='message own'>
          <div className='texts'>
            <p>
              你好!!我是电话手机客户端手机客户端升级的黑科技时代开始的开始看的,多久是多久开始打卡好.
            </p>
            <span>1 分钟</span>
          </div>
        </div>
        <div className='message'>
          <img src='./avatar.png' />
          <div className='texts'>
            <p>
              你好!!我是电话手机客户端手机客户端升级的黑科技时代开始的开始看的,多久是多久开始打卡好.
            </p>
            <span>1 分钟</span>
          </div>
        </div>
        <div className='message own'>
          <div className='texts'>
          <img src='https://tse1-mm.cn.bing.net/th/id/OIP-C.Zte3ljd4g6kqrWWyg-8fhAHaEo?w=258&h=180&c=7&r=0&o=5&dpr=2&pid=1.7' />
            <p>
              你好!!我是电话手机客户端手机客户端升级的黑科技时代开始的开始看的,多久是多久开始打卡好.
            </p>
            <span>1 分钟</span>
          </div>
        </div>
        <div className='message'>
          <img src='./avatar.png' />
          <div className='texts'>
            <p>
              你好!!我是电话手机客户端手机客户端升级的黑科技时代开始的开始看的,多久是多久开始打卡好.
            </p>
            <span>1 分钟</span>
          </div>
        </div>
      </div>
      <div className='bottom'>
        <div className='icons'>
          <img src='./img.png' alt='' />
          <img src='./camera.png' alt='' />
          <img src='./mic.png' alt='' />
        </div>
        <input
          type='text'
          value={text}
          placeholder='发送消息...'
          onChange={(e) => setText(e?.target?.value)}
        />
        <div className='emoji'>
          <img src='./emoji.png' alt='' onClick={() => setOpen((pre) => !pre)} />
          <div className='picker'>
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className='sendButton'>发送</button>
      </div>
    </div>
  )
}

export default Chat