/**
 * System Configuration Database Operations
 *
 * This file provides type-safe CRUD operations for LLM provider configurations,
 * model assignments, and global settings. Used by admin UI to configure AI agents.
 *
 * Firestore Structure:
 * - system_config/global/llm_settings - Global LLM configuration
 * - system_config/providers/{providerId} - Provider configurations
 * - system_config/model_assignments/{assignmentId} - Model assignments
 *
 * @module lib/db/config
 */

import { Timestamp, where, orderBy } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DocumentNotFoundError,
  DatabaseError,
} from './index';
import type {
  LLMProvider,
  ProviderConfig,
  ModelAssignment,
  GlobalLLMConfig,
  LLMAgentType,
  AgentFunction,
  ProviderConnectionStatus,
} from './schema';

// ============================================
// CONSTANTS
// ============================================

const SYSTEM_CONFIG_COLLECTION = 'system_config';
const PROVIDERS_SUBCOLLECTION = 'providers';
const ASSIGNMENTS_SUBCOLLECTION = 'model_assignments';
const GLOBAL_CONFIG_DOC = 'global';
const LLM_SETTINGS_KEY = 'llm_settings';

/**
 * Default models for each provider
 */
export const DEFAULT_PROVIDER_MODELS: Record<LLMProvider, { models: string[]; default: string }> = {
  openai: {
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    default: 'gpt-4o-mini',
  },
  anthropic: {
    models: ['claude-opus-4-5-20250514', 'claude-sonnet-4-20250514', 'claude-3-haiku-20240307'],
    default: 'claude-sonnet-4-20250514',
  },
  google: {
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    default: 'gemini-1.5-flash',
  },
  local: {
    models: [],
    default: '',
  },
};

/**
 * Default provider display names
 */
export const PROVIDER_DISPLAY_NAMES: Record<LLMProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google: 'Google (Gemini)',
  local: 'Local Models',
};

// ============================================
// GLOBAL LLM CONFIGURATION
// ============================================

/**
 * Get global LLM configuration
 * Returns default config if none exists
 */
export async function getGlobalLLMConfig(): Promise<GlobalLLMConfig> {
  try {
    const config = await getDocument<GlobalLLMConfig>(
      `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}`,
      LLM_SETTINGS_KEY
    );
    return config;
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      // Return default config
      return getDefaultGlobalConfig();
    }
    throw new DatabaseError('Failed to get global LLM config', error);
  }
}

/**
 * Set global LLM configuration
 */
export async function setGlobalLLMConfig(
  config: Omit<GlobalLLMConfig, 'configId' | 'createdAt' | 'updatedAt'>,
  updatedBy: string
): Promise<void> {
  const fullConfig: Omit<GlobalLLMConfig, 'createdAt'> = {
    ...config,
    configId: LLM_SETTINGS_KEY,
    updatedAt: Timestamp.now(),
    updatedBy,
  };

  await setDocument<GlobalLLMConfig>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}`,
    LLM_SETTINGS_KEY,
    fullConfig as Omit<GlobalLLMConfig, 'id'>
  );
}

/**
 * Update specific fields in global LLM config
 */
export async function updateGlobalLLMConfig(
  updates: Partial<Omit<GlobalLLMConfig, 'configId' | 'createdAt' | 'updatedAt'>>,
  updatedBy: string
): Promise<void> {
  await updateDocument<GlobalLLMConfig>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}`,
    LLM_SETTINGS_KEY,
    {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy,
    }
  );
}

/**
 * Get default global configuration
 */
function getDefaultGlobalConfig(): GlobalLLMConfig {
  return {
    configId: LLM_SETTINGS_KEY,
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o-mini',
    enableFallback: true,
    fallbackOrder: ['openai', 'anthropic', 'google'],
    requestTimeoutMs: 30000,
    enableRequestLogging: false,
    maxRetries: 3,
    rateLimitPerMinute: 0, // 0 = unlimited
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    updatedBy: 'system',
  };
}

// ============================================
// PROVIDER CONFIGURATION
// ============================================

/**
 * Get all provider configurations
 */
export async function getAllProviders(): Promise<ProviderConfig[]> {
  try {
    const providers = await getDocuments<ProviderConfig>(
      `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`,
      orderBy('providerId', 'asc')
    );

    // If no providers exist, return defaults
    if (providers.length === 0) {
      return getDefaultProviderConfigs();
    }

    return providers;
  } catch {
    // Return defaults on error (e.g., collection doesn't exist)
    return getDefaultProviderConfigs();
  }
}

/**
 * Get provider configuration by ID
 */
