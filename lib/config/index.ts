/**
 * Configuration Module
 *
 * Main exports for LLM configuration management.
 *
 * @module lib/config
 */

// Types
export * from './types';

// Encryption utilities (server-side only)
export {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  validateApiKeyFormat,
  isEncryptionConfigured,
  generateEncryptionKey,
} from './encryption';

// Default configurations
export {
  DEFAULT_PROVIDER_MODELS,
  AGENT_TYPE_NAMES,
  AGENT_FUNCTION_NAMES,
  DEFAULT_TEMPERATURE_BY_FUNCTION,
  DEFAULT_MAX_TOKENS_BY_FUNCTION,
  RECOMMENDED_MODELS,
  DEFAULT_GLOBAL_CONFIG,
  PROVIDER_ENDPOINTS,
  MODEL_CONTEXT_WINDOWS,
  MODEL_PRICING,
} from './defaults';

// Configuration service
export {
  // Cache management
  invalidateConfigCache,
  // Model selection
  getModelForRequest,
  // Provider management
  getProviderWithKey,
  getProviderForClient,
  getAllProvidersForClient,
  updateProviderApiKey,
  removeProviderApiKey,
  // Provider testing
  testProviderConnection,
  testAndUpdateProviderStatus,
  // Admin state
  getAdminConfigState,
  // Validation
  validateModelAssignment,
} from './config-service';
