import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Chat from "./components/chat/Chat";
import Login from "./components/login/Login";
import Notification from "./components/notifiction/Notification";
import Call from "./components/call/Call";
import IncomingCall from "./components/call/IncomingCall";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { api } from "./lib/api";
import { SocketProvider, useSocket } from "./lib/socket.jsx";

const AppContent = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, incomingCall, setIncomingCall, clearIncomingCall } = useChatStore();
  const { socket } = useSocket();
  const [showCall, setShowCall] = useState(false);

  useEffect(() => {
    // Check for stored token and user on app load
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        fetchUserInfo(user.id).catch(err => {
          console.error('Failed to fetch user info:', err);
          useUserStore.setState({ isLoading: false });
        });
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        useUserStore.setState({ isLoading: false });
      }
    } else {
      useUserStore.setState({ isLoading: false });
    }
  }, [fetchUserInfo]);

  // 全局监听来电
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    socket.on('incomingCall', ({ from, callType }) => {
      setIncomingCall({ from, callType });
    });

    socket.on('callEnded', () => {
      clearIncomingCall();
      setShowCall(false);
    });

    return () => {
      socket.off('incomingCall');
      socket.off('callEnded');
    };
  }, [socket, currentUser?.id, setIncomingCall, clearIncomingCall]);

  const handleAcceptCall = () => {
    setShowCall(true);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (socket && incomingCall) {
      socket.emit('rejectCall', {
        from: currentUser.id,
        to: incomingCall.from
      });
    }
    clearIncomingCall();
  };

  return (
    <>
      <div className="container">
        {currentUser ? (
          <>
            <List />
            {chatId && <Chat />}
            {chatId && <Detail />}
          </>
        ) : (
          <Login />
        )}
        <Notification />
      </div>
      {showCall && <Call onClose={() => setShowCall(false)} />}
      {incomingCall && (
        <IncomingCall
          incomingCall={incomingCall}
          setIncomingCall={setIncomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </>
  );
};

const App = () => {
  const { isLoading } = useUserStore();

  if (isLoading) return <div className="loading">Loading...</div>

  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;
