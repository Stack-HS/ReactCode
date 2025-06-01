import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [district, setDistrict] = useState('district');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Check login by calling the info endpoint
      const url = `https://friscoisdhacapi.vercel.app/api/info?username=${username}&password=${password}`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data && res.data.name) {
        // Navigate to dashboard on successful login
        navigate('/dashboard', { state: { username, password } });
      } else {
        setError('Invalid login.');
      }
    } catch (err) {
      setError('Invalid login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #e6b9f2 0%, #a3c7f7 100%)', // Match homepage gradient
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#4a6fa5', // Dark text color
        padding: '2rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
         <h1
          style={{
            fontSize: '2.5rem', // Adjusted font size
            fontWeight: 800,
            marginBottom: '0.5rem',
            color: '#4a6fa5', // Dark text color
          }}
        >
          StudentStack
        </h1>
      </div>

      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem', // Adjusted spacing
          width: '100%',
          maxWidth: '400px', // Adjusted max-width
          background: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white background
          padding: '2rem', // Adjusted padding
          borderRadius: '16px', // Rounded corners
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)', // Subtle shadow
        }}
        onSubmit={handleLogin}
      >
        <select
          value={district}
          onChange={e => setDistrict(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1.2rem', // Adjusted padding
            borderRadius: '8px', // Rounded corners
            border: 'none',
            background: '#f0f0f0', // Light grey background
            fontWeight: 500,
            fontSize: '1rem',
            color: '#444',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', // Inner shadow
          }}
        >
          <option value="district">Frisco</option>
          {/* Add more districts here later */}
        </select>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1.2rem', // Adjusted padding
            borderRadius: '8px', // Rounded corners
            border: 'none',
            background: '#f0f0f0', // Light grey background
            fontWeight: 500,
            fontSize: '1rem',
            color: '#444',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', // Inner shadow
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1.2rem', // Adjusted padding
            borderRadius: '8px', // Rounded corners
            border: 'none',
            background: '#f0f0f0', // Light grey background
            fontWeight: 500,
            fontSize: '1rem',
            color: '#444',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', // Inner shadow
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            background: '#7d9fd6', // Accent color button
            color: '#fff', // White text color
            fontWeight: 700,
            fontSize: '1.1rem', // Adjusted font size
            border: 'none',
            borderRadius: '8px', // Rounded corners
            padding: '1rem 1.2rem', // Adjusted padding
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', // Subtle shadow
            marginTop: '1.5rem', // Adjusted margin
            transition: 'background 0.2s ease',
          }}
          disabled={loading}
          onMouseOver={(e) => e.target.style.background = '#a3c0ff'}
          onMouseOut={(e) => e.target.style.background = '#7d9fd6'}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      </form>
    </div>
  );
} 