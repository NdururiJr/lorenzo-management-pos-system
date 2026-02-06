'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Target,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  suggestedAction?: string;
}

// Simulated AI insights - in production, these would come from OpenAI API
const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Revenue Growth Opportunity',
    description: 'Kilimani branch shows 23% higher order volume on Fridays. Consider increasing staff allocation for Friday operations.',
    impact: 'high',
    category: 'Revenue',
    actionable: true,
    suggestedAction: 'Schedule additional front desk staff for Fridays at Kilimani branch'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Equipment Maintenance Alert',
    description: 'Washing Machine #3 at Westlands has shown 15% decrease in efficiency over the past month. Preventive maintenance recommended.',
    impact: 'medium',
    category: 'Operations',
    actionable: true,
    suggestedAction: 'Schedule maintenance check for Washing Machine #3'
  },
  {
    id: '3',
    type: 'trend',
    title: 'Customer Satisfaction Trending Up',
    description: 'Overall customer satisfaction has improved by 8% this month, primarily driven by improved turnaround times.',
    impact: 'high',
    category: 'Customer Experience',
    actionable: false
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Staff Training Recommendation',
    description: 'Analysis shows new staff members take 40% longer on quality checks. Consider implementing a buddy system for training.',
    impact: 'medium',
    category: 'Staff',
    actionable: true,
    suggestedAction: 'Implement buddy system for new quality check staff'
  },
  {
    id: '5',
    type: 'opportunity',
    title: 'Upsell Opportunity',
    description: '35% of regular customers only use standard washing service. Consider promoting premium services to this segment.',
    impact: 'high',
    category: 'Revenue',
    actionable: true,
    suggestedAction: 'Create targeted promotion for premium services'
  },
  {
    id: '6',
    type: 'warning',
    title: 'Staffing Gap Detected',
    description: 'Tuesday afternoons show 25% longer wait times across all branches. Consider adjusting shift schedules.',
    impact: 'medium',
    category: 'Operations',
    actionable: true,
    suggestedAction: 'Review and adjust Tuesday shift schedules'
  }
];

export default function DirectorInsightsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'opportunity' | 'warning' | 'recommendation' | 'trend'>('all');

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchInsights = async () => {
    // In production, this would call the OpenAI API via a server action
    // For now, we'll use mock data
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setInsights(mockInsights);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'trend':
        return <Activity className="w-5 h-5 text-purple-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string): 'success' | 'warning' | 'info' | 'secondary' => {
    switch (type) {
      case 'opportunity':
        return 'success';
      case 'warning':
        return 'warning';
      case 'recommendation':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Revenue':
        return <DollarSign className="w-4 h-4" />;
      case 'Operations':
        return <Clock className="w-4 h-4" />;
      case 'Staff':
        return <Users className="w-4 h-4" />;
      case 'Customer Experience':
        return <Target className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const filteredInsights = filterType === 'all'
    ? insights
    : insights.filter(i => i.type === filterType);

  if (userData?.role !== 'director') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Insights</h1>
          <p className="text-gray-500 mt-1">AI-powered recommendations and analysis</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Generate New Insights
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Opportunities</p>
              <p className="text-xl font-semibold">
                {insights.filter(i => i.type === 'opportunity').length}
              </p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Warnings</p>
              <p className="text-xl font-semibold">
                {insights.filter(i => i.type === 'warning').length}
              </p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Recommendations</p>
              <p className="text-xl font-semibold">
                {insights.filter(i => i.type === 'recommendation').length}
              </p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trends</p>
              <p className="text-xl font-semibold">
                {insights.filter(i => i.type === 'trend').length}
              </p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'opportunity', 'warning', 'recommendation', 'trend'] as const).map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
            className={filterType === type ? 'bg-lorenzo-teal hover:bg-lorenzo-teal/90' : ''}
          >
            {type === 'all' ? 'All Insights' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
          </Button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {loading ? (
          <ModernCard className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Sparkles className="w-12 h-12 text-lorenzo-teal animate-pulse mb-4" />
              <p className="text-gray-500">Analyzing data and generating insights...</p>
            </div>
          </ModernCard>
        ) : filteredInsights.length === 0 ? (
          <ModernCard className="p-8 text-center text-gray-500">
            No insights available for this filter
          </ModernCard>
        ) : (
          filteredInsights.map((insight) => (
            <ModernCard key={insight.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getTypeIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <ModernBadge variant={getTypeColor(insight.type)}>
                      {insight.type}
                    </ModernBadge>
                    <ModernBadge
                      variant={insight.impact === 'high' ? 'danger' : insight.impact === 'medium' ? 'warning' : 'secondary'}
                    >
                      {insight.impact} impact
                    </ModernBadge>
                  </div>
                  <p className="text-gray-600 mt-2">{insight.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      {getCategoryIcon(insight.category)}
                      {insight.category}
                    </span>
                    {insight.actionable && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Actionable
                      </span>
                    )}
                  </div>
                  {insight.suggestedAction && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Suggested Action:</span> {insight.suggestedAction}
                      </p>
                      <Button size="sm" className="mt-2 bg-lorenzo-teal hover:bg-lorenzo-teal/90">
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );
}
