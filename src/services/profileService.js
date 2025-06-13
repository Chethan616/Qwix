import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  collection,
  query,
  where,
  getDocs,
  arrayContains
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    // If user doesn't exist, create default profile with display name from Firebase Auth
    const currentUser = auth.currentUser;
    const defaultProfile = {
      displayName: currentUser?.displayName || "",
      bio: "",
      threadCount: 0,
      replyCount: 0,
      bookmarkCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    // Get thread count
    const threadsQuery = query(
      collection(db, "threads"),
      where("userId", "==", userId)
    );
    const threadsSnapshot = await getDocs(threadsQuery);
    const threadCount = threadsSnapshot.size;

    // Get all threads to count replies
    const allThreadsQuery = query(collection(db, "threads"));
    const allThreadsSnapshot = await getDocs(allThreadsQuery);
    const replyCount = allThreadsSnapshot.docs.reduce((count, doc) => {
      const thread = doc.data();
      const replies = thread.replies || [];
      return count + replies.filter(reply => reply.userId === userId).length;
    }, 0);

    // Get bookmark count from user's bookmarks array
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const bookmarks = userDoc.exists() ? userDoc.data().bookmarks || [] : [];
    const bookmarkCount = bookmarks.length;

    // Update user profile with new stats
    await updateUserProfile(userId, {
      threadCount,
      replyCount,
      bookmarkCount
    });

    return {
      threadCount,
      replyCount,
      bookmarkCount
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
}; 