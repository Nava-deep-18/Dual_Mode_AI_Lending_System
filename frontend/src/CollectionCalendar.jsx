import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Info, Search } from 'lucide-react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const CollectionCalendar = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchCalendarData();
  }, [token]);

  const fetchCalendarData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/schedule/calendar", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Create grid arrays
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to get payments for a specific day in the current viewed month
  const getPaymentsForDay = (day) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return payments.filter(p => p.due_date === targetDateStr);
  };

  // Determine indicator color
  const getIndicatorColor = (dayPayments) => {
    if (dayPayments.length === 0) return null;
    const hasMissed = dayPayments.some(p => p.status === "MISSED");
    const hasPendingOrPartial = dayPayments.some(p => p.status === "PENDING" || p.status === "PARTIAL");
    
    if (hasMissed) return "var(--neon-red)"; // Red if anything missed
    if (hasPendingOrPartial) return "#fbbf24"; // Yellow/amber if waiting
    return "var(--neon-green)"; // Green if all paid
  };

  const selectedDayPayments = selectedDate ? getPaymentsForDay(selectedDate) : [];

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading Calendar...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalIcon color="var(--neon-green)" />
            Collection Schedule
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>Global overview of all EMI dues and statuses</p>
        </div>
      </div>

      {/* Main Calendar Card - Now Full Width */}
      <div className="card" style={{ padding: '2rem', background: '#0a0a0a' }}>
          
          {/* Header controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
              <ChevronLeft />
            </button>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
              <ChevronRight />
            </button>
          </div>

          {/* Days row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
            {dayNames.map(d => (
              <div key={d} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {blanks.map(b => (
              <div key={`blank-${b}`} style={{ padding: '30px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}></div>
            ))}
            
            {days.map(day => {
              const dayPayments = getPaymentsForDay(day);
              const indicatorColor = getIndicatorColor(dayPayments);
              const isSelected = selectedDate === day;

              // quick check for today
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  style={{ 
                    padding: '20px 10px', 
                    background: isSelected ? 'rgba(212, 255, 112, 0.1)' : 'rgba(255,255,255,0.04)', 
                    borderRadius: '12px',
                    border: isSelected ? '1px solid var(--neon-green)' : isToday ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: '80px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: isToday ? 'var(--neon-green)' : 'white' }}>{day}</span>
                  
                  {indicatorColor && (
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: indicatorColor, boxShadow: `0 0 10px ${indicatorColor}` }}></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dayPayments.length} due</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      {/* Pop-up UI Modal for Selected Date */}
      {selectedDate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', animation: 'fadeIn 0.2s ease', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
            
            <button onClick={() => setSelectedDate(null)} style={{ position: 'absolute', top: '15px', right: '18px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={22} color="var(--neon-green)" />
              {monthNames[month]} {selectedDate}, {year}
            </h3>

            {selectedDayPayments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'center', margin: '2rem 0' }}>No payments due for this date. 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                {selectedDayPayments.map((p) => {
                  const isPaid = p.status === 'PAID';
                  const isMissed = p.status === 'MISSED';
                  const statusColor = isMissed ? 'var(--neon-red)' : isPaid ? 'var(--neon-green)' : '#fbbf24';

                  return (
                    <div key={p.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', borderLeft: `4px solid ${statusColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <strong style={{ color: 'white', fontSize: '1.1rem' }}>{p.borrower_name}</strong>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' }}>
                            M{p.month_number}
                          </span>
                          <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40`, fontWeight: 'bold' }}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Due: ₹<strong style={{ color: 'white' }}>{p.due_amount.toLocaleString()}</strong></span>
                        <button 
                          onClick={() => navigate(`/repayment/${p.loan_id}`)}
                          style={{ background: statusColor, border: 'none', color: '#111', fontWeight: 600, fontSize: '0.85rem', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Track Action &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CollectionCalendar;
