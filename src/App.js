import React, { useEffect, useState } from "react";
import { auth } from "./config/firebase";
import { logout } from "./services/authService";
import { 
  fetchThreads, 
  addThread,
  getUserBookmarks,
  toggleBookmark,
  bookmarkThread,
  unbookmarkThread,
  searchThreads
} from "./services/threadService";
import { FiLogOut, FiMessageSquare, FiUser, FiHome, FiTrendingUp, FiBell, FiBookmark, FiSettings, FiSearch, FiUsers, FiSun, FiMoon } from "react-icons/fi";
import LoginForm from "./components/Auth/LoginForm";
import ThreadList from "./components/Threads/ThreadList";
import CreateThread from "./components/Threads/CreateThread";
import ProfilePage from "./components/Profile/ProfilePage";
import NotificationDropdown from './components/Notifications/NotificationDropdown';
import CommunityList from './components/Communities/CommunityList';
import { getCommunities } from "./services/communityService";
import "./App.css";

// Utility to get a persistent gradient for a user or community
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
function getUserGradient(idOrName) {
  if (!idOrName) return gradients[0];
  const key = `pfp-gradient-${idOrName}`;
  let idx = localStorage.getItem(key);
  if (idx === null) {
    idx = hashString(idOrName) % gradients.length;
    localStorage.setItem(key, idx);
  }
  return gradients[idx];
}

