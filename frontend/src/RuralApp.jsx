import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RuralApp = () => {
  const [formData, setFormData] = useState({
    borrower_name: "",
    annual_income: 45000,
    monthly_expenses: 1200,
    loan_amount: 20000,
    loan_tenure_months: 24,
    lender_interest_rate: "",
    young_dependents: 1,
    old_dependents: 0,
    social_class: "OBC",
    primary_business: "Agriculture",
    secondary_business: "Other",
    home_ownership: 1,
    type_of_house: "Pucca",
    loan_purpose: "Tractor Repair",
    water_availabity: 1
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitEvaluation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...formData,
        borrower_name: formData.borrower_name || "Anonymous",
        annual_income: Number(formData.annual_income),
        monthly_expenses: Number(formData.monthly_expenses),
        loan_amount: Number(formData.loan_amount),
        loan_tenure_months: Number(formData.loan_tenure_months),
        lender_interest_rate: formData.lender_interest_rate !== "" ? Number(formData.lender_interest_rate) : null,
        young_dependents: Number(formData.young_dependents),
        old_dependents: Number(formData.old_dependents),
        home_ownership: Number(formData.home_ownership),
        water_availabity: Number(formData.water_availabity)
      };
      const response = await axios.post("http://127.0.0.1:8000/api/predict/rural", payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the AI Engine. Is FastAPI running?");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <Link to="/" style={{ color: "var(--accent-blue)", textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
        ← Back to Portal
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
        
        {/* LEFT COLUMN: Input Form */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: "1.5rem" }}>🌾 Microfinance Loan Assessment</h2>
          <form onSubmit={submitEvaluation} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <label>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Borrower Name</div>
              <input type="text" name="borrower_name" value={formData.borrower_name} onChange={handleChange} 
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Annual Income (₹)</div>
                <input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Monthly Expenses (₹)</div>
                <input type="number" name="monthly_expenses" value={formData.monthly_expenses} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Loan Amount (₹)</div>
                <input type="number" name="loan_amount" value={formData.loan_amount} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Tenure (Months)</div>
                <input type="number" name="loan_tenure_months" value={formData.loan_tenure_months} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
            </div>

            <label>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Your Interest Rate % <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>(optional — leave blank to use AI suggestion)</span></div>
              <input type="number" step="0.1" name="lender_interest_rate" value={formData.lender_interest_rate} onChange={handleChange} placeholder="e.g. 15"
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--neon-green)", background: "transparent", color: "white" }} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Young Dependents</div>
                <input type="number" name="young_dependents" value={formData.young_dependents} onChange={handleChange}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Old Dependents</div>
                <input type="number" name="old_dependents" value={formData.old_dependents} onChange={handleChange}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
            </div>

            <label>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Primary Business</div>
              <select name="primary_business" value={formData.primary_business} onChange={handleChange} 
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                <option value="Agriculture">Agriculture</option>
                <option value="Animal husbandry">Animal Husbandry</option>
                <option value="Meat Businesses">Meat Businesses</option>
                <option value="Handicrafts">Handicrafts</option>
                <option value="Food_Trade">Food Trade</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Secondary Business</div>
                <input type="text" name="secondary_business" value={formData.secondary_business} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Loan Purpose</div>
                <input type="text" name="loan_purpose" value={formData.loan_purpose} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "transparent", color: "white" }} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Type of House</div>
                <select name="type_of_house" value={formData.type_of_house} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                  <option value="Pucca">Pucca (Concrete)</option>
                  <option value="Semi_Pucca">Semi Pucca</option>
                  <option value="Kutcha">Kutcha (Temporary)</option>
                </select>
              </label>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Home Ownership</div>
                <select name="home_ownership" value={formData.home_ownership} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                  <option value="1">Owned</option>
                  <option value="0">Rented / No Deed</option>
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Social Class</div>
                <select name="social_class" value={formData.social_class} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </label>
              <label>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Utility/Water Access</div>
                <select name="water_availabity" value={formData.water_availabity} onChange={handleChange} 
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.5)", color: "white" }}>
                  <option value="1">Full Access</option>
                  <option value="0.5">Partial/Shared</option>
                  <option value="0">No Access</option>
                </select>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem", width: "100%" }}>
              {loading ? "Analyzing..." : "Evaluate via AI Engine"}
            </button>
          </form>
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
              <p>Awaiting Application Data...</p>
            </div>
          )}

          {result && (
            <>
              {/* Risk Score Gauge Component */}
              <div className="card" style={{ 
                borderTop: `6px solid ${result.risk_score > 60 ? '#ef4444' : result.risk_score > 35 ? '#f59e0b' : 'var(--neon-green)'}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                     <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Risk Prediction</div>
                     <h2 style={{ fontSize: "2.5rem", margin: "10px 0" }}>{result.risk_score.toFixed(1)}%</h2>
                     <div style={{ fontWeight: "600" }}>{result.risk_tier}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Decision Support</div>
                     <h3 style={{ fontSize: "1.5rem", marginTop: "10px", color: "white" }}>{result.decision}</h3>
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  
                  {/* Calculated EMI Block */}
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "15px", marginBottom: "15px" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Calculated Monthly EMI</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--neon-green)" }}>₹{result.calculated_emi ? Math.round(result.calculated_emi).toLocaleString() : "—"}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      {result.lender_interest_rate ? `Your rate: ${result.lender_interest_rate}%` : `Base rate: 12%`} · {result.loan_tenure_months} months · Reducing Balance Method
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {result.risk_score > 65 ? "⚠️ Restructure Suggestion" : result.risk_score > 35 ? "⚠️ Conditional Limit" : "✅ Approved Limit"}
                      </div>
                      <h3 style={{ fontSize: "1.25rem", marginTop: "5px", color: "white" }}>₹{result.max_loan_limit ? result.max_loan_limit.toLocaleString() : "0"}</h3>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>*40% of disposable income × {result.loan_tenure_months} months</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>AI Suggested Rate</div>
                      <h3 style={{ fontSize: "1.25rem", marginTop: "5px", color: result.lender_interest_rate && result.lender_interest_rate < result.suggested_interest_rate ? "#f59e0b" : "var(--neon-green)" }}>
                        {result.suggested_interest_rate ? result.suggested_interest_rate.toFixed(1) : "0"}% APR
                      </h3>
                      {result.lender_interest_rate && result.lender_interest_rate < result.suggested_interest_rate && (
                        <div style={{ fontSize: "0.75rem", color: "#f59e0b", marginTop: "2px" }}>⚠️ Your rate is below AI recommendation</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Component */}
              <div className="card">
                 <h3 style={{ marginBottom: "1rem", color: "white" }}>🤖 AI Insights (SHAP)</h3>
                 <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>The model flagged these primary drivers behind the Risk Score:</p>
                 
                 <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                   {result.shap_explanations.map((item, index) => (
                     <div key={index} style={{ 
                       padding: "12px", 
                       borderRadius: "8px", 
                       background: "var(--bg-main)",
                       borderLeft: `4px solid ${item.impact === "HIGH RISK" ? '#ef4444' : 'var(--neon-green)'}`
                     }}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                         <span style={{ fontWeight: "600" }}>{item.human_label}</span>
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
    </div>
  );
};

export default RuralApp;
