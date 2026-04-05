import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './index.css'

// -----------------------------------------
// PLACEHOLDER COMPONENTS (To be built next)
// -----------------------------------------
const RuralApp = () => (
  <div className="app-container">
    <Link to="/" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>← Back to Portal</Link>
    <div className="glass-panel" style={{ marginTop: "2rem" }}>
      <h2>🌾 Rural Microfinance Dashboard</h2>
      <p>The manual data-entry form will be built here.</p>
    </div>
  </div>
);

const UrbanApp = () => (
  <div className="app-container">
    <Link to="/" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>← Back to Portal</Link>
    <div className="glass-panel" style={{ marginTop: "2rem" }}>
      <h2>🏙️ Urban Commercial Dashboard</h2>
      <p>The simulated CIBIL fetch and override sliders will be built here.</p>
    </div>
  </div>
);

// -----------------------------------------
// LANDING PAGE (The Portal)
// -----------------------------------------
const LandingPage = () => {
  return (
    <div className="app-container">
      <header className="landing-header">
        <h1>Dual-Mode Intelligent Lending</h1>
        <p>Select your origination module to begin evaluating applicants using Explainable AI.</p>
      </header>
      
      <div className="module-grid">
        {/* Urban Card */}
        <div className="glass-panel">
          <h2>🏙️ Urban Commercial Bank</h2>
          <p>Evaluate traditional borrowers using CIBIL data, credit utilization, and historical banking performance.</p>
          <Link to="/urban" className="btn-primary">Launch Urban Module</Link>
        </div>

        {/* Rural Card */}
        <div className="glass-panel">
          <h2>🌾 Rural Microfinance</h2>
          <p>Evaluate unbanked target populations using alternative metrics, DTI proxies, and socioeconomic indicators.</p>
          <Link to="/rural" className="btn-primary">Launch Rural Module</Link>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------
// ROUTER WRAPPER
// -----------------------------------------
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/rural" element={<RuralApp />} />
      <Route path="/urban" element={<UrbanApp />} />
    </Routes>
  )
}

export default App
