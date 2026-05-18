import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Chat from "./components/chat/Chat";
import Login from "./components/login/Login";
import Notification from "./components/notifiction/Notification";
import Call from "./components/call/Call";
import IncomingCall from "./components/call/IncomingCall";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState, useRef } from "react";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { SocketProvider, useSocket } from "./lib/socket.jsx";

const AppContent = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, incomingCall, setIncomingCall, clearIncomingCall } = useChatStore();
  const { socket } = useSocket();
  const [showCall, setShowCall] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat' | 'detail'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const initRef = useRef(false);

  // 监听屏幕大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 切换到聊天视图时同步chatId
  useEffect(() => {
    if (chatId) {
      setMobileView('chat');
    }
  }, [chatId]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.id) {
          fetchUserInfo(user.id).catch(err => {
            console.error('Fetch user failed:', err);
            useUserStore.setState({ isLoading: false });
          });
        } else {
          useUserStore.setState({ isLoading: false });
        }
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        useUserStore.setState({ isLoading: false });
      }
    } else {
      useUserStore.setState({ isLoading: false });
    }
  }, []);

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

  // 移动端返回列表
  const handleBackToList = () => {
    setMobileView('list');
    useChatStore.setState({ chatId: null, user: null });
  };

  // 移动端打开设置
  const handleOpenSettings = () => {
    setMobileView('detail');
  };

  // 移动端根据视图状态渲染组件
  const renderMobileView = () => {
    switch (mobileView) {
      case 'chat':
        return <Chat onBack={handleBackToList} onOpenDetail={handleOpenSettings} />;
      case 'detail':
        return <Detail onBack={() => setMobileView(chatId ? 'chat' : 'list')} />;
      default:
        return <List onOpenSettings={handleOpenSettings} />;
    }
  };

  return (
    <>
      <div className="container">
        {currentUser ? (
          <>
            {/* 桌面端：三栏布局，移动端：根据mobileView渲染 */}
            {isMobile ? renderMobileView() : (
              <>
                <List onOpenSettings={handleOpenSettings} />
                {chatId && <Chat onBack={handleBackToList} />}
                {chatId && <Detail onBack={handleBackToList} />}
              </>
            )}
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
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;
