import React, { useContext } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, Activity, Layers, ArrowRight, ArrowUpRight } from 'lucide-react'
import './index.css'
import RuralApp from './RuralApp.jsx'
import UrbanApp from './UrbanApp.jsx'
import AuditDashboard from './AuditDashboard.jsx'
import RepaymentTracker from './RepaymentTracker.jsx'
import CollectionCalendar from './CollectionCalendar.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import { AuthContext } from './AuthContext.jsx'
import heroImage from './assets/images/bank_lending_money-removebg-preview.png'

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
    <nav className="top-navbar" style={{ position: "relative" }}>
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
           <Layers size={32} color="white" strokeWidth={2.5} />
        </Link>
      </div>
      
      <div className="navbar-links" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        <Link to="/" className={path === '/' ? 'active' : ''}>Home</Link>
        {token && (
          <>
            <Link to="/rural" className={path === '/rural' ? 'active' : ''}>Rural Engine</Link>
            <Link to="/urban" className={path === '/urban' ? 'active' : ''}>Urban Bureau</Link>
            <Link to="/compliance" className={path === '/compliance' ? 'active' : ''}>Compliance</Link>
            <Link to="/calendar" className={path === '/calendar' ? 'active' : ''}>Calendar</Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {token ? (
           <button className="btn-login" onClick={handleLogout} style={{background: "var(--neon-green)", color: "#111", border: "1px solid var(--neon-green)"}}>Log Out</button>
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
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", paddingBottom: "4rem" }}>
    
    {/* HERO SECTION - Takes up full viewport height so you have to scroll down for cards */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "85vh" }}>
      <div className="page-header" style={{ marginBottom: "0", textAlign: "left", flex: "1", paddingRight: "2rem" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1.2rem", lineHeight: "1.1", letterSpacing: "-1px", fontWeight: "800", color: "white" }}>
          Simplify your <br/>Lending. Amplify <br/>your Impact.
        </h1>
        <p style={{ maxWidth: "500px", fontSize: "1.1rem", lineHeight: "1.6", color: "var(--text-muted)", marginBottom: "2rem" }}>
          Elevate your financial operations with our Dual-Mode AI Lending System. Seamlessly predict risk and automate decisions for both unbanked rural applicants and commercial enterprises.
        </p>
        <Link to={token ? "/urban" : "/signup"}>
          <button className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", background: "var(--neon-green)", color: "#111", border: "none", borderRadius: "30px", fontWeight: "bold" }}>Get Started</button>
        </Link>
      </div>

      <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
        <img 
          src={heroImage} 
          alt="AI Lending Dashboard Hero" 
          style={{ width: "135%", maxWidth: "800px", height: "auto", objectFit: "contain", filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.4))", zIndex: 10, transform: "translateX(-20px) scale(1.15)" }} 
        />
      </div>
    </div>
    
    {/* CARDS SECTION - Appears clearly below after scroll */}
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(350px, 1fr)', gap: '3rem', marginTop: "4rem" }}>
      
      {/* Rural Engine Card (Light Green Box) */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "3rem", borderRadius: "32px 100px 32px 32px", minHeight: "300px", background: "linear-gradient(135deg, #d4ff70, #a8e030)", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
        {/* Subtle decorative background ring */}
        <div style={{ position: "absolute", bottom: "-30px", right: "-30px", width: "150px", height: "150px", border: "2px solid rgba(0,0,0,0.06)", borderRadius: "50%" }}></div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", color: "#111", fontWeight: "800", letterSpacing: "-0.5px" }}>
            <Users size={32} color="#111" />
            Rural Engine
          </h2>
          <p style={{ color: "rgba(0,0,0,0.75)", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "25px", fontWeight: "600", maxWidth: "90%" }}>
            Evaluate high-risk, unbanked loan applicants using custom synthetic behavioral risk proxies (water access, social class, and collateral).
          </p>
        </div>
        <Link to={token ? "/rural" : "/signup"} style={{ position: "relative", zIndex: 1 }}>
          <button className="btn-login" style={{ background: "#111", color: "var(--neon-green)", border: "none", padding: "0.9rem 2rem", fontSize: "1.05rem", width: "fit-content", fontWeight: "bold", borderRadius: "30px", display: "flex", alignItems: "center", gap: "8px" }}>
            Launch Engine
            <ArrowRight size={18} />
          </button>
        </Link>
      </div>

      {/* Urban Bureau Card (Black Box) */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "3rem", borderRadius: "100px 32px 32px 32px", background: "#060606", border: "1px solid rgba(255,255,255,0.03)", minHeight: "300px", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        {/* Top right floating arrow indicator like mockup black box */}
        <div style={{ position: "absolute", top: "35px", right: "35px", background: "rgba(255,255,255,0.05)", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowUpRight size={24} color="#666" />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", color: "white", fontWeight: "800", letterSpacing: "-0.5px", marginTop: "1rem" }}>
            <Activity size={32} color="white" />
            Urban Bureau
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "25px", maxWidth: "85%" }}>
            Simulate enterprise JSON queries against national credit bureaus and apply 20+ feature overrides dynamically.
          </p>
        </div>
        <Link to={token ? "/urban" : "/signup"} style={{ position: "relative", zIndex: 1 }}>
          <button className="btn-login" style={{ background: "var(--neon-green)", color: "#111", border: "none", padding: "0.9rem 2rem", fontSize: "1.05rem", width: "fit-content", fontWeight: "bold", borderRadius: "30px", display: "flex", alignItems: "center", gap: "8px" }}>
            Launch Simulator
            <ArrowRight size={18} />
          </button>
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
          <Route path="/calendar" element={<CollectionCalendar />} />
          <Route path="/repayment/:loanId" element={<RepaymentTracker />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
