'use client';

import { useState } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
} from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  category: 'operational' | 'financial' | 'compliance' | 'reputational';
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  impact: string;
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigating' | 'resolved';
  lastReview: string;
}

interface ComplianceItem {
  id: string;
  requirement: string;
  authority: string;
  dueDate: string;
  status: 'compliant' | 'pending' | 'at_risk' | 'non_compliant';
  lastAudit: string;
}

interface Incident {
  id: string;
  date: string;
  type: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigating' | 'resolved';
  resolution?: string;
}

export default function RiskCompliancePage() {
  const [selectedTab, setSelectedTab] = useState<'risks' | 'compliance' | 'incidents'>('risks');

  // Mock data - In production, fetch from API/Firestore
  const risks: Risk[] = [
    {
      id: 'R001',
      title: 'Equipment Failure Risk',
      category: 'operational',
      severity: 'high',
      likelihood: 'medium',
      impact: 'Service disruption, revenue loss up to KES 50K/day',
      mitigation: 'Preventive maintenance schedule, backup equipment inventory',
      owner: 'Operations Manager',
      status: 'mitigating',
      lastReview: '2 weeks ago',
    },
    {
      id: 'R002',
      title: 'Chemical Supply Disruption',
      category: 'operational',
      severity: 'medium',
      likelihood: 'low',
      impact: 'Unable to process orders, 2-3 day recovery',
      mitigation: 'Maintain 30-day inventory buffer, secondary supplier contract',
      owner: 'Procurement Lead',
      status: 'open',
      lastReview: '1 month ago',
    },
    {
      id: 'R003',
      title: 'Data Privacy Breach',
      category: 'compliance',
      severity: 'critical',
      likelihood: 'low',
      impact: 'Legal penalties, reputational damage, customer loss',
      mitigation: 'Encryption, access controls, regular security audits',
      owner: 'IT Manager',
      status: 'mitigating',
      lastReview: '1 week ago',
    },
    {
      id: 'R004',
      title: 'Staff Attrition',
      category: 'operational',
      severity: 'medium',
      likelihood: 'high',
      impact: 'Quality decline, training costs, reduced capacity',
      mitigation: 'Competitive salaries, career development programs',
      owner: 'HR Manager',
      status: 'open',
      lastReview: '3 weeks ago',
    },
  ];

  const complianceItems: ComplianceItem[] = [
    {
      id: 'C001',
      requirement: 'Business Permit Renewal',
      authority: 'Nairobi County',
      dueDate: 'Mar 31, 2025',
      status: 'compliant',
      lastAudit: 'Dec 2024',
    },
    {
      id: 'C002',
      requirement: 'Fire Safety Certificate',
      authority: 'Fire Department',
      dueDate: 'Feb 15, 2025',
      status: 'pending',
      lastAudit: 'Nov 2024',
    },
    {
      id: 'C003',
      requirement: 'Environmental Compliance',
      authority: 'NEMA',
      dueDate: 'Jun 30, 2025',
      status: 'compliant',
      lastAudit: 'Oct 2024',
    },
    {
      id: 'C004',
      requirement: 'NHIF Registration',
      authority: 'NHIF',
      dueDate: 'Ongoing',
      status: 'compliant',
      lastAudit: 'Jan 2025',
    },
    {
      id: 'C005',
      requirement: 'Tax Compliance Certificate',
      authority: 'KRA',
      dueDate: 'Dec 31, 2024',
      status: 'at_risk',
      lastAudit: 'Sep 2024',
    },
  ];

  const incidents: Incident[] = [
    {
      id: 'INC001',
      date: 'Jan 10, 2025',
      type: 'Equipment Failure',
      description: 'Main dryer unit #2 motor failure at Kilimani branch',
      severity: 'major',
      status: 'resolved',
      resolution: 'Motor replaced, unit back online after 6 hours',
    },
    {
      id: 'INC002',
      date: 'Jan 8, 2025',
      type: 'Customer Complaint',
      description: 'Garment damage claim for premium suit - incorrect cleaning method',
      severity: 'major',
      status: 'investigating',
    },
    {
      id: 'INC003',
      date: 'Jan 5, 2025',
      type: 'Staff Incident',
      description: 'Minor burn injury during ironing at Westlands',
      severity: 'minor',
      status: 'resolved',
      resolution: 'First aid administered, safety refresher training scheduled',
    },
  ];

  const getSeverityColor = (severity: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
      case 'major':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      case 'minor':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (status) {
      case 'resolved':
      case 'compliant':
        return 'success';
      case 'mitigating':
      case 'investigating':
      case 'pending':
        return 'warning';
      case 'open':
      case 'at_risk':
        return 'danger';
      case 'non_compliant':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const openRisks = risks.filter((r) => r.status !== 'resolved').length;
  const criticalRisks = risks.filter((r) => r.severity === 'critical').length;
  const pendingCompliance = complianceItems.filter((c) => c.status !== 'compliant').length;
  const openIncidents = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              GOVERNANCE
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Risk & Compliance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Risk register, compliance tracking, and incident management
            </p>
          </div>
          <ModernButton leftIcon={<Plus className="h-4 w-4" />}>
            Log New Item
          </ModernButton>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Open Risks"
            value={openRisks.toString()}
            changeLabel={`${criticalRisks} critical`}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Compliance Items"
            value={complianceItems.length.toString()}
            changeLabel={`${pendingCompliance} need attention`}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Open Incidents"
            value={openIncidents.toString()}
            changeLabel="Being investigated"
            icon={<FileText className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Risk Score"
            value="72"
            changeLabel="Acceptable range"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: 'risks', label: 'Risk Register', icon: AlertTriangle },
            { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
            { key: 'incidents', label: 'Incidents', icon: FileText },
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

        {/* Risk Register */}
        {selectedTab === 'risks' && (
          <div className="space-y-4">
            {risks.map((risk) => (
              <ModernCard key={risk.id} className={`p-4 ${
                risk.severity === 'critical' ? 'border-l-4 border-l-red-500' :
                risk.severity === 'high' ? 'border-l-4 border-l-amber-500' : ''
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{risk.id}</span>
                      <ModernBadge variant={getSeverityColor(risk.severity)} size="sm">
                        {risk.severity}
                      </ModernBadge>
                      <ModernBadge variant="secondary" size="sm">
                        {risk.category}
                      </ModernBadge>
                    </div>
                    <h3 className="font-semibold">{risk.title}</h3>
                  </div>
                  <ModernBadge variant={getStatusColor(risk.status)} size="sm">
                    {risk.status}
                  </ModernBadge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Likelihood</div>
                    <ModernBadge variant={getSeverityColor(risk.likelihood)} size="sm">
                      {risk.likelihood}
                    </ModernBadge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Owner</div>
                    <span>{risk.owner}</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Last Review</div>
                    <span>{risk.lastReview}</span>
                  </div>
                  <div className="flex justify-end items-end">
                    <ModernButton variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                      Details
                    </ModernButton>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-sm">
                  <div className="text-xs text-muted-foreground mb-1">Impact</div>
                  <p className="text-muted-foreground">{risk.impact}</p>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {/* Compliance */}
        {selectedTab === 'compliance' && (
          <ModernCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Requirement
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Authority
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Audit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {complianceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-medium">{item.requirement}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{item.authority}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.dueDate}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <ModernBadge variant={getStatusColor(item.status)} size="sm">
                          {item.status.replace('_', ' ')}
                        </ModernBadge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{item.lastAudit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>
        )}

        {/* Incidents */}
        {selectedTab === 'incidents' && (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <ModernCard key={incident.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{incident.id}</span>
                      <ModernBadge variant={getSeverityColor(incident.severity)} size="sm">
                        {incident.severity}
                      </ModernBadge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {incident.date}
                      </span>
                    </div>
                    <h3 className="font-semibold">{incident.type}</h3>
                  </div>
                  <ModernBadge variant={getStatusColor(incident.status)} size="sm">
                    {incident.status === 'resolved' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Resolved</>
                    ) : incident.status === 'investigating' ? (
                      'Investigating'
                    ) : (
                      'Open'
                    )}
                  </ModernBadge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>

                {incident.resolution && (
                  <div className="p-3 bg-teal-50 rounded-lg text-sm">
                    <div className="text-xs font-medium text-teal-700 mb-1">Resolution</div>
                    <p className="text-teal-800">{incident.resolution}</p>
                  </div>
                )}
              </ModernCard>
            ))}
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
