import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { createCommunity } from '../../services/communityService';
import { auth } from '../../config/firebase';
import './CreateCommunity.css';

const CreateCommunity = ({ onCommunityCreated, showNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification('Community name is required', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const communityData = {
        ...formData,
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        members: [auth.currentUser.uid],
        moderators: [auth.currentUser.uid],
        threadCount: 0
      };

      const newCommunity = await createCommunity(communityData);
      onCommunityCreated(newCommunity);
      showNotification('Community created successfully!', 'success');
      setIsOpen(false);
      setFormData({ name: '', description: '', rules: '' });
    } catch (error) {
      console.error('Error creating community:', error);
      showNotification('Error creating community', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-community">
      <button 
        className="create-community-btn"
        onClick={() => setIsOpen(true)}
      >
        <FiPlus /> Create Community
      </button>

      {isOpen && (
        <div className="create-community-modal">
          <div className="modal-content">
            <h2>Create New Community</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Community Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter community name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your community"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rules">Community Rules</label>
                <textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                  placeholder="Set community rules"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCommunity; 