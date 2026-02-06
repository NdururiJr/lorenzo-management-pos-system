/**
 * Provider Configuration Card
 *
 * Card component for configuring individual LLM providers.
 * Includes API key input, model selection, and connection testing.
 *
 * @module components/features/settings/ProviderConfigCard
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import {
  Eye,
  EyeOff,
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Settings,
} from 'lucide-react';
import type { ClientProviderConfig, ProviderTestResult } from '@/lib/config/types';
import type { LLMProvider } from '@/lib/db/schema';

interface ProviderConfigCardProps {
  provider: ClientProviderConfig;
  onUpdate: (updates: Partial<ClientProviderConfig>) => Promise<void>;
  onApiKeyUpdate: (apiKey: string) => Promise<void>;
  onTestConnection: () => Promise<ProviderTestResult>;
  saving: boolean;
}

const PROVIDER_ICONS: Record<LLMProvider, string> = {
  openai: '🤖',
  anthropic: '🧠',
  google: '✨',
  local: '💻',
};

const STATUS_STYLES = {
  connected: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  disconnected: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  untested: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

export function ProviderConfigCard({
  provider,
  onUpdate,
  onApiKeyUpdate,
  onTestConnection,
  saving,
}: ProviderConfigCardProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProviderTestResult | null>(null);
  const [editingKey, setEditingKey] = useState(false);

  const statusStyle = STATUS_STYLES[provider.connectionStatus];

  const handleEnableToggle = async () => {
    await onUpdate({ enabled: !provider.enabled });
  };

  const handleDefaultModelChange = async (model: string) => {
    await onUpdate({ defaultModel: model });
  };

  const handleApiKeySave = async () => {
    if (apiKey.trim()) {
      await onApiKeyUpdate(apiKey);
      setApiKey('');
      setEditingKey(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await onTestConnection();
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ModernCard hover glowIntensity={provider.enabled ? 'medium' : 'low'}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{PROVIDER_ICONS[provider.providerId]}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{provider.displayName}</h3>
              <p className="text-xs text-gray-500">{provider.providerId}</p>
            </div>
          </div>
          <Switch
            checked={provider.enabled}
            onCheckedChange={handleEnableToggle}
            disabled={saving}
          />
        </div>
      </ModernCardHeader>

      <ModernCardContent className="space-y-4">
        {/* Connection Status */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg border ${statusStyle.bg} ${statusStyle.border}`}
        >
          <div className="flex items-center gap-2">
            {provider.connectionStatus === 'connected' ? (
              <Wifi className={`h-4 w-4 ${statusStyle.text}`} />
            ) : (
              <WifiOff className={`h-4 w-4 ${statusStyle.text}`} />
            )}
            <span className={`text-sm font-medium ${statusStyle.text}`}>
              {provider.connectionStatus === 'connected' && 'Connected'}
              {provider.connectionStatus === 'disconnected' && 'Disconnected'}
              {provider.connectionStatus === 'error' && 'Error'}
              {provider.connectionStatus === 'untested' && 'Not Tested'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing || saving || !provider.hasApiKey}
            className={statusStyle.text}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Test'
            )}
          </Button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              testResult.success
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>
              {testResult.success
                ? `Connected (${testResult.latencyMs}ms)`
                : testResult.error}
            </span>
          </div>
        )}

        {/* API Key */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-gray-400" />
            API Key
          </Label>

          {editingKey ? (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter ${provider.displayName} API key`}
                  className="pr-10 border-lorenzo-teal/20"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                size="sm"
                onClick={handleApiKeySave}
                disabled={!apiKey.trim() || saving}
                className="bg-lorenzo-teal text-white hover:bg-lorenzo-deep-teal"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingKey(false);
                  setApiKey('');
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value={provider.maskedApiKey || '••••••••'}
                disabled
                className="flex-1 bg-gray-50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingKey(true)}
                className="border-lorenzo-teal/20"
              >
                {provider.hasApiKey ? 'Update' : 'Add Key'}
              </Button>
            </div>
          )}

          {!provider.hasApiKey && provider.providerId !== 'local' && (
            <p className="text-xs text-yellow-600">
              ⚠️ API key required to use this provider
            </p>
          )}
        </div>

        {/* Default Model */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            Default Model
          </Label>
          <Select
            value={provider.defaultModel}
            onValueChange={handleDefaultModelChange}
            disabled={saving || provider.availableModels.length === 0}
          >
            <SelectTrigger className="border-lorenzo-teal/20">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {provider.availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Models */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Available Models</Label>
          <div className="flex flex-wrap gap-1">
            {provider.availableModels.slice(0, 4).map((model) => (
              <ModernBadge
                key={model}
                variant={model === provider.defaultModel ? 'primary' : 'secondary'}
                size="sm"
              >
                {model.split('-').slice(-1)[0]}
              </ModernBadge>
            ))}
            {provider.availableModels.length > 4 && (
              <ModernBadge variant="secondary" size="sm">
                +{provider.availableModels.length - 4} more
              </ModernBadge>
            )}
          </div>
        </div>

        {/* Local provider extra config */}
        {provider.providerId === 'local' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Base URL</Label>
            <Input
              placeholder="http://localhost:11434/api"
              defaultValue={provider.baseUrl}
              className="border-lorenzo-teal/20"
              onBlur={(e) => {
                if (e.target.value !== provider.baseUrl) {
                  onUpdate({ baseUrl: e.target.value });
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Default: http://localhost:11434/api (Ollama)
            </p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
}
