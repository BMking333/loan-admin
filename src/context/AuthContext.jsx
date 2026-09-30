import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('access') || null);

  const login = async (email, password) => { // ✅ use email
    try {
      const response = await api.post('token/', { email, password }); // ✅ send email instead of username

      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({ email }));

      setUser({ email });
      setToken(response.data.access);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const contextData = {
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
