import React, { useState } from 'react';
import { 
  Search, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronDown, Calendar, 
  DollarSign, Users, ShoppingBag, Target, ArrowUpRight, ArrowDownRight, Sparkles, 
  Bell, Settings, RefreshCw, LayoutDashboard, Brain, Wallet, Rocket, ShieldCheck, 
  FileText, FlaskConical, MapPin, Building2, Globe, TrendingUp as Trending, Star,
  MessageSquare, ThumbsUp, ThumbsDown, Fuel, Zap, PieChart, BarChart3, LineChart,
  Receipt, CreditCard, Banknote, Calculator, ArrowRight, CheckCircle2, XCircle,
  Clock, AlertCircle, Flag, Award, UserCheck, Briefcase, GraduationCap, Heart,
  FileBarChart, Download, Mail, Video, Folder, Play, Pause, RotateCcw, Sliders,
  GitBranch, Scale, Activity, Percent, ChevronRight, ExternalLink, Filter, MoreVertical,
  Eye, Edit3, Trash2, Plus, Copy, Share2, Bookmark, Archive
} from 'lucide-react';

// Lorenzo Insights Command - Full Director Dashboard
export default function DirectorFullDashboard() {
  const [activePage, setActivePage] = useState('command-center');
  const [timeframe, setTimeframe] = useState('This Quarter');
  const [currency, setCurrency] = useState('KES');

  // ==================== SHARED DATA ====================
  const kpis = [
    { label: 'REVENUE', value: 'KES 2.8M', change: '+18% vs Goal', changeType: 'positive', subtitle: 'Pacing to exceed quarterly target by KES 420K', icon: DollarSign },
    { label: 'OPERATING MARGIN', value: '32%', change: '+4% vs Goal', changeType: 'positive', subtitle: 'Improved efficiency from new equipment', icon: TrendingUp },
    { label: 'CUSTOMER RETENTION', value: '87%', change: '+5% vs LY', changeType: 'positive', subtitle: 'WhatsApp reminders driving repeat visits', icon: Users },
    { label: 'AVG ORDER VALUE', value: 'KES 1,850', change: '-3% vs Goal', changeType: 'warning', subtitle: 'Premium services uptake below target', icon: ShoppingBag }
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

  // Navigation Item Component
  const NavItem = ({ icon: Icon, label, page, badge, badgeColor }) => (
    <div 
      onClick={() => setActivePage(page)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: activePage === page ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
        borderLeft: activePage === page ? '3px solid #2DD4BF' : '3px solid transparent',
        marginBottom: '4px'
      }}>
      <Icon size={18} color={activePage === page ? '#2DD4BF' : 'rgba(232, 240, 242, 0.5)'} />
      <span style={{ 
        flex: 1, 
        fontSize: '13px', 
        fontWeight: activePage === page ? '500' : '400',
        color: activePage === page ? '#E8F0F2' : 'rgba(232, 240, 242, 0.7)'
      }}>
        {label}
      </span>
      {badge && (
        <span style={{
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '9px',
          fontWeight: '600',
          background: `${badgeColor}20`,
          color: badgeColor,
          letterSpacing: '0.5px'
        }}>
          {badge}
        </span>
      )}
    </div>
  );

  // Page Title Component
  const PageTitle = ({ category, title, subtitle }) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '11px', color: '#C9A962', letterSpacing: '1.5px', marginBottom: '4px', fontWeight: '500' }}>
        {category}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '14px', color: 'rgba(232, 240, 242, 0.6)' }}>{subtitle}</div>}
    </div>
  );

  // Stat Card Component
  const StatCard = ({ label, value, change, changeType, icon: Icon, subtitle }) => (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px' }}>{label}</span>
        {Icon && <Icon size={16} color="#2DD4BF" />}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
        {value}
      </div>
      {change && (
        <div style={{ 
          fontSize: '11px', 
          color: changeType === 'positive' ? '#2DD4BF' : changeType === 'negative' ? '#FF6B6B' : '#C9A962',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {changeType === 'positive' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      )}
      {subtitle && <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );

  // ==================== PAGE: COMMAND CENTER ====================
  const CommandCenterPage = () => (
    <>
      <PageTitle category="MORNING BRIEFING" title="Command Center" />
      
      {/* Executive Narrative */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Executive Narrative</div>
        <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(232, 240, 242, 0.85)' }}>
          Good morning. Overall business health is <span style={{ color: '#2DD4BF', fontWeight: '500' }}>strong (Score: 92/100)</span>. 
          Q4 revenue is currently <span style={{ color: '#2DD4BF' }}>18% ahead of forecast</span> driven by the new corporate accounts program. 
          Customer retention has improved by 5% due to WhatsApp automation. However, <span style={{ color: '#C9A962' }}>premium service uptake 
          remains 3% below target</span> — consider promotional pricing for specialty items.
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div key={index} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1.5px', fontWeight: '500' }}>{kpi.label}</div>
                <div style={{ width: '32px', height: '32px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent size={16} color="#2DD4BF" />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>{kpi.value}</div>
              <div style={{ fontSize: '12px', color: kpi.changeType === 'positive' ? '#2DD4BF' : '#C9A962', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                {kpi.changeType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>{kpi.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Strategic Deep Dive Label */}
      <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.4)', letterSpacing: '2px', textAlign: 'center', marginBottom: '16px', fontWeight: '500' }}>
        STRATEGIC DEEP DIVE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Revenue Performance Chart */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Predictive Performance vs. Goal</div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '30px' }}>
            {revenueData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${((d.actual || d.projected) / 1200000) * 150}px`,
                  background: d.actual ? 'linear-gradient(180deg, #2DD4BF, #14524A)' : 'linear-gradient(180deg, #4AE3D0, #1E6B5E)',
                  borderRadius: '4px',
                  opacity: d.projected ? 0.7 : 1
                }} />
                <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Drivers */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Key Drivers & Root Causes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {drivers.map((driver, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(232, 240, 242, 0.8)' }}>{driver.name}</span>
                  <span style={{ color: driver.type === 'positive' ? '#2DD4BF' : '#FF6B6B', fontFamily: "'JetBrains Mono', monospace", fontWeight: '500' }}>
                    {driver.type === 'positive' ? '+' : ''}KES {Math.abs(driver.value).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: '20px', background: 'rgba(10, 47, 44, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(Math.abs(driver.value) / maxDriver) * 100}%`,
                    height: '100%',
                    background: driver.type === 'positive' ? 'linear-gradient(90deg, #14524A, #2DD4BF)' : 'linear-gradient(90deg, #FF6B6B, #C53030)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ==================== PAGE: STRATEGIC INTELLIGENCE ====================
  const StrategicIntelligencePage = () => {
    const competitors = [
      { name: 'Clean Express', location: '0.3km from Kilimani', pricing: 'KES 350/shirt', rating: 4.2, threat: 'high' },
      { name: 'Pristine Cleaners', location: '0.8km from Kilimani', pricing: 'KES 320/shirt', rating: 4.5, threat: 'medium' },
      { name: 'Quick Wash', location: '1.2km from Westlands', pricing: 'KES 280/shirt', rating: 3.8, threat: 'low' },
    ];

    const marketTrends = [
      { trend: 'Eco-friendly cleaning demand', change: '+34%', direction: 'up' },
      { trend: 'Express service requests', change: '+28%', direction: 'up' },
      { trend: 'Traditional dry cleaning', change: '-12%', direction: 'down' },
      { trend: 'Corporate account inquiries', change: '+45%', direction: 'up' },
    ];

    const sentimentData = {
      positive: 78,
      neutral: 15,
      negative: 7,
      totalReviews: 342,
      avgRating: 4.6
    };

    const economicIndicators = [
      { indicator: 'KES/USD Exchange', value: '153.50', change: '+2.3%', impact: 'Imported chemicals cost up' },
      { indicator: 'Fuel Price', value: 'KES 217/L', change: '+8.5%', impact: 'Delivery costs increasing' },
      { indicator: 'Electricity Tariff', value: 'KES 25.3/kWh', change: '+5.2%', impact: 'Operating costs affected' },
      { indicator: 'Min. Wage Index', value: '+12%', change: 'YoY', impact: 'Labor cost pressure' },
    ];

    return (
      <>
        <PageTitle 
          category="MARKET ANALYSIS" 
          title="Strategic Intelligence" 
          subtitle="External factors and competitive landscape affecting your business"
        />

        {/* AI Market Summary */}
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>AI Market Analysis</span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#818CF8', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 10px', borderRadius: '12px' }}>Updated 2 hours ago</span>
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(232, 240, 242, 0.85)' }}>
            The Nairobi dry cleaning market is experiencing <span style={{ color: '#2DD4BF' }}>sustained growth of 15% YoY</span>. 
            Key opportunity: Corporate accounts segment growing 45% faster than retail. <span style={{ color: '#C9A962' }}>Threat detected:</span> Clean Express 
            opened a new branch 300m from your Kilimani location last week. Their aggressive pricing (15% below yours) may impact walk-in traffic. 
            <span style={{ color: '#818CF8' }}> Recommendation: Consider loyalty program launch within 30 days.</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Competitive Landscape */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} color="#FF6B6B" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Competitive Landscape</span>
              </div>
              <button className="action-btn-small">View Map</button>
            </div>

            {competitors.map((comp, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                border: `1px solid ${comp.threat === 'high' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(45, 212, 191, 0.1)'}`,
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{comp.name}</span>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    fontSize: '9px', 
                    fontWeight: '600',
                    background: comp.threat === 'high' ? 'rgba(255, 107, 107, 0.15)' : comp.threat === 'medium' ? 'rgba(201, 169, 98, 0.15)' : 'rgba(45, 212, 191, 0.15)',
                    color: comp.threat === 'high' ? '#FF6B6B' : comp.threat === 'medium' ? '#C9A962' : '#2DD4BF'
                  }}>
                    {comp.threat.toUpperCase()} THREAT
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)' }}>
                  <span><MapPin size={12} style={{ marginRight: '4px' }} />{comp.location}</span>
                  <span>{comp.pricing}</span>
                  <span>⭐ {comp.rating}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Sentiment */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Customer Sentiment</span>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)' }}>{sentimentData.totalReviews} reviews analyzed</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#2DD4BF', fontFamily: "'JetBrains Mono', monospace" }}>
                  {sentimentData.avgRating}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Avg Rating</div>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: 'Positive', value: sentimentData.positive, color: '#2DD4BF' },
                  { label: 'Neutral', value: sentimentData.neutral, color: '#6B7280' },
                  { label: 'Negative', value: sentimentData.negative, color: '#FF6B6B' },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: 'rgba(232, 240, 242, 0.7)' }}>{item.label}</span>
                      <span style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(10, 47, 44, 0.6)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 107, 107, 0.08)', border: '1px solid rgba(255, 107, 107, 0.2)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#FF6B6B', fontWeight: '500', marginBottom: '4px' }}>TOP COMPLAINT</div>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.8)' }}>"Turnaround time longer than promised" - mentioned in 12 reviews this month</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Market Trends */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Trending size={18} color="#6366F1" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Market Trends</span>
            </div>

            {marketTrends.map((trend, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: index < marketTrends.length - 1 ? '1px solid rgba(45, 212, 191, 0.08)' : 'none'
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.8)' }}>{trend.trend}</span>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: trend.direction === 'up' ? '#2DD4BF' : '#FF6B6B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {trend.change}
                </span>
              </div>
            ))}
          </div>

          {/* Economic Indicators */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Globe size={18} color="#C9A962" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Economic Indicators</span>
            </div>

            {economicIndicators.map((item, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)' }}>{item.indicator}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>{item.impact}</span>
                  <span style={{ fontSize: '11px', color: '#C9A962' }}>{item.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ==================== PAGE: FINANCIAL COMMAND ====================
  const FinancialCommandPage = () => {
    const plData = {
      revenue: 2800000,
      cogs: 840000,
      grossProfit: 1960000,
      opex: { labor: 520000, rent: 180000, utilities: 95000, marketing: 45000, other: 120000 },
      netProfit: 1000000
    };

    const cashFlowProjection = [
      { period: 'Current', balance: 1250000, status: 'healthy' },
      { period: '+30 days', balance: 980000, status: 'healthy' },
      { period: '+60 days', balance: 720000, status: 'caution' },
      { period: '+90 days', balance: 890000, status: 'healthy' },
    ];

    const budgetVsActual = [
      { category: 'Revenue', budget: 2500000, actual: 2800000, variance: 12 },
      { category: 'Labor', budget: 480000, actual: 520000, variance: -8.3 },
      { category: 'Marketing', budget: 60000, actual: 45000, variance: 25 },
      { category: 'Utilities', budget: 85000, actual: 95000, variance: -11.8 },
    ];

    const investments = [
      { item: 'Steam Press Machine', cost: 450000, date: 'Mar 2024', roi: '8 months', status: 'achieved' },
      { item: 'Delivery Van', cost: 1200000, date: 'Jun 2024', roi: '18 months', status: 'on-track' },
      { item: 'POS System', cost: 85000, date: 'Aug 2024', roi: '6 months', status: 'achieved' },
    ];

    return (
      <>
        <PageTitle 
          category="FINANCIAL OVERVIEW" 
          title="Financial Command" 
          subtitle="Complete financial picture with P&L, cash flow, and investment tracking"
        />

        {/* Financial Health Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="GROSS REVENUE" value={`KES ${(plData.revenue/1000000).toFixed(1)}M`} change="+18% vs LY" changeType="positive" icon={DollarSign} />
          <StatCard label="GROSS MARGIN" value="70%" change="+3% vs target" changeType="positive" icon={PieChart} />
          <StatCard label="NET PROFIT" value={`KES ${(plData.netProfit/1000000).toFixed(1)}M`} change="+22% vs LY" changeType="positive" icon={TrendingUp} />
          <StatCard label="CASH POSITION" value="KES 1.25M" change="Healthy" changeType="positive" icon={Wallet} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '24px' }}>
          {/* P&L Breakdown */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>P&L Breakdown</span>
              </div>
              <select style={{ background: 'rgba(10, 47, 44, 0.6)', border: '1px solid rgba(45, 212, 191, 0.2)', borderRadius: '6px', padding: '6px 10px', color: '#E8F0F2', fontSize: '12px' }}>
                <option>This Quarter</option>
                <option>Last Quarter</option>
                <option>YTD</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(45, 212, 191, 0.1)' }}>
                <span style={{ color: 'rgba(232, 240, 242, 0.7)' }}>Gross Revenue</span>
                <span style={{ fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>KES {plData.revenue.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(45, 212, 191, 0.1)', color: '#FF6B6B' }}>
                <span>Cost of Goods Sold</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>- KES {plData.cogs.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid rgba(45, 212, 191, 0.2)', fontWeight: '600' }}>
                <span>Gross Profit</span>
                <span style={{ color: '#2DD4BF', fontFamily: "'JetBrains Mono', monospace" }}>KES {plData.grossProfit.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)', marginBottom: '10px' }}>OPERATING EXPENSES</div>
            {Object.entries(plData.opex).map(([key, value], index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                <span style={{ color: 'rgba(232, 240, 242, 0.7)', textTransform: 'capitalize' }}>{key}</span>
                <span style={{ color: '#FF6B6B', fontFamily: "'JetBrains Mono', monospace" }}>- KES {value.toLocaleString()}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: '12px', borderTop: '2px solid rgba(45, 212, 191, 0.3)', fontWeight: '700', fontSize: '16px' }}>
              <span>Net Profit</span>
              <span style={{ color: '#2DD4BF', fontFamily: "'JetBrains Mono', monospace" }}>KES {plData.netProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Cash Flow Forecast */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Activity size={18} color="#6366F1" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Cash Flow Forecast</span>
            </div>

            {cashFlowProjection.map((item, index) => (
              <div key={index} style={{
                background: item.status === 'caution' ? 'rgba(201, 169, 98, 0.1)' : 'rgba(10, 47, 44, 0.4)',
                border: `1px solid ${item.status === 'caution' ? 'rgba(201, 169, 98, 0.3)' : 'rgba(45, 212, 191, 0.1)'}`,
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)', marginBottom: '2px' }}>{item.period}</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>
                      KES {(item.balance / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    background: item.status === 'healthy' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(201, 169, 98, 0.15)',
                    color: item.status === 'healthy' ? '#2DD4BF' : '#C9A962'
                  }}>
                    {item.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}

            {cashFlowProjection.some(i => i.status === 'caution') && (
              <div style={{ background: 'rgba(201, 169, 98, 0.1)', borderRadius: '8px', padding: '12px', marginTop: '10px' }}>
                <div style={{ fontSize: '11px', color: '#C9A962', fontWeight: '500' }}>⚠️ ALERT: Cash dips below KES 750K in 60 days. Consider delaying non-essential expenses.</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Budget vs Actual */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scale size={18} color="#C9A962" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Budget vs Actual</span>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Showing variances &gt;5%</span>
            </div>

            {budgetVsActual.map((item, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(232, 240, 242, 0.8)' }}>{item.category}</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: item.variance > 0 ? '#2DD4BF' : '#FF6B6B' 
                  }}>
                    {item.variance > 0 ? '+' : ''}{item.variance}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(10, 47, 44, 0.6)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(item.actual / item.budget) * 100}%`, 
                      height: '100%', 
                      background: item.variance > 0 ? '#2DD4BF' : '#FF6B6B',
                      borderRadius: '4px'
                    }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', minWidth: '80px' }}>
                    {(item.actual/1000).toFixed(0)}K / {(item.budget/1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Investment Tracker */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calculator size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Investment Tracker</span>
              </div>
              <button className="action-btn-small">+ Add Investment</button>
            </div>

            {investments.map((inv, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{inv.item}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Purchased: {inv.date}</div>
                  </div>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '8px', 
                    fontSize: '9px', 
                    fontWeight: '600',
                    background: inv.status === 'achieved' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: inv.status === 'achieved' ? '#2DD4BF' : '#818CF8'
                  }}>
                    ROI {inv.status === 'achieved' ? 'ACHIEVED' : 'ON TRACK'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(232, 240, 242, 0.6)' }}>Cost: <strong>KES {(inv.cost/1000).toFixed(0)}K</strong></span>
                  <span style={{ color: 'rgba(232, 240, 242, 0.6)' }}>Target ROI: <strong>{inv.roi}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ==================== PAGE: GROWTH HUB ====================
  const GrowthHubPage = () => {
    const expansionLocations = [
      { location: 'Karen', score: 82, population: '45,000', competition: 'Low', rent: 'KES 120K/mo', recommendation: 'Highly Recommended' },
      { location: 'Lavington', score: 74, population: '38,000', competition: 'Medium', rent: 'KES 95K/mo', recommendation: 'Consider' },
      { location: 'Gigiri', score: 68, population: '22,000', competition: 'Low', rent: 'KES 150K/mo', recommendation: 'Niche Opportunity' },
    ];

    const newServices = [
      { service: 'Alterations & Tailoring', potential: 'KES 180K/mo', investment: 'KES 250K', payback: '1.4 months', demand: 'high' },
      { service: 'Shoe Repair & Care', potential: 'KES 95K/mo', investment: 'KES 150K', payback: '1.6 months', demand: 'medium' },
      { service: 'Wedding Dress Preservation', potential: 'KES 120K/mo', investment: 'KES 80K', payback: '0.7 months', demand: 'high' },
    ];

    const corporatePipeline = [
      { company: 'Safari Hotels Group', value: 'KES 2.4M/yr', probability: 85, stage: 'Negotiation', contact: 'Meeting Friday' },
      { company: 'Nation Media', value: 'KES 1.8M/yr', probability: 60, stage: 'Proposal', contact: 'Follow-up needed' },
      { company: 'Safaricom PLC', value: 'KES 4.2M/yr', probability: 25, stage: 'Initial Contact', contact: 'Waiting for response' },
      { company: 'KCB Bank', value: 'KES 1.5M/yr', probability: 70, stage: 'Trial Period', contact: 'Trial ends Jan 15' },
    ];

    return (
      <>
        <PageTitle 
          category="EXPANSION PLANNING" 
          title="Growth Hub" 
          subtitle="New markets, services, and partnership opportunities"
        />

        {/* Growth Potential Summary */}
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', borderLeft: '4px solid #2DD4BF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Rocket size={20} color="#2DD4BF" />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Growth Opportunity Score: 78/100</span>
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(232, 240, 242, 0.85)' }}>
            Your business is <span style={{ color: '#2DD4BF' }}>well-positioned for expansion</span>. Current operational capacity at 72% suggests room for growth. 
            Top opportunity: <span style={{ color: '#C9A962' }}>Karen branch opening</span> (projected ROI: 14 months). Corporate pipeline value: <strong>KES 9.9M annually</strong> with 
            <span style={{ color: '#2DD4BF' }}> KES 4.2M in high-probability deals</span>.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* New Branch Feasibility */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Branch Expansion Analysis</span>
              </div>
              <button className="action-btn-small">Run New Analysis</button>
            </div>

            {expansionLocations.map((loc, index) => (
              <div key={index} style={{
                background: index === 0 ? 'rgba(45, 212, 191, 0.08)' : 'rgba(10, 47, 44, 0.4)',
                border: `1px solid ${index === 0 ? 'rgba(45, 212, 191, 0.25)' : 'rgba(45, 212, 191, 0.1)'}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{loc.location}</span>
                      {index === 0 && <span style={{ background: '#2DD4BF', color: '#0A1A1F', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: '700' }}>TOP PICK</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#2DD4BF' }}>{loc.recommendation}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2DD4BF', fontFamily: "'JetBrains Mono', monospace" }}>{loc.score}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>Feasibility Score</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '11px' }}>
                  <div>
                    <div style={{ color: 'rgba(232, 240, 242, 0.5)', marginBottom: '2px' }}>Population</div>
                    <div style={{ fontWeight: '500' }}>{loc.population}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(232, 240, 242, 0.5)', marginBottom: '2px' }}>Competition</div>
                    <div style={{ fontWeight: '500', color: loc.competition === 'Low' ? '#2DD4BF' : '#C9A962' }}>{loc.competition}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(232, 240, 242, 0.5)', marginBottom: '2px' }}>Est. Rent</div>
                    <div style={{ fontWeight: '500' }}>{loc.rent}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Service Expansion */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#6366F1" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>New Service Opportunities</span>
              </div>
            </div>

            {newServices.map((svc, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{svc.service}</div>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '8px', 
                      fontSize: '9px', 
                      fontWeight: '600',
                      background: svc.demand === 'high' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(201, 169, 98, 0.15)',
                      color: svc.demand === 'high' ? '#2DD4BF' : '#C9A962'
                    }}>
                      {svc.demand.toUpperCase()} DEMAND
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2DD4BF' }}>{svc.potential}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>Monthly Potential</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(232, 240, 242, 0.6)' }}>
                  <span>Investment: <strong>{svc.investment}</strong></span>
                  <span>Payback: <strong style={{ color: '#2DD4BF' }}>{svc.payback}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Pipeline */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color="#C9A962" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Corporate Account Pipeline</span>
              <span style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.5)' }}>Total Value: KES 9.9M/yr</span>
            </div>
            <button className="action-btn-small">+ Add Prospect</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr 1.2fr 0.8fr', gap: '12px', padding: '10px 16px', fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', letterSpacing: '1px', borderBottom: '1px solid rgba(45, 212, 191, 0.1)', marginBottom: '8px' }}>
            <span>COMPANY</span>
            <span>ANNUAL VALUE</span>
            <span>PROBABILITY</span>
            <span>STAGE</span>
            <span>NEXT ACTION</span>
            <span></span>
          </div>

          {corporatePipeline.map((deal, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr 1.2fr 0.8fr',
              gap: '12px',
              padding: '14px 16px',
              background: 'rgba(10, 47, 44, 0.3)',
              borderRadius: '8px',
              marginBottom: '8px',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: '500', fontSize: '13px' }}>{deal.company}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{deal.value}</div>
              <div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: `conic-gradient(${deal.probability >= 70 ? '#2DD4BF' : deal.probability >= 50 ? '#C9A962' : '#6B7280'} ${deal.probability * 3.6}deg, rgba(10, 47, 44, 0.6) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {deal.probability}%
                </div>
              </div>
              <div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '500',
                  background: deal.stage === 'Negotiation' ? 'rgba(45, 212, 191, 0.15)' : deal.stage === 'Trial Period' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                  color: deal.stage === 'Negotiation' ? '#2DD4BF' : deal.stage === 'Trial Period' ? '#818CF8' : '#9CA3AF'
                }}>
                  {deal.stage}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.7)' }}>{deal.contact}</div>
              <div>
                <button className="action-btn-small" style={{ padding: '6px 10px' }}>
                  <MoreVertical size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ==================== PAGE: PERFORMANCE DEEP DIVE ====================
  const PerformanceDeepDivePage = () => {
    const kpiTrends = [
      { metric: 'Revenue', current: 2800000, prev: 2400000, change: 16.7, trend: [65, 70, 68, 75, 82, 88, 92, 95, 98, 100, 105, 112] },
      { metric: 'Orders', current: 1847, prev: 1620, change: 14.0, trend: [60, 62, 65, 68, 72, 75, 80, 85, 88, 92, 95, 98] },
      { metric: 'Avg Order Value', current: 1516, prev: 1481, change: 2.4, trend: [95, 96, 94, 97, 98, 96, 99, 100, 101, 102, 100, 102] },
      { metric: 'Customer Retention', current: 87, prev: 82, change: 6.1, trend: [78, 79, 80, 81, 82, 83, 84, 85, 85, 86, 87, 87] },
    ];

    const branchComparison = [
      { branch: 'Kilimani', revenue: 1680000, orders: 1108, aov: 1516, retention: 89, efficiency: 94 },
      { branch: 'Westlands', revenue: 1120000, orders: 739, aov: 1515, retention: 84, efficiency: 87 },
    ];

    const serviceBreakdown = [
      { service: 'Dry Cleaning', orders: 45, revenue: 38, profit: 42 },
      { service: 'Laundry', orders: 28, revenue: 22, profit: 18 },
      { service: 'Express Service', orders: 15, revenue: 25, profit: 28 },
      { service: 'Premium Care', orders: 8, revenue: 12, profit: 10 },
      { service: 'Corporate', orders: 4, revenue: 3, profit: 2 },
    ];

    return (
      <>
        <PageTitle 
          category="HISTORICAL ANALYSIS" 
          title="Performance Deep Dive" 
          subtitle="Trends, comparisons, and detailed analytics across all metrics"
        />

        {/* KPI Trends */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {kpiTrends.map((kpi, index) => (
            <div key={index} className="glass-card-dark" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1px', marginBottom: '8px' }}>{kpi.metric.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>
                  {kpi.metric === 'Revenue' ? `KES ${(kpi.current/1000000).toFixed(1)}M` : kpi.metric === 'Avg Order Value' ? `KES ${kpi.current}` : kpi.metric === 'Customer Retention' ? `${kpi.current}%` : kpi.current.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#2DD4BF', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <ArrowUpRight size={14} />
                  +{kpi.change}%
                </div>
              </div>
              {/* Mini Sparkline */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '30px' }}>
                {kpi.trend.map((val, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${val * 0.3}px`,
                    background: i === kpi.trend.length - 1 ? '#2DD4BF' : 'rgba(45, 212, 191, 0.3)',
                    borderRadius: '2px'
                  }} />
                ))}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', marginTop: '8px' }}>Last 12 months</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '20px', marginBottom: '24px' }}>
          {/* Branch Comparison */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Branch Performance Comparison</span>
              </div>
              <select style={{ background: 'rgba(10, 47, 44, 0.6)', border: '1px solid rgba(45, 212, 191, 0.2)', borderRadius: '6px', padding: '6px 10px', color: '#E8F0F2', fontSize: '12px' }}>
                <option>This Quarter</option>
                <option>Last Quarter</option>
                <option>YTD</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '10px 0', borderBottom: '1px solid rgba(45, 212, 191, 0.1)', fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', letterSpacing: '1px' }}>
              <span>BRANCH</span>
              <span>REVENUE</span>
              <span>ORDERS</span>
              <span>AOV</span>
              <span>RETENTION</span>
              <span>EFFICIENCY</span>
            </div>

            {branchComparison.map((branch, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                gap: '8px',
                padding: '16px 0',
                borderBottom: '1px solid rgba(45, 212, 191, 0.05)',
                alignItems: 'center'
              }}>
                <div style={{ fontWeight: '500' }}>{branch.branch}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>KES {(branch.revenue/1000).toFixed(0)}K</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{branch.orders}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>KES {branch.aov}</div>
                <div style={{ color: branch.retention >= 87 ? '#2DD4BF' : '#C9A962', fontWeight: '500' }}>{branch.retention}%</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(10, 47, 44, 0.6)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${branch.efficiency}%`, height: '100%', background: branch.efficiency >= 90 ? '#2DD4BF' : '#C9A962', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: branch.efficiency >= 90 ? '#2DD4BF' : '#C9A962' }}>{branch.efficiency}%</span>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', padding: '12px', marginTop: '16px' }}>
              <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: '500' }}>
                💡 INSIGHT: Kilimani outperforms Westlands by 50% in revenue. Consider replicating Kilimani's staffing model at Westlands.
              </div>
            </div>
          </div>

          {/* Service Mix Analysis */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <PieChart size={18} color="#6366F1" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Service Mix Analysis</span>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              {/* Pie Chart Placeholder */}
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(#2DD4BF 0deg 162deg, #6366F1 162deg 252deg, #C9A962 252deg 306deg, #FF6B6B 306deg 338deg, #9CA3AF 338deg 360deg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', background: '#0D2329', borderRadius: '50%' }} />
              </div>
              <div style={{ flex: 1, fontSize: '11px' }}>
                {serviceBreakdown.map((svc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: ['#2DD4BF', '#6366F1', '#C9A962', '#FF6B6B', '#9CA3AF'][i] }} />
                    <span style={{ color: 'rgba(232, 240, 242, 0.7)' }}>{svc.service}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{svc.orders}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', letterSpacing: '1px', marginBottom: '10px' }}>PROFIT CONTRIBUTION</div>
            {serviceBreakdown.slice(0, 3).map((svc, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                  <span>{svc.service}</span>
                  <span style={{ color: '#2DD4BF' }}>{svc.profit}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(10, 47, 44, 0.6)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${svc.profit}%`, height: '100%', background: '#2DD4BF', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ==================== PAGE: RISK & COMPLIANCE ====================
  const RiskCompliancePage = () => {
    const riskRegister = [
      { risk: 'Equipment Failure', probability: 'Medium', impact: 'High', score: 12, status: 'active', mitigation: 'Preventive maintenance schedule in place' },
      { risk: 'Staff Turnover', probability: 'High', impact: 'Medium', score: 12, status: 'active', mitigation: 'Competitive salary review Q1' },
      { risk: 'Supply Chain Disruption', probability: 'Low', impact: 'High', score: 8, status: 'monitoring', mitigation: 'Alternative suppliers identified' },
      { risk: 'Cyber Security Breach', probability: 'Low', impact: 'High', score: 8, status: 'monitoring', mitigation: 'IT security audit scheduled' },
    ];

    const complianceItems = [
      { item: 'Business License', status: 'valid', expiry: 'Dec 2025', daysRemaining: 350 },
      { item: 'Fire Safety Certificate', status: 'expiring', expiry: 'Jan 29, 2025', daysRemaining: 21 },
      { item: 'NEMA Compliance', status: 'valid', expiry: 'Mar 2025', daysRemaining: 82 },
      { item: 'Insurance - Property', status: 'valid', expiry: 'Jun 2025', daysRemaining: 172 },
      { item: 'Insurance - Liability', status: 'valid', expiry: 'Jun 2025', daysRemaining: 172 },
      { item: 'Staff NHIF Registration', status: 'valid', expiry: 'Ongoing', daysRemaining: null },
    ];

    const recentIncidents = [
      { date: 'Jan 5', type: 'Customer Complaint', description: 'Garment damage claim - silk blouse', status: 'resolved', cost: 'KES 4,500' },
      { date: 'Jan 3', type: 'Equipment', description: 'Steam press temperature sensor malfunction', status: 'resolved', cost: 'KES 12,000' },
      { date: 'Dec 28', type: 'Staff', description: 'Unauthorized absence - John M.', status: 'closed', cost: '-' },
    ];

    return (
      <>
        <PageTitle 
          category="GOVERNANCE" 
          title="Risk & Compliance" 
          subtitle="Risk management, regulatory compliance, and incident tracking"
        />

        {/* Risk Score Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="OVERALL RISK SCORE" value="Medium" subtitle="Score: 12/25" icon={ShieldCheck} />
          <StatCard label="ACTIVE RISKS" value="4" change="2 high priority" changeType="warning" icon={AlertTriangle} />
          <StatCard label="COMPLIANCE STATUS" value="92%" change="1 item expiring soon" changeType="warning" icon={CheckCircle2} />
          <StatCard label="OPEN INCIDENTS" value="0" change="3 resolved this month" changeType="positive" icon={Flag} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '24px' }}>
          {/* Risk Register */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} color="#FF6B6B" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Risk Register</span>
              </div>
              <button className="action-btn-small">+ Add Risk</button>
            </div>

            {riskRegister.map((risk, index) => (
              <div key={index} style={{
                background: risk.score >= 12 ? 'rgba(255, 107, 107, 0.08)' : 'rgba(10, 47, 44, 0.4)',
                border: `1px solid ${risk.score >= 12 ? 'rgba(255, 107, 107, 0.2)' : 'rgba(45, 212, 191, 0.1)'}`,
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{risk.risk}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                      <span style={{ color: 'rgba(232, 240, 242, 0.6)' }}>Probability: <strong style={{ color: risk.probability === 'High' ? '#FF6B6B' : '#C9A962' }}>{risk.probability}</strong></span>
                      <span style={{ color: 'rgba(232, 240, 242, 0.6)' }}>Impact: <strong style={{ color: risk.impact === 'High' ? '#FF6B6B' : '#C9A962' }}>{risk.impact}</strong></span>
                    </div>
                  </div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: risk.score >= 12 ? 'rgba(255, 107, 107, 0.2)' : 'rgba(201, 169, 98, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: risk.score >= 12 ? '#FF6B6B' : '#C9A962'
                  }}>
                    {risk.score}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', background: 'rgba(10, 47, 44, 0.4)', borderRadius: '6px', padding: '8px' }}>
                  <strong>Mitigation:</strong> {risk.mitigation}
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Checklist */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle2 size={18} color="#2DD4BF" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Compliance Status</span>
            </div>

            {complianceItems.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: item.status === 'expiring' ? 'rgba(201, 169, 98, 0.1)' : 'transparent',
                borderRadius: '8px',
                marginBottom: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.status === 'valid' ? (
                    <CheckCircle2 size={16} color="#2DD4BF" />
                  ) : (
                    <AlertCircle size={16} color="#C9A962" />
                  )}
                  <span style={{ fontSize: '13px' }}>{item.item}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: item.status === 'expiring' ? '#C9A962' : 'rgba(232, 240, 242, 0.6)' }}>
                    {item.expiry}
                  </div>
                  {item.daysRemaining && item.daysRemaining <= 30 && (
                    <div style={{ fontSize: '10px', color: '#C9A962' }}>{item.daysRemaining} days left</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flag size={18} color="#6366F1" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Recent Incidents</span>
            </div>
            <button className="action-btn-small">Log Incident</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 100px 100px', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(45, 212, 191, 0.1)', fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', letterSpacing: '1px' }}>
            <span>DATE</span>
            <span>TYPE</span>
            <span>DESCRIPTION</span>
            <span>STATUS</span>
            <span>COST</span>
          </div>

          {recentIncidents.map((incident, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 2fr 100px 100px',
              gap: '12px',
              padding: '14px 0',
              borderBottom: '1px solid rgba(45, 212, 191, 0.05)',
              alignItems: 'center',
              fontSize: '13px'
            }}>
              <span style={{ color: 'rgba(232, 240, 242, 0.6)' }}>{incident.date}</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '10px',
                background: incident.type === 'Customer Complaint' ? 'rgba(255, 107, 107, 0.15)' : incident.type === 'Equipment' ? 'rgba(201, 169, 98, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: incident.type === 'Customer Complaint' ? '#FF6B6B' : incident.type === 'Equipment' ? '#C9A962' : '#818CF8'
              }}>
                {incident.type}
              </span>
              <span style={{ color: 'rgba(232, 240, 242, 0.8)' }}>{incident.description}</span>
              <span style={{ color: '#2DD4BF', fontSize: '11px' }}>✓ {incident.status}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: incident.cost !== '-' ? '#FF6B6B' : 'rgba(232, 240, 242, 0.4)' }}>{incident.cost}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ==================== PAGE: LEADERSHIP & PEOPLE ====================
  const LeadershipPeoplePage = () => {
    const leadershipTeam = [
      { name: 'Margaret Njoroge', role: 'General Manager', performance: 94, goals: '8/10 achieved', tenure: '3 years', photo: 'MN' },
      { name: 'David Kimani', role: 'Operations Manager', performance: 88, goals: '7/10 achieved', tenure: '2 years', photo: 'DK' },
      { name: 'Susan Achieng', role: 'Kilimani Branch Manager', performance: 91, goals: '9/10 achieved', tenure: '4 years', photo: 'SA' },
      { name: 'Peter Omondi', role: 'Westlands Branch Manager', performance: 79, goals: '6/10 achieved', tenure: '1 year', photo: 'PO' },
    ];

    const successionPlan = [
      { role: 'General Manager', incumbent: 'Margaret Njoroge', successor: 'David Kimani', readiness: 'Ready in 1 year' },
      { role: 'Operations Manager', incumbent: 'David Kimani', successor: 'Susan Achieng', readiness: 'Ready now' },
      { role: 'Branch Manager (Kilimani)', incumbent: 'Susan Achieng', successor: 'Frank Mwangi', readiness: 'Ready in 2 years' },
    ];

    const compensationData = [
      { role: 'Branch Manager', current: 85000, market: 95000, gap: -10.5 },
      { role: 'Presser', current: 28000, market: 32000, gap: -12.5 },
      { role: 'Cashier', current: 25000, market: 26000, gap: -3.8 },
      { role: 'Washer', current: 22000, market: 24000, gap: -8.3 },
    ];

    const cultureMetrics = {
      overallSatisfaction: 78,
      retention: 87,
      nps: 42,
      trainingHours: 24
    };

    return (
      <>
        <PageTitle 
          category="PEOPLE MANAGEMENT" 
          title="Leadership & People" 
          subtitle="Team performance, succession planning, and organizational culture"
        />

        {/* Culture Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="STAFF SATISFACTION" value={`${cultureMetrics.overallSatisfaction}%`} change="+5% from last survey" changeType="positive" icon={Heart} />
          <StatCard label="RETENTION RATE" value={`${cultureMetrics.retention}%`} change="Above industry avg" changeType="positive" icon={Users} />
          <StatCard label="EMPLOYEE NPS" value={`+${cultureMetrics.nps}`} change="Promoter zone" changeType="positive" icon={ThumbsUp} />
          <StatCard label="TRAINING HOURS/EMP" value={`${cultureMetrics.trainingHours}h`} change="This quarter" changeType="positive" icon={GraduationCap} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Leadership Scorecard */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={18} color="#C9A962" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Leadership Scorecard</span>
              </div>
              <button className="action-btn-small">Full Report</button>
            </div>

            {leadershipTeam.map((leader, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '10px',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${leader.performance >= 90 ? '#2DD4BF' : leader.performance >= 80 ? '#6366F1' : '#C9A962'} 0%, #14524A 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {leader.photo}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{leader.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>{leader.role} • {leader.tenure}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: leader.performance >= 90 ? '#2DD4BF' : leader.performance >= 80 ? '#6366F1' : '#C9A962',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {leader.performance}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)' }}>{leader.goals}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Succession Planning */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Succession Planning</span>
              </div>
            </div>

            {successionPlan.map((plan, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '12px', color: '#C9A962', fontWeight: '500', marginBottom: '10px' }}>{plan.role}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>INCUMBENT</div>
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{plan.incumbent}</div>
                  </div>
                  <ArrowRight size={16} color="rgba(232, 240, 242, 0.3)" />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', marginBottom: '4px' }}>SUCCESSOR</div>
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{plan.successor}</div>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '10px', 
                  padding: '6px 10px', 
                  background: plan.readiness.includes('now') ? 'rgba(45, 212, 191, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  textAlign: 'center',
                  color: plan.readiness.includes('now') ? '#2DD4BF' : '#818CF8'
                }}>
                  {plan.readiness}
                </div>
              </div>
            ))}

            <div style={{ background: 'rgba(255, 107, 107, 0.08)', borderRadius: '8px', padding: '12px', marginTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#FF6B6B' }}>
                ⚠️ GAP: No identified successor for Westlands Branch Manager position
              </div>
            </div>
          </div>
        </div>

        {/* Compensation Benchmarks */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wallet size={18} color="#6366F1" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Compensation vs Market Benchmarks</span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Data: Nairobi Hospitality & Services Sector Q4 2024</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {compensationData.map((comp, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)', marginBottom: '10px' }}>{comp.role}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)' }}>Current</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>KES {(comp.current/1000).toFixed(0)}K</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)' }}>Market</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace", color: 'rgba(232, 240, 242, 0.6)' }}>KES {(comp.market/1000).toFixed(0)}K</div>
                  </div>
                </div>
                <div style={{
                  padding: '6px',
                  borderRadius: '6px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#FF6B6B',
                  fontWeight: '500'
                }}>
                  {comp.gap}% below market
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(201, 169, 98, 0.1)', borderRadius: '8px', padding: '12px', marginTop: '16px' }}>
            <div style={{ fontSize: '11px', color: '#C9A962' }}>
              ⚠️ RETENTION RISK: Pressers are paid 12.5% below market average. This role has the highest turnover in the industry.
            </div>
          </div>
        </div>
      </>
    );
  };

  // ==================== PAGE: BOARD ROOM ====================
  const BoardRoomPage = () => {
    const upcomingMeetings = [
      { date: 'Jan 25, 2025', type: 'Board Meeting', agenda: 'Q4 Results & 2025 Strategy', status: 'scheduled' },
      { date: 'Feb 15, 2025', type: 'Investor Update', agenda: 'Expansion Funding Discussion', status: 'pending' },
    ];

    const recentReports = [
      { name: 'Q4 2024 Board Report', date: 'Jan 5, 2025', pages: 24, status: 'final' },
      { name: 'Q3 2024 Board Report', date: 'Oct 8, 2024', pages: 22, status: 'final' },
      { name: 'Annual Strategy Review 2024', date: 'Dec 15, 2024', pages: 36, status: 'final' },
      { name: 'Expansion Feasibility Study', date: 'Nov 20, 2024', pages: 18, status: 'draft' },
    ];

    const boardActions = [
      { action: 'Approve Karen branch investment', assigned: 'Full Board', deadline: 'Jan 25', status: 'pending' },
      { action: 'Review staff compensation proposal', assigned: 'HR Committee', deadline: 'Jan 30', status: 'in-progress' },
      { action: 'Sign off on insurance renewal', assigned: 'James Karanja', deadline: 'Feb 5', status: 'pending' },
    ];

    return (
      <>
        <PageTitle 
          category="GOVERNANCE" 
          title="Board Room" 
          subtitle="Board reports, meeting prep, and stakeholder communications"
        />

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <button className="action-card" style={{
            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(20, 82, 74, 0.25) 100%)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <FileBarChart size={24} color="#2DD4BF" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#E8F0F2' }}>Generate Board Report</div>
            <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>AI-powered quarterly summary</div>
          </button>
          <button className="action-card" style={{
            background: 'rgba(10, 47, 44, 0.4)',
            border: '1px solid rgba(45, 212, 191, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <Video size={24} color="#6366F1" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#E8F0F2' }}>Schedule Meeting</div>
            <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Set up board or committee call</div>
          </button>
          <button className="action-card" style={{
            background: 'rgba(10, 47, 44, 0.4)',
            border: '1px solid rgba(45, 212, 191, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <Mail size={24} color="#C9A962" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#E8F0F2' }}>Investor Update</div>
            <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Draft shareholder communication</div>
          </button>
          <button className="action-card" style={{
            background: 'rgba(10, 47, 44, 0.4)',
            border: '1px solid rgba(45, 212, 191, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <Folder size={24} color="#FF6B6B" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#E8F0F2' }}>Document Vault</div>
            <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Access board archives</div>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Upcoming Meetings */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Upcoming Meetings</span>
              </div>
            </div>

            {upcomingMeetings.map((meeting, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{meeting.type}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)' }}>{meeting.date}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '500',
                    background: meeting.status === 'scheduled' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(201, 169, 98, 0.15)',
                    color: meeting.status === 'scheduled' ? '#2DD4BF' : '#C9A962'
                  }}>
                    {meeting.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.7)', marginBottom: '12px' }}>
                  <strong>Agenda:</strong> {meeting.agenda}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn-small">Prep Materials</button>
                  <button className="action-btn-small" style={{ background: 'transparent', border: '1px solid rgba(45, 212, 191, 0.2)' }}>View Agenda</button>
                </div>
              </div>
            ))}
          </div>

          {/* Open Actions */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#C9A962" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Board Action Items</span>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>{boardActions.length} open</span>
            </div>

            {boardActions.map((action, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'rgba(10, 47, 44, 0.4)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${action.status === 'in-progress' ? '#6366F1' : '#6B7280'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {action.status === 'in-progress' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{action.action}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>
                    {action.assigned} • Due: {action.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="#6366F1" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Recent Reports & Documents</span>
            </div>
            <button className="action-btn-small">View All</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {recentReports.map((report, index) => (
              <div key={index} style={{
                background: 'rgba(10, 47, 44, 0.4)',
                border: '1px solid rgba(45, 212, 191, 0.1)',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <FileText size={24} color={report.status === 'final' ? '#2DD4BF' : '#C9A962'} />
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: '600',
                    background: report.status === 'final' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(201, 169, 98, 0.15)',
                    color: report.status === 'final' ? '#2DD4BF' : '#C9A962'
                  }}>
                    {report.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontWeight: '500', fontSize: '13px', marginBottom: '4px' }}>{report.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>
                  {report.date} • {report.pages} pages
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Download size={14} color="rgba(232, 240, 242, 0.5)" style={{ cursor: 'pointer' }} />
                  <Share2 size={14} color="rgba(232, 240, 242, 0.5)" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ==================== PAGE: AI STRATEGY LAB ====================
  const AIStrategyLabPage = () => {
    const [activeScenario, setActiveScenario] = useState(null);

    const scenarios = [
      { 
        id: 1,
        name: 'Price Increase Simulation',
        description: 'What if we raise prices by 10%?',
        status: 'ready',
        result: { revenue: '+8%', volume: '-15%', profit: '+12%', risk: 'Medium' }
      },
      { 
        id: 2,
        name: 'Karen Branch Opening',
        description: 'Model outcomes of new location',
        status: 'ready',
        result: { breakeven: '14 months', investment: 'KES 2.8M', npv: 'KES 4.2M', risk: 'Low' }
      },
      { 
        id: 3,
        name: 'Staff Optimization',
        description: 'Optimal staffing levels analysis',
        status: 'ready',
        result: { savings: 'KES 45K/mo', efficiency: '+12%', satisfaction: 'No impact', risk: 'Low' }
      },
    ];

    const aiRecommendations = [
      { priority: 1, action: 'Launch corporate loyalty program', impact: 'KES 320K incremental revenue', confidence: 92, timeframe: '30 days' },
      { priority: 2, action: 'Hire 1 additional presser for Kilimani', impact: 'Reduce turnaround 25%', confidence: 87, timeframe: '14 days' },
      { priority: 3, action: 'Increase digital marketing spend', impact: '+18% new customer acquisition', confidence: 78, timeframe: '60 days' },
      { priority: 4, action: 'Negotiate bulk detergent contract', impact: 'KES 85K annual savings', confidence: 95, timeframe: '45 days' },
    ];

    return (
      <>
        <PageTitle 
          category="AI-POWERED" 
          title="AI Strategy Lab" 
          subtitle="Predictive modeling, scenario planning, and AI-generated recommendations"
        />

        {/* AI Confidence Banner */}
        <div className="glass-card" style={{ 
          padding: '16px 24px', 
          marginBottom: '24px', 
          borderLeft: '4px solid #6366F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>AI Model Status: Active & Learning</div>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)' }}>
                Trained on 18 months of operational data • Last updated: 2 hours ago • Prediction accuracy: 89%
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="action-btn-small" style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
              <RotateCcw size={12} />
              Retrain Model
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Scenario Builder */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GitBranch size={18} color="#6366F1" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Scenario Builder</span>
              </div>
              <button className="action-btn-small">+ New Scenario</button>
            </div>

            {scenarios.map((scenario, index) => (
              <div 
                key={index} 
                onClick={() => setActiveScenario(activeScenario === scenario.id ? null : scenario.id)}
                style={{
                  background: activeScenario === scenario.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(10, 47, 44, 0.4)',
                  border: `1px solid ${activeScenario === scenario.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(45, 212, 191, 0.1)'}`,
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{scenario.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.6)' }}>{scenario.description}</div>
                  </div>
                  <ChevronRight size={16} color="rgba(232, 240, 242, 0.4)" style={{ transform: activeScenario === scenario.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {activeScenario === scenario.id && (
                  <div style={{ 
                    marginTop: '12px', 
                    paddingTop: '12px', 
                    borderTop: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px'
                  }}>
                    {Object.entries(scenario.result).map(([key, value], i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>{key}</div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: typeof value === 'string' && value.includes('+') ? '#2DD4BF' : typeof value === 'string' && value.includes('-') ? '#FF6B6B' : '#E8F0F2'
                        }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '2px dashed rgba(99, 102, 241, 0.3)',
              borderRadius: '10px',
              color: '#818CF8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Play size={16} />
              Run Custom "What-If" Analysis
            </button>
          </div>

          {/* Resource Optimizer */}
          <div className="glass-card-dark" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={18} color="#2DD4BF" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>Resource Optimizer</span>
              </div>
              <span style={{ fontSize: '10px', color: '#818CF8', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 10px', borderRadius: '10px' }}>AI OPTIMIZED</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(232, 240, 242, 0.6)', marginBottom: '10px' }}>CURRENT VS. OPTIMAL STAFFING</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(10, 47, 44, 0.5)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>10</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Current Staff</div>
                </div>
                <div style={{ background: 'rgba(45, 212, 191, 0.1)', borderRadius: '8px', padding: '14px', textAlign: 'center', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace", color: '#2DD4BF' }}>11</div>
                  <div style={{ fontSize: '11px', color: '#2DD4BF' }}>AI Recommended</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(45, 212, 191, 0.08)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#2DD4BF', marginBottom: '8px' }}>AI RECOMMENDATION</div>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(232, 240, 242, 0.85)' }}>
                Add <strong>1 presser at Kilimani</strong> (8AM-2PM shift). This reduces overtime by <strong>KES 45,000/month</strong> and cuts average turnaround time by <strong>2.5 hours</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="action-btn" style={{ flex: 1, justifyContent: 'center' }}>
                <CheckCircle2 size={14} />
                Approve & Implement
              </button>
              <button className="action-btn" style={{ background: 'transparent', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                Modify
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card-dark" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lightbulb size={18} color="#C9A962" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>AI Strategic Recommendations</span>
              <span style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Prioritized by impact</span>
            </div>
            <button className="action-btn-small">Refresh Analysis</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {aiRecommendations.map((rec, index) => (
              <div key={index} style={{
                background: index === 0 ? 'rgba(45, 212, 191, 0.08)' : 'rgba(10, 47, 44, 0.4)',
                border: `1px solid ${index === 0 ? 'rgba(45, 212, 191, 0.25)' : 'rgba(45, 212, 191, 0.1)'}`,
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: index === 0 ? '#2DD4BF' : 'rgba(45, 212, 191, 0.2)',
                    color: index === 0 ? '#0A1A1F' : '#2DD4BF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {rec.priority}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    fontSize: '10px',
                    color: '#818CF8'
                  }}>
                    {rec.confidence}% confident
                  </div>
                </div>

                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', lineHeight: '1.4' }}>{rec.action}</div>
                <div style={{ fontSize: '12px', color: '#2DD4BF', marginBottom: '8px' }}>Impact: {rec.impact}</div>
                <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)', marginBottom: '12px' }}>Timeframe: {rec.timeframe}</div>

                <button className="action-btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                  Implement
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ==================== RENDER PAGE BASED ON ACTIVE PAGE ====================
  const renderPage = () => {
    switch (activePage) {
      case 'command-center': return <CommandCenterPage />;
      case 'strategic-intelligence': return <StrategicIntelligencePage />;
      case 'financial-command': return <FinancialCommandPage />;
      case 'growth-hub': return <GrowthHubPage />;
      case 'performance': return <PerformanceDeepDivePage />;
      case 'risk-compliance': return <RiskCompliancePage />;
      case 'leadership-people': return <LeadershipPeoplePage />;
      case 'board-room': return <BoardRoomPage />;
      case 'ai-strategy-lab': return <AIStrategyLabPage />;
      default: return <CommandCenterPage />;
    }
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
        
        .kpi-card {
          background: linear-gradient(145deg, rgba(20, 82, 74, 0.2) 0%, rgba(10, 47, 44, 0.3) 100%);
          border: 1px solid rgba(45, 212, 191, 0.1);
          border-radius: 14px;
          padding: 20px 24px;
          transition: all 0.3s ease;
        }
        
        .kpi-card:hover {
          border-color: rgba(45, 212, 191, 0.25);
          transform: translateY(-2px);
        }
        
        .stat-card {
          background: linear-gradient(145deg, rgba(20, 82, 74, 0.2) 0%, rgba(10, 47, 44, 0.3) 100%);
          border: 1px solid rgba(45, 212, 191, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          border-color: rgba(45, 212, 191, 0.2);
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
        }
        
        .search-input::placeholder {
          color: rgba(232, 240, 242, 0.4);
        }
        
        .search-input:focus {
          border-color: rgba(45, 212, 191, 0.4);
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
        }
        
        .dropdown:hover {
          border-color: rgba(45, 212, 191, 0.3);
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
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background: linear-gradient(135deg, #1E6B5E 0%, #2DD4BF 100%);
        }
        
        .action-btn-small {
          background: linear-gradient(135deg, #14524A 0%, #1E6B5E 100%);
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 6px;
          padding: 6px 12px;
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .action-btn-small:hover {
          background: linear-gradient(135deg, #1E6B5E 0%, #2DD4BF 100%);
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
          color: rgba(232, 240, 242, 0.6);
        }
        
        .icon-btn:hover {
          background: rgba(20, 82, 74, 0.5);
          color: #2DD4BF;
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2DD4BF;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'linear-gradient(180deg, #0A2F2C 0%, #0D2329 100%)',
        borderRight: '1px solid rgba(45, 212, 191, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 200
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(45, 212, 191, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #2DD4BF 0%, #14524A 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.3px' }}>Lorenzo Insights</div>
              <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.5)', letterSpacing: '1.5px' }}>COMMAND CENTER</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.3)', letterSpacing: '1.5px', padding: '0 12px', marginBottom: '10px' }}>MAIN</div>
            <NavItem icon={LayoutDashboard} label="Command Center" page="command-center" />
            <NavItem icon={Brain} label="Strategic Intelligence" page="strategic-intelligence" badge="NEW" badgeColor="#6366F1" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.3)', letterSpacing: '1.5px', padding: '0 12px', marginBottom: '10px' }}>FINANCIAL</div>
            <NavItem icon={Wallet} label="Financial Command" page="financial-command" />
            <NavItem icon={Rocket} label="Growth Hub" page="growth-hub" />
            <NavItem icon={TrendingUp} label="Performance Deep Dive" page="performance" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.3)', letterSpacing: '1.5px', padding: '0 12px', marginBottom: '10px' }}>GOVERNANCE</div>
            <NavItem icon={ShieldCheck} label="Risk & Compliance" page="risk-compliance" badge="2" badgeColor="#FF6B6B" />
            <NavItem icon={Users} label="Leadership & People" page="leadership-people" />
            <NavItem icon={FileText} label="Board Room" page="board-room" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(232, 240, 242, 0.3)', letterSpacing: '1.5px', padding: '0 12px', marginBottom: '10px' }}>AI-POWERED</div>
            <NavItem icon={FlaskConical} label="AI Strategy Lab" page="ai-strategy-lab" badge="BETA" badgeColor="#C9A962" />
          </div>
        </nav>

        {/* User Profile */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid rgba(45, 212, 191, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2DD4BF 0%, #14524A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff'
          }}>JK</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>James Karanja</div>
            <div style={{ fontSize: '11px', color: 'rgba(232, 240, 242, 0.5)' }}>Director</div>
          </div>
          <Settings size={18} style={{ color: 'rgba(232, 240, 242, 0.4)', cursor: 'pointer' }} />
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: '260px' }}>
        {/* Header */}
        <header style={{
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderBottom: '1px solid rgba(45, 212, 191, 0.08)',
          background: 'rgba(10, 26, 31, 0.6)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
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
              <span>Currency:</span>
              <span style={{ color: '#2DD4BF', fontWeight: '500' }}>{currency}</span>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="icon-btn"><RefreshCw size={18} /></div>
            <div className="icon-btn" style={{ position: 'relative' }}>
              <Bell size={18} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: '#C9A962', borderRadius: '50%' }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '24px 32px' }}>
          {renderPage()}
        </main>

        {/* Footer */}
        <footer style={{ 
          padding: '16px 32px',
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
        </footer>
      </div>
    </div>
  );
}
