import React, { useState, useEffect } from 'react';
import ThreadItem from './ThreadItem';
import { likeThread, addReply, likeReply } from '../../services/threadService';

const ThreadList = ({ 
  threads = [],
  user, 
  setThreads, 
  showNotification, 
  onBookmarkThread,
  bookmarks = [],
  isLoading = false
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  const normalizeThread = (thread) => {
    const optimisticData = optimisticUpdates[thread.id] || {};
    return {
      ...thread,
      likes: optimisticData.likes || thread.likes || [],
      replies: optimisticData.replies || thread.replies || [],
    };
  };

  const handleLikeThread = async (threadId) => {
    if (!user?.uid || localLoading) return;

    try {
      setLocalLoading(true);
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      const currentLikes = thread.likes || [];
      const newLikes = currentLikes.includes(user.uid)
        ? currentLikes.filter(id => id !== user.uid)
        : [...currentLikes, user.uid];

      setOptimisticUpdates(prev => ({
        ...prev,
        [threadId]: { ...thread, likes: newLikes }
      }));

      setThreads(prev => prev.map(t => 
        t.id === threadId ? normalizeThread({ ...t, likes: newLikes }) : t
      ));

      await likeThread(threadId, user.uid);

      showNotification(
        newLikes.length > currentLikes.length ? "Post liked!" : "Post unliked",
        "success"
      );
    } catch (error) {
      console.error("Like error:", error);
      showNotification("Like update failed", "error");
      setOptimisticUpdates(prev => ({ ...prev, [threadId]: undefined }));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLikeReply = async (threadId, replyId) => {
    if (!user?.uid || localLoading) return;

    try {
      setLocalLoading(true);
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      const updatedReplies = (thread.replies || []).map(reply => {
        if (reply.id === replyId) {
          const likes = reply.likes || [];
          const newLikes = likes.includes(user.uid)
            ? likes.filter(id => id !== user.uid)
            : [...likes, user.uid];
          return { ...reply, likes: newLikes };
        }
        return reply;
      });

      setOptimisticUpdates(prev => ({
        ...prev,
        [threadId]: { ...thread, replies: updatedReplies }
      }));

      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, replies: updatedReplies } : t
      ));

      await likeReply(threadId, updatedReplies.findIndex(r => r.id === replyId), user.uid);

    } catch (error) {
      console.error("Reply like error:", error);
      showNotification("Reply like update failed", "error");
      setOptimisticUpdates(prev => ({ ...prev, [threadId]: undefined }));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAddReply = async (threadId, replyText) => {
    if (!user?.uid || localLoading) return;

    try {
      setLocalLoading(true);
      const tempReply = {
        id: `temp-${Date.now()}`,
        text: replyText,
        user: user.displayName || user.email,
        userId: user.uid,
        likes: [],
        createdAt: new Date().toISOString(),
      };

      setOptimisticUpdates(prev => ({
        ...prev,
        [threadId]: {
          ...prev[threadId],
          replies: [...(prev[threadId]?.replies || []), tempReply]
        }
      }));

      setThreads(prev => prev.map(t => 
        t.id === threadId 
          ? { ...t, replies: [...(t.replies || []), tempReply] } 
          : t
      ));

      const replyData = {
        text: replyText,
        user: user.displayName || user.email,
        userId: user.uid,
        likes: []
      };
      await addReply(threadId, replyData);

      showNotification("Reply posted!", "success");
    } catch (error) {
      console.error("Reply error:", error);
      showNotification("Failed to post reply", "error");
      setOptimisticUpdates(prev => ({
        ...prev,
        [threadId]: {
          ...prev[threadId],
          replies: (prev[threadId]?.replies || []).filter(r => !r.id.startsWith('temp-'))
        }
      }));
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    setOptimisticUpdates(prev => {
      const validUpdates = {};
      threads.forEach(thread => {
        if (prev[thread.id]) validUpdates[thread.id] = prev[thread.id];
      });
      return validUpdates;
    });
  }, [threads]);

  if (isLoading && !threads.length) {
    return <div className="loading">Loading discussions...</div>;
  }

  if (!threads.length) {
    return <div className="empty">No discussions found</div>;
  }

  return (
    <div className="thread-list">
      {threads.map(thread => (
        <ThreadItem
          key={thread.id}
          thread={normalizeThread(thread)}
          user={user}
          onLikeThread={handleLikeThread}
          onAddReply={handleAddReply}
          onLikeReply={handleLikeReply}
          onBookmarkThread={onBookmarkThread}
          isBookmarked={bookmarks.includes(thread.id)}
          isDisabled={localLoading}
        />
      ))}
    </div>
  );
};

export default ThreadList;