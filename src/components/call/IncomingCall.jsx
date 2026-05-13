import React, { useState, useEffect, useRef } from 'react';
import './incomingCall.css';
import { useUserStore } from '../../lib/userStore';
import { useSocket } from '../../lib/socket.jsx';
import { api } from '../../lib/api';

const IncomingCall = ({ onAccept, onReject, incomingCall, setIncomingCall }) => {
  const [callerInfo, setCallerInfo] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const { socket } = useSocket();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (incomingCall?.from) {
      // Fetch caller info
      api.getUserInfo(incomingCall.from).then(user => {
        setCallerInfo(user);
      }).catch(err => {
        console.error('Failed to get caller info:', err);
        setCallerInfo({ username: incomingCall.from, avatar: './avatar.png' });
      });

      // Auto reject after 30 seconds
      timeoutRef.current = setTimeout(() => {
        handleReject();
      }, 30000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [incomingCall]);

  const handleAccept = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setFadeOut(true);
    setTimeout(() => {
      setIncomingCall(null);
      setFadeOut(false);
      if (onAccept) onAccept(incomingCall);
    }, 300);
  };

  const handleReject = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setFadeOut(true);
    setTimeout(() => {
      setIncomingCall(null);
      setFadeOut(false);
      if (onReject) onReject(incomingCall);
    }, 300);
  };

  if (!incomingCall) return null;

  return (
    <div className={`incoming-call-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="incoming-call-popup">
        <div className="caller-avatar">
          <img src={callerInfo?.avatar || './avatar.png'} alt="" />
          <div className={`call-type-indicator ${incomingCall.callType}`}>
            {incomingCall.callType === 'video' ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            )}
          </div>
        </div>
        
        <div className="caller-info">
          <h3>{callerInfo?.username || '未知用户'}</h3>
          <p>{incomingCall.callType === 'video' ? '视频通话' : '语音通话'} 来电</p>
        </div>

        <div className="call-actions">
          <button className="reject-btn" onClick={handleReject}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.33.72-.72.72H5.9c-.39 0-.72-.33-.72-.72V9.02c0-.39.33-.72.72-.72h1.78c.39 0 .72.33.72.72v3.1c1.45-.47 3-.72 4.6-.72 1.66 0 3.17.48 4.36 1.32.3.21.43.59.31.92-.12.33-.43.55-.78.55h-.02c-.44-.03-.78-.37-.78-.8v-1.88c0-.44.36-.8.8-.8 1.66 0 3-1.34 3-3s-1.34-3-3-3c-.44 0-.8.36-.8.8v1.88c0 .43.34.77.78.8h.02c.35 0 .66-.22.78-.55.12-.33-.01-.71-.31-.92-1.19-.84-2.7-1.32-4.36-1.32z"/>
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button className="accept-btn" onClick={handleAccept}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </button>
        </div>

        <div className="call-timer">
          <div className="pulse-ring"></div>
          <span>等待接听...</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;