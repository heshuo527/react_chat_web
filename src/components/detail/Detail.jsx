import React, { useState, useEffect } from 'react'
import './detail.css'

const Detail = () => {
  return (
    <div className='detail'>
      <div className='user'>
        <img src='./avatar.png' alt='' />
        <h2>女神</h2>
        <p>得不到回应的山谷不值得一跃</p>
      </div>
      <div className='info'>
        <div className='option'>
          <div className='title'>
            <span>聊天设置</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>隐私帮助</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>共享图片</span>
            <img src='./arrowDown.png' alt='' />
          </div>
          <div className='photos'>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://tse4-mm.cn.bing.net/th/id/OIP-C.88TwnUWcXP2OEI9uXbLrZwHaLJ?w=115&h=180&c=7&r=0&o=5&dpr=2&pid=1.7' alt='' />
                <span>图片_2024_2.png</span>
              </div>
              <img src='./download.png' alt='' className='icon' />
            </div>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://tse4-mm.cn.bing.net/th/id/OIP-C.88TwnUWcXP2OEI9uXbLrZwHaLJ?w=115&h=180&c=7&r=0&o=5&dpr=2&pid=1.7' alt='' />
                <span>图片_2024_2.png</span>
              </div>
              <img src='./download.png' alt='' className='icon' />
            </div>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://tse4-mm.cn.bing.net/th/id/OIP-C.88TwnUWcXP2OEI9uXbLrZwHaLJ?w=115&h=180&c=7&r=0&o=5&dpr=2&pid=1.7' alt='' />
                <span>图片_2024_2.png</span>
              </div>
              <img src='./download.png' alt='' className='icon' />
            </div>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://tse4-mm.cn.bing.net/th/id/OIP-C.88TwnUWcXP2OEI9uXbLrZwHaLJ?w=115&h=180&c=7&r=0&o=5&dpr=2&pid=1.7' alt='' />
                <span>图片_2024_2.png</span>
              </div>
              <img src='./download.png' alt='' className='icon' />
            </div>
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>共享文件</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <button>关闭用户</button>
      </div>
    </div>
  )
}

export default Detail