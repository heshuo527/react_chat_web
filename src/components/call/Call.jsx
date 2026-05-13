import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './call.css';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';

const socket = io('http://localhost:3001');

const Call = ({ onClose }) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, incoming, active, ended
  const [callType, setCallType] = useState('audio'); // audio, video
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const { currentUser } = useUserStore();
  const { user: chatUser } = useChatStore();
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!currentUser?.id) return;

    // Register user with socket
    socket.emit('register', currentUser.id);

    // Listen for incoming calls
    socket.on('incomingCall', ({ from, callType }) => {
      setIncomingCall({ from, callType });
      setCallType(callType);
      setCallStatus('incoming');
    });

    // Listen for call accepted
    socket.on('callAccepted', async () => {
      setCallStatus('active');
      createPeerConnection();
    });

    // Listen for call rejected
    socket.on('callRejected', () => {
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 2000);
    });

    // Listen for call ended
    socket.on('callEnded', () => {
      endCall();
    });

    // Listen for WebRTC signaling
    socket.on('offer', async ({ from, offer }) => {
      if (callStatus === 'incoming' || callStatus === 'active') {
        await handleOffer(offer);
      }
    });

    socket.on('answer', async ({ answer }) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('iceCandidate', async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    return () => {
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callRejected');
      socket.off('callEnded');
      socket.off('offer');
      socket.off('answer');
      socket.off('iceCandidate');
    };
  }, [currentUser?.id]);

  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection(config);
    peerConnectionRef.current = pc;

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('iceCandidate', {
          from: currentUser.id,
          to: incomingCall?.from || chatUser?.id,
          candidate: event.candidate
        });
      }
    };

    return pc;
  };

  const startLocalStream = async (type) => {
    try {
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      return null;
    }
  };

  const initiateCall = async (type) => {
    setCallType(type);
    setCallStatus('calling');
    
    const stream = await startLocalStream(type);
    if (!stream) {
      setCallStatus('idle');
      return;
    }

    const pc = await createPeerConnection();
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('call', {
      from: currentUser.id,
      to: chatUser.id,
      callType: type
    });

    socket.emit('offer', {
      from: currentUser.id,
      to: chatUser.id,
      offer
    });
  };

  const handleOffer = async (offer) => {
    const pc = await createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('answer', {
      from: currentUser.id,
      to: incomingCall.from,
      answer
    });

    setCallStatus('active');
  };

  const acceptCall = async () => {
    const stream = await startLocalStream(callType);
    if (!stream) return;

    await createPeerConnection();

    socket.emit('acceptCall', {
      from: currentUser.id,
      to: incomingCall.from
    });

    setCallStatus('active');
  };

  const rejectCall = () => {
    socket.emit('rejectCall', {
      from: currentUser.id,
      to: incomingCall.from
    });
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    socket.emit('endCall', {
      from: currentUser.id,
      to: incomingCall?.from || chatUser?.id
    });

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallStatus('ended');
    
    setTimeout(() => setCallStatus('idle'), 2000);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  if (callStatus === 'idle') {
    return (
      <div className="call-overlay">
        <div className="call-modal">
          <h3>语音/视频通话</h3>
          <div className="call-buttons">
            <button className="call-btn audio" onClick={() => initiateCall('audio')}>
              <img src="./phone.png" alt="音频通话" />
              <span>语音通话</span>
            </button>
            <button className="call-btn video" onClick={() => initiateCall('video')}>
              <img src="./video.png" alt="视频通话" />
              <span>视频通话</span>
            </button>
          </div>
          <button className="close-call" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  if (callStatus === 'calling') {
    return (
      <div className="call-overlay">
        <div className="call-modal calling">
          <div className="call-animation">
            <img src={chatUser?.avatar || "./avatar.png"} alt="" />
            <div className="pulse"></div>
          </div>
          <h3>正在呼叫 {chatUser?.username || '用户'}...</h3>
          <p>{callType === 'video' ? '视频通话' : '语音通话'}</p>
          <button className="end-call" onClick={endCall}>取消</button>
        </div>
      </div>
    );
  }

  if (callStatus === 'incoming' && incomingCall) {
    return (
      <div className="call-overlay">
        <div className="call-modal incoming">
          <div className="call-animation">
            <img src="./avatar.png" alt="" />
            <div className="pulse"></div>
          </div>
          <h3>{incomingCall.from} 来电</h3>
          <p>{incomingCall.callType === 'video' ? '视频通话' : '语音通话'}</p>
          <div className="incoming-buttons">
            <button className="accept-call" onClick={acceptCall}>接听</button>
            <button className="reject-call" onClick={rejectCall}>拒绝</button>
          </div>
        </div>
      </div>
    );
  }

  if (callStatus === 'active') {
    return (
      <div className="call-overlay active">
        <div className="call-container">
          <div className="remote-video">
            {callType === 'video' && (
              <video ref={remoteVideoRef} autoPlay playsInline />
            )}
            {!remoteStream && callType === 'video' && (
              <div className="waiting">等待对方加入...</div>
            )}
            {callType === 'audio' && (
              <div className="audio-calling">
                <img src={chatUser?.avatar || "./avatar.png"} alt="" />
                <h3>{chatUser?.username || '用户'}</h3>
                <p>通话中...</p>
              </div>
            )}
          </div>
          
          <div className="local-video">
            {callType === 'video' ? (
              <video ref={localVideoRef} autoPlay playsInline muted />
            ) : (
              <div className="audio-avatar">
                <img src={currentUser?.avatar || "./avatar.png"} alt="" />
              </div>
            )}
          </div>

          <div className="call-controls">
            <button className={isMuted ? 'active' : ''} onClick={toggleMute}>
              <img src={isMuted ? "./mic-off.png" : "./mic.png"} alt="" />
            </button>
            {callType === 'video' && (
              <button className={isVideoOff ? 'active' : ''} onClick={toggleVideo}>
                <img src={isVideoOff ? "./video-off.png" : "./video.png"} alt="" />
              </button>
            )}
            <button className="end-call" onClick={endCall}>
              <img src="./phone.png" alt="" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callStatus === 'ended') {
    return (
      <div className="call-overlay">
        <div className="call-modal ended">
          <h3>通话结束</h3>
        </div>
      </div>
    );
  }

  return null;
};

export default Call;