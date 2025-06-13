import React, { useState } from 'react';
import { FiLogIn, FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signUp, signInWithGoogle } from '../../services/authService';
// Create a new file LoginForm.css in the same folder as LoginForm.js
import './LoginForm.css'; // Add this at the top of LoginForm.js

const LoginForm = ({ setIsLoading, showNotification, isLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (activeTab === "login") {
        await signIn(email, password);
        showNotification("Logged in successfully!", "success");
      } else {
        if (!name.trim()) {
          showNotification("Please enter your name", "error");
          return;
        }
        await signUp(email, password, name.trim());
        showNotification("Account created successfully!", "success");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showNotification("Google login successful!", "success");
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="auth-container"
    >
      <div className="auth-card" style={{ perspective: 1200 }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.25 }}
              style={{ position: 'relative', width: '100%' }}
            >
              <div className="auth-header">
                <h1>QwiX</h1>
                <p>Connect with people worldwide</p>
              </div>
              <div className="auth-tabs">
                <button
                  className={`tab-btn ${activeTab === "login" ? "active" : "active"}`}
                  disabled={isLoading}
                  onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                >
                  {activeTab === "login" ? "Sign In" : "Create Account"}
                </button>
              </div>
              <form onSubmit={handleSubmit} className="auth-form">
                {activeTab === "register" && (
                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {activeTab === "login" && (
                  <div className="forgot-password">
                    <a href="#reset">Forgot password?</a>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  type="submit"
                  className="auth-submit"
                  disabled={isLoading}
                >
                  <FiLogIn className="btn-icon" />
                  {isLoading ? "Processing..." : (activeTab === "login" ? "Sign In" : "Create Account")}
                </motion.button>
                <div className="divider">
                  <span>OR</span>
                </div>
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="google-auth"
                  disabled={isLoading}
                >
                  <FaGoogle className="btn-icon" />
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </motion.button>
              </form>
              <div className="auth-footer">
                {activeTab === "login" ? (
                  <p>Don't have an account? <button 
                    onClick={() => setActiveTab("register")}
                    disabled={isLoading}
                  >Sign up</button></p>
                ) : (
                  <p>Already have an account? <button 
                    onClick={() => setActiveTab("login")}
                    disabled={isLoading}
                  >Sign in</button></p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;