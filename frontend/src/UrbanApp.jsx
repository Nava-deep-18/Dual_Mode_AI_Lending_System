import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// The "Wizard of Oz" fake CIBIL Database
const MOCK_BUREAU_DB = {
  "ID-PRIME-001": {
    "EXT_SOURCE_MEAN": 0.85,
    "EXT_SOURCE_MIN": 0.70,
    "EXT_SOURCE_1": 0.80,
    "CC_UTILISATION_RATIO": 0.10,
    "INSTAL_LATE_RATE": 0.0,
    "CREDIT_TERM": 12.0,
    "PREV_REFUSAL_RATE": 0.0,
    "APARTMENTS_MEDI": 0.8,
    "PREV_APPROVED_COUNT": 5.0,
    "CC_AVG_BALANCE": 500.0,
    "FLAG_DOCUMENT_3": 1,
    "CODE_GENDER": 1,
    "FLAG_OWN_CAR": 1,
    "NAME_INCOME_TYPE_Working": 1,
    "NAME_INCOME_TYPE_Pensioner": 0,
    "NAME_CONTRACT_TYPE": 0,
    "REG_CITY_NOT_LIVE_CITY": 0,
    "DEF_60_CNT_SOCIAL_CIRCLE": 0.0,
    "NAME_EDUCATION_TYPE_Higher education": 1,
    "NAME_EDUCATION_TYPE_Secondary / secondary special": 0
  },
  "ID-RISK-002": {
    "EXT_SOURCE_MEAN": 0.15,
    "EXT_SOURCE_MIN": 0.05,
    "EXT_SOURCE_1": 0.10,
    "CC_UTILISATION_RATIO": 0.95,
    "INSTAL_LATE_RATE": 0.60,
    "CREDIT_TERM": 60.0,
    "PREV_REFUSAL_RATE": 0.90,
    "APARTMENTS_MEDI": 0.1,
    "PREV_APPROVED_COUNT": 0.0,
    "CC_AVG_BALANCE": 75000.0,
    "FLAG_DOCUMENT_3": 1,
    "CODE_GENDER": 1,
    "FLAG_OWN_CAR": 0,
    "NAME_INCOME_TYPE_Working": 1,
    "NAME_INCOME_TYPE_Pensioner": 0,
    "NAME_CONTRACT_TYPE": 0,
    "REG_CITY_NOT_LIVE_CITY": 1,
    "DEF_60_CNT_SOCIAL_CIRCLE": 3.0,
    "NAME_EDUCATION_TYPE_Higher education": 0,
    "NAME_EDUCATION_TYPE_Secondary / secondary special": 1
  }
};

