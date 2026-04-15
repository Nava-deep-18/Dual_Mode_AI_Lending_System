import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Zap } from 'lucide-react';

const AuditDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Activate loan modal state
  const [activateTarget, setActivateTarget] = useState(null); // the loan record to activate
  const [startDate, setStartDate] = useState('');
  const [activating, setActivating] = useState(false);
  const [activateMsg, setActivateMsg] = useState('');
  const [disbursedAmount, setDisbursedAmount] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await axios.get('http://127.0.0.1:8000/api/history?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(resp.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openActivateModal = (e, record) => {
    e.stopPropagation(); // don't open the raw JSON modal
    setActivateTarget(record);
    // Default start date = today
    setStartDate(new Date().toISOString().split('T')[0]);
    // Pre-fill with requested amount; officer can override
    setDisbursedAmount(record.loan_amount ?? '');
    setActivateMsg('');
  };

  const submitActivation = async () => {
    setActivating(true);
    setActivateMsg('');
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/loans/${activateTarget.id}/activate`,
        { start_date: startDate, disbursed_amount: Number(disbursedAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivateMsg('✅ Loan activated!');
      await fetchHistory(); // refresh is_activated flags
      setTimeout(() => {
        setActivateTarget(null);
        navigate(`/repayment/${activateTarget.id}`);
      }, 800);
    } catch (err) {
      setActivateMsg('❌ ' + (err.response?.data?.detail || 'Activation failed'));
    }
    setActivating(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={36} color="var(--neon-green)" /> AI Compliance &amp; Audit Log
        </h1>
        <p>Immutable ledger of all historic AI evaluations processed through local engine.</p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Connecting to SQLite Audit Database...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem', color: 'var(--neon-green)' }}>ID</th>
                  <th style={{ padding: '1rem' }}>Timestamp</th>
                  <th style={{ padding: '1rem' }}>Origination Module</th>
                  <th style={{ padding: '1rem', color: 'var(--text-bright)' }}>Borrower/Entity</th>
                  <th style={{ padding: '1rem' }}>Risk Score</th>
                  <th style={{ padding: '1rem' }}>Decision</th>
                  <th style={{ padding: '1rem' }}>Safe Limit (₹)</th>
                  <th style={{ padding: '1rem' }}>Interest Rate</th>
                  <th style={{ padding: '1rem' }}>Repayment</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No loan evaluations have been executed yet.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecord(r)}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{r.id}</td>
                      <td style={{ padding: '1rem' }}>{new Date(r.created_at).toLocaleString()}</td>
                      <td style={{ padding: '1rem', color: 'white' }}>{r.loan_module}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-bright)', fontWeight: 'bold' }}>{r.borrower_name}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: r.risk_score > 60 ? '#ef4444' : r.risk_score > 35 ? '#f59e0b' : 'var(--neon-green)' }}>
                        {r.risk_score.toFixed(1)}% ({r.risk_tier})
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: r.decision.includes('Approved') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: r.decision.includes('Approved') ? '#10b981' : '#ef4444',
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {r.decision}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                        {r.max_loan_limit ? `₹${r.max_loan_limit.toLocaleString()}` : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--neon-green)' }}>
                        {r.suggested_interest_rate ? `${r.suggested_interest_rate.toFixed(1)}%` : 'N/A'}
                      </td>
                      {/* Repayment action column — Rural Approved only */}
                      <td style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
                        {r.loan_module === 'Rural Microfinance' && r.decision.includes('Approved') ? (
                          r.is_activated ? (
                            <button
                              onClick={() => navigate(`/repayment/${r.id}`)}
                              style={{
                                background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
                                border: '1px solid rgba(96,165,250,0.3)', borderRadius: '8px',
                                padding: '5px 12px', fontSize: '0.8rem', fontWeight: '600',
                                cursor: 'pointer', whiteSpace: 'nowrap'
                              }}
                            >
                              📊 View
                            </button>
                          ) : (
                            <button
                              onClick={(e) => openActivateModal(e, r)}
                              style={{
                                background: 'rgba(212,255,112,0.1)', color: 'var(--neon-green)',
                                border: '1px solid rgba(212,255,112,0.3)', borderRadius: '8px',
                                padding: '5px 12px', fontSize: '0.8rem', fontWeight: '600',
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                              }}
                            >
                              <Zap size={13} /> Activate
                            </button>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Raw Input Modal ── */}
      {selectedRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedRecord(null)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', color: 'var(--neon-green)', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--neon-green)' }}>Evaluation Trace #{selectedRecord.id}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Borrower Name</strong> <br /><span style={{ fontSize: '1.1rem', color: 'white' }}>{selectedRecord.borrower_name}</span></div>
              <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Decision</strong> <br />
                <span style={{ color: selectedRecord.decision.includes('Approved') ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{selectedRecord.decision}</span>
              </div>
              <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Risk Score</strong> <br /><span style={{ color: 'white' }}>{selectedRecord.risk_score.toFixed(1)}%</span></div>
              <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Max Limit</strong> <br /><span style={{ color: 'white' }}>{selectedRecord.max_loan_limit ? `₹${selectedRecord.max_loan_limit.toLocaleString()}` : 'N/A'}</span></div>
            </div>

            <h3 style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-bright)' }}>Analyzed Raw Financials</h3>
            <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem', color: 'var(--neon-green)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {JSON.stringify(JSON.parse(selectedRecord.raw_input_data), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* ── Activate Loan Modal ── */}
      {activateTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', animation: 'fadeIn 0.2s ease' }}>
            <button onClick={() => setActivateTarget(null)} style={{ position: 'absolute', top: '15px', right: '18px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
              <Zap size={20} color="var(--neon-green)" />
              <h3 style={{ color: 'var(--neon-green)', margin: 0 }}>Activate Loan</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: 'white' }}>{activateTarget.borrower_name}</strong>
              &nbsp;·&nbsp;{activateTarget.loan_tenure_months} months&nbsp;·&nbsp;{activateTarget.effective_rate?.toFixed(1)}% p.a.
            </p>

            {/* Disbursed Amount — editable, pre-filled with requested amount */}
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Disbursed Amount (₹)</div>
              <input
                type="number"
                value={disbursedAmount}
                onChange={e => setDisbursedAmount(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--neon-green)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' }}
              />
              {/* Show both hints side by side */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Requested: <strong style={{ color: 'white' }}>₹{activateTarget.loan_amount?.toLocaleString()}</strong></span>
                {activateTarget.max_loan_limit && (
                  <span
                    style={{ color: 'var(--neon-green)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                    title="Click to use AI safe limit"
                    onClick={() => setDisbursedAmount(activateTarget.max_loan_limit)}
                  >
                    AI safe limit: ₹{activateTarget.max_loan_limit?.toLocaleString()} ↖ use this
                  </span>
                )}
              </div>
            </label>

            <label>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First EMI Start Date</div>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </label>

            <div style={{ marginTop: '0.8rem', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              EMI will be auto-calculated on ₹<strong style={{ color: 'white' }}>{Number(disbursedAmount).toLocaleString()}</strong> using reducing balance method.
            </div>

            {activateMsg && (
              <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: activateMsg.startsWith('✅') ? '#10b981' : '#ef4444' }}>
                {activateMsg}
              </div>
            )}

            <button
              onClick={submitActivation}
              disabled={activating || !startDate}
              style={{ marginTop: '1.2rem', width: '100%', padding: '12px', background: 'var(--neon-green)', color: '#111', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: activating ? 'not-allowed' : 'pointer', opacity: activating ? 0.7 : 1 }}
            >
              {activating ? 'Activating...' : '⚡ Generate Schedule'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
