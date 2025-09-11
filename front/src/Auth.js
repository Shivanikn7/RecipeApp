import React, { useState } from 'react';
import API from './api';

const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png'; // Recipe book logo

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    if (isLogin) {
      const res = await API.login(form.email, form.password);
      if (res.token) {
        onLogin(res.token, res.user?.username || form.email);
      } else {
        setMsg(res.message || 'Login failed');
      }
    } else {
      const res = await API.register(form.username, form.email, form.password);
      setMsg(res.message || 'Registration complete. Please login.');
      if (res.success) setIsLogin(true);
    }
  };

  return (
    <div className="auth-container colorful-auth">
      <div className="auth-logo-row">
        <img src={logoUrl} alt="Recipe e-Book" className="auth-logo" />
        <span className="auth-title">Recipe e-Book</span>
      </div>
      <h1 style={{ textAlign: 'center', color: '#ff9800', fontWeight: 800, fontSize: '2.2rem', marginBottom: 8, letterSpacing: 1 }}>
        Recipe Management & Meal Plan
      </h1>
      <h2 style={{ color: isLogin ? '#1976d2' : '#43a047', fontWeight: 700, marginBottom: 18 }}>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            style={{ background: '#f3faff', color: '#1976d2', fontWeight: 500 }}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ background: '#f3faff', color: '#1976d2', fontWeight: 500 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ background: '#f3faff', color: '#1976d2', fontWeight: 500 }}
        />
        <button type="submit" className="auth-main-btn" style={{ background: isLogin ? '#1976d2' : '#43a047', color: '#fff', fontWeight: 700, fontSize: '1.15rem', marginTop: 8 }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div style={{ marginTop: 18 }}>
        <button type="button" className="auth-switch-btn" onClick={() => setIsLogin(!isLogin)} style={{ background: '#fff', color: isLogin ? '#43a047' : '#1976d2', border: `2px solid ${isLogin ? '#43a047' : '#1976d2'}`, fontWeight: 600, borderRadius: 8, padding: '0.6rem 1.2rem', fontSize: '1rem', marginBottom: 8 }}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
      {msg && <div className="msg" style={{ color: msg.includes('success') || msg.includes('complete') ? '#43a047' : '#d32f2f', fontWeight: 600, marginTop: 10 }}>{msg}</div>}
    </div>
  );
}