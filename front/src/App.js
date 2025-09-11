import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user') || '');

  const handleLogin = (token, username) => {
    setToken(token);
    setUser(username);
    localStorage.setItem('token', token);
    localStorage.setItem('user', username);
  };

  const handleLogout = () => {
    setToken(null);
    setUser('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return token ? (
    <Dashboard token={token} user={user} onLogout={handleLogout} />
  ) : (
    <Auth onLogin={handleLogin} />
  );
}

export default App;