export async function getProvider(providerId: LLMProvider): Promise<ProviderConfig> {
  try {
    return await getDocument<ProviderConfig>(
      `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`,
      providerId
    );
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      // Return default config for this provider
      return getDefaultProviderConfig(providerId);
    }
    throw new DatabaseError(`Failed to get provider ${providerId}`, error);
  }
}

/**
 * Get only enabled providers
 */
export async function getEnabledProviders(): Promise<ProviderConfig[]> {
  const allProviders = await getAllProviders();
  return allProviders.filter((p) => p.enabled);
}

/**
 * Create or update provider configuration
 */
export async function setProvider(
  providerId: LLMProvider,
  config: Omit<ProviderConfig, 'providerId' | 'createdAt' | 'updatedAt'>,
  updatedBy: string
): Promise<void> {
  const fullConfig: Omit<ProviderConfig, 'createdAt'> = {
    ...config,
    providerId,
    updatedAt: Timestamp.now(),
    updatedBy,
  };

  await setDocument<ProviderConfig>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`,
    providerId,
    fullConfig as Omit<ProviderConfig, 'id'>
  );
}

/**
 * Update provider configuration
 */
export async function updateProvider(
  providerId: LLMProvider,
  updates: Partial<Omit<ProviderConfig, 'providerId' | 'createdAt' | 'updatedAt'>>,
  updatedBy: string
): Promise<void> {
  await updateDocument<ProviderConfig>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`,
    providerId,
    {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy,
    }
  );
}

/**
 * Update provider connection status
 */
export async function updateProviderStatus(
  providerId: LLMProvider,
  status: ProviderConnectionStatus,
  updatedBy: string
): Promise<void> {
  await updateDocument<ProviderConfig>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`,
    providerId,
    {
      connectionStatus: status,
      lastTestedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      updatedBy,
    }
  );
}

/**
 * Enable or disable a provider
 */
export async function setProviderEnabled(
  providerId: LLMProvider,
  enabled: boolean,
  updatedBy: string
): Promise<void> {
  await updateProvider(providerId, { enabled }, updatedBy);
}

/**
 * Delete provider configuration (resets to default)
 */
export async function deleteProvider(providerId: LLMProvider): Promise<void> {
  await deleteDocument(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`,
    providerId
  );
}

/**
 * Get default provider configuration
 */
function getDefaultProviderConfig(providerId: LLMProvider): ProviderConfig {
  const providerDefaults = DEFAULT_PROVIDER_MODELS[providerId];
  return {
    providerId,
    displayName: PROVIDER_DISPLAY_NAMES[providerId],
    enabled: providerId === 'openai', // Only OpenAI enabled by default
    availableModels: providerDefaults.models,
    defaultModel: providerDefaults.default,
    connectionStatus: 'untested',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    updatedBy: 'system',
  };
}

/**
 * Get default configurations for all providers
 */
function getDefaultProviderConfigs(): ProviderConfig[] {
  return (['openai', 'anthropic', 'google', 'local'] as LLMProvider[]).map(getDefaultProviderConfig);
}

// ============================================
// MODEL ASSIGNMENTS
// ============================================

/**
 * Generate a unique assignment ID
 */
function generateAssignmentId(agentType: LLMAgentType | '*', agentFunction: AgentFunction | '*'): string {
  return `${agentType}-${agentFunction}`;
}

/**
 * Get all model assignments
 */
export async function getAllModelAssignments(): Promise<ModelAssignment[]> {
  try {
    const assignments = await getDocuments<ModelAssignment>(
      `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${ASSIGNMENTS_SUBCOLLECTION}`,
      orderBy('priority', 'asc')
    );
    return assignments;
  } catch {
    // Return empty array if collection doesn't exist
    return [];
  }
}

/**
 * Get model assignments for a specific agent type
 */
export async function getModelAssignmentsByAgent(
  agentType: LLMAgentType
): Promise<ModelAssignment[]> {
  try {
    const assignments = await getDocuments<ModelAssignment>(
      `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${ASSIGNMENTS_SUBCOLLECTION}`,
      where('agentType', 'in', [agentType, '*']),
      orderBy('priority', 'asc')
    );
    return assignments;
  } catch {
    return [];
  }
}

/**
 * Get the best matching model assignment for an agent and function
 * Priority: exact match > agent wildcard > function wildcard > global wildcard
 */
