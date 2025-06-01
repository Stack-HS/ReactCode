import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';

function DashboardWrapper() {
  const location = useLocation();
  const { username, password } = location.state || {};
  if (!username || !password) return <Navigate to="/portal" replace />;
  return <Dashboard username={username} password={password} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portal" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;