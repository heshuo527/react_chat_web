import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from './userStore';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useUserStore();

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Register user when currentUser changes
  useEffect(() => {
    if (socket && currentUser?.id) {
      socket.emit('register', currentUser.id);
      console.log('User registered with socket:', currentUser.id);
    }
  }, [socket, currentUser?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};