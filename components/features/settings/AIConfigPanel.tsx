/**
 * AI Configuration Panel
 *
 * Main admin panel for configuring LLM providers and model assignments.
 * Allows dev admins to manage which AI models each agent uses.
 *
 * @module components/features/settings/AIConfigPanel
 */

'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Settings2, Cpu, Sliders, AlertCircle } from 'lucide-react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { ProviderConfigCard } from './ProviderConfigCard';
import { ModelAssignmentTable } from './ModelAssignmentTable';
import { GlobalSettingsCard } from './GlobalSettingsCard';
import type { AdminConfigState, ClientProviderConfig } from '@/lib/config/types';
import type { ModelAssignment, GlobalLLMConfig, LLMProvider } from '@/lib/db/schema';

interface AIConfigPanelProps {
  initialConfig?: AdminConfigState;
}

export function AIConfigPanel({ initialConfig }: AIConfigPanelProps) {
  const [loading, setLoading] = useState(!initialConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [globalConfig, setGlobalConfig] = useState<GlobalLLMConfig | null>(
    initialConfig?.global || null
  );
  const [providers, setProviders] = useState<ClientProviderConfig[]>(
    initialConfig?.providers || []
  );
  const [assignments, setAssignments] = useState<ModelAssignment[]>(
    initialConfig?.assignments || []
  );

  // Fetch configuration on mount
  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig]);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/config');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }

      const data: AdminConfigState = await response.json();
      setGlobalConfig(data.global);
      setProviders(data.providers);
      setAssignments(data.assignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderUpdate = async (
    providerId: LLMProvider,
    updates: Partial<ClientProviderConfig>
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/config/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update provider');
      }

      // Refresh providers
      await fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleApiKeyUpdate = async (providerId: LLMProvider, apiKey: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/config/providers/${providerId}/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }

      await fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerId: LLMProvider) => {
    try {
      const response = await fetch(`/api/admin/config/providers/${providerId}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      await fetchConfig();
      return result;
    } catch {
      return { success: false, error: 'Connection test failed' };
    }
  };

  const handleGlobalUpdate = async (updates: Partial<GlobalLLMConfig>) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/config/global', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update global settings');
      }

      await fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignmentUpdate = async (assignment: Partial<ModelAssignment> & { assignmentId?: string }) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/config/assignments', {
        method: assignment.assignmentId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      await fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignmentDelete = async (assignmentId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/config/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      await fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-lorenzo-teal" />
        <span className="ml-2 text-gray-600">Loading AI configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-lorenzo-teal" />
            AI Configuration
          </h2>
          <p className="text-sm text-gray-600">
            Configure AI providers and model assignments for agents
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConfig}
          disabled={loading || saving}
          className="border-lorenzo-teal/20 hover:bg-lorenzo-cream/50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:bg-red-100"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Configuration Tabs */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="bg-white border border-lorenzo-teal/10">
          <TabsTrigger
            value="providers"
            className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Providers
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white"
          >
            <Sliders className="h-4 w-4 mr-2" />
            Model Assignments
          </TabsTrigger>
          <TabsTrigger
            value="global"
            className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white"
          >
            <Cpu className="h-4 w-4 mr-2" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <ProviderConfigCard
                key={provider.providerId}
                provider={provider}
                onUpdate={(updates) => handleProviderUpdate(provider.providerId, updates)}
                onApiKeyUpdate={(apiKey) => handleApiKeyUpdate(provider.providerId, apiKey)}
                onTestConnection={() => handleTestConnection(provider.providerId)}
                saving={saving}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <ModernCard>
            <ModernCardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Model Assignments</h3>
              <p className="text-sm text-gray-600">
                Configure which models each agent uses for different functions
              </p>
            </ModernCardHeader>
            <ModernCardContent>
              <ModelAssignmentTable
                assignments={assignments}
                providers={providers}
                onUpdate={handleAssignmentUpdate}
                onDelete={handleAssignmentDelete}
                saving={saving}
              />
            </ModernCardContent>
          </ModernCard>
        </TabsContent>

        <TabsContent value="global">
          {globalConfig && (
            <GlobalSettingsCard
              config={globalConfig}
              providers={providers}
              onUpdate={handleGlobalUpdate}
              saving={saving}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
