'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Filter } from 'lucide-react';
import { getAuditLogsByBranch } from '@/lib/db/audit-logs';
import type { AuditLog, AuditLogAction } from '@/lib/db/schema';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface BranchAuditProps {
  branchId: string;
}

function getActionColor(action: AuditLogAction): string {
  switch (action) {
    case 'create':
      return 'bg-green-100 text-green-700';
    case 'update':
      return 'bg-blue-100 text-blue-700';
    case 'delete':
      return 'bg-red-100 text-red-700';
    case 'transfer':
      return 'bg-purple-100 text-purple-700';
    case 'role_change':
      return 'bg-amber-100 text-amber-700';
    case 'branch_access_change':
      return 'bg-indigo-100 text-indigo-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatAction(action: AuditLogAction): string {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function BranchAudit({ branchId }: BranchAuditProps) {
  const { isAdmin, isManager, isSuperAdmin } = useAuth();
  const canViewAudit = isAdmin || isManager || isSuperAdmin;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<AuditLogAction | 'all'>('all');

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        setLoading(true);

        if (!canViewAudit) {
          setLoading(false);
          return;
        }

        const auditLogs = await getAuditLogsByBranch(
          branchId,
          50,
          filterAction === 'all' ? undefined : filterAction
        );

        setLogs(auditLogs);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAuditLogs();
  }, [branchId, filterAction, canViewAudit]);

  if (!canViewAudit) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={FileText}
            heading="Access Restricted"
            description="Only administrators and managers can view audit logs"
          />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <LoadingSkeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <LoadingSkeleton className="h-96" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Audit Logs
          {logs.length > 0 && <Badge variant="secondary">{logs.length}</Badge>}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={filterAction}
            onValueChange={(value) => setFilterAction(value as AuditLogAction | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="role_change">Role Change</SelectItem>
              <SelectItem value="branch_access_change">Branch Access</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <EmptyState
            icon={FileText}
            heading="No audit logs"
            description={
              filterAction === 'all'
                ? 'Activity logs will appear here'
                : 'No logs found for selected action'
            }
          />
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.auditLogId}
                className="p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {log.resourceType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-sm text-gray-900 mb-2">{log.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>
                      <span className="font-medium">By:</span> {log.performedByName}
                    </span>
                    <span>
                      <span className="font-medium">Role:</span>{' '}
                      {log.performedByRole.replace('_', ' ')}
                    </span>
                  </div>
                  {log.resourceId && (
                    <span className="text-gray-500">{log.resourceId}</span>
                  )}
                </div>

                {log.changes && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                      View changes
                    </summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
