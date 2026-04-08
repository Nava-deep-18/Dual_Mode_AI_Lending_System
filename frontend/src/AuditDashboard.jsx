import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

const AuditDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await axios.get("http://127.0.0.1:8000/api/history?limit=50");
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
                  <th style={{ padding: "1rem" }}>Risk Score</th>
                  <th style={{ padding: "1rem" }}>Decision</th>
                  <th style={{ padding: "1rem" }}>Safe Limit (₹)</th>
                  <th style={{ padding: "1rem" }}>Interest Rate</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No loan evaluations have been executed yet.</td></tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "1rem", color: "var(--text-muted)" }}>#{r.id}</td>
                      <td style={{ padding: "1rem" }}>{new Date(r.created_at).toLocaleString()}</td>
                      <td style={{ padding: "1rem", color: "white" }}>{r.loan_module}</td>
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
    </div>
  );
};

export default AuditDashboard;
