import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, CheckCircle, XCircle, AlertCircle, Clock, TrendingUp, IndianRupee } from 'lucide-react';

const STATUS_CONFIG = {
  PAID:    { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  icon: <CheckCircle size={16} />,  label: 'Paid' },
  PARTIAL: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: <AlertCircle size={16} />, label: 'Partial' },
  MISSED:  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  icon: <XCircle size={16} />,     label: 'Missed' },
  PENDING: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: <Clock size={16} />,       label: 'Pending' },
};

const RepaymentTracker = () => {
  const { loanId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logModal, setLogModal] = useState(null); // { month_number, due_amount }
  const [logForm, setLogForm] = useState({ paid_amount: '', paid_date: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const token = localStorage.getItem('access_token');

  const fetchSchedule = async () => {
    try {
      const resp = await axios.get(`http://127.0.0.1:8000/api/loans/${loanId}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedule(resp.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load repayment schedule.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, [loanId]);

  const openLogModal = (payment) => {
    setLogForm({
      paid_amount: payment.paid_amount > 0 ? payment.paid_amount : payment.due_amount,
      paid_date: new Date().toISOString().split('T')[0],
    });
    setLogModal(payment);
    setSaveMsg('');
  };

  const submitPayment = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/loans/${loanId}/payments/${logModal.month_number}`,
        { paid_amount: Number(logForm.paid_amount), paid_date: logForm.paid_date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveMsg('✅ Payment logged!');
      await fetchSchedule();
      setTimeout(() => setLogModal(null), 1000);
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.detail || 'Failed to save'));
    }
    setSaving(false);
  };

  // ── Summary Stats ──
  const stats = schedule ? (() => {
    const total = schedule.payments.length;
    const paid = schedule.payments.filter(p => p.status === 'PAID').length;
    const partial = schedule.payments.filter(p => p.status === 'PARTIAL').length;
    const missed = schedule.payments.filter(p => p.status === 'MISSED').length;
    const totalPaid = schedule.payments.reduce((s, p) => s + (p.paid_amount || 0), 0);
    const totalDue = schedule.tenure_months * schedule.monthly_emi;
    const remaining = total - paid - partial - missed;
    const healthPct = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, partial, missed, remaining, totalPaid, totalDue, healthPct };
  })() : null;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      Loading repayment schedule...
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem' }}>
      <Link to="/compliance" style={{ color: 'var(--neon-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Compliance Log
      </Link>
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '12px', padding: '2rem', color: '#ef4444' }}>
        <strong>Error:</strong> {error}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 4rem', animation: 'fadeIn 0.4s ease' }}>
      {/* Back link */}
      <Link to="/compliance" style={{ color: 'var(--neon-green)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Compliance Log
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.3rem' }}>
          📅 Repayment Tracker
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Loan #{loanId} &nbsp;·&nbsp; <strong style={{ color: 'white' }}>{schedule?.borrower_name}</strong>
        </p>
      </div>

      {/* Loan Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Principal', value: `₹${schedule.principal.toLocaleString()}`, color: 'white' },
          { label: 'Monthly EMI', value: `₹${Math.round(schedule.monthly_emi).toLocaleString()}`, color: 'var(--neon-green)' },
          { label: 'Interest Rate', value: `${schedule.annual_rate}% p.a.`, color: '#60a5fa' },
          { label: 'Tenure', value: `${schedule.tenure_months} months`, color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '1.2rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{c.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Health Bar + Stats */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--neon-green)" />
            <span style={{ fontWeight: '700', fontSize: '1rem' }}>Repayment Health</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: stats.healthPct >= 80 ? '#10b981' : stats.healthPct >= 50 ? '#f59e0b' : '#ef4444' }}>
            {stats.healthPct}%
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ height: '100%', width: `${stats.healthPct}%`, background: stats.healthPct >= 80 ? 'var(--neon-green)' : stats.healthPct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '99px', transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Paid', count: stats.paid, color: '#10b981' },
            { label: 'Partial', count: stats.partial, color: '#f59e0b' },
            { label: 'Missed', count: stats.missed, color: '#ef4444' },
            { label: 'Pending', count: stats.remaining, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}: <strong style={{ color: s.color }}>{s.count}</strong></span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total collected: <strong style={{ color: 'white' }}>₹{Math.round(stats.totalPaid).toLocaleString()}</strong>
            &nbsp;/&nbsp;₹{Math.round(stats.totalDue).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Monthly Payment Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--neon-green)" />
          <span style={{ fontWeight: '700' }}>Monthly Payment Schedule</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Month', 'Due Date', 'EMI Due', 'Paid Amount', 'Paid On', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.payments.map(p => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
                const canLog = p.status !== 'PAID';
                return (
                  <tr key={p.month_number}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{p.month_number}</td>
                    <td style={{ padding: '0.9rem 1rem', color: 'white', fontSize: '0.9rem' }}>
                      {new Date(p.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '600', color: 'white', fontFamily: 'monospace' }}>
                      ₹{Math.round(p.due_amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', color: p.paid_amount > 0 ? '#10b981' : 'var(--text-muted)' }}>
                      {p.paid_amount > 0 ? `₹${Math.round(p.paid_amount).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {p.paid_date ? new Date(p.paid_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', border: `1px solid ${cfg.color}30` }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {canLog ? (
                        <button
                          onClick={() => openLogModal(p)}
                          style={{ background: 'rgba(212,255,112,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(212,255,112,0.3)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(212,255,112,0.2)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(212,255,112,0.1)'}
                        >
                          Log Payment
                        </button>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.8rem' }}>✓ Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Payment Modal */}
      {logModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', position: 'relative', animation: 'fadeIn 0.2s ease' }}>
            <button onClick={() => setLogModal(null)} style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            <h3 style={{ color: 'var(--neon-green)', marginBottom: '0.3rem' }}>Log Payment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Month #{logModal.month_number} &nbsp;·&nbsp; EMI Due: <strong style={{ color: 'white' }}>₹{Math.round(logModal.due_amount).toLocaleString()}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount Paid (₹)</div>
                <input
                  type="number"
                  value={logForm.paid_amount}
                  onChange={e => setLogForm({ ...logForm, paid_amount: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--neon-green)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </label>
              <label>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Received</div>
                <input
                  type="date"
                  value={logForm.paid_date}
                  onChange={e => setLogForm({ ...logForm, paid_date: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </label>
              {saveMsg && <div style={{ fontSize: '0.85rem', color: saveMsg.startsWith('✅') ? '#10b981' : '#ef4444' }}>{saveMsg}</div>}
              <button
                onClick={submitPayment}
                disabled={saving}
                style={{ background: 'var(--neon-green)', color: '#111', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s' }}
              >
                {saving ? 'Saving...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepaymentTracker;
