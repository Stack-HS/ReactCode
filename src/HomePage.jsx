import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #e6b9f2 0%, #a3c7f7 100%)', // Approximate gradient from 1.png
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        {/* Placeholder for Logo/Image based on the image provided */}
        {/* You would replace this div with an actual image tag */}
        <div
          style={{
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          SS
        </div>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            marginBottom: '1rem',
          }}
        >
          StudentStack
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            fontWeight: 500,
            opacity: 0.9,
          }}
        >
          Simplify your academic life.
        </p>
      </div>

      <button
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#4a6fa5', // Dark blue text color from dashboard theme
          fontWeight: 700,
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '2rem',
          padding: '1rem 2.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
        }}
        onClick={() => navigate('/portal')}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 1)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        }}
      >
        Get Started
      </button>
    </div>
  );
} 