export async function getModelAssignment(
  agentType: LLMAgentType,
  agentFunction: AgentFunction
): Promise<ModelAssignment | null> {
  const allAssignments = await getAllModelAssignments();
  const enabledAssignments = allAssignments.filter((a) => a.enabled);

  // Priority order: exact > agent-specific > function-specific > global
  const exactMatch = enabledAssignments.find(
    (a) => a.agentType === agentType && a.agentFunction === agentFunction
  );
  if (exactMatch) return exactMatch;

  const agentWildcard = enabledAssignments.find(
    (a) => a.agentType === agentType && a.agentFunction === '*'
  );
  if (agentWildcard) return agentWildcard;

  const functionWildcard = enabledAssignments.find(
    (a) => a.agentType === '*' && a.agentFunction === agentFunction
  );
  if (functionWildcard) return functionWildcard;

  const globalDefault = enabledAssignments.find(
    (a) => a.agentType === '*' && a.agentFunction === '*'
  );
  if (globalDefault) return globalDefault;

  return null;
}

/**
 * Create or update a model assignment
 */
export async function setModelAssignment(
  assignment: Omit<ModelAssignment, 'assignmentId' | 'createdAt' | 'updatedAt'>,
  updatedBy: string
): Promise<string> {
  const assignmentId = generateAssignmentId(assignment.agentType, assignment.agentFunction);

  const fullAssignment: Omit<ModelAssignment, 'createdAt'> = {
    ...assignment,
    assignmentId,
    updatedAt: Timestamp.now(),
    updatedBy,
  };

  await setDocument<ModelAssignment>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${ASSIGNMENTS_SUBCOLLECTION}`,
    assignmentId,
    fullAssignment as Omit<ModelAssignment, 'id'>
  );

  return assignmentId;
}

/**
 * Update a model assignment
 */
export async function updateModelAssignment(
  assignmentId: string,
  updates: Partial<Omit<ModelAssignment, 'assignmentId' | 'createdAt' | 'updatedAt'>>,
  updatedBy: string
): Promise<void> {
  await updateDocument<ModelAssignment>(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${ASSIGNMENTS_SUBCOLLECTION}`,
    assignmentId,
    {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy,
    }
  );
}

/**
 * Delete a model assignment
 */
export async function deleteModelAssignment(assignmentId: string): Promise<void> {
  await deleteDocument(
    `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${ASSIGNMENTS_SUBCOLLECTION}`,
    assignmentId
  );
}

/**
 * Enable or disable a model assignment
 */
export async function setModelAssignmentEnabled(
  assignmentId: string,
  enabled: boolean,
  updatedBy: string
): Promise<void> {
  await updateModelAssignment(assignmentId, { enabled }, updatedBy);
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Initialize default configurations (called on first setup)
 */
export async function initializeDefaultConfigs(updatedBy: string): Promise<void> {
  // Set global config
  await setGlobalLLMConfig(
    {
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o-mini',
      enableFallback: true,
      fallbackOrder: ['openai', 'anthropic', 'google'],
      requestTimeoutMs: 30000,
      enableRequestLogging: false,
      maxRetries: 3,
      rateLimitPerMinute: 0,
      updatedBy,
    },
    updatedBy
  );

  // Set default provider configs
  for (const providerId of ['openai', 'anthropic', 'google', 'local'] as LLMProvider[]) {
    const defaults = DEFAULT_PROVIDER_MODELS[providerId];
    await setProvider(
      providerId,
      {
        displayName: PROVIDER_DISPLAY_NAMES[providerId],
        enabled: providerId === 'openai',
        availableModels: defaults.models,
        defaultModel: defaults.default,
        connectionStatus: 'untested',
        updatedBy,
      },
      updatedBy
    );
  }

  // Set default global assignment
  await setModelAssignment(
    {
      agentType: '*',
      agentFunction: '*',
      provider: 'openai',
      model: 'gpt-4o-mini',
      priority: 100,
      enabled: true,
      temperature: 0.7,
      maxTokens: 4096,
      updatedBy,
    },
    updatedBy
  );
}

/**
 * Get complete LLM configuration (global + providers + assignments)
 */
export async function getCompleteLLMConfig(): Promise<{
  global: GlobalLLMConfig;
  providers: ProviderConfig[];
  assignments: ModelAssignment[];
}> {
  const [global, providers, assignments] = await Promise.all([
    getGlobalLLMConfig(),
    getAllProviders(),
    getAllModelAssignments(),
  ]);

  return { global, providers, assignments };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if a provider has a valid API key configured
 */
export function hasValidApiKey(provider: ProviderConfig): boolean {
  // Local models don't need API keys
  if (provider.providerId === 'local') {
    return !!provider.baseUrl;
  }
  return !!provider.encryptedApiKey;
}

/**
 * Check if a model is valid for a provider
 */
export function isValidModel(providerId: LLMProvider, model: string): boolean {
  const defaults = DEFAULT_PROVIDER_MODELS[providerId];
  // Local provider allows any model
  if (providerId === 'local') return true;
  return defaults.models.includes(model);
}
