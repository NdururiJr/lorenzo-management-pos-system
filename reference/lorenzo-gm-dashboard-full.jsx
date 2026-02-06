import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Users, Wrench, BarChart3, Settings,
  Clock, TrendingUp, AlertTriangle, CheckCircle2, Bell, RefreshCw,
  ChevronDown, MapPin, Star, Phone, MessageSquare, Play, Pause,
  Timer, Zap, ThermometerSun, AlertCircle, Search, Filter,
  Building2, Shirt, CircleDot, ArrowUpRight, ArrowDownRight,
  UserCheck, ClipboardList, ChevronRight, MoreVertical, X
} from 'lucide-react';

// Lorenzo Dry Cleaners - General Manager Operations Dashboard
export default function GMDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Live refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSeconds(s => (s + 1) % 30);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1A1F 0%, #0F2027 50%, #1A2832 100%)',
      color: '#E8F0F2',
      fontFamily: "'General Sans', -apple-system, sans-serif",
      display: 'flex',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(13, 27, 33, 0.7) 0%, rgba(15, 32, 39, 0.6) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(45, 212, 191, 0.12);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        
        .metric-card {
          background: linear-gradient(135deg, rgba(13, 27, 33, 0.8) 0%, rgba(15, 32, 39, 0.7) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .metric-card:hover {
          transform: translateY(-3px);
          border-color: rgba(45, 212, 191, 0.3);
          box-shadow: 0 12px 28px rgba(45, 212, 191, 0.15);
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #2DD4BF;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.6);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: rgba(232, 240, 242, 0.6);
          margin-bottom: 6px;
        }
        
        .nav-item:hover {
          background: rgba(45, 212, 191, 0.1);
          color: #2DD4BF;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(45, 212, 191, 0.08) 100%);
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.2);
        }
        
        .order-row {
          background: rgba(13, 27, 33, 0.5);
          border: 1px solid rgba(45, 212, 191, 0.08);
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
          margin-bottom: 10px;
        }
        
        .order-row:hover {
          background: rgba(13, 27, 33, 0.8);
          border-color: rgba(45, 212, 191, 0.2);
          transform: translateX(4px);
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: inline-block;
        }
        
        .dropdown {
          background: rgba(13, 27, 33, 0.6);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        
        .dropdown:hover {
          background: rgba(13, 27, 33, 0.8);
          border-color: rgba(45, 212, 191, 0.3);
        }
        
        .action-btn {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(45, 212, 191, 0.08) 100%);
          border: 1px solid rgba(45, 212, 191, 0.3);
          color: #2DD4BF;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.25) 0%, rgba(45, 212, 191, 0.15) 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 212, 191, 0.2);
        }
        
        .equipment-item {
          background: rgba(13, 27, 33, 0.6);
          border: 1px solid rgba(45, 212, 191, 0.1);
          border-radius: 10px;
          padding: 16px;
          text-align: center;
        }
        
        .staff-card {
          background: rgba(13, 27, 33, 0.5);
          border: 1px solid rgba(45, 212, 191, 0.1);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }
        
        .staff-card:hover {
          background: rgba(13, 27, 33, 0.8);
          border-color: rgba(45, 212, 191, 0.2);
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(45, 212, 191, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 8px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2DD4BF 0%, #1AA89B 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? '80px' : '260px',
        background: 'linear-gradient(180deg, rgba(10, 26, 31, 0.95) 0%, rgba(15, 32, 39, 0.98) 100%)',
        borderRight: '1px solid rgba(45, 212, 191, 0.15)',
        padding: sidebarCollapsed ? '24px 12px' : '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}>
        {/* Logo & Brand */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #2DD4BF 0%, #1AA89B 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)'
            }}>
              <Shirt size={20} color="#0A1A1F" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#E8F0F2' }}>
                  Lorenzo
                </div>
                <div style={{ fontSize: '11px', color: '#C9A962', letterSpacing: '1px' }}>
                  OPERATIONS
                </div>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div className="pulse-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.6)', marginBottom: '2px' }}>
                  Live Sync
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#2DD4BF' }}>
                  {30 - liveSeconds}s refresh
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '11px', 
            color: 'rgba(232, 240, 242, 0.4)', 
            letterSpacing: '1px',
            marginBottom: '12px',
            paddingLeft: sidebarCollapsed ? '0' : '16px',
            display: sidebarCollapsed ? 'none' : 'block'
          }}>
            MAIN MENU
          </div>
          
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'orders', icon: Package, label: 'Live Orders', badge: '29' },
            { id: 'staff', icon: Users, label: 'Staff' },
            { id: 'equipment', icon: Wrench, label: 'Equipment' },
            { id: 'performance', icon: BarChart3, label: 'Performance' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              style={{
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              }}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: '#C9A962',
                      color: '#0A1A1F',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        {!sidebarCollapsed && (
          <div style={{
            background: 'rgba(13, 27, 33, 0.8)',
            border: '1px solid rgba(45, 212, 191, 0.15)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #C9A962 0%, #A68850 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              color: '#0A1A1F'
            }}>
              JM
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#E8F0F2' }}>
                Joseph Mwangi
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)' }}>
                General Manager
              </div>
            </div>
            <MoreVertical size={18} color="rgba(232, 240, 242, 0.4)" style={{ cursor: 'pointer' }} />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        overflow: 'auto',
        height: '100vh'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(10, 26, 31, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#C9A962', letterSpacing: '1.5px', marginBottom: '4px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#E8F0F2' }}>
              {activePage === 'overview' && 'Operations Overview'}
              {activePage === 'orders' && 'Live Order Queue'}
              {activePage === 'staff' && 'Staff Management'}
              {activePage === 'equipment' && 'Equipment Status'}
              {activePage === 'performance' && 'Branch Performance'}
              {activePage === 'settings' && 'Settings'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="dropdown">
              <Building2 size={16} />
              <span>{selectedBranch}</span>
              <ChevronDown size={14} />
            </div>
            
            <div style={{
              background: 'rgba(13, 27, 33, 0.6)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '8px',
              padding: '10px 12px',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <Bell size={18} />
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: '#C9A962',
                borderRadius: '50%',
                border: '2px solid #0A1A1F'
              }} />
            </div>

            <button className="action-btn">
              <RefreshCw size={16} style={{ marginRight: '6px' }} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '32px' }}>
          {activePage === 'overview' && <OverviewPage />}
          {activePage === 'orders' && <OrdersPage />}
          {activePage === 'staff' && <StaffPage />}
          {activePage === 'equipment' && <EquipmentPage />}
          {activePage === 'performance' && <PerformancePage />}
          {activePage === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

// Overview Page Component
function OverviewPage() {
  const todayMetrics = [
    {
      label: 'ORDERS TODAY',
      value: '127',
      subtitle: '98 complete • 29 in progress',
      progress: 77,
      icon: Package,
      color: '#2DD4BF',
      trend: '+12%'
    },
    {
      label: "TODAY'S REVENUE",
      value: 'KES 234K',
      subtitle: '82% to target',
      progress: 82,
      icon: TrendingUp,
      color: '#2DD4BF',
      trend: '+8%'
    },
    {
      label: 'AVG TURNAROUND',
      value: '18.5 hrs',
      subtitle: 'Beating 24hr goal',
      progress: 77,
      icon: Clock,
      color: '#2DD4BF',
      trend: '-15%'
    },
    {
      label: 'STAFF ON DUTY',
      value: '9/10',
      subtitle: '1 pending arrival',
      progress: 90,
      icon: Users,
      color: '#C9A962',
      trend: '90%'
    },
    {
      label: 'SATISFACTION',
      value: '4.7★',
      subtitle: '24 ratings today',
      progress: 94,
      icon: Star,
      color: '#2DD4BF',
      trend: '+0.2'
    }
  ];

  const urgentIssues = [
    { type: 'VIP Order', message: 'Sarah Mwangi express order delayed by 15 mins', priority: 'high', time: '2 min ago' },
    { type: 'Equipment', message: 'Washer #3 at Westlands needs maintenance', priority: 'medium', time: '12 min ago' },
    { type: 'Inventory', message: 'Detergent stock low - reorder needed', priority: 'low', time: '28 min ago' }
  ];

  const recentOrders = [
    { id: 'ORD-2847', customer: 'Sarah Mwangi', status: 'pressing', priority: 'VIP', eta: '45 min', branch: 'Kilimani', items: 3 },
    { id: 'ORD-2846', customer: 'John Kamau', status: 'washing', priority: 'Standard', eta: '2.5 hrs', branch: 'Westlands', items: 5 },
    { id: 'ORD-2845', customer: 'Grace Omondi', status: 'ready', priority: 'Express', eta: 'Ready', branch: 'Kilimani', items: 2 },
    { id: 'ORD-2844', customer: 'Peter Njoroge', status: 'sorting', priority: 'Standard', eta: '3 hrs', branch: 'Westlands', items: 7 }
  ];

  return (
    <div>
      {/* Today's Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {todayMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: `${metric.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComponent size={22} color={metric.color} />
                </div>
                <div style={{
                  background: metric.trend.includes('+') || metric.trend.includes('-') && metric.label === 'AVG TURNAROUND' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(201, 169, 98, 0.1)',
                  color: metric.trend.includes('+') || metric.trend.includes('-') && metric.label === 'AVG TURNAROUND' ? '#2DD4BF' : '#C9A962',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {metric.trend}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#E8F0F2', marginBottom: '8px' }}>
                {metric.value}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.6)', marginBottom: '12px' }}>
                {metric.subtitle}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${metric.progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Recent Orders</h3>
              <p style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.5)' }}>Live order tracking</p>
            </div>
            <button className="action-btn">View All</button>
          </div>

          {recentOrders.map((order, index) => (
            <div key={index} className="order-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#2DD4BF' }}>
                    {order.id}
                  </div>
                  <span style={{
                    background: order.priority === 'VIP' ? 'rgba(201, 169, 98, 0.15)' : 'rgba(45, 212, 191, 0.1)',
                    color: order.priority === 'VIP' ? '#C9A962' : '#2DD4BF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {order.priority}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.6)' }}>
                  ETA: {order.eta}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {order.customer}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)' }}>
                    {order.items} items • {order.branch}
                  </div>
                </div>
                <span className="status-badge" style={{
                  background: order.status === 'ready' ? 'rgba(45, 212, 191, 0.15)' : 
                              order.status === 'pressing' ? 'rgba(201, 169, 98, 0.15)' :
                              'rgba(232, 240, 242, 0.1)',
                  color: order.status === 'ready' ? '#2DD4BF' : 
                         order.status === 'pressing' ? '#C9A962' : 
                         'rgba(232, 240, 242, 0.7)'
                }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Urgent Issues Sidebar */}
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertTriangle size={20} color="#C9A962" />
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Urgent Issues</h3>
              <span style={{
                background: '#C9A962',
                color: '#0A1A1F',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                marginLeft: 'auto'
              }}>
                {urgentIssues.length}
              </span>
            </div>

            {urgentIssues.map((issue, index) => (
              <div key={index} style={{
                background: 'rgba(13, 27, 33, 0.5)',
                border: `1px solid ${
                  issue.priority === 'high' ? 'rgba(255, 107, 107, 0.3)' :
                  issue.priority === 'medium' ? 'rgba(201, 169, 98, 0.3)' :
                  'rgba(45, 212, 191, 0.2)'
                }`,
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#C9A962',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {issue.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)' }}>
                    {issue.time}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.85)', marginBottom: '10px' }}>
                  {issue.message}
                </div>
                <button className="action-btn" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                  Take Action
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { icon: Package, label: 'New Order', color: '#2DD4BF' },
                { icon: Users, label: 'Add Staff', color: '#C9A962' },
                { icon: AlertCircle, label: 'Log Issue', color: '#FF6B6B' },
                { icon: MessageSquare, label: 'Send Alert', color: '#6366F1' }
              ].map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button key={index} style={{
                    background: `${action.color}10`,
                    border: `1px solid ${action.color}30`,
                    borderRadius: '10px',
                    padding: '16px',
                    color: '#E8F0F2',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <IconComponent size={20} color={action.color} />
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Orders Page Component
function OrdersPage() {
  const orders = [
    { id: 'ORD-2847', customer: 'Sarah Mwangi', phone: '+254 712 345 678', status: 'pressing', priority: 'VIP', eta: '45 min', branch: 'Kilimani', items: 3, amount: 'KES 4,500', time: '8:45 AM' },
    { id: 'ORD-2846', customer: 'John Kamau', phone: '+254 723 456 789', status: 'washing', priority: 'Standard', eta: '2.5 hrs', branch: 'Westlands', items: 5, amount: 'KES 2,800', time: '8:30 AM' },
    { id: 'ORD-2845', customer: 'Grace Omondi', phone: '+254 734 567 890', status: 'ready', priority: 'Express', eta: 'Ready', branch: 'Kilimani', items: 2, amount: 'KES 1,600', time: '7:15 AM' },
    { id: 'ORD-2844', customer: 'Peter Njoroge', phone: '+254 745 678 901', status: 'sorting', priority: 'Standard', eta: '3 hrs', branch: 'Westlands', items: 7, amount: 'KES 3,200', time: '7:00 AM' },
    { id: 'ORD-2843', customer: 'Mary Wanjiku', phone: '+254 756 789 012', status: 'pressing', priority: 'Standard', eta: '1 hr', branch: 'Kilimani', items: 4, amount: 'KES 2,100', time: '6:45 AM' },
    { id: 'ORD-2842', customer: 'David Otieno', phone: '+254 767 890 123', status: 'washing', priority: 'Express', eta: '1.5 hrs', branch: 'Westlands', items: 6, amount: 'KES 3,800', time: '6:30 AM' }
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['All', 'In Progress', 'Ready', 'VIP Only'].map((filter, index) => (
          <button key={index} className={index === 0 ? 'action-btn' : 'dropdown'}>
            {filter}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <div className="dropdown">
            <Filter size={16} />
            <span>Filter</span>
          </div>
          <div className="dropdown" style={{ width: '280px' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search orders..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#E8F0F2',
                flex: 1,
                fontSize: '13px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '20px 24px',
          background: 'rgba(13, 27, 33, 0.6)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
          fontSize: '11px',
          fontWeight: '600',
          color: 'rgba(232, 240, 242, 0.5)',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          <div>Order ID</div>
          <div>Customer</div>
          <div>Branch</div>
          <div>Status</div>
          <div>Items</div>
          <div>Amount</div>
          <div>ETA</div>
        </div>

        {orders.map((order, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: index !== orders.length - 1 ? '1px solid rgba(45, 212, 191, 0.08)' : 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13, 27, 33, 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#2DD4BF', marginBottom: '4px' }}>
                {order.id}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)' }}>
                {order.time}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                {order.customer}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={12} />
                {order.phone}
              </div>
            </div>

            <div style={{ fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#C9A962" />
                {order.branch}
              </div>
            </div>

            <div>
              <span className="status-badge" style={{
                background: order.status === 'ready' ? 'rgba(45, 212, 191, 0.15)' : 
                            order.status === 'pressing' ? 'rgba(201, 169, 98, 0.15)' :
                            order.status === 'washing' ? 'rgba(99, 102, 241, 0.15)' :
                            'rgba(232, 240, 242, 0.1)',
                color: order.status === 'ready' ? '#2DD4BF' : 
                       order.status === 'pressing' ? '#C9A962' : 
                       order.status === 'washing' ? '#6366F1' :
                       'rgba(232, 240, 242, 0.7)'
              }}>
                {order.status}
              </span>
            </div>

            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              {order.items}
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2DD4BF' }}>
              {order.amount}
            </div>

            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: order.eta === 'Ready' ? '#2DD4BF' : '#E8F0F2'
              }}>
                {order.eta}
              </div>
              {order.priority === 'VIP' && (
                <span style={{
                  fontSize: '10px',
                  color: '#C9A962',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  VIP
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Staff Page Component
function StaffPage() {
  const staff = [
    { name: 'Frank Mwangi', role: 'Cashier', branch: 'Kilimani', status: 'active', shift: '8:00 AM - 5:00 PM', ordersHandled: 34, rating: 4.8, avatar: 'FM' },
    { name: 'Grace Akinyi', role: 'Presser', branch: 'Kilimani', status: 'active', shift: '8:00 AM - 5:00 PM', ordersHandled: 28, rating: 4.9, avatar: 'GA' },
    { name: 'John Mutua', role: 'Washer', branch: 'Kilimani', status: 'break', shift: '7:00 AM - 4:00 PM', ordersHandled: 22, rating: 4.6, avatar: 'JM' },
    { name: 'Alice Wambui', role: 'Cashier', branch: 'Westlands', status: 'active', shift: '9:00 AM - 6:00 PM', ordersHandled: 31, rating: 4.7, avatar: 'AW' },
    { name: 'David Otieno', role: 'Presser', branch: 'Westlands', status: 'active', shift: '8:00 AM - 5:00 PM', ordersHandled: 25, rating: 4.5, avatar: 'DO' },
    { name: 'Sarah Njeri', role: 'Supervisor', branch: 'Kilimani', status: 'active', shift: '7:00 AM - 4:00 PM', ordersHandled: 18, rating: 4.9, avatar: 'SN' }
  ];

  return (
    <div>
      {/* Staff Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'On Duty', value: '9/10', icon: UserCheck, color: '#2DD4BF' },
          { label: 'On Break', value: '1', icon: Timer, color: '#C9A962' },
          { label: 'Avg Performance', value: '4.7★', icon: Star, color: '#2DD4BF' },
          { label: 'Orders Today', value: '158', icon: Package, color: '#6366F1' }
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="metric-card">
              <div style={{
                width: '44px',
                height: '44px',
                background: `${metric.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <IconComponent size={22} color={metric.color} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#E8F0F2' }}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Staff Members</h3>
            <p style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.5)' }}>Real-time staff status and performance</p>
          </div>
          <button className="action-btn">
            <Users size={16} style={{ marginRight: '6px' }} />
            Add Staff
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {staff.map((member, index) => (
            <div key={index} className="staff-card">
              <div style={{
                width: '56px',
                height: '56px',
                background: member.status === 'active' ? 
                  'linear-gradient(135deg, #2DD4BF 0%, #1AA89B 100%)' :
                  'linear-gradient(135deg, #C9A962 0%, #A68850 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: '#0A1A1F',
                position: 'relative'
              }}>
                {member.avatar}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  background: member.status === 'active' ? '#2DD4BF' : '#C9A962',
                  border: '2px solid #0A1A1F',
                  borderRadius: '50%'
                }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)' }}>
                      {member.role} • {member.branch}
                    </div>
                  </div>
                  <span className="status-badge" style={{
                    background: member.status === 'active' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(201, 169, 98, 0.15)',
                    color: member.status === 'active' ? '#2DD4BF' : '#C9A962',
                    fontSize: '10px',
                    padding: '4px 8px'
                  }}>
                    {member.status}
                  </span>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  padding: '10px 0',
                  borderTop: '1px solid rgba(45, 212, 191, 0.1)',
                  marginTop: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>
                      Orders
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2DD4BF' }}>
                      {member.ordersHandled}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>
                      Rating
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} fill="#C9A962" color="#C9A962" />
                      {member.rating}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>
                      Shift
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(232, 240, 242, 0.7)' }}>
                      {member.shift.split(' - ')[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Equipment Page Component
function EquipmentPage() {
  const equipment = {
    kilimani: [
      { id: 'W-K1', name: 'Washer #1', status: 'running', load: 85, temp: '65°C', cycle: '25 min left' },
      { id: 'W-K2', name: 'Washer #2', status: 'running', load: 92, temp: '70°C', cycle: '18 min left' },
      { id: 'W-K3', name: 'Washer #3', status: 'idle', load: 0, temp: '22°C', cycle: 'Ready' },
      { id: 'P-K1', name: 'Press #1', status: 'running', load: 75, temp: '180°C', cycle: '12 min left' },
      { id: 'P-K2', name: 'Press #2', status: 'idle', load: 0, temp: '25°C', cycle: 'Ready' }
    ],
    westlands: [
      { id: 'W-W1', name: 'Washer #1', status: 'running', load: 88, temp: '68°C', cycle: '32 min left' },
      { id: 'W-W2', name: 'Washer #2', status: 'idle', load: 0, temp: '24°C', cycle: 'Ready' },
      { id: 'W-W3', name: 'Washer #3', status: 'maintenance', load: 0, temp: '22°C', cycle: 'Under service' },
      { id: 'P-W1', name: 'Press #1', status: 'running', load: 82, temp: '185°C', cycle: '8 min left' },
      { id: 'P-W2', name: 'Press #2', status: 'running', load: 70, temp: '175°C', cycle: '15 min left' }
    ]
  };

  return (
    <div>
      {/* Equipment Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Total Equipment', value: '10', icon: Wrench, color: '#6366F1' },
          { label: 'Running', value: '6', icon: Play, color: '#2DD4BF' },
          { label: 'Idle', value: '3', icon: Pause, color: '#C9A962' },
          { label: 'Maintenance', value: '1', icon: AlertTriangle, color: '#FF6B6B' }
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="metric-card">
              <div style={{
                width: '44px',
                height: '44px',
                background: `${metric.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <IconComponent size={22} color={metric.color} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#E8F0F2' }}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch Equipment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {Object.entries(equipment).map(([branch, items]) => (
          <div key={branch} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Building2 size={20} color="#2DD4BF" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>
                {branch}
              </h3>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {items.map((item, index) => (
                <div key={index} className="equipment-item" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#2DD4BF', marginBottom: '4px' }}>
                        {item.id}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {item.name}
                      </div>
                    </div>
                    <span className="status-badge" style={{
                      background: item.status === 'running' ? 'rgba(45, 212, 191, 0.15)' : 
                                  item.status === 'maintenance' ? 'rgba(255, 107, 107, 0.15)' :
                                  'rgba(201, 169, 98, 0.15)',
                      color: item.status === 'running' ? '#2DD4BF' : 
                             item.status === 'maintenance' ? '#FF6B6B' :
                             '#C9A962',
                      fontSize: '10px',
                      padding: '4px 10px'
                    }}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    padding: '12px 0',
                    borderTop: '1px solid rgba(45, 212, 191, 0.1)'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>
                        Load
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>
                        {item.load}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>
                        Temp
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ThermometerSun size={14} color="#C9A962" />
                        {item.temp}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>
                        Status
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(232, 240, 242, 0.7)' }}>
                        {item.cycle}
                      </div>
                    </div>
                  </div>

                  {item.status === 'running' && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.load}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Performance Page Component
function PerformancePage() {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const branches = [
    {
      name: 'Kilimani',
      orders: 68,
      ordersCompleted: 65,
      ordersInProgress: 3,
      revenue: 124500,
      target: 140000,
      efficiency: 89,
      satisfaction: 4.8,
      staff: 5,
      staffOnDuty: 5,
      avgTurnaround: 18.5,
      targetTurnaround: 24,
      equipmentUtilization: 72,
      // Efficiency breakdown
      turnaroundEfficiency: 100,
      staffProductivity: 100,
      equipmentUtilizationScore: 96,
      revenueAchievement: 89,
      satisfactionScore: 96
    },
    {
      name: 'Westlands',
      orders: 59,
      ordersCompleted: 54,
      ordersInProgress: 5,
      revenue: 109500,
      target: 145000,
      efficiency: 76,
      satisfaction: 4.6,
      staff: 4,
      staffOnDuty: 4,
      avgTurnaround: 22.8,
      targetTurnaround: 24,
      equipmentUtilization: 58,
      // Efficiency breakdown
      turnaroundEfficiency: 95,
      staffProductivity: 92,
      equipmentUtilizationScore: 77,
      revenueAchievement: 75,
      satisfactionScore: 92
    }
  ];

  if (selectedBranch) {
    return <BranchDetailView branch={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Branch Performance Comparison
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {branches.map((branch, index) => (
          <div 
            key={index} 
            className="glass-card" 
            style={{ 
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSelectedBranch(branch)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.12)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #2DD4BF 0%, #1AA89B 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={24} color="#0A1A1F" />
                </div>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: '700' }}>{branch.name}</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.5)' }}>
                    {branch.staff} staff members
                  </p>
                </div>
              </div>
              <div style={{
                background: branch.efficiency >= 85 ? 'rgba(45, 212, 191, 0.15)' : 'rgba(201, 169, 98, 0.15)',
                color: branch.efficiency >= 85 ? '#2DD4BF' : '#C9A962',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {branch.efficiency}% Efficient
              </div>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Orders */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.6)' }}>Orders Today</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#2DD4BF' }}>{branch.orders}</span>
                </div>
              </div>

              {/* Revenue */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.6)' }}>Revenue</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#2DD4BF' }}>
                    KES {(branch.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(branch.revenue / branch.target) * 100}%` }} />
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)', marginTop: '6px' }}>
                  Target: KES {(branch.target / 1000).toFixed(0)}K • {Math.round((branch.revenue / branch.target) * 100)}% achieved
                </div>
              </div>

              {/* Satisfaction */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.6)' }}>Customer Satisfaction</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} fill="#C9A962" color="#C9A962" />
                    {branch.satisfaction}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(45, 212, 191, 0.05)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#2DD4BF'
            }}>
              Click for detailed breakdown
              <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Branch Detail View Component
function BranchDetailView({ branch, onBack }) {
  const efficiencyComponents = [
    {
      label: 'Turnaround Efficiency',
      score: branch.turnaroundEfficiency,
      weight: 25,
      icon: Clock,
      color: '#2DD4BF',
      details: `Avg: ${branch.avgTurnaround}hrs vs Target: ${branch.targetTurnaround}hrs`,
      status: branch.turnaroundEfficiency >= 95 ? 'excellent' : branch.turnaroundEfficiency >= 85 ? 'good' : 'needs improvement'
    },
    {
      label: 'Staff Productivity',
      score: branch.staffProductivity,
      weight: 25,
      icon: Users,
      color: '#6366F1',
      details: `${(branch.orders / branch.staff).toFixed(1)} orders per staff member`,
      status: branch.staffProductivity >= 95 ? 'excellent' : branch.staffProductivity >= 85 ? 'good' : 'needs improvement'
    },
    {
      label: 'Equipment Utilization',
      score: branch.equipmentUtilizationScore,
      weight: 20,
      icon: Wrench,
      color: '#C9A962',
      details: `${branch.equipmentUtilization}% of capacity used`,
      status: branch.equipmentUtilizationScore >= 90 ? 'excellent' : branch.equipmentUtilizationScore >= 75 ? 'good' : 'needs improvement'
    },
    {
      label: 'Revenue Achievement',
      score: branch.revenueAchievement,
      weight: 20,
      icon: TrendingUp,
      color: '#10B981',
      details: `KES ${(branch.revenue / 1000).toFixed(0)}K of ${(branch.target / 1000).toFixed(0)}K target`,
      status: branch.revenueAchievement >= 95 ? 'excellent' : branch.revenueAchievement >= 85 ? 'good' : 'needs improvement'
    },
    {
      label: 'Customer Satisfaction',
      score: branch.satisfactionScore,
      weight: 10,
      icon: Star,
      color: '#F59E0B',
      details: `${branch.satisfaction}★ average rating`,
      status: branch.satisfactionScore >= 95 ? 'excellent' : branch.satisfactionScore >= 90 ? 'good' : 'needs improvement'
    }
  ];

  const calculateWeightedContribution = (score, weight) => {
    return ((score / 100) * weight).toFixed(1);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            color: '#2DD4BF',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
          Back to Comparison
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #2DD4BF 0%, #1AA89B 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)'
            }}>
              <Building2 size={32} color="#0A1A1F" />
            </div>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '6px' }}>
                {branch.name} Branch
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(232, 240, 242, 0.6)' }}>
                Detailed Performance Analysis
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(45, 212, 191, 0.08) 100%)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)', marginBottom: '6px' }}>
              OVERALL EFFICIENCY
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#2DD4BF' }}>
              {branch.efficiency}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Orders Today', value: branch.orders, sublabel: `${branch.ordersCompleted} completed`, icon: Package, color: '#2DD4BF' },
          { label: 'Staff on Duty', value: `${branch.staffOnDuty}/${branch.staff}`, sublabel: 'All active', icon: Users, color: '#6366F1' },
          { label: 'Avg Turnaround', value: `${branch.avgTurnaround}hrs`, sublabel: `Target: ${branch.targetTurnaround}hrs`, icon: Clock, color: '#10B981' },
          { label: 'Revenue Today', value: `${(branch.revenue / 1000).toFixed(0)}K`, sublabel: `${branch.revenueAchievement}% of target`, icon: TrendingUp, color: '#C9A962' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="metric-card">
              <div style={{
                width: '44px',
                height: '44px',
                background: `${stat.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <IconComponent size={22} color={stat.color} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#E8F0F2', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)' }}>
                {stat.sublabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Efficiency Breakdown */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          Efficiency Score Breakdown
        </h3>

        <div style={{ display: 'grid', gap: '20px' }}>
          {efficiencyComponents.map((component, index) => {
            const IconComponent = component.icon;
            const contribution = calculateWeightedContribution(component.score, component.weight);
            
            return (
              <div key={index} style={{
                background: 'rgba(13, 27, 33, 0.5)',
                border: '1px solid rgba(45, 212, 191, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `${component.color}15`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={20} color={component.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                        {component.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)' }}>
                        {component.details}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: component.color, marginBottom: '2px' }}>
                      {component.score}%
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>
                      Weight: {component.weight}%
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div className="progress-bar" style={{ height: '8px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${component.score}%`,
                        background: `linear-gradient(90deg, ${component.color} 0%, ${component.color}CC 100%)`
                      }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    background: component.status === 'excellent' ? 'rgba(45, 212, 191, 0.15)' :
                                component.status === 'good' ? 'rgba(201, 169, 98, 0.15)' :
                                'rgba(255, 107, 107, 0.15)',
                    color: component.status === 'excellent' ? '#2DD4BF' :
                           component.status === 'good' ? '#C9A962' :
                           '#FF6B6B'
                  }}>
                    {component.status.toUpperCase()}
                  </span>

                  <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.7)' }}>
                    Contributes <span style={{ fontWeight: '700', color: component.color }}>{contribution}</span> points to overall score
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Calculation */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.05) 100%)',
          border: '2px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.6)', marginBottom: '4px' }}>
                TOTAL EFFICIENCY SCORE
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(232, 240, 242, 0.8)' }}>
                Weighted average of all components
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#2DD4BF' }}>
              {branch.efficiency}%
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Zap size={20} color="#C9A962" />
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
            Actionable Insights & Recommendations
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {branch.efficiency >= 85 ? (
            <>
              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '12px'
              }}>
                <CheckCircle2 size={20} color="#2DD4BF" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#2DD4BF' }}>
                    Excellent Performance
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.8)', lineHeight: '1.6' }}>
                    {branch.name} is operating at peak efficiency. Continue monitoring turnaround times and maintain current staff scheduling to sustain this level of performance.
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(201, 169, 98, 0.1)',
                border: '1px solid rgba(201, 169, 98, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '12px'
              }}>
                <TrendingUp size={20} color="#C9A962" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#C9A962' }}>
                    Revenue Opportunity
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.8)', lineHeight: '1.6' }}>
                    You're KES {((branch.target - branch.revenue) / 1000).toFixed(0)}K short of daily target. Consider promoting premium services during peak hours to boost average order value.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '12px'
              }}>
                <AlertTriangle size={20} color="#FF6B6B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#FF6B6B' }}>
                    Priority: Improve Equipment Utilization
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.8)', lineHeight: '1.6' }}>
                    Equipment utilization at {branch.equipmentUtilization}% is below optimal range (70-85%). Schedule maintenance during off-peak hours and consider batch processing to maximize machine uptime.
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(201, 169, 98, 0.1)',
                border: '1px solid rgba(201, 169, 98, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '12px'
              }}>
                <Clock size={20} color="#C9A962" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#C9A962' }}>
                    Turnaround Time Monitoring
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.8)', lineHeight: '1.6' }}>
                    Average turnaround of {branch.avgTurnaround} hours is approaching the 24-hour target. Monitor order queue closely during peak hours to prevent delays.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings Page Component
function SettingsPage() {
  return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
      <Settings size={64} color="#2DD4BF" style={{ margin: '0 auto 20px' }} />
      <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
        Settings
      </h3>
      <p style={{ fontSize: '14px', color: 'rgba(232, 240, 242, 0.6)' }}>
        Settings page coming soon. Configure your preferences, notifications, and system settings here.
      </p>
    </div>
  );
}