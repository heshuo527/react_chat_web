import React, { useState, useEffect } from "react";
import "./addUser.css";
import {
  getDoc,
  where,
  collection,
  query,
  getDocs,
  setDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore'

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "user");
      const p = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(p);
      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data())
      }
    } catch (error) {
      console.log("🚀 _ file: AddUser.jsx:14 _ error:", error);
    }
  };

  /**
   * 添加一个用户
   * 如果是新用户先去创建一个数据模型  否则会出问题
   * @param {*}
   */
  const handleAddUser = async () => {
    const chatRef = collection(db, 'chats');
    const userChatsRef = collection(db, 'userchats');

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        message: [],
      });

      const updateUserChat = async (userId, chatDetails) => {
        const userChatDocRef = doc(userChatsRef, userId);
        const userChatDoc = await getDoc(userChatDocRef);

        if (userChatDoc.exists()) {
          await updateDoc(userChatDocRef, {
            chats: arrayUnion(chatDetails)
          });
        } else {
          await setDoc(userChatDocRef, {
            chats: [chatDetails]
          });
        }
      };

      const chatDetailsForUser = {
        chatId: newChatRef.id,
        lastMessage: '',
        receiverId: currentUser.id,
        upDateAt: Date.now()
      };

      const chatDetailsForCurrentUser = {
        chatId: newChatRef.id,
        lastMessage: '',
        receiverId: user.id,
        upDateAt: Date.now()
      };

      await updateUserChat(user.id, chatDetailsForUser);
      await updateUserChat(currentUser.id, chatDetailsForCurrentUser);

    } catch (error) {
      console.log('🚀 _ file: AddUser.jsx:38 _ error:', error);
    }
  }

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && <div className="user">
        <div className="detail">
          <img src={user.avatar || "./avatar.png"} alt="" />
          <span>{user.username}</span>
        </div>
        <button onClick={handleAddUser}>添加用户</button>
      </div>}
    </div>
  );
};

export default AddUser;
