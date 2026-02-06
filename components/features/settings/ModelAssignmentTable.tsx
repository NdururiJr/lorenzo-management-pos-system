/**
 * Model Assignment Table
 *
 * Table component for managing model assignments per agent/function.
 * Allows admins to configure which model each agent uses for different tasks.
 *
 * @module components/features/settings/ModelAssignmentTable
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Loader2, Edit2, Save, X } from 'lucide-react';
import { ModernBadge } from '@/components/modern/ModernBadge';
import type { ModelAssignment, LLMProvider, LLMAgentType, AgentFunction } from '@/lib/db/schema';
import type { ClientProviderConfig } from '@/lib/config/types';

interface ModelAssignmentTableProps {
  assignments: ModelAssignment[];
  providers: ClientProviderConfig[];
  onUpdate: (assignment: Partial<ModelAssignment> & { assignmentId?: string }) => Promise<void>;
  onDelete: (assignmentId: string) => Promise<void>;
  saving: boolean;
}

const AGENT_TYPES: { value: LLMAgentType | '*'; label: string }[] = [
  { value: '*', label: 'All Agents' },
  { value: 'orchestrator', label: 'Orchestrator' },
  { value: 'order', label: 'Order Agent' },
  { value: 'pricing', label: 'Pricing Agent' },
  { value: 'customer', label: 'Customer Agent' },
  { value: 'support', label: 'Support Agent' },
  { value: 'onboarding', label: 'Onboarding Agent' },
  { value: 'logistics', label: 'Logistics Agent' },
  { value: 'analytics', label: 'Analytics Agent' },
];

const AGENT_FUNCTIONS: { value: AgentFunction | '*'; label: string }[] = [
  { value: '*', label: 'All Functions' },
  { value: 'chat_response', label: 'Chat Response' },
  { value: 'intent_classification', label: 'Intent Classification' },
  { value: 'data_response', label: 'Data Response' },
  { value: 'analytics_insights', label: 'Analytics Insights' },
  { value: 'time_estimation', label: 'Time Estimation' },
];

interface EditingRow {
  agentType: LLMAgentType | '*';
  agentFunction: AgentFunction | '*';
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  priority: number;
  enabled: boolean;
}

export function ModelAssignmentTable({
  assignments,
  providers,
  onUpdate,
  onDelete,
  saving,
}: ModelAssignmentTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newRow, setNewRow] = useState<EditingRow>({
    agentType: '*',
    agentFunction: '*',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 4096,
    priority: 50,
    enabled: true,
  });

  const enabledProviders = providers.filter((p) => p.enabled && p.hasApiKey);

  const getModelsForProvider = (providerId: LLMProvider) => {
    const provider = providers.find((p) => p.providerId === providerId);
    return provider?.availableModels || [];
  };

  const handleEdit = (assignment: ModelAssignment) => {
    setEditingId(assignment.assignmentId);
    setEditingRow({
      agentType: assignment.agentType,
      agentFunction: assignment.agentFunction,
      provider: assignment.provider,
      model: assignment.model,
      temperature: assignment.temperature ?? 0.7,
      maxTokens: assignment.maxTokens ?? 4096,
      priority: assignment.priority,
      enabled: assignment.enabled,
    });
  };

  const handleSave = async () => {
    if (!editingRow) return;

    await onUpdate({
      assignmentId: editingId!,
      ...editingRow,
    });

    setEditingId(null);
    setEditingRow(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingRow(null);
  };

  const handleAddNew = async () => {
    await onUpdate(newRow);
    setAddingNew(false);
    setNewRow({
      agentType: '*',
      agentFunction: '*',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4096,
      priority: 50,
      enabled: true,
    });
  };

  const handleDelete = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      await onDelete(assignmentId);
    }
  };

  const renderEditableRow = (row: EditingRow, onChange: (updates: Partial<EditingRow>) => void) => (
    <>
      <TableCell>
        <Select
          value={row.agentType}
          onValueChange={(value) => onChange({ agentType: value as LLMAgentType | '*' })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={row.agentFunction}
          onValueChange={(value) => onChange({ agentFunction: value as AgentFunction | '*' })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENT_FUNCTIONS.map((fn) => (
              <SelectItem key={fn.value} value={fn.value}>
                {fn.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={row.provider}
          onValueChange={(value) => {
            const models = getModelsForProvider(value as LLMProvider);
            onChange({
              provider: value as LLMProvider,
              model: models[0] || '',
            });
          }}
        >
          <SelectTrigger className="w-[120px]">
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
      </TableCell>
      <TableCell>
        <Select
          value={row.model}
          onValueChange={(value) => onChange({ model: value })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getModelsForProvider(row.provider).map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={row.temperature}
          onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })}
          className="w-[70px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="256"
          min="256"
          max="32768"
          value={row.maxTokens}
          onChange={(e) => onChange({ maxTokens: parseInt(e.target.value) })}
          className="w-[80px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="100"
          value={row.priority}
          onChange={(e) => onChange({ priority: parseInt(e.target.value) })}
          className="w-[60px]"
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={row.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
        />
      </TableCell>
    </>
  );

  return (
    <div className="space-y-4">
      {enabledProviders.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          ⚠️ No providers are enabled. Please enable at least one provider with an API key to create model assignments.
        </div>
      )}

      <div className="rounded-lg border border-lorenzo-teal/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-lorenzo-cream/30">
              <TableHead className="text-lorenzo-dark-teal">Agent</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Function</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Provider</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Model</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Temp</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Tokens</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Priority</TableHead>
              <TableHead className="text-lorenzo-dark-teal">Enabled</TableHead>
              <TableHead className="text-lorenzo-dark-teal w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.assignmentId}>
                {editingId === assignment.assignmentId && editingRow ? (
                  <>
                    {renderEditableRow(editingRow, (updates) =>
                      setEditingRow((prev) => (prev ? { ...prev, ...updates } : prev))
                    )}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSave}
                          disabled={saving}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancel}
                          className="h-8 w-8 text-gray-600 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <ModernBadge
                        variant={assignment.agentType === '*' ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {AGENT_TYPES.find((t) => t.value === assignment.agentType)?.label}
                      </ModernBadge>
                    </TableCell>
                    <TableCell>
                      <ModernBadge
                        variant={assignment.agentFunction === '*' ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {AGENT_FUNCTIONS.find((f) => f.value === assignment.agentFunction)?.label}
                      </ModernBadge>
                    </TableCell>
                    <TableCell className="text-sm">{assignment.provider}</TableCell>
                    <TableCell className="text-sm font-mono">{assignment.model}</TableCell>
                    <TableCell className="text-sm">{assignment.temperature ?? 0.7}</TableCell>
                    <TableCell className="text-sm">{assignment.maxTokens ?? 4096}</TableCell>
                    <TableCell className="text-sm">{assignment.priority}</TableCell>
                    <TableCell>
                      <Switch
                        checked={assignment.enabled}
                        onCheckedChange={(checked) =>
                          onUpdate({
                            assignmentId: assignment.assignmentId,
                            enabled: checked,
                          })
                        }
                        disabled={saving}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(assignment)}
                          className="h-8 w-8 text-lorenzo-teal hover:text-lorenzo-deep-teal hover:bg-lorenzo-cream/50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(assignment.assignmentId)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}

            {/* Add new row */}
            {addingNew && (
              <TableRow className="bg-lorenzo-cream/20">
                {renderEditableRow(newRow, (updates) =>
                  setNewRow((prev) => ({ ...prev, ...updates }))
                )}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleAddNew}
                      disabled={saving || enabledProviders.length === 0}
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setAddingNew(false)}
                      className="h-8 w-8 text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!addingNew && (
        <Button
          variant="outline"
          onClick={() => setAddingNew(true)}
          disabled={enabledProviders.length === 0}
          className="border-lorenzo-teal/20 hover:bg-lorenzo-cream/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      )}

      <p className="text-xs text-gray-500">
        <strong>Priority:</strong> Lower numbers = higher priority. Assignments are matched in order:
        exact match &gt; agent wildcard &gt; function wildcard &gt; global default.
      </p>
    </div>
  );
}
