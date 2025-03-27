import React, { useState } from 'react';
import { checkEmailRegistration } from '../../api/EmailVerification';
import './styles/LoginModal.css'; 

/**
 * Props interface for the LoginModal component
 * Defines the structure of props passed to the modal
 */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string) => void;
}

/**
 * LoginModal component for user authentication
 * Allows users to log in by providing a username and email
 */
const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  // State management for form inputs and error handling
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles form submission and email verification
   * @param e Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      // Check if email is registered and verified
      const isRegistered = await checkEmailRegistration(email);
      
      if (!isRegistered) {
        setError('This email is not authorized to comment or support');
        return;
      }

      // If all checks pass, proceed with login
      onLogin(username, email);
      onClose();
    } catch (err) {
      setError('An error occurred during email verification');
    }
  };

  // Do not render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="login-modal-content">
          <h2>Verify Your Access</h2>
          <p className="verification-hint">
            Check if your email is allowed to comment or support!
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                id="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;