function getGradientMainColor(gradient) {
  // Extract the first color from the gradient string
  const match = gradient.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1]}` : '#fff';
}

function App() {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkedThreads, setBookmarkedThreads] = useState([]);
  const [activeTab, setActiveTab] = useState("discussions");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sidebarCommunities, setSidebarCommunities] = useState([]);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const loadData = async (currentUser) => {
      try {
        setIsLoading(true);
        const fetchedThreads = await fetchThreads(selectedCommunity?.id);
        setThreads(fetchedThreads || []);
        setFilteredThreads(fetchedThreads || []);
        
        if (currentUser) {
          try {
            const userBookmarks = await getUserBookmarks(currentUser.uid);
            setBookmarks(userBookmarks || []);
            
            // Fetch all threads to filter bookmarked ones
            const allThreads = await fetchThreads();
            const bookmarkedThreadsList = allThreads.filter(thread => 
              userBookmarks.includes(thread.id)
            );
            setBookmarkedThreads(bookmarkedThreadsList);
          } catch (bookmarkError) {
            console.error("Error loading bookmarks:", bookmarkError);
            setBookmarks([]);
            setBookmarkedThreads([]);
          }
        }
      } catch (error) {
        console.error("Error loading threads:", error);
        setThreads([]);
        setFilteredThreads([]);
        showNotification("Error loading discussions. Please refresh.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      await loadData(user);
    });

    return () => unsubscribe();
  }, [selectedCommunity]);

  // Add a new useEffect to update bookmarked threads when bookmarks change
  useEffect(() => {
    const updateBookmarkedThreads = async () => {
      if (user && bookmarks.length > 0) {
        try {
          const allThreads = await fetchThreads();
          const bookmarkedThreadsList = allThreads.filter(thread => 
            bookmarks.includes(thread.id)
          );
          setBookmarkedThreads(bookmarkedThreadsList);
        } catch (error) {
          console.error("Error updating bookmarked threads:", error);
        }
      } else {
        setBookmarkedThreads([]);
      }
    };

    updateBookmarkedThreads();
  }, [bookmarks, user]);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchThreads(searchTerm, selectedCommunity?.id).then(setFilteredThreads);
    } else {
      setFilteredThreads(threads);
    }
  }, [searchTerm, threads, selectedCommunity]);

  // Update the useEffect for sidebar communities
  useEffect(() => {
    const loadSidebarCommunities = async () => {
      if (user) {
        try {
          const communities = await getCommunities();
          // Sort communities by thread count
          const sortedCommunities = communities.sort((a, b) => 
            (b.threadCount || 0) - (a.threadCount || 0)
          );
          setSidebarCommunities(sortedCommunities.slice(0, 5)); // Show top 5 communities
        } catch (error) {
          console.error("Error loading sidebar communities:", error);
        }
      }
    };

    loadSidebarCommunities();
  }, [user, activeTab, selectedCommunity]); // Add dependencies to reload when these change

  // Add a new useEffect to reload sidebar communities when threads change
  useEffect(() => {
    if (user && activeTab === "discussions") {
      const loadSidebarCommunities = async () => {
        try {
          const communities = await getCommunities();
          const sortedCommunities = communities.sort((a, b) => 
            (b.threadCount || 0) - (a.threadCount || 0)
          );
          setSidebarCommunities(sortedCommunities.slice(0, 5));
        } catch (error) {
          console.error("Error updating sidebar communities:", error);
        }
      };

      loadSidebarCommunities();
    }
  }, [threads, user, activeTab]);

  // Add useEffect to handle profile navigation
  useEffect(() => {
    const handleProfileNavigation = (e) => {
      const path = window.location.pathname;
      if (path.startsWith('/profile/')) {
        const profileId = path.split('/profile/')[1];
        setViewingProfileId(profileId);
        setActiveTab('profile');
      }
    };

    window.addEventListener('popstate', handleProfileNavigation);
    handleProfileNavigation(); // Handle initial load

    return () => window.removeEventListener('popstate', handleProfileNavigation);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = async (text) => {
    try {
      setIsLoading(true);
      const newThread = {
        text,
        user: user.displayName || user.email,
        userId: user.uid,
        likes: [],
        replies: [],
        createdAt: new Date().toISOString(),
        communityId: selectedCommunity?.id || null
      };
      
      const createdThread = await addThread(newThread);
      
      setThreads(prev => [{
        ...createdThread,
        id: createdThread.id,
        likes: [],
        replies: []
      }, ...prev]);
      
      showNotification("Thread created successfully!", "success");
    } catch (error) {
      console.error("Error creating thread:", error);
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkThread = async (threadId) => {
    try {
      if (!user?.uid) {
        showNotification("Please login to bookmark", "error");
        return;
      }
  
      const { operation } = await toggleBookmark(user.uid, threadId);
      
      // Update bookmarks state
      setBookmarks(prev => {
        const newBookmarks = operation === 'added' 
          ? [...prev, threadId] 
          : prev.filter(id => id !== threadId);
        return newBookmarks;
      });

      // Update bookmarkedThreads state
      if (operation === 'added') {
        // Add the thread to bookmarkedThreads if it's not already there
        const thread = threads.find(t => t.id === threadId);
        if (thread) {
          setBookmarkedThreads(prev => [thread, ...prev]);
        }
      } else {
        // Remove the thread from bookmarkedThreads
        setBookmarkedThreads(prev => prev.filter(t => t.id !== threadId));
      }
  
      showNotification(
        operation === 'added' ? "Bookmark added!" : "Bookmark removed",
        "success"
      );
    } catch (error) {
      console.error("Bookmark error:", error);
      showNotification("Failed to update bookmark", "error");
    }
  };

  // Update the profile tab rendering
  const renderProfileTab = () => {
    if (viewingProfileId) {
      return (
        <ProfilePage
          user={user}
          showNotification={showNotification}
          isViewingOtherProfile={true}
          targetUserId={viewingProfileId}
        />
      );
    }
    return (
      <ProfilePage
        user={user}
        showNotification={showNotification}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="splash-logo">Q</div>
        <div className="splash-title">QwiX</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`app-container${darkMode ? ' dark-mode' : ''}`}>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="app-header">
        <div className="header-container">
          <div className="logo-container" onClick={() => {
            if (user) {
              setActiveTab('discussions');
              setViewingProfileId(null);
            }
          }}>
            <FiMessageSquare className="logo-icon" />
            <h1 className="logo-text">QwiX</h1>
          </div>
          {user ? (
            <div className="user-controls">
              <button
                className="theme-toggle-btn"
                onClick={() => setDarkMode((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.6rem',
                  color: 'var(--brand-accent)'
                }}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <FiSun /> : <FiMoon />}
              </button>
              <NotificationDropdown userId={user.uid} />
              <div className="user-dropdown">
                <div className="user-avatar">
                  <FiUser />
                </div>
                <span className="user-name">{user.displayName || user.email}</span>
                <button 
                  onClick={handleSignOut}
                  className="signout-btn"
                  disabled={isLoading}
                >
                  <FiLogOut />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="theme-toggle-btn"
              onClick={() => setDarkMode((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.6rem',
                color: 'var(--brand-accent)'
              }}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {!user ? (
          <LoginForm 
            showNotification={showNotification}
            setIsLoading={setIsLoading}
          />
        ) : (
          <div className="forum-layout">
            <nav className="forum-sidebar">
              <div className="sidebar-content">
                <div className="sidebar-section">
                  <h3 className="sidebar-title">Menu</h3>
                  <ul className="sidebar-menu">
                    <li 
                      className={`menu-item ${activeTab === "discussions" ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab("discussions");
                        setSelectedCommunity(null);
                      }}
                    >
                      <FiHome className="menu-icon" />
                      <span>Discussions</span>
                    </li>
                    <li 
                      className={`menu-item ${activeTab === "communities" ? 'active' : ''}`}
                      onClick={() => setActiveTab("communities")}
                    >
                      <FiUsers className="menu-icon" />
                      <span>Communities</span>
                    </li>
                    <li 
                      className={`menu-item ${activeTab === "bookmarks" ? 'active' : ''}`}
                      onClick={() => setActiveTab("bookmarks")}
                    >
                      <FiBookmark className="menu-icon" />
                      <span>Bookmarks</span>
                    </li>
                    <li 
                      className={`menu-item ${activeTab === "profile" ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab("profile");
                        setViewingProfileId(null);
                      }}
                    >
                      <FiUser className="menu-icon" />
                      <span>Profile</span>
                    </li>
                  </ul>
                </div>

                {/* Add new sidebar section for communities */}
                <div className="sidebar-section">
                  <h3 className="sidebar-title">Top Communities</h3>
                  <ul className="sidebar-communities">
                    {sidebarCommunities.slice(0, showAllCommunities ? undefined : 5).map(community => (
                      <li 
                        key={community.id}
                        className={`sidebar-community-item ${selectedCommunity?.id === community.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCommunity(community);
                          setActiveTab("discussions");
                        }}
                      >
                        <div className="community-item-content">
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: getUserGradient(community.id || community.name),
                          }}>
                            <FiUsers className="community-icon" style={{ color: '#fff' }} />
                          </span>
                          <div className="community-item-info">
                            <span className="community-name" style={{ color: getGradientMainColor(getUserGradient(community.id || community.name)) }}>{community.name}</span>
                            <span className="community-stats">
                              {community.threadCount || 0} threads
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {sidebarCommunities.length > 5 && (
                    <button 
                      className="show-more-btn"
                      onClick={() => setShowAllCommunities(!showAllCommunities)}
                    >
                      {showAllCommunities ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>
            </nav>
            
            <div className="forum-content">
              {activeTab === "discussions" && (
                <>
                  {selectedCommunity && (
                    <div className="community-header">
                      <div className="community-header-content">
                        <h1>{selectedCommunity.name}</h1>
                        <p className="community-description">{selectedCommunity.description}</p>
                        <div className="community-stats">
                          <span>{selectedCommunity.threadCount || 0} threads</span>
                          <span>{selectedCommunity.members?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder={selectedCommunity ? `Search in ${selectedCommunity.name}...` : "Search discussions..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <CreateThread 
                    onCreateThread={handleCreateThread}
                    isLoading={isLoading}
                    selectedCommunity={selectedCommunity}
                  />
                  <ThreadList
                    threads={filteredThreads}
                    user={user}
                    setThreads={setThreads}
                    showNotification={showNotification}
                    onBookmarkThread={handleBookmarkThread}
                    bookmarks={bookmarks}
                    selectedCommunity={selectedCommunity}
                  />
                </>
              )}
              {activeTab === "communities" && (
                <CommunityList
                  onCommunitySelect={(community) => {
                    setSelectedCommunity(community);
                    setActiveTab("discussions");
                  }}
                  showNotification={showNotification}
                />
              )}
              {activeTab === "bookmarks" && (
                <ThreadList
                  threads={bookmarkedThreads}
                  user={user}
                  setThreads={setThreads}
                  showNotification={showNotification}
                  onBookmarkThread={handleBookmarkThread}
                  bookmarks={bookmarks}
                />
              )}
              {activeTab === "profile" && renderProfileTab()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;