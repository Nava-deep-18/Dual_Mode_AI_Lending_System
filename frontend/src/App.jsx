import React, { useContext } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, Activity } from 'lucide-react'
import './index.css'
import RuralApp from './RuralApp.jsx'
import UrbanApp from './UrbanApp.jsx'
import AuditDashboard from './AuditDashboard.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import { AuthContext } from './AuthContext.jsx'

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
           <span style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-1px", color: "var(--text-bright)" }}>Nexus<span style={{ color: "var(--neon-green)" }}>AI</span></span>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/" className={path === '/' ? 'active' : ''}>Home</Link>
        {token && (
          <>
            <Link to="/rural" className={path === '/rural' ? 'active' : ''}>Rural Engine</Link>
            <Link to="/urban" className={path === '/urban' ? 'active' : ''}>Urban Bureau</Link>
            <Link to="/compliance" className={path === '/compliance' ? 'active' : ''}>Compliance</Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {token ? (
           <button className="btn-login" onClick={handleLogout} style={{background: "transparent", color: "var(--neon-green)", border: "1px solid var(--neon-green)"}}>Log Out</button>
        ) : (
          <>
           <Link to="/signup"><button className="btn-login" style={{background: "var(--neon-green)", color: "#111", marginRight: "10px"}}>Sign Up</button></Link>
           <Link to="/login"><button className="btn-login">Log In</button></Link>
          </>
        )}
      </div>
    </nav>
  );
};

const DashboardHome = () => {
  const { token } = useContext(AuthContext);
  
  return (
  <div style={{ display: "flex", flexDirection: "column", maxWidth: "1200px", margin: "0 auto" }}>
    
    <div className="page-header" style={{ marginBottom: "2.5rem", textAlign: "center", marginTop: "0rem" }}>
      <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>Global Operations Dashboard</h1>
      <p style={{ maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>Predictive AI evaluation engine. Select a module below to begin screening applicants through the Rural or Commercial pipelines.</p>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(350px, 1fr)', gap: '2rem', marginTop: "2rem" }}>
      
      {/* Rural Desk Card */}
      <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={28} color="var(--neon-green)" />
            Rural Microfinance
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.6", marginBottom: "30px" }}>
            Evaluate high-risk, unbanked loan applicants using custom synthetic behavioral risk proxies (water access, social class, and collateral).
          </p>
        </div>
        <Link to={token ? "/rural" : "/signup"}>
          <button className="btn-primary" style={{ width: "100%" }}>Launch Rural Engine</button>
        </Link>
      </div>
      
      {/* Urban Bureau Card */}
      <div className="card-neon" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", color: "#111" }}>
            <Activity size={28} color="#111" />
            Urban Commercial
          </h2>
          <p style={{ color: "rgba(0,0,0,0.7)", fontSize: "1rem", lineHeight: "1.6", marginBottom: "30px" }}>
            Simulate enterprise JSON queries against national credit bureaus (CIBIL/Equifax) and apply 20+ feature overrides.
          </p>
        </div>
        <Link to={token ? "/urban" : "/signup"}>
          <button className="btn-primary" style={{ width: "100%", background: "#111", color: "var(--neon-green)" }}>Launch Bureau Simulator</button>
        </Link>
      </div>

    </div>
  </div>
  );
};

const App = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/rural" element={<RuralApp />} />
          <Route path="/urban" element={<UrbanApp />} />
          <Route path="/compliance" element={<AuditDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
