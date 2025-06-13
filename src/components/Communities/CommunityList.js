import React, { useState, useEffect } from 'react';
import { FiUsers, FiMessageSquare, FiSearch, FiPlus } from 'react-icons/fi';
import { getCommunities, joinCommunity, leaveCommunity, searchCommunities, createCommunity } from '../../services/communityService';
import { auth } from '../../config/firebase';
import CreateCommunity from './CreateCommunity';
import './CommunityList.css';

const CommunityList = ({ onCommunitySelect, showNotification }) => {
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setIsLoading(true);
      const fetchedCommunities = await getCommunities();
      // Sort communities by thread count in descending order
      const sortedCommunities = fetchedCommunities.sort((a, b) => 
        (b.threadCount || 0) - (a.threadCount || 0)
      );
      setCommunities(sortedCommunities);
    } catch (error) {
      console.error('Error loading communities:', error);
      showNotification('Error loading communities', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim()) {
      try {
        const results = await searchCommunities(term);
        // Sort search results by thread count
        const sortedResults = results.sort((a, b) => 
          (b.threadCount || 0) - (a.threadCount || 0)
        );
        setCommunities(sortedResults);
      } catch (error) {
        console.error('Error searching communities:', error);
        showNotification('Error searching communities', 'error');
      }
    } else {
      loadCommunities();
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await joinCommunity(communityId, auth.currentUser.uid);
      // Update the UI state immediately
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId
            ? {
                ...community,
                members: [...(community.members || []), auth.currentUser.uid]
              }
            : community
        )
      );
      showNotification('Joined community successfully!', 'success');
    } catch (error) {
      console.error('Error joining community:', error);
      showNotification('Error joining community', 'error');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await leaveCommunity(communityId, auth.currentUser.uid);
      // Update the UI state immediately
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId
            ? {
                ...community,
                members: (community.members || []).filter(id => id !== auth.currentUser.uid)
              }
            : community
        )
      );
      showNotification('Left community successfully!', 'success');
    } catch (error) {
      console.error('Error leaving community:', error);
      showNotification('Error leaving community', 'error');
    }
  };

  const handleCommunityCreated = (newCommunity) => {
    setCommunities(prev => [newCommunity, ...prev]);
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="community-list">
      <div className="community-header">
        <h2>Communities</h2>
        <CreateCommunity 
          onCommunityCreated={handleCommunityCreated}
          showNotification={showNotification}
        />
      </div>

      <div className="search-container">
        <FiUsers className="search-icon" />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="communities-grid">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map(community => (
            <div key={community.id} className="community-card">
              <div className="community-info">
                <h3>{community.name}</h3>
                <p className="community-description">{community.description}</p>
                <div className="community-stats">
                  <span>{community.threadCount || 0} threads</span>
                  <span>{community.members?.length || 0} members</span>
                </div>
              </div>
              <div className="community-actions">
                <button
                  className={`join-btn ${community.members?.includes(auth.currentUser.uid) ? 'joined' : ''}`}
                  onClick={() => {
                    if (community.members?.includes(auth.currentUser.uid)) {
                      handleLeaveCommunity(community.id);
                    } else {
                      handleJoinCommunity(community.id);
                    }
                  }}
                >
                  {community.members?.includes(auth.currentUser.uid) ? 'Leave' : 'Join'}
                </button>
                <button
                  className="view-btn"
                  onClick={() => onCommunitySelect(community)}
                >
                  View Community
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-communities">
            No communities found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList; 