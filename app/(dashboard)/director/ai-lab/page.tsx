'use client';

import { useState } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import {
  FlaskConical,
  Brain,
  Lightbulb,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Target,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  status: 'ready' | 'running' | 'completed';
  lastRun?: string;
  impact?: {
    revenue: number;
    customers: number;
    efficiency: number;
  };
}

interface AIRecommendation {
  id: string;
  title: string;
  category: 'revenue' | 'operations' | 'customers' | 'risk';
  confidence: number;
  potentialImpact: string;
  effort: 'low' | 'medium' | 'high';
  status: 'new' | 'reviewing' | 'implementing' | 'dismissed';
}

interface Simulation {
  id: string;
  name: string;
  variable: string;
  currentValue: number | string;
  scenarios: { value: number | string; outcome: string; probability: number }[];
}

export default function AIStrategyLabPage() {
  const [selectedTab, setSelectedTab] = useState<'scenarios' | 'recommendations' | 'simulations'>('recommendations');
  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  // Mock data - In production, fetch from API/Firestore
  const scenarios: Scenario[] = [
    {
      id: '1',
      name: 'New Branch Launch - Karen',
      description: 'Simulate impact of opening a new branch in Karen area',
      status: 'completed',
      lastRun: '2 days ago',
      impact: { revenue: 18, customers: 25, efficiency: -5 },
    },
    {
      id: '2',
      name: 'Price Increase Scenario',
      description: 'Model 10% price increase across all services',
      status: 'ready',
      lastRun: '1 week ago',
      impact: { revenue: 8, customers: -4, efficiency: 0 },
    },
    {
      id: '3',
      name: 'Express Service Expansion',
      description: 'Analyze impact of promoting express services',
      status: 'ready',
    },
    {
      id: '4',
      name: 'Corporate Account Growth',
      description: 'Project 50% increase in corporate accounts',
      status: 'completed',
      lastRun: '5 days ago',
      impact: { revenue: 35, customers: 12, efficiency: 10 },
    },
  ];

  const recommendations: AIRecommendation[] = [
    {
      id: '1',
      title: 'Launch Customer Loyalty Program',
      category: 'customers',
      confidence: 92,
      potentialImpact: 'Increase retention by 15%, LTV by 25%',
      effort: 'medium',
      status: 'new',
    },
    {
      id: '2',
      title: 'Optimize Delivery Routes',
      category: 'operations',
      confidence: 88,
      potentialImpact: 'Reduce delivery costs by 12%, improve on-time by 8%',
      effort: 'low',
      status: 'implementing',
    },
    {
      id: '3',
      title: 'Target Corporate Accounts in Upperhill',
      category: 'revenue',
      confidence: 85,
      potentialImpact: 'KES 1.2M additional annual revenue potential',
      effort: 'high',
      status: 'reviewing',
    },
    {
      id: '4',
      title: 'Preventive Equipment Maintenance Schedule',
      category: 'risk',
      confidence: 94,
      potentialImpact: 'Reduce unplanned downtime by 40%',
      effort: 'medium',
      status: 'new',
    },
    {
      id: '5',
      title: 'Peak Hour Staffing Optimization',
      category: 'operations',
      confidence: 78,
      potentialImpact: 'Improve throughput by 15% during peak hours',
      effort: 'low',
      status: 'new',
    },
  ];

  const simulations: Simulation[] = [
    {
      id: '1',
      name: 'Fuel Price Impact',
      variable: 'Fuel Cost',
      currentValue: 'KES 217/L',
      scenarios: [
        { value: 'KES 230/L', outcome: '-1.2% margin', probability: 60 },
        { value: 'KES 250/L', outcome: '-2.8% margin', probability: 30 },
        { value: 'KES 200/L', outcome: '+0.8% margin', probability: 10 },
      ],
    },
    {
      id: '2',
      name: 'Customer Volume Growth',
      variable: 'Monthly Orders',
      currentValue: '2,400',
      scenarios: [
        { value: '2,800', outcome: '+KES 350K revenue', probability: 45 },
        { value: '3,200', outcome: '+KES 680K revenue', probability: 25 },
        { value: '2,200', outcome: '-KES 180K revenue', probability: 30 },
      ],
    },
    {
      id: '3',
      name: 'Staff Attrition',
      variable: 'Annual Turnover',
      currentValue: '15%',
      scenarios: [
        { value: '20%', outcome: '+KES 420K training cost', probability: 40 },
        { value: '10%', outcome: '-KES 180K training cost', probability: 35 },
        { value: '25%', outcome: '+KES 720K training cost', probability: 25 },
      ],
    },
  ];

  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (category) {
      case 'revenue':
        return 'success';
      case 'operations':
        return 'info';
      case 'customers':
        return 'warning';
      case 'risk':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'text-teal-600 bg-teal-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'operations':
        return <Clock className="h-4 w-4" />;
      case 'customers':
        return <Users className="h-4 w-4" />;
      case 'risk':
        return <Target className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const newRecommendations = recommendations.filter((r) => r.status === 'new').length;
  const completedScenarios = scenarios.filter((s) => s.status === 'completed').length;

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-amber-500 font-medium tracking-wider">AI-POWERED</p>
              <ModernBadge variant="info" size="sm">BETA</ModernBadge>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">AI Strategy Lab</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Scenario builder, simulations, and AI-powered recommendations
            </p>
          </div>
          <ModernButton leftIcon={<Sparkles className="h-4 w-4" />}>
            Generate Insights
          </ModernButton>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="AI Recommendations"
            value={recommendations.length}
            changeLabel={`${newRecommendations} new this week`}
            icon={<Brain className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Scenarios Built"
            value={scenarios.length}
            changeLabel={`${completedScenarios} completed`}
            icon={<FlaskConical className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Avg Confidence"
            value={`${Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)}%`}
            changeLabel="On recommendations"
            icon={<Target className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Simulations"
            value={simulations.length}
            changeLabel="Active models"
            icon={<Sliders className="h-5 w-5" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: 'recommendations', label: 'AI Recommendations', icon: Lightbulb },
            { key: 'scenarios', label: 'Scenario Builder', icon: FlaskConical },
            { key: 'simulations', label: 'What-If Simulations', icon: Sliders },
          ].map((tab) => (
            <ModernButton
              key={tab.key}
              variant={selectedTab === tab.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              leftIcon={<tab.icon className="h-4 w-4" />}
            >
              {tab.label}
            </ModernButton>
          ))}
        </div>

        {/* Recommendations Tab */}
        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <ModernCard key={rec.id} className={`p-4 ${rec.status === 'new' ? 'border-l-4 border-l-indigo-500' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      rec.category === 'revenue' ? 'bg-green-100' :
                      rec.category === 'operations' ? 'bg-blue-100' :
                      rec.category === 'customers' ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.potentialImpact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModernBadge variant={getCategoryColor(rec.category)} size="sm">
                      {rec.category}
                    </ModernBadge>
                    {rec.status === 'new' && (
                      <ModernBadge variant="info" size="sm">NEW</ModernBadge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rec.confidence >= 85 ? 'bg-teal-500' :
                            rec.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{rec.confidence}%</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEffortColor(rec.effort)}`}>
                      {rec.effort} effort
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.status === 'new' && (
                      <>
                        <ModernButton variant="secondary" size="sm">Dismiss</ModernButton>
                        <ModernButton size="sm">Review</ModernButton>
                      </>
                    )}
                    {rec.status === 'reviewing' && (
                      <ModernBadge variant="warning" size="sm">Under Review</ModernBadge>
                    )}
                    {rec.status === 'implementing' && (
                      <ModernBadge variant="success" size="sm">Implementing</ModernBadge>
                    )}
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {/* Scenarios Tab */}
        {selectedTab === 'scenarios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario) => (
              <ModernCard key={scenario.id} className="overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{scenario.name}</h3>
                    <ModernBadge
                      variant={scenario.status === 'completed' ? 'success' : scenario.status === 'running' ? 'warning' : 'secondary'}
                      size="sm"
                    >
                      {scenario.status}
                    </ModernBadge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>

                  {scenario.impact && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${scenario.impact.revenue >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                          {scenario.impact.revenue >= 0 ? '+' : ''}{scenario.impact.revenue}%
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${scenario.impact.customers >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                          {scenario.impact.customers >= 0 ? '+' : ''}{scenario.impact.customers}%
                        </div>
                        <div className="text-xs text-muted-foreground">Customers</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${scenario.impact.efficiency >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                          {scenario.impact.efficiency >= 0 ? '+' : ''}{scenario.impact.efficiency}%
                        </div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {scenario.lastRun && (
                      <span className="text-xs text-muted-foreground">Last run: {scenario.lastRun}</span>
                    )}
                    <div className="flex items-center gap-2">
                      {scenario.status === 'completed' && (
                        <ModernButton variant="secondary" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />}>
                          Re-run
                        </ModernButton>
                      )}
                      {scenario.status === 'ready' && (
                        <ModernButton size="sm" leftIcon={<Play className="h-4 w-4" />}>
                          Run Scenario
                        </ModernButton>
                      )}
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {/* Simulations Tab */}
        {selectedTab === 'simulations' && (
          <div className="space-y-6">
            {simulations.map((sim) => (
              <ModernCard key={sim.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{sim.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Current {sim.variable}: <span className="font-medium text-foreground">{sim.currentValue}</span>
                    </p>
                  </div>
                  <ModernButton variant="secondary" size="sm" leftIcon={<Sliders className="h-4 w-4" />}>
                    Adjust Parameters
                  </ModernButton>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {sim.scenarios.map((scenario, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        scenario.outcome.includes('+') ? 'bg-teal-50/50 border-teal-200' :
                        scenario.outcome.includes('-') ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium mb-2">If {sim.variable} = {scenario.value}</div>
                      <div className={`text-lg font-bold mb-2 ${
                        scenario.outcome.includes('+') ? 'text-teal-600' : 'text-red-600'
                      }`}>
                        {scenario.outcome}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${scenario.probability}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{scenario.probability}% likely</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCard>
            ))}
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
