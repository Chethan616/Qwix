import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  query,
  orderBy,
  deleteDoc,
  where,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getUserStats } from "./profileService";
import { createNotification } from "./notificationService";

export const normalizeThread = (thread) => {
  return {
    ...thread,
    likes: thread.likes || [],
    replies: thread.replies || []
  };
};

export const fetchThreads = async (communityId = null) => {
  try {
    let threadsQuery;
    if (communityId) {
      // Get threads for a specific community
      threadsQuery = query(
        collection(db, "threads"),
        where("communityId", "==", communityId)
      );
    } else {
      // Get all threads without communityId (main discussions)
      threadsQuery = query(
        collection(db, "threads"),
        where("communityId", "==", null)
      );
    }

    const querySnapshot = await getDocs(threadsQuery);
    const threads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...normalizeThread(doc.data())
    }));

    // Sort threads by createdAt in memory
    return threads.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error("Error fetching threads:", error);
    throw error;
  }
};

export const addThread = async (threadData) => {
  try {
    const docRef = await addDoc(collection(db, "threads"), threadData);
    const thread = {
      id: docRef.id,
      ...normalizeThread(threadData)
    };

    // Update user stats after creating a thread
    await getUserStats(threadData.userId);

    // Update community thread count if thread is in a community
    if (threadData.communityId) {
      const communityRef = doc(db, "communities", threadData.communityId);
      await updateDoc(communityRef, {
        threadCount: increment(1)
      });
    }

    return thread;
  } catch (error) {
    console.error("Error adding thread:", error);
    throw error;
  }
};

export const deleteThread = async (threadId) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadDoc = await getDoc(threadRef);
    
    if (threadDoc.exists()) {
      const threadData = threadDoc.data();
      await deleteDoc(threadRef);
      
      // Update user stats after deleting a thread
      await getUserStats(threadData.userId);

      // Update community thread count if thread is in a community
      if (threadData.communityId) {
        const communityRef = doc(db, "communities", threadData.communityId);
        await updateDoc(communityRef, {
          threadCount: increment(-1)
        });
      }
    }
  } catch (error) {
    console.error("Error deleting thread:", error);
    throw error;
  }
};

export const likeThread = async (threadId, userId) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadDoc = await getDoc(threadRef);
    
    if (!threadDoc.exists()) {
      throw new Error("Thread not found");
    }

    const threadData = threadDoc.data();
    const isLiked = threadData.likes.includes(userId);

    await updateDoc(threadRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });

    return { operation: isLiked ? 'removed' : 'added' };
  } catch (error) {
    console.error("Error liking thread:", error);
    throw error;
  }
};

export const addReply = async (threadId, replyData) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadDoc = await getDoc(threadRef);
    
    if (!threadDoc.exists()) {
      throw new Error("Thread not found");
    }

    const threadData = threadDoc.data();
    const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const normalizedReply = {
      ...replyData,
      id: replyId,
      createdAt: new Date().toISOString(),
      likes: []
    };

    await updateDoc(threadRef, {
      replies: arrayUnion(normalizedReply)
    });

    // Update user stats after adding a reply
    await getUserStats(replyData.userId);

    // Create notification for thread owner if the reply is from someone else
    if (threadData.userId !== replyData.userId) {
      await createNotification({
        userId: threadData.userId,
        type: 'reply',
        threadId: threadId,
        message: `${replyData.user} replied to your thread`,
        data: {
          threadId,
          replyId: replyId,
          replyText: replyData.text
        }
      });
    }

    return normalizedReply;
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
};

export const likeReply = async (threadId, replyIndex, userId) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadDoc = await getDoc(threadRef);
    
    if (!threadDoc.exists()) {
      throw new Error("Thread not found");
    }

    const threadData = threadDoc.data();
    const replies = [...threadData.replies];
    const reply = replies[replyIndex];

    if (!reply) {
      throw new Error("Reply not found");
    }

    const isLiked = reply.likes.includes(userId);
    reply.likes = isLiked 
      ? reply.likes.filter(id => id !== userId)
      : [...reply.likes, userId];

    await updateDoc(threadRef, { replies });

    return { operation: isLiked ? 'removed' : 'added' };
  } catch (error) {
    console.error("Error liking reply:", error);
    throw error;
  }
};

export const toggleBookmark = async (userId, threadId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create default user document if it doesn't exist
      await setDoc(userRef, {
        bookmarks: [threadId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { operation: 'added' };
    }

    const userData = userDoc.data();
    const bookmarks = userData.bookmarks || [];
    const isBookmarked = bookmarks.includes(threadId);

    await updateDoc(userRef, {
      bookmarks: isBookmarked ? arrayRemove(threadId) : arrayUnion(threadId),
      updatedAt: new Date().toISOString()
    });

    // Update user stats after toggling bookmark
    await getUserStats(userId);

    return { operation: isBookmarked ? 'removed' : 'added' };
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

export const getUserBookmarks = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create default user document with empty bookmarks array
      await setDoc(userRef, {
        bookmarks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return [];
    }

    return userDoc.data().bookmarks || [];
  } catch (error) {
    console.error("Error getting user bookmarks:", error);
    throw error;
  }
};

export const searchThreads = async (searchTerm, communityId = null) => {
  try {
    let threadsQuery;
    if (communityId) {
      threadsQuery = query(
        collection(db, "threads"),
        where("communityId", "==", communityId),
        orderBy("createdAt", "desc")
      );
    } else {
      threadsQuery = query(
        collection(db, "threads"),
        where("communityId", "==", null),
        orderBy("createdAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(threadsQuery);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...normalizeThread(doc.data())
      }))
      .filter(thread => 
        thread.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
  } catch (error) {
    console.error("Error searching threads:", error);
    throw error;
  }
};