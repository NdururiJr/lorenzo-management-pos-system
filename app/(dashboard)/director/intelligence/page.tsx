'use client';

import { useState } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import {
  Brain,
  Target,
  MessageSquare,
  TrendingUp,
  Globe,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Star,
} from 'lucide-react';

interface Competitor {
  name: string;
  location: string;
  pricing: string;
  rating: number;
  threat: 'high' | 'medium' | 'low';
}

interface MarketTrend {
  trend: string;
  change: string;
  direction: 'up' | 'down';
}

interface EconomicIndicator {
  indicator: string;
  value: string;
  change: string;
  impact: string;
}

export default function StrategicIntelligencePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');

  // Mock data - In production, fetch from API/Firestore
  const competitors: Competitor[] = [
    { name: 'Clean Express', location: '0.3km from Kilimani', pricing: 'KES 350/shirt', rating: 4.2, threat: 'high' },
    { name: 'Pristine Cleaners', location: '0.8km from Kilimani', pricing: 'KES 320/shirt', rating: 4.5, threat: 'medium' },
    { name: 'Quick Wash', location: '1.2km from Westlands', pricing: 'KES 280/shirt', rating: 3.8, threat: 'low' },
  ];

  const marketTrends: MarketTrend[] = [
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
    avgRating: 4.6,
    topComplaint: '"Turnaround time longer than promised" - mentioned in 12 reviews this month',
  };

  const economicIndicators: EconomicIndicator[] = [
    { indicator: 'KES/USD Exchange', value: '153.50', change: '+2.3%', impact: 'Imported chemicals cost up' },
    { indicator: 'Fuel Price', value: 'KES 217/L', change: '+8.5%', impact: 'Delivery costs increasing' },
    { indicator: 'Electricity Tariff', value: 'KES 25.3/kWh', change: '+5.2%', impact: 'Operating costs affected' },
    { indicator: 'Min. Wage Index', value: '+12%', change: 'YoY', impact: 'Labor cost pressure' },
  ];

  const getThreatColor = (threat: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (threat) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              MARKET ANALYSIS
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Strategic Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              External factors and competitive landscape affecting your business
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* AI Market Summary */}
        <ModernCard className="p-5 border-l-4 border-l-indigo-500 bg-indigo-50/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">AI Market Analysis</span>
            <ModernBadge variant="info" size="sm" className="ml-auto">
              Updated 2 hours ago
            </ModernBadge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Nairobi dry cleaning market is experiencing{' '}
            <span className="text-teal-600 font-medium">sustained growth of 15% YoY</span>.
            Key opportunity: Corporate accounts segment growing 45% faster than retail.{' '}
            <span className="text-amber-600 font-medium">Threat detected:</span> Clean Express
            opened a new branch 300m from your Kilimani location last week. Their aggressive
            pricing (15% below yours) may impact walk-in traffic.{' '}
            <span className="text-indigo-600 font-medium">
              Recommendation: Consider loyalty program launch within 30 days.
            </span>
          </p>
        </ModernCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competitive Landscape */}
          <ModernCard>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold">Competitive Landscape</h2>
              </div>
              <ModernButton variant="secondary" size="sm">
                View Map
              </ModernButton>
            </div>
            <div className="p-4 space-y-3">
              {competitors.map((comp, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    comp.threat === 'high'
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{comp.name}</span>
                    <ModernBadge variant={getThreatColor(comp.threat)} size="sm">
                      {comp.threat.toUpperCase()} THREAT
                    </ModernBadge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {comp.location}
                    </span>
                    <span>{comp.pricing}</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      {comp.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          {/* Customer Sentiment */}
          <ModernCard>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-500" />
                <h2 className="font-semibold">Customer Sentiment</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {sentimentData.totalReviews} reviews analyzed
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-teal-600">
                    {sentimentData.avgRating}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Positive', value: sentimentData.positive, color: 'bg-teal-500' },
                    { label: 'Neutral', value: sentimentData.neutral, color: 'bg-gray-400' },
                    { label: 'Negative', value: sentimentData.negative, color: 'bg-red-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={item.color.replace('bg-', 'text-').replace('-500', '-600')}>
                          {item.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs font-medium text-red-600 mb-1">TOP COMPLAINT</div>
                <div className="text-sm text-muted-foreground">{sentimentData.topComplaint}</div>
              </div>
            </div>
          </ModernCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Trends */}
          <ModernCard>
            <div className="p-4 border-b flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold">Market Trends</h2>
            </div>
            <div className="divide-y">
              {marketTrends.map((trend, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between"
                >
                  <span className="text-sm">{trend.trend}</span>
                  <span
                    className={`text-sm font-semibold flex items-center gap-1 ${
                      trend.direction === 'up' ? 'text-teal-600' : 'text-red-600'
                    }`}
                  >
                    {trend.direction === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {trend.change}
                  </span>
                </div>
              ))}
            </div>
          </ModernCard>

          {/* Economic Indicators */}
          <ModernCard>
            <div className="p-4 border-b flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold">Economic Indicators</h2>
            </div>
            <div className="p-4 space-y-3">
              {economicIndicators.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{item.indicator}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.impact}</span>
                    <span className="text-xs text-amber-600">{item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      </div>
    </ModernLayout>
  );
}
