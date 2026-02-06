import React, { useState, useEffect } from 'react';

// Lorenzo Dry Cleaners - Staff Dashboard
// Individual performance view with productivity metrics

export default function LorenzoStaffDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(20520);
  const [performanceView, setPerformanceView] = useState('weekly');
  
  const navItems = ['Dashboard', 'Orders', 'Pipeline', 'Customers', 'Drivers', 'Reports'];
  const periods = ['Today', 'This Week', 'This Month'];

  // Brand Colors
  const colors = {
    darkTeal: '#0A2F2C',
    deepTeal: '#0F3D38',
    teal: '#14524A',
    lightTeal: '#1E6B5E',
    accentTeal: '#2DD4BF',
    cream: '#F5F5F0',
    gold: '#C9A962',
    white: '#FFFFFF',
  };

  // Logged-in staff member data
  const currentStaff = {
    name: 'Frank Mwangi',
    role: 'Front Desk',
    avatar: '/mnt/user-data/uploads/Frank_Mwangi.png',
    rating: 4.8,
    totalOrders: 156,
    todayOrders: 18,
    avgProcessingTime: '12 min',
    satisfaction: 96,
    accuracy: 94,
    efficiency: 89,
    streak: 5, // days of meeting target
    rank: 2, // among all staff
    totalStaff: 12,
  };

  // Weekly performance data (orders processed per day)
  const weeklyPerformance = [
    { day: 'Mon', orders: 14, target: 15, items: 42 },
    { day: 'Tue', orders: 18, target: 15, items: 54 },
    { day: 'Wed', orders: 16, target: 15, items: 48 },
    { day: 'Thu', orders: 21, target: 15, items: 63 },
    { day: 'Fri', orders: 19, target: 15, items: 57 },
    { day: 'Sat', orders: 24, target: 20, items: 72 },
    { day: 'Sun', orders: 8, target: 10, items: 24 },
  ];

  // Daily performance (hourly breakdown)
  const dailyPerformance = [
    { hour: '8am', orders: 2 },
    { hour: '9am', orders: 3 },
    { hour: '10am', orders: 4 },
    { hour: '11am', orders: 2 },
    { hour: '12pm', orders: 1 },
    { hour: '1pm', orders: 3 },
    { hour: '2pm', orders: 2 },
    { hour: '3pm', orders: 1 },
  ];

  const maxWeeklyOrders = Math.max(...weeklyPerformance.map(d => d.orders));
  const maxDailyOrders = Math.max(...dailyPerformance.map(d => d.orders));
  const totalWeeklyOrders = weeklyPerformance.reduce((sum, d) => sum + d.orders, 0);
  const totalWeeklyItems = weeklyPerformance.reduce((sum, d) => sum + d.items, 0);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const recentOrders = [
    { id: 'ORD-001', customer: 'Sarah Kimani', items: 3, status: 'Washing', time: '09:30', statusColor: '#3B82F6' },
    { id: 'ORD-002', customer: 'John Odhiambo', items: 5, status: 'Ready', time: '10:45', statusColor: '#10B981' },
    { id: 'ORD-003', customer: 'Mary Wanjiku', items: 2, status: 'Ironing', time: '11:00', statusColor: '#F59E0B' },
    { id: 'ORD-004', customer: 'Peter Mwangi', items: 4, status: 'QC', time: '13:15', statusColor: '#8B5CF6' },
  ];

  const pipelineStats = [
    { stage: 'Received', count: 3, percent: 15 },
    { stage: 'Washing', count: 5, percent: 25 },
    { stage: 'Drying', count: 2, percent: 10 },
    { stage: 'Ironing', count: 4, percent: 20 },
    { stage: 'Ready', count: 6, percent: 30 },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.cream,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Top Navigation */}
      <nav style={{ 
        background: `linear-gradient(90deg, ${colors.darkTeal} 0%, ${colors.deepTeal} 50%, ${colors.darkTeal} 100%)`,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '24px', letterSpacing: '0.25em', color: colors.white, fontWeight: 300 }}>
            LORENZO
          </span>
          <span style={{ fontSize: '10px', letterSpacing: '0.3em', color: colors.accentTeal, opacity: 0.8, textTransform: 'uppercase' }}>
            Dry Cleaners
          </span>
        </div>

        {/* Center Nav */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '6px',
          borderRadius: '50px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              style={{
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === item ? colors.accentTeal : 'transparent',
                color: activeTab === item ? colors.darkTeal : 'rgba(255,255,255,0.7)'
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '10px 16px',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            ⚙️ Settings
          </button>
          
          <div style={{ position: 'relative' }}>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              🔔
            </button>
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              backgroundColor: colors.gold,
              color: colors.darkTeal,
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>3</span>
          </div>
          
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.gold} 0%, #A68B4B 100%)`,
            padding: '2px',
            cursor: 'pointer'
          }}>
            <img 
              src="/mnt/user-data/uploads/Frank_Mwangi.png" 
              alt="Frank Mwangi"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px 32px' }}>
        {/* Welcome Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', color: colors.darkTeal, fontWeight: 300, margin: 0 }}>
              Welcome back, <span style={{ fontWeight: 500 }}>{currentStaff.name.split(' ')[0]}</span>
            </h1>
            <p style={{ color: colors.teal, opacity: 0.7, marginTop: '4px' }}>
              Here's your performance overview at Kilimani Branch
            </p>
          </div>
          
          {/* Period Selector */}
          <div style={{ 
            display: 'flex', 
            gap: '4px',
            backgroundColor: colors.white,
            padding: '4px',
            borderRadius: '50px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedPeriod === period ? colors.deepTeal : 'transparent',
                  color: selectedPeriod === period ? colors.white : colors.teal
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          {[
            { label: "Today's Orders", value: currentStaff.todayOrders, icon: '📦', subtext: 'Processed by you' },
            { label: 'Items Handled', value: '54', icon: '👔', subtext: 'Garments today' },
            { label: 'Avg. Time', value: currentStaff.avgProcessingTime, icon: '⏱️', subtext: 'Per order' },
            { label: 'Your Rank', value: `#${currentStaff.rank}`, icon: '🏆', subtext: `of ${currentStaff.totalStaff} staff`, highlight: true },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: stat.highlight ? colors.deepTeal : colors.white,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: stat.highlight ? 'none' : '1px solid rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>{stat.icon}</span>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: stat.highlight ? 'rgba(255,255,255,0.6)' : colors.teal,
                marginBottom: '4px'
              }}>{stat.label}</p>
              <p style={{ 
                fontSize: '32px', 
                fontWeight: 600, 
                color: stat.highlight ? colors.white : colors.darkTeal,
                margin: 0
              }}>{stat.value}</p>
              <p style={{ 
                fontSize: '12px', 
                color: stat.highlight ? 'rgba(255,255,255,0.5)' : `${colors.teal}99`,
                marginTop: '4px'
              }}>{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '20px', marginBottom: '20px' }}>
          
          {/* My Performance - Large Card with Chart */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, color: colors.darkTeal, fontSize: '20px' }}>My Performance</h3>
                <p style={{ margin: '4px 0 0', color: colors.teal, opacity: 0.6, fontSize: '14px' }}>Orders processed over time</p>
              </div>
              
              {/* Toggle Weekly/Daily */}
              <div style={{ 
                display: 'flex', 
                gap: '4px',
                backgroundColor: colors.cream,
                padding: '4px',
                borderRadius: '12px'
              }}>
                <button
                  onClick={() => setPerformanceView('weekly')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: performanceView === 'weekly' ? colors.deepTeal : 'transparent',
                    color: performanceView === 'weekly' ? colors.white : colors.teal
                  }}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setPerformanceView('daily')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: performanceView === 'daily' ? colors.deepTeal : 'transparent',
                    color: performanceView === 'daily' ? colors.white : colors.teal
                  }}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: colors.cream,
              borderRadius: '16px'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: colors.teal, opacity: 0.6 }}>This Week</p>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 600, color: colors.darkTeal }}>{totalWeeklyOrders}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#10B981' }}>↑ 12% vs last week</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: colors.teal, opacity: 0.6 }}>Items Processed</p>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 600, color: colors.darkTeal }}>{totalWeeklyItems}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#10B981' }}>↑ 8% vs last week</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: colors.teal, opacity: 0.6 }}>Target Met</p>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 600, color: colors.gold }}>{currentStaff.streak} days</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.gold }}>🔥 Streak!</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: colors.teal, opacity: 0.6 }}>Efficiency</p>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 600, color: colors.accentTeal }}>{currentStaff.efficiency}%</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.teal, opacity: 0.5 }}>Above average</p>
              </div>
            </div>
            
            {/* Bar Chart */}
            {performanceView === 'weekly' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', marginBottom: '8px' }}>
                  {weeklyPerformance.map((data, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                      {/* Target line indicator */}
                      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        {/* Target marker */}
                        <div style={{
                          position: 'absolute',
                          bottom: `${(data.target / maxWeeklyOrders) * 100}%`,
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: colors.gold,
                          opacity: 0.5
                        }} />
                        {/* Bar */}
                        <div style={{
                          width: '100%',
                          height: `${(data.orders / maxWeeklyOrders) * 100}%`,
                          backgroundColor: data.orders >= data.target ? colors.accentTeal : colors.deepTeal,
                          borderRadius: '8px 8px 4px 4px',
                          position: 'relative',
                          minHeight: '20px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          paddingTop: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 600, 
                            color: colors.white
                          }}>{data.orders}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {weeklyPerformance.map((data, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: colors.teal, opacity: 0.6 }}>{data.day}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: colors.accentTeal }} />
                    <span style={{ fontSize: '12px', color: colors.teal }}>Target met</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: colors.deepTeal }} />
                    <span style={{ fontSize: '12px', color: colors.teal }}>Below target</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '2px', backgroundColor: colors.gold }} />
                    <span style={{ fontSize: '12px', color: colors.teal }}>Daily target</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', marginBottom: '8px' }}>
                  {dailyPerformance.map((data, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '100%',
                        height: `${(data.orders / maxDailyOrders) * 100}%`,
                        background: `linear-gradient(180deg, ${colors.accentTeal} 0%, ${colors.deepTeal} 100%)`,
                        borderRadius: '6px 6px 2px 2px',
                        minHeight: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: '6px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: colors.white }}>{data.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {dailyPerformance.map((data, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: colors.teal, opacity: 0.6 }}>{data.hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Profile & Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* My Profile Card */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.darkTeal} 0%, ${colors.deepTeal} 100%)`,
              borderRadius: '24px',
              padding: '24px',
              color: colors.white
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${colors.gold} 0%, #A68B4B 100%)`,
                  padding: '3px'
                }}>
                  <img 
                    src="/mnt/user-data/uploads/Frank_Mwangi.png" 
                    alt="Frank Mwangi"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '17px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>{currentStaff.name}</h3>
                  <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '14px' }}>{currentStaff.role}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: colors.gold, fontSize: '18px' }}>★</span>
                    <span style={{ fontSize: '24px', fontWeight: 600 }}>{currentStaff.rating}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', opacity: 0.5, fontSize: '12px' }}>Rating</p>
                </div>
              </div>
              
              {/* Skills Breakdown */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', opacity: 0.6 }}>Performance Metrics</p>
                {[
                  { label: 'Customer Satisfaction', value: currentStaff.satisfaction, color: colors.accentTeal },
                  { label: 'Accuracy', value: currentStaff.accuracy, color: colors.gold },
                  { label: 'Efficiency', value: currentStaff.efficiency, color: '#10B981' },
                ].map((skill) => (
                  <div key={skill.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', opacity: 0.8 }}>{skill.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{skill.value}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${skill.value}%`, height: '100%', backgroundColor: skill.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Achievement Badge */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>🎯</span>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Top Performer</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.6 }}>Ranked #{currentStaff.rank} this month</p>
                </div>
              </div>
            </div>

            {/* Shift Timer */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: colors.darkTeal, fontSize: '16px' }}>Shift Timer</h3>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: isTimerRunning ? colors.accentTeal : '#9CA3AF'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke={colors.deepTeal} strokeOpacity="0.1" strokeWidth="8" />
                    <circle 
                      cx="60" cy="60" r="52" fill="none" stroke={colors.deepTeal} strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="327"
                      strokeDashoffset={327 - (327 * ((timerSeconds % 28800) / 28800))}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 300, color: colors.darkTeal, fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(timerSeconds)}
                    </span>
                    <span style={{ fontSize: '10px', color: colors.teal, opacity: 0.5 }}>of 8:00:00</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isTimerRunning ? '#FEF3C7' : `${colors.deepTeal}20`,
                    color: isTimerRunning ? '#D97706' : colors.deepTeal,
                    fontSize: '18px'
                  }}
                >
                  {isTimerRunning ? '⏸' : '▶'}
                </button>
                <button style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: `${colors.deepTeal}20`,
                  color: colors.deepTeal,
                  fontSize: '18px'
                }}>
                  ↺
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 5fr 4fr', gap: '20px' }}>
          
          {/* Quick Actions */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.deepTeal} 0%, ${colors.darkTeal} 100%)`,
            borderRadius: '24px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px', color: colors.white, fontSize: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: colors.accentTeal,
                color: colors.darkTeal,
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                ➕ New Order
              </button>
              <button style={{
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: colors.white,
                fontSize: '14px',
                fontWeight: 500
              }}>
                🔍 Find Order
              </button>
              <button style={{
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: colors.white,
                fontSize: '14px',
                fontWeight: 500
              }}>
                👤 Add Customer
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: colors.darkTeal, fontSize: '18px' }}>My Recent Orders</h3>
              <button style={{ background: 'none', border: 'none', color: colors.teal, cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>View All →</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentOrders.map((order) => (
                <div key={order.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  backgroundColor: colors.cream,
                  borderRadius: '14px',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: `${order.statusColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    📦
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 500, color: colors.darkTeal, fontSize: '14px' }}>{order.customer}</p>
                    <p style={{ margin: '2px 0 0', color: colors.teal, opacity: 0.5, fontSize: '12px' }}>{order.id} • {order.items} items</p>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: `${order.statusColor}15`,
                    color: order.statusColor,
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: '12px', color: colors.teal, opacity: 0.5 }}>{order.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Status */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: colors.darkTeal, fontSize: '16px' }}>Pipeline Status</h3>
              <span style={{ fontSize: '24px', fontWeight: 300, color: colors.darkTeal }}>20</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pipelineStats.map((stat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: colors.teal, opacity: 0.7 }}>{stat.stage}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: colors.darkTeal }}>{stat.count}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: `${colors.deepTeal}15`, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${stat.percent * 3}%`, 
                      height: '100%', 
                      backgroundColor: i === 4 ? '#10B981' : i === 3 ? colors.gold : colors.accentTeal,
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
