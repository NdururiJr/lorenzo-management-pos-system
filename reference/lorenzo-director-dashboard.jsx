import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronDown, Calendar, DollarSign, Users, ShoppingBag, Target, ArrowUpRight, ArrowDownRight, Sparkles, Bell, Settings, RefreshCw } from 'lucide-react';

// Lorenzo Insights Command - Director Dashboard
export default function DirectorDashboard() {
  const [timeframe, setTimeframe] = useState('This Quarter');
  const [currency, setCurrency] = useState('KES');

  // Mock data
  const kpis = [
    {
      label: 'REVENUE',
      value: 'KES 2.8M',
      change: '+18% vs Goal',
      changeType: 'positive',
      subtitle: 'Pacing to exceed quarterly target by KES 420K',
      icon: DollarSign
    },
    {
      label: 'OPERATING MARGIN',
      value: '32%',
      change: '+4% vs Goal',
      changeType: 'positive',
      subtitle: 'Improved efficiency from new equipment',
      icon: TrendingUp
    },
    {
      label: 'CUSTOMER RETENTION',
      value: '87%',
      change: '+5% vs LY',
      changeType: 'positive',
      subtitle: 'WhatsApp reminders driving repeat visits',
      icon: Users
    },
    {
      label: 'AVG ORDER VALUE',
      value: 'KES 1,850',
      change: '-3% vs Goal',
      changeType: 'warning',
      subtitle: 'Premium services uptake below target',
      icon: ShoppingBag
    }
  ];

  const revenueData = [
    { month: 'Jul', actual: 720000, goal: 700000 },
    { month: 'Aug', actual: 850000, goal: 750000 },
    { month: 'Sep', actual: 920000, goal: 800000 },
    { month: 'Oct', projected: 980000, goal: 850000 },
    { month: 'Nov', projected: 1050000, goal: 900000 },
    { month: 'Dec', projected: 1150000, goal: 950000 }
  ];

  const drivers = [
    { name: 'Corporate Accounts', value: 380000, type: 'positive' },
    { name: 'Premium Services', value: 220000, type: 'positive' },
    { name: 'Walk-in Decline', value: -85000, type: 'negative' },
    { name: 'Seasonal Dip', value: -120000, type: 'negative' }
  ];

  const maxDriver = Math.max(...drivers.map(d => Math.abs(d.value)));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1A1F 0%, #0D2329 50%, #0A1A1F 100%)',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      color: '#E8F0F2'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; }
        
        .glass-card {
          background: linear-gradient(145deg, rgba(20, 82, 74, 0.15) 0%, rgba(10, 47, 44, 0.25) 100%);
          border: 1px solid rgba(45, 212, 191, 0.12);
          border-radius: 16px;
          backdrop-filter: blur(20px);
        }
        
        .glass-card-dark {
          background: linear-gradient(145deg, rgba(10, 47, 44, 0.4) 0%, rgba(10, 30, 35, 0.6) 100%);
          border: 1px solid rgba(45, 212, 191, 0.08);
          border-radius: 16px;
        }
        
        .kpi-card {
          background: linear-gradient(145deg, rgba(20, 82, 74, 0.2) 0%, rgba(10, 47, 44, 0.3) 100%);
          border: 1px solid rgba(45, 212, 191, 0.1);
          border-radius: 14px;
          padding: 20px 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .kpi-card:hover {
          border-color: rgba(45, 212, 191, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.4), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .kpi-card:hover::before {
          opacity: 1;
        }
        
        .search-input {
          background: rgba(10, 47, 44, 0.5);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: 12px;
          padding: 12px 16px 12px 44px;
          color: #E8F0F2;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .search-input::placeholder {
          color: rgba(232, 240, 242, 0.4);
        }
        
        .search-input:focus {
          border-color: rgba(45, 212, 191, 0.4);
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
        }
        
        .dropdown {
          background: rgba(10, 47, 44, 0.6);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: 10px;
          padding: 10px 14px;
          color: #E8F0F2;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .dropdown:hover {
          border-color: rgba(45, 212, 191, 0.3);
          background: rgba(20, 82, 74, 0.4);
        }
        
        .chart-bar {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .chart-bar:hover {
          filter: brightness(1.15);
        }
        
        .action-btn {
          background: linear-gradient(135deg, #14524A 0%, #1E6B5E 100%);
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 8px;
          padding: 8px 16px;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background: linear-gradient(135deg, #1E6B5E 0%, #2DD4BF 100%);
          transform: translateY(-1px);
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #2DD4BF;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(10, 47, 44, 0.4);
          border: 1px solid rgba(45, 212, 191, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgba(232, 240, 242, 0.6);
        }
        
        .icon-btn:hover {
          background: rgba(20, 82, 74, 0.5);
          border-color: rgba(45, 212, 191, 0.25);
          color: #2DD4BF;
        }
      `}</style>

      {/* Header */}
      <header style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderBottom: '1px solid rgba(45, 212, 191, 0.08)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #2DD4BF 0%, #14524A 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>Lorenzo Insights Command</div>
            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '2px' }}>DIRECTOR VIEW</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(232, 240, 242, 0.4)' }} />
          <input 
            type="text" 
            className="search-input"
            placeholder='Ask anything... e.g., "Why did Kilimani revenue drop last week?"'
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="dropdown">
            <Calendar size={14} />
            <span>Timeframe:</span>
            <span style={{ color: '#2DD4BF', fontWeight: '500' }}>{timeframe}</span>
            <ChevronDown size={14} />
          </div>
          <div className="dropdown">
            <span>Business Unit:</span>
            <span style={{ color: '#2DD4BF', fontWeight: '500' }}>All Branches</span>
            <ChevronDown size={14} />
          </div>
          <div className="dropdown">
            <span>Currency:</span>
            <span style={{ color: '#2DD4BF', fontWeight: '500' }}>{currency}</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Actions & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="icon-btn"><RefreshCw size={18} /></div>
          <div className="icon-btn" style={{ position: 'relative' }}>
            <Bell size={18} />
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: '#C9A962', borderRadius: '50%' }} />
          </div>
          <div className="icon-btn"><Settings size={18} /></div>
          <div style={{ 
            marginLeft: '8px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '6px 12px 6px 6px',
            background: 'rgba(10, 47, 44, 0.4)',
            border: '1px solid rgba(45, 212, 191, 0.1)',
            borderRadius: '24px',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2DD4BF 0%, #14524A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#fff'
            }}>JK</div>
            <div style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: '500' }}>James Karanja</div>
              <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>Director</div>
            </div>
            <ChevronDown size={14} style={{ color: 'rgba(232, 240, 242, 0.5)' }} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px 32px' }}>
        {/* Executive Narrative */}
        <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#C9A962', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: '500' }}>
            MORNING BRIEFING
          </div>
          <div style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>
            Executive Narrative
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(232, 240, 242, 0.85)' }}>
            Good morning. Overall business health is <span style={{ color: '#2DD4BF', fontWeight: '500' }}>strong (Score: 92/100)</span>. 
            Q4 revenue is currently <span style={{ color: '#2DD4BF' }}>18% ahead of forecast</span> driven by the new corporate accounts program. 
            Customer retention has improved by 5% due to WhatsApp automation. However, <span style={{ color: '#C9A962' }}>premium service uptake 
            remains 3% below target</span> — consider promotional pricing for specialty items. Walk-in traffic at Kilimani branch 
            requires attention.
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <div key={index} className="kpi-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1.5px', fontWeight: '500' }}>
                    {kpi.label}
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={16} color="#2DD4BF" />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {kpi.value}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: kpi.changeType === 'positive' ? '#2DD4BF' : '#C9A962',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {kpi.changeType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.change}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>
                  {kpi.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategic Deep Dive */}
        <div style={{ 
          fontSize: '11px', 
          color: 'rgba(232, 240, 242, 0.4)', 
          letterSpacing: '2px', 
          textAlign: 'center',
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          STRATEGIC DEEP DIVE
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Revenue Performance Chart */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
              Predictive Performance vs. Goal (Revenue)
            </div>
            
            <div style={{ position: 'relative', height: '220px', paddingLeft: '50px', paddingBottom: '30px' }}>
              {/* Y-axis labels */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
                <span>KES 1.2M</span>
                <span>KES 900K</span>
                <span>KES 600K</span>
                <span>KES 300K</span>
                <span>KES 0</span>
              </div>
              
              {/* Chart area */}
              <svg width="100%" height="190" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={i * 47.5} x2="100%" y2={i * 47.5} stroke="rgba(45, 212, 191, 0.08)" />
                ))}
                
                {/* Confidence Corridor - Best/Worst case shaded area for projections */}
                <path 
                  d={`M 50% ${190 - (1050000/1200000) * 190} 
                      L 66.6% ${190 - (1120000/1200000) * 190} 
                      L 83.3% ${190 - (1250000/1200000) * 190} 
                      L 83.3% ${190 - (1050000/1200000) * 190} 
                      L 66.6% ${190 - (980000/1200000) * 190} 
                      L 50% ${190 - (910000/1200000) * 190} Z`}
                  fill="url(#confidenceGradient)"
                  opacity="0.3"
                />
                
                {/* Goal line */}
                <path 
                  d={`M 0,${190 - (700000/1200000) * 190} ${revenueData.map((d, i) => `L ${(i / 5) * 100}%,${190 - ((d.goal)/1200000) * 190}`).join(' ')}`}
                  fill="none"
                  stroke="rgba(201, 169, 98, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
                
                {/* Actual bars */}
                {revenueData.slice(0, 3).map((d, i) => (
                  <rect 
                    key={i}
                    className="chart-bar"
                    x={`${(i / 6) * 100 + 2}%`}
                    y={190 - (d.actual/1200000) * 190}
                    width="12%"
                    height={(d.actual/1200000) * 190}
                    fill="url(#actualGradient)"
                    rx="4"
                  />
                ))}
                
                {/* Projected bars */}
                {revenueData.slice(3).map((d, i) => (
                  <rect 
                    key={i + 3}
                    className="chart-bar"
                    x={`${((i + 3) / 6) * 100 + 2}%`}
                    y={190 - (d.projected/1200000) * 190}
                    width="12%"
                    height={(d.projected/1200000) * 190}
                    fill="url(#projectedGradient)"
                    rx="4"
                    opacity="0.7"
                  />
                ))}
                
                {/* Trajectory line connecting projections */}
                <path 
                  d={`M ${(2.5 / 6) * 100}% ${190 - (920000/1200000) * 190} 
                      L ${(3.5 / 6) * 100}% ${190 - (980000/1200000) * 190}
                      L ${(4.5 / 6) * 100}% ${190 - (1050000/1200000) * 190}
                      L ${(5.5 / 6) * 100}% ${190 - (1150000/1200000) * 190}`}
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.8"
                />
                
                {/* Projection annotation */}
                <g transform={`translate(${(3.5 / 6) * 100}%, 30)`}>
                  <rect x="-60" y="-12" width="140" height="24" rx="4" fill="rgba(10, 47, 44, 0.9)" stroke="rgba(45, 212, 191, 0.3)" />
                  <text x="10" y="4" fill="#E8F0F2" fontSize="10" textAnchor="middle">Projected to beat goal by KES 200K</text>
                </g>
                
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="100%" stopColor="#14524A" />
                  </linearGradient>
                  <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4AE3D0" />
                    <stop offset="100%" stopColor="#1E6B5E" />
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* X-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '8px', fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)' }}>
                {revenueData.map((d, i) => (
                  <span key={i} style={{ color: i >= 3 ? 'rgba(232, 240, 242, 0.25)' : 'rgba(232, 240, 242, 0.4)' }}>{d.month}</span>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '11px', color: 'rgba(232, 240, 242, 0.6)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: 'linear-gradient(180deg, #2DD4BF, #14524A)', borderRadius: '2px' }} />
                <span>Historical</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: 'linear-gradient(180deg, #4AE3D0, #1E6B5E)', borderRadius: '2px', opacity: 0.7 }} />
                <span>Current Trajectory</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: 'linear-gradient(180deg, #6366F1, #4F46E5)', borderRadius: '2px', opacity: 0.3 }} />
                <span>Confidence Corridor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '2px', background: '#C9A962' }} />
                <span>Goal</span>
              </div>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
              Key Drivers & Root Causes
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {drivers.map((driver, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(232, 240, 242, 0.8)' }}>{driver.name}</span>
                    <span style={{ 
                      color: driver.type === 'positive' ? '#2DD4BF' : '#FF6B6B',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: '500'
                    }}>
                      {driver.type === 'positive' ? '+' : ''}KES {Math.abs(driver.value).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ 
                    height: '24px', 
                    background: 'rgba(10, 47, 44, 0.5)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: driver.type === 'positive' ? 'flex-start' : 'flex-start',
                    justifyContent: driver.type === 'positive' ? 'flex-start' : 'flex-end'
                  }}>
                    <div style={{
                      width: `${(Math.abs(driver.value) / maxDriver) * 100}%`,
                      height: '100%',
                      background: driver.type === 'positive' 
                        ? 'linear-gradient(90deg, #14524A, #2DD4BF)' 
                        : 'linear-gradient(90deg, #FF6B6B, #C53030)',
                      borderRadius: '6px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Radar & Opportunities */}
        <div style={{ 
          fontSize: '11px', 
          color: 'rgba(232, 240, 242, 0.4)', 
          letterSpacing: '2px', 
          textAlign: 'center',
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          RISK RADAR & OPPORTUNITIES
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Watchlist */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertTriangle size={18} color="#FF6B6B" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Watchlist (Anomalies & Risks)</span>
            </div>
            
            <div style={{ 
              background: 'rgba(201, 169, 98, 0.08)', 
              border: '1px solid rgba(201, 169, 98, 0.2)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div className="pulse-dot" style={{ background: '#C9A962', marginTop: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Walk-in Traffic Decline</div>
                  <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.7)', lineHeight: '1.5' }}>
                    Kilimani branch walk-ins dropped 22% week-over-week. Competitor opened nearby. 
                    <span style={{ color: '#C9A962' }}> (Medium Risk)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button className="action-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>View Mitigation</button>
                  <button className="action-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>Assign to Manager</button>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255, 107, 107, 0.08)', 
              border: '1px solid rgba(255, 107, 107, 0.25)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div className="pulse-dot" style={{ background: '#FF6B6B', marginTop: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Equipment Maintenance Due</div>
                  <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.7)', lineHeight: '1.5' }}>
                    Main pressing machine servicing overdue by 12 days. Risk of breakdown during peak season.
                    <span style={{ color: '#FF6B6B' }}> (High Risk to Q4 Operations)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button className="action-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>View Mitigation</button>
                  <button className="action-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>Assign to COO</button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lightbulb size={14} color="#fff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '600' }}>AI Recommended Actions</span>
              <div style={{ 
                marginLeft: 'auto',
                padding: '4px 10px',
                background: 'rgba(99, 102, 241, 0.15)',
                borderRadius: '12px',
                fontSize: '10px',
                color: '#818CF8',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                POWERED BY AI
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.08)', 
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#818CF8', 
                    letterSpacing: '1px', 
                    marginBottom: '6px',
                    fontWeight: '500'
                  }}>
                    OPPORTUNITY
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.9)', lineHeight: '1.6' }}>
                    Corporate account conversion rate is high (34%). Consider allocating additional 
                    sales resources to prospect list. Estimated incremental revenue: <strong style={{ color: '#818CF8' }}>KES 450K/quarter</strong>.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '16px' }}>
                  <button className="action-btn" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', fontSize: '11px', padding: '6px 12px' }}>Model Scenarios</button>
                  <button className="action-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>Approve Shift</button>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(99, 102, 241, 0.05)', 
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#818CF8', 
                  letterSpacing: '1px', 
                  marginBottom: '6px',
                  fontWeight: '500'
                }}>
                  OPTIMIZATION
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.9)', lineHeight: '1.6' }}>
                  Peak hour staffing model suggests adding 1 staff member during 8-10am rush. 
                  Reduces average wait time by 40%.
                </div>
              </div>
              <button className="action-btn" style={{ marginLeft: '16px', background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}>Model Scenarios</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(45, 212, 191, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'rgba(232, 240, 242, 0.4)'
        }}>
          <div>Last updated: Today at 6:00 AM • Auto-refresh in 55 minutes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            <span>All systems operational</span>
          </div>
        </div>
      </main>
    </div>
  );
}
