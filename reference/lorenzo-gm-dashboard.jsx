import React, { useState } from 'react';
import { 
  Search, Clock, Users, Package, AlertTriangle, CheckCircle2, 
  TrendingUp, TrendingDown, MapPin, Shirt, Timer, UserCheck,
  Wrench, MessageSquare, Phone, ChevronDown, ChevronRight,
  RefreshCw, Bell, Settings, Calendar, Filter, MoreVertical,
  Play, Pause, AlertCircle, ThermometerSun, Droplets, Zap,
  ArrowUpRight, ArrowDownRight, CircleDot, Target, ClipboardList,
  Building2, Sparkles
} from 'lucide-react';

// Lorenzo Dry Cleaners - General Manager Operations Dashboard
export default function GMDashboard() {
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [activeTab, setActiveTab] = useState('overview');

  // Today's metrics
  const todayMetrics = {
    ordersReceived: 127,
    ordersCompleted: 98,
    ordersInProgress: 42,
    ordersPending: 29,
    revenue: 234500,
    revenueTarget: 250000,
    avgTurnaround: '18.5 hrs',
    customerSatisfaction: 4.7
  };

  // Real-time order queue
  const orderQueue = [
    { id: 'ORD-4521', customer: 'Sarah Wanjiku', items: 8, service: 'Express', status: 'washing', eta: '2 hrs', priority: 'high', branch: 'Kilimani' },
    { id: 'ORD-4520', customer: 'James Ochieng', items: 3, service: 'Premium', status: 'pressing', eta: '45 min', priority: 'normal', branch: 'Kilimani' },
    { id: 'ORD-4519', customer: 'Acme Corp', items: 45, service: 'Corporate', status: 'sorting', eta: '4 hrs', priority: 'high', branch: 'Westlands' },
    { id: 'ORD-4518', customer: 'Mary Njeri', items: 5, service: 'Standard', status: 'ready', eta: 'Ready', priority: 'normal', branch: 'Kilimani' },
    { id: 'ORD-4517', customer: 'Peter Kamau', items: 12, service: 'Express', status: 'washing', eta: '3 hrs', priority: 'normal', branch: 'Westlands' },
  ];

  // Staff on duty
  const staffOnDuty = [
    { name: 'Frank Mwangi', role: 'Cashier', branch: 'Kilimani', status: 'active', ordersHandled: 34, rating: 4.8 },
    { name: 'Grace Akinyi', role: 'Presser', branch: 'Kilimani', status: 'active', ordersHandled: 28, rating: 4.9 },
    { name: 'John Mutua', role: 'Washer', branch: 'Kilimani', status: 'break', ordersHandled: 22, rating: 4.6 },
    { name: 'Alice Wambui', role: 'Cashier', branch: 'Westlands', status: 'active', ordersHandled: 31, rating: 4.7 },
    { name: 'David Otieno', role: 'Presser', branch: 'Westlands', status: 'active', ordersHandled: 25, rating: 4.5 },
  ];

  // Branch performance
  const branchPerformance = [
    { name: 'Kilimani', orders: 78, revenue: 142300, target: 150000, efficiency: 94, staff: 6, issues: 1 },
    { name: 'Westlands', orders: 49, revenue: 92200, target: 100000, efficiency: 87, staff: 4, issues: 2 },
  ];

  // Equipment status
  const equipment = [
    { name: 'Industrial Washer #1', branch: 'Kilimani', status: 'running', load: '85%', temp: '60°C', nextService: '12 days' },
    { name: 'Industrial Washer #2', branch: 'Kilimani', status: 'running', load: '72%', temp: '45°C', nextService: '12 days' },
    { name: 'Steam Press #1', branch: 'Kilimani', status: 'idle', load: '0%', temp: '180°C', nextService: '5 days' },
    { name: 'Industrial Washer #1', branch: 'Westlands', status: 'maintenance', load: '0%', temp: '-', nextService: 'Now' },
    { name: 'Steam Press #1', branch: 'Westlands', status: 'running', load: '90%', temp: '175°C', nextService: '18 days' },
  ];

  // Urgent issues
  const urgentIssues = [
    { type: 'customer', title: 'VIP Order Delayed', description: 'Acme Corp order running 2 hours behind schedule', time: '15 min ago', priority: 'high' },
    { type: 'equipment', title: 'Washer Maintenance', description: 'Westlands Washer #1 requires immediate attention', time: '1 hr ago', priority: 'high' },
    { type: 'inventory', title: 'Low Stock Alert', description: 'Detergent supply below 20% threshold', time: '2 hrs ago', priority: 'medium' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready': return '#2DD4BF';
      case 'pressing': return '#6366F1';
      case 'washing': return '#3B82F6';
      case 'sorting': return '#F59E0B';
      case 'active': return '#2DD4BF';
      case 'break': return '#F59E0B';
      case 'running': return '#2DD4BF';
      case 'idle': return '#6B7280';
      case 'maintenance': return '#FF6B6B';
      default: return '#6B7280';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') {
      return { bg: 'rgba(255, 107, 107, 0.15)', color: '#FF6B6B', text: 'URGENT' };
    }
    return { bg: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF', text: 'NORMAL' };
  };

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
        
        .metric-card {
          background: linear-gradient(145deg, rgba(20, 82, 74, 0.2) 0%, rgba(10, 47, 44, 0.3) 100%);
          border: 1px solid rgba(45, 212, 191, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.3s ease;
        }
        
        .metric-card:hover {
          border-color: rgba(45, 212, 191, 0.25);
          transform: translateY(-2px);
        }
        
        .order-row {
          background: rgba(10, 47, 44, 0.3);
          border: 1px solid rgba(45, 212, 191, 0.06);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .order-row:hover {
          background: rgba(20, 82, 74, 0.3);
          border-color: rgba(45, 212, 191, 0.15);
        }
        
        .staff-row {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .staff-row:hover {
          background: rgba(45, 212, 191, 0.05);
        }
        
        .tab-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: rgba(232, 240, 242, 0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }
        
        .tab-btn:hover {
          color: rgba(232, 240, 242, 0.8);
        }
        
        .tab-btn.active {
          color: #2DD4BF;
          border-bottom-color: #2DD4BF;
        }
        
        .action-btn {
          background: linear-gradient(135deg, #14524A 0%, #1E6B5E 100%);
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 8px;
          padding: 8px 14px;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .action-btn:hover {
          background: linear-gradient(135deg, #1E6B5E 0%, #2DD4BF 100%);
          transform: translateY(-1px);
        }
        
        .action-btn-small {
          padding: 6px 10px;
          font-size: 11px;
        }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(10, 47, 44, 0.6);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
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
        }
        
        .icon-btn {
          width: 38px;
          height: 38px;
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
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 20px;
          font-size: 11px;
          color: #2DD4BF;
          font-weight: 500;
        }
        
        .search-input {
          background: rgba(10, 47, 44, 0.5);
          border: 1px solid rgba(45, 212, 191, 0.15);
          border-radius: 10px;
          padding: 10px 14px 10px 40px;
          color: #E8F0F2;
          font-size: 13px;
          width: 100%;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .search-input::placeholder {
          color: rgba(232, 240, 242, 0.4);
        }
        
        .search-input:focus {
          border-color: rgba(45, 212, 191, 0.4);
        }

        .issue-card {
          background: rgba(10, 47, 44, 0.4);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 10px;
          border-left: 3px solid;
          transition: all 0.2s ease;
        }

        .issue-card:hover {
          background: rgba(20, 82, 74, 0.3);
        }
      `}</style>

      {/* Header */}
      <header style={{
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        borderBottom: '1px solid rgba(45, 212, 191, 0.08)',
        background: 'rgba(10, 26, 31, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: 'linear-gradient(135deg, #2DD4BF 0%, #14524A 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px' }}>Lorenzo Operations</div>
            <div style={{ fontSize: '9px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1.5px' }}>GENERAL MANAGER</div>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="live-indicator">
          <div className="pulse-dot" style={{ background: '#2DD4BF', width: '6px', height: '6px' }} />
          LIVE
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(232, 240, 242, 0.4)' }} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Search orders, customers, staff..."
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="dropdown">
            <MapPin size={14} />
            <span style={{ color: '#2DD4BF', fontWeight: '500' }}>{selectedBranch}</span>
            <ChevronDown size={14} />
          </div>
          <div className="dropdown">
            <Calendar size={14} />
            <span style={{ color: '#2DD4BF', fontWeight: '500' }}>Today</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="icon-btn"><RefreshCw size={16} /></div>
          <div className="icon-btn" style={{ position: 'relative' }}>
            <Bell size={16} />
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#FF6B6B', borderRadius: '50%', border: '2px solid #0A1A1F' }} />
          </div>
          <div className="icon-btn"><Settings size={16} /></div>
        </div>

        {/* User */}
        <div style={{ 
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
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9A962 0%, #8B7355 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: '#fff'
          }}>MN</div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: '500' }}>Margaret Njoroge</div>
            <div style={{ fontSize: '9px', color: 'rgba(232, 240, 242, 0.5)' }}>General Manager</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px 28px' }}>
        {/* Today's Snapshot Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#C9A962', letterSpacing: '1.5px', marginBottom: '4px', fontWeight: '500' }}>
              TODAY'S OPERATIONS • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>
              Operations Dashboard
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="action-btn">
              <ClipboardList size={14} />
              Daily Report
            </button>
            <button className="action-btn" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}>
              <Sparkles size={14} />
              AI Insights
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
          {/* Orders Today */}
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px' }}>ORDERS TODAY</span>
              <Package size={16} color="#2DD4BF" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>
              {todayMetrics.ordersReceived}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px' }}>
              <span style={{ color: '#2DD4BF' }}>✓ {todayMetrics.ordersCompleted} done</span>
              <span style={{ color: '#F59E0B' }}>⟳ {todayMetrics.ordersInProgress} in progress</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px' }}>TODAY'S REVENUE</span>
              <TrendingUp size={16} color="#2DD4BF" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>
              KES {(todayMetrics.revenue / 1000).toFixed(0)}K
            </div>
            <div className="progress-bar" style={{ marginTop: '10px' }}>
              <div className="progress-fill" style={{ 
                width: `${(todayMetrics.revenue / todayMetrics.revenueTarget) * 100}%`,
                background: 'linear-gradient(90deg, #14524A, #2DD4BF)'
              }} />
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', marginTop: '4px' }}>
              {Math.round((todayMetrics.revenue / todayMetrics.revenueTarget) * 100)}% of KES {(todayMetrics.revenueTarget / 1000).toFixed(0)}K target
            </div>
          </div>

          {/* Avg Turnaround */}
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px' }}>AVG TURNAROUND</span>
              <Timer size={16} color="#2DD4BF" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>
              {todayMetrics.avgTurnaround}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '11px', color: '#2DD4BF' }}>
              <ArrowDownRight size={12} />
              <span>12% faster than target</span>
            </div>
          </div>

          {/* Staff on Duty */}
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px' }}>STAFF ON DUTY</span>
              <Users size={16} color="#2DD4BF" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>
              {staffOnDuty.filter(s => s.status === 'active').length}/{staffOnDuty.length}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px' }}>
              <span style={{ color: '#2DD4BF' }}>{staffOnDuty.filter(s => s.status === 'active').length} active</span>
              <span style={{ color: '#F59E0B' }}>{staffOnDuty.filter(s => s.status === 'break').length} on break</span>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px' }}>SATISFACTION</span>
              <span style={{ fontSize: '14px' }}>⭐</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>
              {todayMetrics.customerSatisfaction}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '11px', color: '#2DD4BF' }}>
              <ArrowUpRight size={12} />
              <span>+0.2 from yesterday</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Order Queue */}
            <div className="glass-card-dark" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>Live Order Queue</span>
                  <span style={{ 
                    padding: '3px 10px', 
                    background: 'rgba(45, 212, 191, 0.15)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#2DD4BF',
                    fontWeight: '500'
                  }}>
                    {orderQueue.length} active
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn action-btn-small">
                    <Filter size={12} />
                    Filter
                  </button>
                  <button className="action-btn action-btn-small">
                    View All
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Queue Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '100px 1.2fr 0.6fr 0.8fr 0.8fr 80px 100px',
                gap: '12px',
                padding: '8px 16px',
                fontSize: '10px',
                color: 'rgba(232, 240, 242, 0.4)',
                letterSpacing: '1px',
                borderBottom: '1px solid rgba(45, 212, 191, 0.08)',
                marginBottom: '8px'
              }}>
                <span>ORDER ID</span>
                <span>CUSTOMER</span>
                <span>ITEMS</span>
                <span>SERVICE</span>
                <span>STATUS</span>
                <span>ETA</span>
                <span>ACTIONS</span>
              </div>

              {/* Queue Items */}
              {orderQueue.map((order, index) => {
                const priorityBadge = getPriorityBadge(order.priority);
                return (
                  <div key={index} className="order-row" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '100px 1.2fr 0.6fr 0.8fr 0.8fr 80px 100px',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '500' }}>
                        {order.id}
                      </div>
                      <div style={{ fontSize: '9px', color: 'rgba(232, 240, 242, 0.4)' }}>{order.branch}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{order.customer}</div>
                      {order.priority === 'high' && (
                        <span style={{ 
                          padding: '2px 6px', 
                          background: priorityBadge.bg, 
                          color: priorityBadge.color,
                          borderRadius: '4px',
                          fontSize: '8px',
                          fontWeight: '600',
                          letterSpacing: '0.5px'
                        }}>
                          {priorityBadge.text}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px' }}>{order.items} items</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.7)' }}>{order.service}</div>
                    <div>
                      <span className="status-badge" style={{ 
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status)
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: order.eta === 'Ready' ? '#2DD4BF' : 'inherit' }}>
                      {order.eta}
                    </div>
                    <div>
                      <button className="action-btn action-btn-small" style={{ padding: '4px 8px' }}>
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Branch Performance */}
            <div className="glass-card-dark" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Branch Performance</span>
                <button className="action-btn action-btn-small">
                  Compare
                  <ChevronRight size={12} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {branchPerformance.map((branch, index) => (
                  <div key={index} style={{
                    background: 'rgba(10, 47, 44, 0.4)',
                    border: '1px solid rgba(45, 212, 191, 0.1)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} color="#2DD4BF" />
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{branch.name}</span>
                      </div>
                      {branch.issues > 0 && (
                        <span style={{ 
                          padding: '2px 8px', 
                          background: 'rgba(255, 107, 107, 0.15)', 
                          color: '#FF6B6B',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {branch.issues} issue{branch.issues > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', marginBottom: '2px' }}>Orders</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>{branch.orders}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', marginBottom: '2px' }}>Revenue</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>
                          {(branch.revenue / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                        <span style={{ color: 'rgba(232, 240, 242, 0.5)' }}>Target Progress</span>
                        <span style={{ color: '#2DD4BF' }}>{Math.round((branch.revenue / branch.target) * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ 
                          width: `${(branch.revenue / branch.target) * 100}%`,
                          background: 'linear-gradient(90deg, #14524A, #2DD4BF)'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(232, 240, 242, 0.6)' }}>
                      <span>Efficiency: <strong style={{ color: branch.efficiency >= 90 ? '#2DD4BF' : '#F59E0B' }}>{branch.efficiency}%</strong></span>
                      <span>Staff: <strong>{branch.staff}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Status */}
            <div className="glass-card-dark" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>Equipment Status</span>
                  {equipment.some(e => e.status === 'maintenance') && (
                    <span style={{ 
                      padding: '3px 10px', 
                      background: 'rgba(255, 107, 107, 0.15)', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#FF6B6B',
                      fontWeight: '500'
                    }}>
                      1 needs attention
                    </span>
                  )}
                </div>
                <button className="action-btn action-btn-small">
                  Schedule Service
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {equipment.map((eq, index) => (
                  <div key={index} style={{
                    background: eq.status === 'maintenance' ? 'rgba(255, 107, 107, 0.08)' : 'rgba(10, 47, 44, 0.4)',
                    border: `1px solid ${eq.status === 'maintenance' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(45, 212, 191, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      margin: '0 auto 8px',
                      background: `${getStatusColor(eq.status)}20`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {eq.name.includes('Washer') ? (
                        <Droplets size={18} color={getStatusColor(eq.status)} />
                      ) : (
                        <ThermometerSun size={18} color={getStatusColor(eq.status)} />
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>
                      {eq.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '6px' }}>
                      {eq.branch}
                    </div>
                    <span className="status-badge" style={{ 
                      background: `${getStatusColor(eq.status)}20`,
                      color: getStatusColor(eq.status),
                      fontSize: '9px',
                      padding: '3px 8px'
                    }}>
                      {eq.status}
                    </span>
                    {eq.status === 'running' && (
                      <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', marginTop: '6px' }}>
                        Load: {eq.load}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Urgent Issues */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <AlertTriangle size={18} color="#FF6B6B" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Requires Attention</span>
                <span style={{ 
                  marginLeft: 'auto',
                  width: '22px',
                  height: '22px',
                  background: '#FF6B6B',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {urgentIssues.length}
                </span>
              </div>

              {urgentIssues.map((issue, index) => (
                <div key={index} className="issue-card" style={{
                  borderLeftColor: issue.priority === 'high' ? '#FF6B6B' : '#F59E0B'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{issue.title}</span>
                    <span style={{ fontSize: '9px', color: 'rgba(232, 240, 242, 0.4)' }}>{issue.time}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.7)', lineHeight: '1.5', marginBottom: '10px' }}>
                    {issue.description}
                  </div>
                  <button className="action-btn action-btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                    Take Action
                  </button>
                </div>
              ))}
            </div>

            {/* Staff on Duty */}
            <div className="glass-card-dark" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Staff on Duty</span>
                <button className="action-btn action-btn-small">
                  Schedule
                </button>
              </div>

              {staffOnDuty.map((staff, index) => (
                <div key={index} className="staff-row">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #14524A 0%, #1E6B5E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginRight: '10px'
                  }}>
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{staff.name}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>
                      {staff.role} • {staff.branch}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: getStatusColor(staff.status) 
                      }} />
                      <span style={{ fontSize: '10px', color: getStatusColor(staff.status), textTransform: 'capitalize' }}>
                        {staff.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>
                      {staff.ordersHandled} orders • ⭐ {staff.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card-dark" style={{ padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { icon: Package, label: 'New Order', color: '#2DD4BF' },
                  { icon: Users, label: 'Add Staff', color: '#6366F1' },
                  { icon: Wrench, label: 'Log Issue', color: '#F59E0B' },
                  { icon: MessageSquare, label: 'Send Alert', color: '#3B82F6' },
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button key={index} style={{
                      background: `${action.color}10`,
                      border: `1px solid ${action.color}30`,
                      borderRadius: '10px',
                      padding: '14px',
                      color: '#E8F0F2',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <IconComponent size={20} color={action.color} />
                      <span style={{ fontSize: '11px', fontWeight: '500' }}>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '14px', 
          borderTop: '1px solid rgba(45, 212, 191, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'rgba(232, 240, 242, 0.4)'
        }}>
          <div>Last synced: Just now • Auto-refresh: 30 seconds</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="pulse-dot" style={{ width: '6px', height: '6px', background: '#2DD4BF' }} />
            <span>All systems operational</span>
          </div>
        </div>
      </main>
    </div>
  );
}
