import React, { useState, useEffect } from 'react';
import { FiUser, FiEdit2, FiSave } from 'react-icons/fi';
import { getUserProfile, updateUserProfile } from '../../services/profileService';
import { getUserCommunities } from '../../services/communityService';
import './ProfilePage.css';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ProfilePage = ({ user, showNotification, isViewingOtherProfile = false, targetUserId = null }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userCommunities, setUserCommunities] = useState([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

  useEffect(() => {
    loadProfile();
    loadUserCommunities();
  }, [user, targetUserId]);

  const loadUserCommunities = async () => {
    try {
      setIsLoadingCommunities(true);
      const targetUser = isViewingOtherProfile ? targetUserId : user.uid;
      const communities = await getUserCommunities(targetUser);
      setUserCommunities(communities);
    } catch (error) {
      console.error("Error loading communities:", error);
      showNotification("Failed to load communities", "error");
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const targetUser = isViewingOtherProfile ? targetUserId : user.uid;
      const userDoc = await getDoc(doc(db, 'users', targetUser));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile(userData);
        setDisplayName(userData.displayName || user.displayName || '');
        setBio(userData.bio || '');
      } else {
        // If profile doesn't exist in Firestore, create it with current user data
        const defaultProfile = {
          displayName: user.displayName || '',
          email: user.email,
          bio: '',
          threadCount: 0,
          replyCount: 0,
          bookmarkCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', targetUser), defaultProfile);
        setProfile(defaultProfile);
        setDisplayName(defaultProfile.displayName);
        setBio(defaultProfile.bio);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showNotification("Failed to load profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Update profile data
      await updateUserProfile(user.uid, {
        displayName,
        bio
      });

      // Reload profile to get updated data
      await loadProfile();
      
      setIsEditing(false);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      showNotification('Error updating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-picture">
            <FiUser className="default-avatar" />
          </div>
          
          {isEditing && !isViewingOtherProfile ? (
            <div className="edit-form">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="profile-input"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="profile-textarea"
              />
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <FiSave className="mr-2" />
                  Save Changes
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(profile.displayName || '');
                    setBio(profile.bio || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <h2 className="profile-name">{profile?.displayName || user.displayName || 'Anonymous User'}</h2>
              <p className="profile-bio">{profile?.bio || 'No bio yet'}</p>
              {!isViewingOtherProfile && (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{profile?.threadCount || 0}</span>
          <span className="stat-label">Threads</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{profile?.replyCount || 0}</span>
          <span className="stat-label">Replies</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{profile?.bookmarkCount || 0}</span>
          <span className="stat-label">Bookmarks</span>
        </div>
      </div>

      <div className="profile-communities">
        <h3>{isViewingOtherProfile ? "Communities" : "Your Communities"}</h3>
        {isLoadingCommunities ? (
          <div className="loading-spinner"></div>
        ) : userCommunities.length > 0 ? (
          <div className="communities-grid">
            {userCommunities.map(community => (
              <div key={community.id} className="community-card">
                <h4>{community.name}</h4>
                <p>{community.description}</p>
                <div className="community-stats">
                  <span>{community.threadCount || 0} threads</span>
                  <span>{community.members?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-communities">
            {isViewingOtherProfile 
              ? "This user hasn't joined any communities yet"
              : "You haven't joined any communities yet"}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 