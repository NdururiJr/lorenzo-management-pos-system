'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import { SetupRequired } from '@/components/ui/setup-required';
import {
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  Star,
  Briefcase,
  GraduationCap,
  DollarSign,
  Clock,
  ChevronRight,
  Building2,
  Loader2,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Manager {
  id: string;
  name: string;
  role: string;
  branch: string;
  avatar?: string;
  performanceScore: number;
  teamSize: number;
  tenure: string;
  achievements: string[];
  areas_for_improvement: string[];
  trend: 'up' | 'down' | 'stable';
}

interface SuccessionCandidate {
  name: string;
  currentRole: string;
  targetRole: string;
  readiness: 'ready' | 'developing' | 'potential';
  timeline: string;
  developmentAreas: string[];
}

interface CompensationBenchmark {
  role: string;
  current: number;
  market: number;
  variance: number;
}

export default function LeadershipPeoplePage() {
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [successionCandidates, setSuccessionCandidates] = useState<SuccessionCandidate[]>([]);
  const [compensationBenchmarks, _setCompensationBenchmarks] = useState<CompensationBenchmark[]>([]);

  useEffect(() => {
    async function fetchLeadershipData() {
      setLoading(true);
      try {
        // Check for users with management roles
        const usersRef = collection(db, 'users');
        const managersQuery = query(
          usersRef,
          where('role', 'in', ['general_manager', 'store_manager', 'branch_manager', 'workstation_manager'])
        );
        const managersSnapshot = await getDocs(managersQuery);

        // Check for succession candidates collection
        const successionRef = collection(db, 'succession_candidates');
        const successionSnapshot = await getDocs(successionRef);

        if (managersSnapshot.size > 0) {
          // Load real managers from users collection
          const realManagers: Manager[] = [];
          managersSnapshot.forEach((doc) => {
            const data = doc.data();
            realManagers.push({
              id: doc.id,
              name: data.name || 'Unknown',
              role: data.role || 'Manager',
              branch: data.branchId || 'Unassigned',
              performanceScore: data.performanceScore || 0,
              teamSize: data.teamSize || 0,
              tenure: data.tenure || 'N/A',
              achievements: data.achievements || [],
              areas_for_improvement: data.areasForImprovement || [],
              trend: data.trend || 'stable',
            });
          });
          setManagers(realManagers);

          // Load real succession candidates
          const realCandidates: SuccessionCandidate[] = [];
          successionSnapshot.forEach((doc) => {
            const data = doc.data();
            realCandidates.push({
              name: data.name,
              currentRole: data.currentRole,
              targetRole: data.targetRole,
              readiness: data.readiness,
              timeline: data.timeline,
              developmentAreas: data.developmentAreas || [],
            });
          });
          setSuccessionCandidates(realCandidates);

          setHasRealData(true);
        } else {
          setHasRealData(false);
        }
      } catch (error) {
        console.error('Error fetching leadership data:', error);
        setHasRealData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchLeadershipData();
  }, []);

  const selectedManagerData = selectedManager ? managers.find((m) => m.id === selectedManager) : null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-teal-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getReadinessColor = (readiness: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (readiness) {
      case 'ready':
        return 'success';
      case 'developing':
        return 'info';
      case 'potential':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const avgPerformance = managers.length > 0
    ? managers.reduce((sum, m) => sum + m.performanceScore, 0) / managers.length
    : 0;
  const totalTeamSize = managers.reduce((sum, m) => sum + m.teamSize, 0);

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-muted-foreground">Loading leadership data...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!hasRealData) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              PEOPLE MANAGEMENT
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Leadership & People</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manager scorecards, succession planning, and compensation
            </p>
          </div>

          {/* No Data State */}
          <SetupRequired
            feature="Leadership Data"
            description="No managers found. Leadership data will appear when users with management roles (general_manager, store_manager, branch_manager) are added to the system."
            configPath="/employees"
            actionLabel="Manage Employees"
            variant="warning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-500" />
                Manager Scorecards
              </h3>
              <p className="text-xs text-muted-foreground">
                Performance scores are calculated from order processing metrics, customer satisfaction, and team output.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                Succession Planning
              </h3>
              <p className="text-xs text-muted-foreground">
                Succession candidates are tracked in the succession_candidates collection with readiness levels.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Compensation Benchmarks
              </h3>
              <p className="text-xs text-muted-foreground">
                Compensation data requires salary information to be tracked in user profiles with market benchmarks.
              </p>
            </ModernCard>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              PEOPLE MANAGEMENT
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Leadership & People</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manager scorecards, succession planning, and compensation
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Leadership Team"
            value={managers.length.toString()}
            changeLabel="Key managers"
            icon={<Users className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Avg Performance"
            value={`${avgPerformance.toFixed(0)}%`}
            changeLabel="Manager scores"
            icon={<Award className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Total Staff"
            value={totalTeamSize.toString()}
            changeLabel="Under management"
            icon={<Briefcase className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Succession Ready"
            value={successionCandidates.filter((c) => c.readiness === 'ready').length.toString()}
            changeLabel="Ready for promotion"
            icon={<GraduationCap className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manager List */}
          <ModernCard className="lg:col-span-1">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Manager Scorecards</h2>
            </div>
            <div className="divide-y">
              {managers.map((manager) => (
                <div
                  key={manager.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedManager === manager.id ? 'bg-teal-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedManager(manager.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                        {manager.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium">{manager.name}</h3>
                        <p className="text-xs text-muted-foreground">{manager.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(manager.performanceScore)}`}>
                        {manager.performanceScore}%
                      </span>
                      {manager.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-teal-500" />
                      ) : manager.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          {/* Manager Detail */}
          <ModernCard className="lg:col-span-2">
            {selectedManagerData ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-medium">
                        {selectedManagerData.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{selectedManagerData.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedManagerData.role}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {selectedManagerData.branch}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          {selectedManagerData.tenure}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedManagerData.performanceScore)}`}>
                        {selectedManagerData.performanceScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Performance Score</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-6">
                  {/* Achievements */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Key Achievements
                    </h3>
                    <ul className="space-y-2">
                      {selectedManagerData.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-teal-500 mt-0.5">✓</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Development Areas
                    </h3>
                    <ul className="space-y-2">
                      {selectedManagerData.areas_for_improvement.map((area, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500 mt-0.5">○</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 border-t bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Team Size: {selectedManagerData.teamSize} staff members
                    </span>
                    <ModernButton variant="secondary" size="sm">
                      View Full Profile <ChevronRight className="h-4 w-4 ml-1" />
                    </ModernButton>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Manager</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a manager to view their detailed scorecard
                </p>
              </div>
            )}
          </ModernCard>
        </div>

        {/* Succession Planning */}
        <ModernCard>
          <div className="p-4 border-b flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold">Succession Pipeline</h2>
          </div>
          {successionCandidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Target Role
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Readiness
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Development Areas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {successionCandidates.map((candidate, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium">{candidate.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{candidate.currentRole}</td>
                      <td className="p-4 text-sm">{candidate.targetRole}</td>
                      <td className="p-4">
                        <ModernBadge variant={getReadinessColor(candidate.readiness)} size="sm">
                          {candidate.readiness}
                        </ModernBadge>
                      </td>
                      <td className="p-4 text-sm">{candidate.timeline}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.developmentAreas.map((area, i) => (
                            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {area}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No succession candidates configured. Add succession planning data in the succession_candidates collection.
              </p>
            </div>
          )}
        </ModernCard>

        {/* Compensation Benchmarks */}
        <ModernCard>
          <div className="p-4 border-b flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h2 className="font-semibold">Compensation Benchmarks</h2>
          </div>
          <div className="p-4">
            {compensationBenchmarks.length > 0 ? (
              <div className="space-y-4">
                {compensationBenchmarks.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-40 font-medium text-sm">{item.role}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Current: KES {item.current.toLocaleString()}</span>
                        <span className="text-muted-foreground">Market: KES {item.market.toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full ${
                            item.variance >= 0 ? 'bg-teal-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.current / item.market) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className={`w-20 text-right text-sm font-medium ${
                      item.variance >= 0 ? 'text-teal-600' : 'text-amber-600'
                    }`}>
                      {item.variance >= 0 ? '+' : ''}{item.variance.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No compensation data available. Salary and market benchmark data needs to be configured.
                </p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </ModernLayout>
  );
}
