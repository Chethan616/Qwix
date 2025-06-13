import React, { useState } from 'react';
import { FiSend, FiX } from "react-icons/fi";
import './ReplyForm.css';

const ReplyForm = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="reply-form-container">
      <form onSubmit={handleSubmit} className="reply-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply..."
          rows={3}
          className="reply-textarea"
        />
        <div className="reply-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="reply-cancel-btn"
          >
            <FiX /> Cancel
          </button>
          <button 
            type="submit" 
            className="reply-submit-btn"
            disabled={!text.trim()}
          >
            <FiSend /> Post Reply
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;