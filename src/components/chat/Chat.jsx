import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { api } from "../../lib/api";
import Call from "../call/Call";

const Chat = ({ onBack }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    url: '',
    file: null
  });
  const [showCall, setShowCall] = useState(false);
  const [showFullDate, setShowFullDate] = useState(false);

  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (showFullDate) {
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return '今天';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    return d.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const shouldShowDateSeparator = (index) => {
    if (!chat?.messages?.length) return false;
    if (index === 0) return true;
    const current = new Date(chat.messages[index].createdAt);
    const previous = new Date(chat.messages[index - 1].createdAt);
    return current.toDateString() !== previous.toDateString();
  };

  useEffect(() => {
    if (!chatId) return;

    const fetchChat = async () => {
      try {
        const chatData = await api.getChat(chatId);
        setChat(chatData);
      } catch (error) {
        console.error('Fetch chat error:', error);
      }
    };

    fetchChat();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // 切换聊天时清除图片
  useEffect(() => {
    setImg({ url: '', file: null });
  }, [chatId]);

  const handleImg = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      console.log('File selected:', file);
      setImg({
        file: file,
        url: URL.createObjectURL(file),
      })
    }
  };

  const handleEmoji = (e) => {
    setText((pre) => `${pre}${e.emoji}`);
    setOpen(false);
  };

  const handleSend = async () => {
    console.log('handleSend called, img.file:', img.file, 'text:', text);
    if (text === "" && !img.file) {
      console.log('Early return: nothing to send');
      return;
    }

    try {
      let imgUrl = null;

      if (img.file) {
        console.log('Uploading file:', img.file);
        const uploadResult = await api.uploadFile(img.file);
        console.log('Upload result:', uploadResult);
        imgUrl = uploadResult.url;
        console.log('Image URL:', imgUrl);
      }

      const message = {
        senderId: currentUser.id,
        text,
        img: imgUrl,
        createdAt: new Date(),
      };
      
      console.log('Sending message:', message);

      await api.addMessage(chatId, message);

      // Update user chats
      const userChats = await api.getUserChats(currentUser.id);
      const chats = userChats.chats || [];
      const chatIndex = chats.findIndex((c) => c.chatId === chatId);

      if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = text;
        chats[chatIndex].isSeen = false;
        chats[chatIndex].updatedAt = Date.now();
        await api.updateUserChats(currentUser.id, chats);
      }

      // Refresh chat data
      const updatedChat = await api.getChat(chatId);
      setChat(updatedChat);
      
      // Notify ChatList to refresh
      window.dispatchEvent(new CustomEvent('chatsUpdated'));
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setImg({
        url: "",
        file: null
      });
      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "用户"}</span>
            <p>{user?.email || ""}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" onClick={() => setShowCall(true)} />
          <img src="./video.png" alt="" onClick={() => setShowCall(true)} />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <React.Fragment key={index}>
            {shouldShowDateSeparator(index) && (
              <div className="date-separator">
                <span>{formatDateSeparator(message.createdAt)}</span>
              </div>
            )}
            <div className={message.senderId === currentUser.id ? "message own" : "message"}>
              <div className="texts">
                {message.img && <img src={message.img} />}
                <p>{message.text}</p>
                <span className="time" onClick={() => setShowFullDate(!showFullDate)}>
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
          </React.Fragment>
        ))}
        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} />
            <span className="time" onClick={() => setShowFullDate(!showFullDate)}>{formatTime(new Date())}</span>
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type='file' id="file" style={{ display: 'none' }} onChange={handleImg} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          value={text}
          placeholder="发送消息..."
          onChange={(e) => setText(e?.target?.value)}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((pre) => !pre)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={() => { console.log('Send button clicked'); handleSend(); }}>
          发送
        </button>
      </div>
      {showCall && <Call onClose={() => setShowCall(false)} />}
    </div>
  );
};

export default Chat;
