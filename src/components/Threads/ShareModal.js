import React, { useState } from 'react';
import {
  FiTwitter,
  FiLink,
  FiFacebook,
  FiLinkedin,
  FiX
} from 'react-icons/fi';

const ShareModal = ({ thread, onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/thread/${thread.id}`;

  const shareOptions = [
    {
      name: 'Twitter',
      icon: <FiTwitter />,
      action: () => window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(thread.text.substring(0, 100))}&url=${encodeURIComponent(url)}`,
        '_blank'
      )
    },
    {
      name: 'Copy Link',
      icon: <FiLink />,
      action: async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    // Add more platforms as needed
  ];

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <button style={modalStyles.closeButton} onClick={onClose}>
          <FiX />
        </button>
        <h3 style={modalStyles.title}>Share this thread</h3>
        <div style={modalStyles.options}>
          {shareOptions.map((option) => (
            <button
              key={option.name}
              style={modalStyles.option}
              onClick={option.action}
            >
              <span style={modalStyles.optionIcon}>{option.icon}</span>
              <span>{option.name}</span>
              {option.name === 'Copy Link' && copied && (
                <span style={modalStyles.copiedText}>Copied!</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    width: '300px',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center'
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    background: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  optionIcon: {
    fontSize: '1.2rem'
  },
  copiedText: {
    marginLeft: 'auto',
    color: '#4361ee',
    fontSize: '0.8rem'
  }
};

export default ShareModal;