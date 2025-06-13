import { db } from "../config/firebase";

export const shareThread = async (thread) => {
  try {
    if (!thread?.id) {
      throw new Error("Invalid thread data");
    }

    const url = `${window.location.origin}/thread/${thread.id}`;
    
    if (navigator.share) {
      await navigator.share({
        title: 'Check out this thread',
        text: thread.text?.substring(0, 100) || 'Interesting discussion',
        url: url
      });
      return { status: 'shared' };
    } else {
      await navigator.clipboard.writeText(url);
      return { status: 'copied' };
    }
  } catch (error) {
    console.error('Sharing failed:', error);
    throw error;
  }
};