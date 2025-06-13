import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from "firebase/firestore";
import { db } from "../config/firebase";

export const createCommunity = async (communityData) => {
  try {
    const communitiesRef = collection(db, "communities");
    const community = {
      ...communityData,
      createdAt: new Date().toISOString(),
      ownerId: communityData.createdBy,
      members: [communityData.createdBy],
      moderators: [communityData.createdBy],
      threadCount: 0
    };
    
    const docRef = await addDoc(communitiesRef, community);
    return { id: docRef.id, ...community };
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
};

export const getCommunities = async () => {
  try {
    const communitiesRef = collection(db, "communities");
    const q = query(communitiesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting communities:", error);
    throw error;
  }
};

export const getCommunityById = async (communityId) => {
  try {
    const communityRef = doc(db, "communities", communityId);
    const communityDoc = await getDoc(communityRef);
    
    if (!communityDoc.exists()) {
      throw new Error("Community not found");
    }
    
    return {
      id: communityDoc.id,
      ...communityDoc.data()
    };
  } catch (error) {
    console.error("Error getting community:", error);
    throw error;
  }
};

export const joinCommunity = async (communityId, userId) => {
  try {
    const communityRef = doc(db, "communities", communityId);
    await updateDoc(communityRef, {
      members: arrayUnion(userId)
    });
  } catch (error) {
    console.error("Error joining community:", error);
    throw error;
  }
};

export const leaveCommunity = async (communityId, userId) => {
  try {
    const communityRef = doc(db, "communities", communityId);
    await updateDoc(communityRef, {
      members: arrayRemove(userId)
    });
  } catch (error) {
    console.error("Error leaving community:", error);
    throw error;
  }
};

export const deleteCommunity = async (communityId) => {
  try {
    const communityRef = doc(db, "communities", communityId);
    await deleteDoc(communityRef);
  } catch (error) {
    console.error("Error deleting community:", error);
    throw error;
  }
};

export const searchCommunities = async (searchTerm) => {
  try {
    const communitiesRef = collection(db, "communities");
    const q = query(communitiesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(community => 
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  } catch (error) {
    console.error("Error searching communities:", error);
    throw error;
  }
};

export const getUserCommunities = async (userId) => {
  try {
    const communitiesRef = collection(db, "communities");
    const q = query(communitiesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(community => 
        community.members?.includes(userId)
      );
  } catch (error) {
    console.error("Error getting user communities:", error);
    throw error;
  }
}; 