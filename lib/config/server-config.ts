/**
 * Server-Side Configuration Service
 *
 * This module provides LLM configuration functions for use in API routes.
 * It uses Firebase Admin SDK (adminDb) instead of the client SDK.
 *
 * Use this module ONLY in:
 * - API routes (app/api/*)
 * - Server components
 * - Cloud Functions
 *
 * For client-side code, use lib/db/config.ts instead.
 *
 * @module lib/config/server-config
 */

import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type {
  LLMProvider,
  ProviderConfig,
  ModelAssignment,
  GlobalLLMConfig,
  LLMAgentType,
  AgentFunction,
} from '@/lib/db/schema';
import {
  DEFAULT_PROVIDER_MODELS,
  PROVIDER_DISPLAY_NAMES,
} from '@/lib/db/config';

// ============================================
// CONSTANTS
// ============================================

const SYSTEM_CONFIG_COLLECTION = 'system_config';
const PROVIDERS_SUBCOLLECTION = 'providers';
const ASSIGNMENTS_SUBCOLLECTION = 'model_assignments';
const GLOBAL_CONFIG_DOC = 'global';
const LLM_SETTINGS_KEY = 'llm_settings';

// ============================================
// GLOBAL LLM CONFIGURATION (Server-side)
// ============================================

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
    maxRetries: 2,
    enableRequestLogging: true,
    rateLimitPerMinute: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    updatedBy: 'system',
  };
}

/**
 * Get global LLM configuration (Server-side)
 * Returns default config if none exists
 */
export async function getGlobalLLMConfigServer(): Promise<GlobalLLMConfig> {
  try {
    const docRef = adminDb
      .collection(SYSTEM_CONFIG_COLLECTION)
      .doc(GLOBAL_CONFIG_DOC)
      .collection('settings')
      .doc(LLM_SETTINGS_KEY);

    const doc = await docRef.get();

    if (!doc.exists) {
      // Try alternate path (direct document)
      const altDocRef = adminDb
        .collection(`${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}`)
        .doc(LLM_SETTINGS_KEY);

      const altDoc = await altDocRef.get();

      if (!altDoc.exists) {
        return getDefaultGlobalConfig();
      }

      return altDoc.data() as GlobalLLMConfig;
    }

    return doc.data() as GlobalLLMConfig;
  } catch (error) {
    console.warn('[Server Config] Error fetching global LLM config, using defaults:', error);
    return getDefaultGlobalConfig();
  }
}

// ============================================
// PROVIDER CONFIGURATION (Server-side)
// ============================================

/**
 * Get default configuration for a provider
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
 * Get a specific provider configuration (Server-side)
 */
export async function getProviderServer(providerId: LLMProvider): Promise<ProviderConfig> {
  try {
    const docRef = adminDb
      .collection(`${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`)
      .doc(providerId);

    const doc = await docRef.get();

    if (!doc.exists) {
      return getDefaultProviderConfig(providerId);
    }

    return doc.data() as ProviderConfig;
  } catch (error) {
    console.warn(`[Server Config] Error fetching provider ${providerId}, using defaults:`, error);
    return getDefaultProviderConfig(providerId);
  }
}

/**
 * Get all provider configurations (Server-side)
 */
export async function getAllProvidersServer(): Promise<ProviderConfig[]> {
  try {
    const collectionRef = adminDb.collection(
      `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${PROVIDERS_SUBCOLLECTION}`
    );

    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      // Return default configs for all providers
      return (['openai', 'anthropic', 'google', 'local'] as LLMProvider[]).map(
        getDefaultProviderConfig
      );
    }

    return snapshot.docs.map((doc) => doc.data() as ProviderConfig);
  } catch (error) {
    console.warn('[Server Config] Error fetching all providers, using defaults:', error);
    return (['openai', 'anthropic', 'google', 'local'] as LLMProvider[]).map(
      getDefaultProviderConfig
    );
  }
}

// ============================================
// MODEL ASSIGNMENTS (Server-side)
// ============================================

/**
 * Get all model assignments (Server-side)
 */
export async function getAllModelAssignmentsServer(): Promise<ModelAssignment[]> {
  try {
    const collectionRef = adminDb
      .collection(
        `${SYSTEM_CONFIG_COLLECTION}/${GLOBAL_CONFIG_DOC}/${ASSIGNMENTS_SUBCOLLECTION}`
      )
      .orderBy('priority', 'asc');

    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => doc.data() as ModelAssignment);
  } catch (error) {
    console.warn('[Server Config] Error fetching model assignments:', error);
    return [];
  }
}

/**
 * Get the best matching model assignment for an agent and function (Server-side)
 * Priority: exact match > agent wildcard > function wildcard > global wildcard
 */
export async function getModelAssignmentServer(
  agentType: LLMAgentType,
  agentFunction: AgentFunction
): Promise<ModelAssignment | null> {
  const allAssignments = await getAllModelAssignmentsServer();
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
