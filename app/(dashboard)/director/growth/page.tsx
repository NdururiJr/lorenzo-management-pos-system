'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import { SetupRequired } from '@/components/ui/setup-required';
import {
  Rocket,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  MapPin,
  Plus,
  ArrowRight,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ExpansionOpportunity {
  location: string;
  population: string;
  competition: 'low' | 'medium' | 'high';
  investmentRequired: number;
  projectedROI: string;
  status: 'researching' | 'planning' | 'approved' | 'in_progress';
}

interface NewService {
  name: string;
  targetLaunch: string;
  investmentRequired: number;
  projectedRevenue: number;
  status: 'concept' | 'development' | 'testing' | 'ready';
}

interface CorporateLead {
  company: string;
  industry: string;
  estimatedValue: number;
  stage: 'lead' | 'proposal' | 'negotiation' | 'closed';
  lastContact: string;
}

export default function GrowthHubPage() {
  const [selectedTab, setSelectedTab] = useState<'expansion' | 'services' | 'corporate'>('expansion');
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);
  const [expansionOpportunities, setExpansionOpportunities] = useState<ExpansionOpportunity[]>([]);
  const [newServices, setNewServices] = useState<NewService[]>([]);
  const [corporateLeads, setCorporateLeads] = useState<CorporateLead[]>([]);

  useEffect(() => {
    async function fetchGrowthData() {
      setLoading(true);
      try {
        // Check for expansion opportunities collection
        const expansionRef = collection(db, 'expansion_opportunities');
        const expansionSnapshot = await getDocs(expansionRef);

        // Check for new services collection
        const servicesRef = collection(db, 'new_services');
        const servicesSnapshot = await getDocs(servicesRef);

        // Check for corporate leads collection
        const leadsRef = collection(db, 'corporate_leads');
        const leadsSnapshot = await getDocs(leadsRef);

        if (expansionSnapshot.size > 0 || servicesSnapshot.size > 0 || leadsSnapshot.size > 0) {
          // Load real expansion opportunities
          const realExpansion: ExpansionOpportunity[] = [];
          expansionSnapshot.forEach((doc) => {
            const data = doc.data();
            realExpansion.push({
              location: data.location,
              population: data.population,
              competition: data.competition,
              investmentRequired: data.investmentRequired,
              projectedROI: data.projectedROI,
              status: data.status,
            });
          });
          setExpansionOpportunities(realExpansion);

          // Load real new services
          const realServices: NewService[] = [];
          servicesSnapshot.forEach((doc) => {
            const data = doc.data();
            realServices.push({
              name: data.name,
              targetLaunch: data.targetLaunch,
              investmentRequired: data.investmentRequired,
              projectedRevenue: data.projectedRevenue,
              status: data.status,
            });
          });
          setNewServices(realServices);

          // Load real corporate leads
          const realLeads: CorporateLead[] = [];
          leadsSnapshot.forEach((doc) => {
            const data = doc.data();
            realLeads.push({
              company: data.company,
              industry: data.industry,
              estimatedValue: data.estimatedValue,
              stage: data.stage,
              lastContact: data.lastContact,
            });
          });
          setCorporateLeads(realLeads);

          setHasRealData(true);
        } else {
          setHasRealData(false);
        }
      } catch (error) {
        console.error('Error fetching growth data:', error);
        setHasRealData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchGrowthData();
  }, []);

  // Data is now fetched from Firestore

  const getCompetitionColor = (level: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (status) {
      case 'researching':
      case 'concept':
      case 'lead':
        return 'secondary';
      case 'planning':
      case 'development':
      case 'proposal':
        return 'info';
      case 'approved':
      case 'testing':
      case 'negotiation':
        return 'warning';
      case 'in_progress':
      case 'ready':
      case 'closed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const totalPipelineValue = corporateLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const closedDeals = corporateLeads.filter((l) => l.stage === 'closed').length;

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-muted-foreground">Loading growth data...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!hasRealData) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              STRATEGIC GROWTH
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Growth Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Expansion tracking, new service development, and corporate pipeline
            </p>
          </div>

          <SetupRequired
            feature="Growth & Expansion Data"
            description="No expansion opportunities, new services, or corporate leads configured. Add growth initiatives to track strategic expansion."
            variant="warning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-500" />
                Expansion Opportunities
              </h3>
              <p className="text-xs text-muted-foreground">
                Track potential new branch locations with market analysis and ROI projections.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-blue-500" />
                New Services
              </h3>
              <p className="text-xs text-muted-foreground">
                Plan and develop new service offerings to expand revenue streams.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-500" />
                Corporate Pipeline
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage corporate client leads and track deal progress through the sales funnel.
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
              STRATEGIC GROWTH
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Growth Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Expansion opportunities, new services, and corporate pipeline
            </p>
          </div>
          <ModernButton leftIcon={<Plus className="h-4 w-4" />}>
            Add Initiative
          </ModernButton>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Expansion Sites"
            value={expansionOpportunities.length.toString()}
            changeLabel="Under evaluation"
            icon={<MapPin className="h-5 w-5" />}
          />
          <ModernStatCard
            title="New Services"
            value={newServices.length.toString()}
            changeLabel="In development"
            icon={<Rocket className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Corporate Pipeline"
            value={`KES ${(totalPipelineValue / 1000000).toFixed(1)}M`}
            changeLabel={`${corporateLeads.length} opportunities`}
            icon={<Briefcase className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Closed This Quarter"
            value={closedDeals.toString()}
            changeLabel="Corporate accounts"
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: 'expansion', label: 'Expansion', icon: Building2 },
            { key: 'services', label: 'New Services', icon: Rocket },
            { key: 'corporate', label: 'Corporate Pipeline', icon: Briefcase },
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

        {/* Tab Content */}
        {selectedTab === 'expansion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {expansionOpportunities.map((opp, index) => (
              <ModernCard key={index} className="overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-lg">{opp.location}</h3>
                    </div>
                    <ModernBadge variant={getStatusColor(opp.status)} size="sm">
                      {opp.status.replace('_', ' ')}
                    </ModernBadge>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Market Size</span>
                    <span className="text-sm font-medium">{opp.population}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Competition</span>
                    <ModernBadge variant={getCompetitionColor(opp.competition)} size="sm">
                      {opp.competition}
                    </ModernBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Investment Required</span>
                    <span className="text-sm font-semibold">
                      KES {opp.investmentRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Projected ROI</span>
                    <span className="text-sm font-medium text-teal-600">{opp.projectedROI}</span>
                  </div>
                  <ModernButton variant="secondary" className="w-full" size="sm">
                    View Details <ArrowRight className="h-4 w-4 ml-2" />
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {selectedTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {newServices.map((service, index) => (
              <ModernCard key={index} className="overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{service.name}</h3>
                    <ModernBadge variant={getStatusColor(service.status)} size="sm">
                      {service.status}
                    </ModernBadge>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Target Launch
                    </span>
                    <span className="text-sm font-medium">{service.targetLaunch}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Investment
                    </span>
                    <span className="text-sm font-semibold">
                      KES {service.investmentRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Projected Revenue/Year
                    </span>
                    <span className="text-sm font-medium text-teal-600">
                      KES {service.projectedRevenue.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Development Progress</span>
                      <span>
                        {service.status === 'concept'
                          ? '25%'
                          : service.status === 'development'
                          ? '50%'
                          : service.status === 'testing'
                          ? '75%'
                          : '100%'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width:
                            service.status === 'concept'
                              ? '25%'
                              : service.status === 'development'
                              ? '50%'
                              : service.status === 'testing'
                              ? '75%'
                              : '100%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {selectedTab === 'corporate' && (
          <ModernCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Est. Annual Value
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {corporateLeads.map((lead, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-medium">{lead.company}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{lead.industry}</td>
                      <td className="p-4">
                        <span className="font-semibold">
                          KES {lead.estimatedValue.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <ModernBadge variant={getStatusColor(lead.stage)} size="sm">
                          {lead.stage}
                        </ModernBadge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{lead.lastContact}</td>
                      <td className="p-4 text-right">
                        <ModernButton variant="ghost" size="sm">
                          View
                        </ModernButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>
        )}
      </div>
    </ModernLayout>
  );
}
