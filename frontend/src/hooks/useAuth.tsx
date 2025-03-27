import { useState, useEffect } from 'react';

interface AuthUser {
  username: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check localStorage on initial load
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');

    if (storedUsername && storedEmail) {
      setUser({ username: storedUsername, email: storedEmail });
    }
  }, []);

  const login = (username: string, email: string) => {
    // Store in localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    
    // Update state
    setUser({ username, email });
  };

  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    
    // Clear state
    setUser(null);
  };

  return { user, login, logout };
};