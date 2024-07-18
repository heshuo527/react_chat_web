// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchatweb-b7c2c.firebaseapp.com",
  projectId: "reactchatweb-b7c2c",
  storageBucket: "reactchatweb-b7c2c.appspot.com",
  messagingSenderId: "400870715107",
  appId: "1:400870715107:web:51cd2271554115133adfd6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()