import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSub = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/signup", { email, password });
      login(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create account. User might exist.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", animation: "fadeIn 0.4s ease" }}>
       <div className="card">
         <h2 style={{ marginBottom: "1rem", color: "var(--neon-green)" }}>New Registration</h2>
         {error && <div style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", padding: "10px", borderRadius: "8px", marginBottom: "15px" }}>{error}</div>}
         <form onSubmit={handleSub}>
           <div style={{ marginBottom: "1rem" }}>
             <label style={{ display: "block", marginBottom: "5px", color: "var(--text-muted)" }}>Email Address</label>
             <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
           </div>
           <div style={{ marginBottom: "1.5rem" }}>
             <label style={{ display: "block", marginBottom: "5px", color: "var(--text-muted)" }}>Secure Password</label>
             <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
           </div>
           <button type="submit" className="btn-primary" style={{ width: "100%", background: "var(--neon-green)", color: "#111" }}>Create Account</button>
           <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
             Already have an account? <Link to="/login" style={{ color: "var(--neon-green)", textDecoration: "none" }}>Log in</Link>
           </div>
         </form>
       </div>
    </div>
  );
};

export default Signup;