const UrbanApp = () => {
  const [searchId, setSearchId] = useState("");
  const [formData, setFormData] = useState(null);
  
  const [fetching, setFetching] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setFetching(true);
    setError("");
    setFormData(null);
    setResult(null);

    // Simulate a 1.5 second enterprise API call to a credit bureau
    setTimeout(() => {
      const data = MOCK_BUREAU_DB[searchId.toUpperCase()];
      if (data) {
        setFormData({ ...data, borrower_name: "" });
      } else {
        setError("Applicant ID not found in CIBIL index. Try 'ID-PRIME-001' or 'ID-RISK-002'.");
      }
      setFetching(false);
    }, 1500);
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleDataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitEvaluation = async () => {
    setEvaluating(true);
    setError("");

    try {
      const payload = { ...formData, borrower_name: formData.borrower_name || "Anonymous" };
      const response = await axios.post("http://127.0.0.1:8000/api/predict/urban", payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the AI Engine. Is FastAPI running?");
    }
    setEvaluating(false);
  };

  return (
    <div className="app-container">
      <Link to="/" style={{ color: "var(--accent-blue)", textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
        ← Back to Portal
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
        
        {/* LEFT COLUMN: Data Fetching and Adjusting */}
        <div>
          {/* Section 1: The API Fetcher */}
          <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>🏙️ Bureau Sync</h2>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
              <input 
                type="text" 
                placeholder="Enter ID (e.g., ID-PRIME-001)" 
                value={searchId} 
                onChange={(e) => setSearchId(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} 
              />
              <button type="submit" className="btn-primary" style={{ marginTop: 0 }} disabled={fetching}>
                {fetching ? "Connecting to CIBIL..." : "Fetch Report"}
              </button>
            </form>
          </div>

          {/* Section 2: The Data Profile Editor */}
          {formData && (
            <div className="glass-panel" style={{ animation: "fadeIn 0.5s ease" }}>
              <h3 style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                <span>Applicant Profile Loaded</span>
                <span style={{ fontSize: "0.8rem", color: "#10b981", background: "rgba(16, 185, 129, 0.2)", padding: "4px 8px", borderRadius: "12px" }}>Verified</span>
              </h3>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "var(--text-muted)", fontSize: "0.85rem" }}>Borrower Name / Entity</label>
                <input type="text" name="borrower_name" value={formData.borrower_name} onChange={handleDataChange} placeholder="e.g. John Doe" style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", maxHeight: "450px", overflowY: "auto", paddingRight: "10px" }}>
                
                {/* CORE BUREAU SCORES */}
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>CIBIL Proxy (Mean)</div>
                  <input type="range" name="EXT_SOURCE_MEAN" min="0" max="1" step="0.01" value={formData.EXT_SOURCE_MEAN} onChange={handleSliderChange} style={{ width: "100%", accentColor: "var(--accent-purple)" }} />
                  <div style={{ textAlign: "right", fontSize: "0.8rem", fontWeight: "bold" }}>{parseFloat(formData.EXT_SOURCE_MEAN).toFixed(2)}</div>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>CIBIL Proxy (Min)</div>
                  <input type="range" name="EXT_SOURCE_MIN" min="0" max="1" step="0.01" value={formData.EXT_SOURCE_MIN} onChange={handleSliderChange} style={{ width: "100%", accentColor: "var(--accent-purple)" }} />
                  <div style={{ textAlign: "right", fontSize: "0.8rem", fontWeight: "bold" }}>{parseFloat(formData.EXT_SOURCE_MIN).toFixed(2)}</div>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>CIBIL Proxy (Source 1)</div>
                  <input type="range" name="EXT_SOURCE_1" min="0" max="1" step="0.01" value={formData.EXT_SOURCE_1} onChange={handleSliderChange} style={{ width: "100%", accentColor: "var(--accent-purple)" }} />
                  <div style={{ textAlign: "right", fontSize: "0.8rem", fontWeight: "bold" }}>{parseFloat(formData.EXT_SOURCE_1).toFixed(2)}</div>
                </label>

                {/* HISTORICAL BEHAVIOR */}
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Credit Card Utilization</div>
                  <input type="range" name="CC_UTILISATION_RATIO" min="0" max="1" step="0.01" value={formData.CC_UTILISATION_RATIO} onChange={handleSliderChange} style={{ width: "100%", accentColor: formData.CC_UTILISATION_RATIO > 0.7 ? "#ef4444" : "var(--accent-purple)" }} />
                  <div style={{ textAlign: "right", fontSize: "0.8rem", fontWeight: "bold" }}>{(formData.CC_UTILISATION_RATIO * 100).toFixed(0)}%</div>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Late Payment Rate</div>
                  <input type="range" name="INSTAL_LATE_RATE" min="0" max="1" step="0.01" value={formData.INSTAL_LATE_RATE} onChange={handleSliderChange} style={{ width: "100%", accentColor: formData.INSTAL_LATE_RATE > 0.2 ? "#ef4444" : "var(--accent-purple)" }} />
                  <div style={{ textAlign: "right", fontSize: "0.8rem", fontWeight: "bold" }}>{(formData.INSTAL_LATE_RATE * 100).toFixed(0)}%</div>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Prev. Rejection Rate</div>
                  <input type="range" name="PREV_REFUSAL_RATE" min="0" max="1" step="0.01" value={formData.PREV_REFUSAL_RATE} onChange={handleSliderChange} style={{ width: "100%", accentColor: formData.PREV_REFUSAL_RATE > 0.5 ? "#ef4444" : "var(--accent-purple)" }} />
                  <div style={{ textAlign: "right", fontSize: "0.8rem", fontWeight: "bold" }}>{(formData.PREV_REFUSAL_RATE * 100).toFixed(0)}%</div>
                </label>

                {/* NUMERICAL METRICS */}
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Requested Term (Months)</div>
                  <input type="number" name="CREDIT_TERM" value={formData.CREDIT_TERM} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Prev. Approved Loans</div>
                  <input type="number" name="PREV_APPROVED_COUNT" value={formData.PREV_APPROVED_COUNT} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>CC Avg Balance (₹)</div>
                  <input type="number" name="CC_AVG_BALANCE" value={formData.CC_AVG_BALANCE} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Social Circle Defaults (Count)</div>
                  <input type="number" name="DEF_60_CNT_SOCIAL_CIRCLE" value={formData.DEF_60_CNT_SOCIAL_CIRCLE} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Apartment Quality (0-1)</div>
                  <input type="number" name="APARTMENTS_MEDI" step="0.1" value={formData.APARTMENTS_MEDI} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
                </label>

                {/* CATEGORICAL FLAGS */}
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Vehicle Ownership</div>
                  <select name="FLAG_OWN_CAR" value={formData.FLAG_OWN_CAR} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Yes (Asset)</option>
                    <option value="0">No</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Gender Flag</div>
                  <select name="CODE_GENDER" value={formData.CODE_GENDER} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>KYC Document 3 Verified</div>
                  <select name="FLAG_DOCUMENT_3" value={formData.FLAG_DOCUMENT_3} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Verified</option>
                    <option value="0">Missing</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Income Type: Working</div>
                  <select name="NAME_INCOME_TYPE_Working" value={formData.NAME_INCOME_TYPE_Working} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Income Type: Pensioner</div>
                  <select name="NAME_INCOME_TYPE_Pensioner" value={formData.NAME_INCOME_TYPE_Pensioner} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Address Mismatch Flag</div>
                  <select name="REG_CITY_NOT_LIVE_CITY" value={formData.REG_CITY_NOT_LIVE_CITY} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Mismatch Detected</option>
                    <option value="0">Verified Match</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Higher Education</div>
                  <select name="NAME_EDUCATION_TYPE_Higher education" value={formData["NAME_EDUCATION_TYPE_Higher education"]} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Secondary Education</div>
                  <select name="NAME_EDUCATION_TYPE_Secondary / secondary special" value={formData["NAME_EDUCATION_TYPE_Secondary / secondary special"]} onChange={handleSliderChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </label>

              </div>

              <button 
                onClick={submitEvaluation} 
                className="btn-primary" 
                style={{ width: "100%", fontSize: "1.2rem", padding: "1rem", marginTop: "1rem" }}
                disabled={evaluating}
              >
                {evaluating ? "Running AI Core..." : "Execute AI Evaluation"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {error && (
            <div className="glass-panel" style={{ borderLeft: "4px solid #ef4444" }}>
              <h3 style={{ color: "#ef4444" }}>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {!result && !error && (
            <div className="glass-panel" style={{ opacity: 0.5, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <p>Sync a profile and execute evaluation to view AI Decision.</p>
            </div>
          )}

          {result && (
            <>
              {/* Risk Score Gauge Component */}
              <div className="card" style={{ 
                borderTop: `6px solid ${result.risk_score > 60 ? '#ef4444' : result.risk_score > 35 ? '#f59e0b' : 'var(--neon-green)'}`,
                animation: "fadeIn 0.5s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                     <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Risk Prediction</div>
                     <h2 style={{ fontSize: "2.5rem", margin: "10px 0" }}>{result.risk_score.toFixed(1)}%</h2>
                     <div style={{ fontWeight: "600" }}>{result.risk_tier}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>System Decision</div>
                     <h3 style={{ fontSize: "1.5rem", marginTop: "10px", color: "white" }}>{result.decision}</h3>
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  {/* Creditworthiness notice */}
                  <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#60a5fa", fontWeight: "600", marginBottom: "4px" }}>ℹ️ CREDITWORTHINESS ASSESSMENT ONLY</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      This score reflects the borrower's probability of default based on bureau signals and repayment history — not their loan capacity. Loan sizing requires separate income verification (salary slips / ITR).
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>AI Suggested Rate</div>
                    <h3 style={{ fontSize: "1.25rem", marginTop: "5px", color: "var(--neon-green)" }}>{result.suggested_interest_rate ? result.suggested_interest_rate.toFixed(2) : "0"}% APR</h3>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>Risk-adjusted base rate (9.5% + premium)</div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Component */}
              <div className="card" style={{ animation: "fadeIn 0.8s ease" }}>
                 <h3 style={{ marginBottom: "1rem" }}>⚙️ Bureau Analysis (SHAP)</h3>
                 
                 <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                   {result.shap_explanations.map((item, index) => (
                     <div key={index} style={{ 
                       padding: "12px", 
                       borderRadius: "8px", 
                       background: "var(--bg-main)",
                       borderLeft: `4px solid ${item.impact === "HIGH RISK" ? '#ef4444' : 'var(--neon-green)'}`
                     }}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                         <span style={{ fontWeight: "600", color: "white" }}>{item.human_label}</span>
                         <span style={{ fontSize: "0.8rem", color: item.impact === "HIGH RISK" ? '#ef4444' : 'var(--neon-green)', fontWeight: "bold" }}>
                           {item.impact}
                         </span>
                       </div>
                       <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>{item.reason}</p>
                     </div>
                   ))}
                 </div>
              </div>
            </>
          )}

        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UrbanApp;
