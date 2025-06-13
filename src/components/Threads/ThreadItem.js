import React, { useState } from 'react';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiBookmark, 
  FiUser,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import ReplyForm from './ReplyForm';
import ReplyItem from './ReplyItem';
import { shareThread } from '../../services/shareService';

// Utility to get a persistent gradient for a user
const gradients = [
  'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fdcbf1 0%, #e0c3fc 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getUserGradient(userIdOrEmail) {
  if (!userIdOrEmail) return gradients[0];
  const key = `pfp-gradient-${userIdOrEmail}`;
  let idx = localStorage.getItem(key);
  if (idx === null) {
    idx = hashString(userIdOrEmail) % gradients.length;
    localStorage.setItem(key, idx);
  }
  return gradients[idx];
}

const ThreadItem = ({ 
  thread,
  user, 
  onLikeThread, 
  onAddReply, 
  onLikeReply,
  onBookmarkThread,
  isBookmarked,
  isDisabled
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Safely handle likes data
  const safeLikes = Array.isArray(thread.likes) ? thread.likes : [];
  const isLiked = user?.uid ? safeLikes.includes(user.uid) : false;
  const likeCount = safeLikes.length;
  
  // Safely handle replies data
  const safeReplies = Array.isArray(thread.replies) ? thread.replies : [];
  const replyCount = safeReplies.length;

  const handleLikeClick = () => {
    if (!user?.uid) {
      alert("Please login to like");
      return;
    }
    if (isDisabled || !thread?.id) return;
    onLikeThread(thread.id); // Pass only threadId
  };

  const handleReplySubmit = (replyText) => {
    if (!user?.uid) {
      alert("Please login to reply");
      return;
    }
    if (isDisabled || !thread?.id) return;
    onAddReply(thread.id, replyText); // Pass threadId and replyText
  };

  const handleReplyLikeClick = (replyId) => {
    if (!user?.uid) {
      alert("Please login to like replies");
      return;
    }
    if (isDisabled || !thread?.id || !replyId) return;
    onLikeReply(thread.id, replyId); // Pass both threadId and replyId
  };

  const handleShare = async () => {
    try {
      if (isDisabled) return;
      const result = await shareThread(thread);
      if (result?.status === 'copied') {
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      alert('Could not share thread. Please try again.');
    }
  };

   const handleBookmarkClick = () => {
    if (!user?.uid) {
      alert("Please login to bookmark");
      return;
    }
    if (isDisabled || !thread?.id) return;
    onBookmarkThread(thread.id); // Pass only threadId
  };

  const toggleReplies = () => {
    if (isDisabled) return;
    setShowReplies(!showReplies);
  };

  const toggleReplyForm = () => {
    if (isDisabled) return;
    setShowReplyForm(!showReplyForm);
  };

  return (
    <div className="thread-card" style={styles.card}>
      <div className="thread-header" style={styles.header}>
        <div className="user-info" style={styles.userInfo}>
          <div className="user-avatar" style={{ ...styles.avatar, background: getUserGradient(thread.userId || thread.user || '') }}>
            <FiUser />
          </div>
          <div>
            <h4 
              style={{
                ...styles.username,
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = `/profile/${thread.userId}`}
            >
              {thread.user || 'Anonymous'}
            </h4>
            <span className="thread-time" style={styles.time}>
              {new Date(thread.createdAt || new Date()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="thread-content" style={styles.content}>
        <p style={styles.text}>{thread.text}</p>
      </div>
      
      <div className="thread-actions" style={styles.actions}>
        {/* Like Button */}
        <button 
          className={`thread-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          style={{
            ...styles.actionButton,
            ...(isLiked ? styles.likedButton : {}),
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          }}
          disabled={isDisabled}
        >
          {isLiked ? <FaHeart style={{...styles.actionIcon, color: '#FF3040', fill: '#FF3040'}} /> : <FiHeart style={styles.actionIcon} />}
          <span className="action-count" style={styles.actionCount}>{likeCount}</span>
        </button>

        {/* Reply Button */}
        <button 
          className="thread-action-btn reply"
          onClick={toggleReplyForm}
          style={{
            ...styles.actionButton,
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          }}
          disabled={isDisabled}
        >
          <FiMessageSquare style={styles.actionIcon} />
          <span className="action-text" style={styles.actionText}>
            {showReplyForm ? 'Cancel' : 'Reply'}
          </span>
        </button>

        {/* Replies Toggle */}
        {replyCount > 0 && (
          <button 
            className="thread-action-btn"
            onClick={toggleReplies}
            style={{
              ...styles.actionButton,
              cursor: isDisabled ? 'not-allowed' : 'pointer'
            }}
            disabled={isDisabled}
          >
            {showReplies ? (
              <FiChevronUp style={styles.actionIcon} />
            ) : (
              <FiChevronDown style={styles.actionIcon} />
            )}
            <span className="action-text" style={styles.actionText}>
              {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
            </span>
          </button>
        )}

        {/* Share Button */}
        <button 
          className="thread-action-btn share"
          onClick={handleShare}
          style={{
            ...styles.actionButton,
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          }}
          disabled={isDisabled}
          title="Share this thread"
        >
          <FiShare2 style={styles.actionIcon} />
          <span className="action-text" style={styles.actionText}>Share</span>
        </button>

        {/* Bookmark Button */}
        <button 
          className={`thread-action-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmarkClick}
          style={{
            ...styles.actionButton,
            ...(isBookmarked ? styles.bookmarkedButton : {}),
            cursor: !user?.uid || isDisabled ? 'not-allowed' : 'pointer'
          }}
          disabled={!user?.uid || isDisabled}
          title={!user?.uid ? "Login to bookmark" : ""}
        >
          <FiBookmark style={{
            ...styles.actionIcon,
            color: isBookmarked ? '#f59e0b' : '#6c757d',
            fill: isBookmarked ? '#f59e0b' : 'none'
          }} />
        </button>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div style={styles.replyFormContainer}>
          <ReplyForm 
            onSubmit={handleReplySubmit} 
            onCancel={() => setShowReplyForm(false)}
            currentUser={user}
          />
        </div>
      )}

      {/* Replies List */}
      {showReplies && (
  <div style={styles.repliesContainer}>
    {safeReplies.map((reply) => (
      <ReplyItem 
        key={reply.id} 
        reply={reply} 
        user={user}
        onLikeReply={handleReplyLikeClick} // Use the new handler
        isDisabled={isDisabled}
      />
    ))}
  </div>
)}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4361ee',
  },
  username: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2b2d42',
  },
  time: {
    fontSize: '0.8rem',
    color: '#6c757d',
  },
  content: {
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  text: {
    margin: '0 0 8px 0',
    color: '#2b2d42',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f2f5',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#6c757d',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '20px',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
  },
  likedButton: {
    color: '#f72585',
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
  },
  bookmarkedButton: {
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  actionIcon: {
    fontSize: '1.1rem',
  },
  actionCount: {
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  actionText: {
    fontSize: '0.85rem',
  },
  replyFormContainer: {
    marginTop: '16px',
  },
  repliesContainer: {
    marginTop: '16px',
    paddingLeft: '16px',
    borderLeft: '2px solid #e9ecef'
  },
};

export default ThreadItem;