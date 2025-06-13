import React from 'react';
import { FiHeart, FiUser } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const ReplyItem = ({ reply, user, onLikeReply }) => {
  const isLiked = reply.likes?.includes(user?.uid);
  const likeCount = reply.likes?.length || 0;

  return (
    <div className="reply-item">
      <div className="reply-header">
        <div className="user-info">
          <div className="user-avatar">
            <FiUser />
          </div>
          <div>
            <h5 
              style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#2b2d42',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = `/profile/${reply.userId}`}
            >
              {reply.user}
            </h5>
            <span className="reply-time">
              {new Date(reply.createdAt).toLocaleDateString('en-US', {
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
      
      <div className="reply-content">
        <p>{reply.text}</p>
      </div>
      
      <div className="reply-actions">
        <button 
          className={`thread-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLikeReply(reply.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isLiked ? 'rgba(247, 37, 133, 0.1)' : 'none',
            border: 'none',
            color: isLiked ? 'rgb(247, 37, 133)' : 'inherit',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '20px',
            transition: 'all 0.2s ease'
          }}
        >
          {isLiked ? (
            <FaHeart style={{
              fontSize: '1.1rem',
              color: 'rgb(247, 37, 133)'
            }} />
          ) : (
            <FiHeart style={{
              fontSize: '1.1rem'
            }} />
          )}
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 500,
            color: isLiked ? 'rgb(247, 37, 133)' : 'inherit'
          }}>
            {likeCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;