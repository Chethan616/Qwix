import React, { useState } from 'react';
import { FiEdit2 } from "react-icons/fi";

const CreateThread = ({ onCreateThread, isLoading, selectedCommunity }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onCreateThread(text);
      setText("");
    }
  };

  return (
    <div className="create-thread" style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={selectedCommunity 
            ? `Share your thoughts in ${selectedCommunity.name}...` 
            : "Share your thoughts with the community..."}
          rows={4}
          disabled={isLoading}
          required
          style={styles.textarea}
        />
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading || !text.trim()}
          style={styles.button}
        >
          <FiEdit2 className="btn-icon" style={styles.icon} />
          {isLoading ? "Posting..." : "Post Discussion"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '0.95rem',
    resize: 'vertical',
    minHeight: '120px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  button: {
    backgroundColor: '#4361ee',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    alignSelf: 'flex-end',
  },
  icon: {
    fontSize: '1.1rem',
  },
};

export default CreateThread;