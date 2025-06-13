import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZ577w2Bzs55JK5HT4x572ntOSQDhwE-U",
  authDomain: "web-mini-pro.firebaseapp.com",
  projectId: "web-mini-pro",
  storageBucket: "web-mini-pro.appspot.com",
  messagingSenderId: "318099891061",
  appId: "1:318099891061:web:6a4748b8133fc7ec0d693c",
  measurementId: "G-0829L31HGF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app); 