import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { api } from "../../lib/api";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    url: ' ',
    file: null
  });

  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
  }, [chatId]);

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      })
    }
  };

  const handleEmoji = (e) => {
    setText((pre) => `${pre}${e.emoji}`);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    try {
      let imgUrl = null;

      if (img.file) {
        imgUrl = await api.uploadFile(img.file);
      }

      const message = {
        senderId: currentUser.id,
        text,
        img: imgUrl,
        createdAt: new Date(),
      };

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

    } catch (error) {
      console.log("Send message error:", error);
    }

    setImg({
      url: "",
      file: null
    });

    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>女神</span>
            <p>得不到回应的山谷不值得一跃</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={message.senderId === currentUser.id ? "message own" : "message"} key={index}>
            <div className="texts">
              {message.img && <img src={message.img} />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} />
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
        <button className="sendButton" onClick={handleSend}>
          发送
        </button>
      </div>
    </div>
  );
};

export default Chat;
