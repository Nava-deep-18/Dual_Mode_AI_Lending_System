import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

const AuditDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const resp = await axios.get("http://127.0.0.1:8000/api/history?limit=50", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(resp.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}><Shield size={36} color="var(--neon-green)" /> AI Compliance & Audit Log</h1>
        <p>Immutable ledger of all historic AI evaluations processed through local engine.</p>
      </div>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Connecting to SQLite Audit Database...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "1rem", color: "var(--neon-green)" }}>ID</th>
                  <th style={{ padding: "1rem" }}>Timestamp</th>
                  <th style={{ padding: "1rem" }}>Origination Module</th>
                  <th style={{ padding: "1rem", color: "var(--text-bright)" }}>Borrower/Entity</th>
                  <th style={{ padding: "1rem" }}>Risk Score</th>
                  <th style={{ padding: "1rem" }}>Decision</th>
                  <th style={{ padding: "1rem" }}>Safe Limit (₹)</th>
                  <th style={{ padding: "1rem" }}>Interest Rate</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="8" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No loan evaluations have been executed yet.</td></tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} onClick={() => setSelectedRecord(r)} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "all 0.2s" }}>
                      <td style={{ padding: "1rem", color: "var(--text-muted)" }}>#{r.id}</td>
                      <td style={{ padding: "1rem" }}>{new Date(r.created_at).toLocaleString()}</td>
                      <td style={{ padding: "1rem", color: "white" }}>{r.loan_module}</td>
                      <td style={{ padding: "1rem", color: "var(--text-bright)", fontWeight: "bold" }}>{r.borrower_name}</td>
                      <td style={{ padding: "1rem", fontWeight: "bold", color: r.risk_score > 60 ? "#ef4444" : r.risk_score > 35 ? "#f59e0b" : "var(--neon-green)" }}>{r.risk_score.toFixed(1)}% ({r.risk_tier})</td>
                      <td style={{ padding: "1rem" }}>
                         <span style={{ 
                           background: r.decision.includes("Approved") ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                           color: r.decision.includes("Approved") ? "#10b981" : "#ef4444",
                           padding: "4px 8px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600",
                           display: "inline-block"
                         }}>{r.decision}</span>
                      </td>
                      <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "1.1rem" }}>{r.max_loan_limit ? `₹${r.max_loan_limit.toLocaleString()}` : "N/A"}</td>
                      <td style={{ padding: "1rem", fontFamily: "monospace", color: "var(--neon-green)" }}>{r.suggested_interest_rate ? `${r.suggested_interest_rate.toFixed(1)}%` : "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
          backdropFilter: "blur(5px)"
        }}>
          <div className="card" style={{ width: "90%", maxWidth: "650px", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setSelectedRecord(null)} style={{ position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", color: "var(--neon-green)", fontSize: "1.2rem", cursor: "pointer" }}>✖</button>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--neon-green)" }}>Evaluation Trace #{selectedRecord.id}</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Borrower Name</strong> <br/><span style={{ fontSize: "1.1rem", color: "white" }}>{selectedRecord.borrower_name}</span></div>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Decision</strong> <br/>
                <span style={{ color: selectedRecord.decision.includes("Approved") ? "#10b981" : "#ef4444", fontWeight: "bold" }}>{selectedRecord.decision}</span>
              </div>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Risk Score</strong> <br/><span style={{ color: "white" }}>{selectedRecord.risk_score.toFixed(1)}%</span></div>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Max Limit</strong> <br/><span style={{ color: "white" }}>{selectedRecord.max_loan_limit ? `₹${selectedRecord.max_loan_limit.toLocaleString()}` : "N/A"}</span></div>
            </div>
            
            <h3 style={{ marginBottom: "10px", paddingBottom: "5px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--text-bright)" }}>Analyzed Raw Financials</h3>
            <pre style={{ background: "rgba(0,0,0,0.4)", padding: "15px", borderRadius: "8px", overflowX: "auto", fontSize: "0.85rem", color: "var(--neon-green)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {JSON.stringify(JSON.parse(selectedRecord.raw_input_data), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
