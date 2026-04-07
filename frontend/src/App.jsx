import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Activity, FileText } from 'lucide-react'
import './index.css'
import RuralApp from './RuralApp.jsx'
import UrbanApp from './UrbanApp.jsx'

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        Nexus Enterprise AI
      </div>
      <nav>
        <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard Overview
        </Link>
        <Link to="/rural" className={`nav-link ${path === '/rural' ? 'active' : ''}`}>
          <Users size={20} />
          Rural Microfinance
        </Link>
        <Link to="/urban" className={`nav-link ${path === '/urban' ? 'active' : ''}`}>
          <Activity size={20} />
          Urban Commercial
        </Link>
        <Link to="/compliance" className={`nav-link ${path === '/compliance' ? 'active' : ''}`}>
          <FileText size={20} />
          Fair Lending Policy
        </Link>
      </nav>
    </div>
  );
};

const DashboardHome = () => (
  <div>
    <div className="page-header">
      <h1>Global Operations Dashboard</h1>
      <p>Select a lending module from the sidebar to begin applicant credit evaluation.</p>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}><Users color="var(--primary-blue)" /> Rural Micro-Lending Desk</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px', marginBottom: '20px', lineHeight: '1.5' }}>
          Evaluate high-risk, low-data agrarian loan applicants using custom synthetic behavioral risk proxies.
        </p>
        <Link to="/rural">
          <button className="btn-primary">Launch Rural Desk</button>
        </Link>
      </div>
      
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}><Activity color="var(--primary-blue)" /> Urban Bureau Simulator</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px', marginBottom: '20px', lineHeight: '1.5' }}>
          Simulate enterprise Equifax/CIBIL API queries utilizing historical credit limits and 20+ feature overrides.
        </p>
        <Link to="/urban">
          <button className="btn-primary">Launch Commercial App</button>
        </Link>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/rural" element={<RuralApp />} />
          <Route path="/urban" element={<UrbanApp />} />
          <Route path="/compliance" element={
            <div>
               <div className="page-header">
                 <h1>Compliance & Ethics</h1>
                 <p>AI Bias Reporting Dashboard</p>
               </div>
               <div className="card">
                 <h3 style={{margin:0}}>Module In Development</h3>
                 <p style={{marginTop: '10px'}}>This module will surface historical AI approvals vs demographic proxies soon.</p>
               </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  )
}

export default App
