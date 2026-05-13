import React, { useState, useEffect } from 'react'
import './friendRequests.css'
import { useUserStore } from '../../../lib/userStore';
import { api } from '../../../lib/api';

const FriendRequests = ({ onRequestAccepted }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (!currentUser?.id) return;
    
    const fetchRequests = async () => {
      try {
        const data = await api.getFriendRequests(currentUser.id);
        setRequests(data);
      } catch (error) {
        console.error('Fetch requests error:', error);
      }
    };

    fetchRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleAccept = async (requestId) => {
    setLoading(true);
    try {
      await api.acceptFriendRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
      if (onRequestAccepted) {
        onRequestAccepted();
      }
    } catch (error) {
      console.error('Accept error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setLoading(true);
    try {
      await api.rejectFriendRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className='friendRequests'>
      <h3>好友申请</h3>
      {requests.map((req) => (
        <div key={req._id} className='requestItem'>
          <img src={req.fromUser?.avatar || "./avatar.png"} alt='' />
          <span>{req.fromUser?.username || '未知用户'}</span>
          <div className='buttons'>
            <button onClick={() => handleAccept(req._id)} disabled={loading}>接受</button>
            <button onClick={() => handleReject(req._id)} disabled={loading}>拒绝</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
