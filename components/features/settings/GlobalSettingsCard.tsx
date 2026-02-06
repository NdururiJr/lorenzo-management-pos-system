/**
 * Global Settings Card
 *
 * Card component for configuring global LLM settings.
 * Includes fallback configuration and default provider settings.
 *
 * @module components/features/settings/GlobalSettingsCard
 */

'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Save, Settings, RefreshCw, Clock, RotateCcw } from 'lucide-react';
import type { GlobalLLMConfig, LLMProvider } from '@/lib/db/schema';
import type { ClientProviderConfig } from '@/lib/config/types';

interface GlobalSettingsCardProps {
  config: GlobalLLMConfig;
  providers: ClientProviderConfig[];
  onUpdate: (updates: Partial<GlobalLLMConfig>) => Promise<void>;
  saving: boolean;
}

export function GlobalSettingsCard({
  config,
  providers,
  onUpdate,
  saving,
}: GlobalSettingsCardProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset local config when prop changes
  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  const enabledProviders = providers.filter((p) => p.enabled);

  const handleChange = (updates: Partial<GlobalLLMConfig>) => {
    setLocalConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onUpdate(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  const getModelsForProvider = (providerId: LLMProvider) => {
    const provider = providers.find((p) => p.providerId === providerId);
    return provider?.availableModels || [];
  };

  const moveFallbackUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...localConfig.fallbackOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    handleChange({ fallbackOrder: newOrder });
  };

  const moveFallbackDown = (index: number) => {
    if (index >= localConfig.fallbackOrder.length - 1) return;
    const newOrder = [...localConfig.fallbackOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    handleChange({ fallbackOrder: newOrder });
  };

  return (
    <ModernCard hover glowIntensity="medium">
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lorenzo-teal/10">
              <Settings className="h-5 w-5 text-lorenzo-teal" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Global Settings</h3>
              <p className="text-sm text-gray-600">Default configuration for all agents</p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-lorenzo-teal text-white hover:bg-lorenzo-deep-teal"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </ModernCardHeader>

      <ModernCardContent className="space-y-6">
        {/* Default Provider & Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Provider</Label>
            <Select
              value={localConfig.defaultProvider}
              onValueChange={(value) => {
                const models = getModelsForProvider(value as LLMProvider);
                handleChange({
                  defaultProvider: value as LLMProvider,
                  defaultModel: models[0] || '',
                });
              }}
            >
              <SelectTrigger className="border-lorenzo-teal/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabledProviders.map((p) => (
                  <SelectItem key={p.providerId} value={p.providerId}>
                    {p.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Used when no specific assignment is configured
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Model</Label>
            <Select
              value={localConfig.defaultModel}
              onValueChange={(value) => handleChange({ defaultModel: value })}
            >
              <SelectTrigger className="border-lorenzo-teal/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getModelsForProvider(localConfig.defaultProvider).map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeouts & Retries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Request Timeout (ms)
            </Label>
            <Input
              type="number"
              step="1000"
              min="5000"
              max="120000"
              value={localConfig.requestTimeoutMs}
              onChange={(e) => handleChange({ requestTimeoutMs: parseInt(e.target.value) })}
              className="border-lorenzo-teal/20"
            />
            <p className="text-xs text-gray-500">
              Max time to wait for LLM response (5000-120000)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-gray-400" />
              Max Retries
            </Label>
            <Input
              type="number"
              min="0"
              max="5"
              value={localConfig.maxRetries}
              onChange={(e) => handleChange({ maxRetries: parseInt(e.target.value) })}
              className="border-lorenzo-teal/20"
            />
            <p className="text-xs text-gray-500">
              Number of retry attempts on failure (0-5)
            </p>
          </div>
        </div>

        {/* Fallback Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Fallback</Label>
              <p className="text-xs text-gray-500">
                Automatically try alternative providers if primary fails
              </p>
            </div>
            <Switch
              checked={localConfig.enableFallback}
              onCheckedChange={(checked) => handleChange({ enableFallback: checked })}
            />
          </div>

          {localConfig.enableFallback && (
            <div className="space-y-2 p-4 bg-lorenzo-cream/30 rounded-lg">
              <Label className="text-sm font-medium">Fallback Order</Label>
              <p className="text-xs text-gray-500 mb-3">
                Drag or use arrows to reorder. Providers will be tried in this order.
              </p>
              <div className="space-y-2">
                {localConfig.fallbackOrder.map((providerId, index) => {
                  const provider = providers.find((p) => p.providerId === providerId);
                  const isEnabled = provider?.enabled && provider?.hasApiKey;

                  return (
                    <div
                      key={providerId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isEnabled
                          ? 'bg-white border-lorenzo-teal/20'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-lorenzo-teal/10 text-sm font-medium text-lorenzo-teal">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {provider?.displayName || providerId}
                        </span>
                        {!isEnabled && (
                          <span className="text-xs text-gray-500">(not available)</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => moveFallbackUp(index)}
                          disabled={index === 0}
                          className="h-8 w-8"
                        >
                          <span className="sr-only">Move up</span>
                          ↑
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => moveFallbackDown(index)}
                          disabled={index === localConfig.fallbackOrder.length - 1}
                          className="h-8 w-8"
                        >
                          <span className="sr-only">Move down</span>
                          ↓
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        {config.updatedAt && (
          <div className="text-xs text-gray-400 pt-4 border-t border-lorenzo-teal/10">
            Last updated:{' '}
            {config.updatedAt?.toDate
              ? config.updatedAt.toDate().toLocaleString()
              : 'Unknown'}
            {config.updatedBy && ` by ${config.updatedBy}`}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
}
