import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, provider, db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Firebase Auth profile with name
    if (name) {
      await updateProfile(user, {
        displayName: name
      });
    }

    // Create user profile in Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      displayName: name || "",
      email: user.email,
      bio: "",
      threadCount: 0,
      replyCount: 0,
      bookmarkCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Update Firebase Auth profile with Google account info
    await updateProfile(user, {
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    
    // Check if user profile exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user profile with Google account info
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        bio: "",
        threadCount: 0,
        replyCount: 0,
        bookmarkCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing user profile with latest Google account info
      await setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}; 