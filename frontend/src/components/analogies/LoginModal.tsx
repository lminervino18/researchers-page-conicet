import React, { useState, useEffect } from 'react';
import { checkEmailRegistration, updateUserName } from '../../api/emailVerification'; 
import './styles/LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [usernameRequired, setUsernameRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalUsername, setFinalUsername] = useState('');

  useEffect(() => {
  if (!isOpen && !showSuccess) {
    setUsername('');
    setEmail('');
    setError('');
    setEmailExists(null);
    setUsernameRequired(false);
    setLoading(false);
    setFinalUsername('');
  }
}, [isOpen, showSuccess]);


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailExists(null);

    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const userData = await checkEmailRegistration(email);

      if (!userData.registered) {
        setError('This email is not authorized to comment or support');
        setEmailExists(false);
        setLoading(false);
        return;
      }

      setEmailExists(true);

      if (!userData.username) {
        setUsernameRequired(true);
        setLoading(false);
        return;
      }

      onLogin(userData.username, email);
      setFinalUsername(userData.username);
      setShowSuccess(true);
      setLoading(false);
      setShowSuccess(true);
      setLoading(false);


    } catch (err) {
      setError('An error occurred during email verification');
      setLoading(false);
    }
  };

  const handleSetUsername = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUserName(email, username.trim());

      onLogin(username.trim(), email);
      setFinalUsername(username.trim());
      setShowSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Error saving username');
      setLoading(false);
    }
  };

  if (!isOpen && !showSuccess) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className={`login-modal-content ${showSuccess ? 'success-message' : ''}`}>
          {showSuccess ? (
            <>
              <h2>🎉 You're logged in!</h2>
              <p style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '1rem' }}>
                Welcome, <strong>{finalUsername || 'User'}</strong>! You can now comment and support.
              </p>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSuccess(false);
                    onClose();
                  }}
                >
                  Continue
                </button>
              </div>
            </>

          ) : usernameRequired ? (
            <>
              <p className="verification-hint">
                Your email is authorized but you need to set your username.<br/>
                This can only be done <strong>once</strong> and cannot be changed later.
              </p>
              <div className="form-group">
                <label htmlFor="username">Username (one-time set)</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your username"
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSetUsername}
                  disabled={loading}
                >
                  Save Username
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Verify Your Access</h2>
              <p className="verification-hint">
                Check if your email is allowed to comment or support!
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  {emailExists === false && (
                    <p className="error-message">
                      This email is not authorized to comment or support
                    </p>
                  )}
                  <input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required 
                    disabled={loading}
                  />
                </div>
                {error && emailExists !== false && <p className="error-message">{error}</p>}
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Verify
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
