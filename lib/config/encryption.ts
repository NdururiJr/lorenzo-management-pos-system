/**
 * API Key Encryption Service
 *
 * Provides AES-256-GCM encryption for API keys stored in Firestore.
 * Server-side only - never expose decrypted keys to client.
 *
 * @module lib/config/encryption
 */

import * as crypto from 'crypto';
import type { EncryptedKey } from './types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const _AUTH_TAG_LENGTH = 16;

/**
 * Get the encryption key from environment
 * Key should be 32 bytes (256 bits) base64 encoded
 */
function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.CONFIG_ENCRYPTION_KEY;

  if (!keyBase64) {
    throw new Error(
      'CONFIG_ENCRYPTION_KEY environment variable is not set. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    );
  }

  const key = Buffer.from(keyBase64, 'base64');

  if (key.length !== 32) {
    throw new Error(
      `Invalid CONFIG_ENCRYPTION_KEY length. Expected 32 bytes, got ${key.length}. ` +
        'Key must be 32 bytes base64 encoded.'
    );
  }

  return key;
}

/**
 * Encrypt an API key
 *
 * @param plaintext - The API key to encrypt
 * @returns Encrypted key with IV and auth tag
 */
export function encryptApiKey(plaintext: string): EncryptedKey {
  if (!plaintext || plaintext.trim() === '') {
    throw new Error('Cannot encrypt empty API key');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypt an API key
 *
 * @param encryptedData - The encrypted key data
 * @returns The decrypted API key
 */
export function decryptApiKey(encryptedData: EncryptedKey): string {
  if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
    throw new Error('Invalid encrypted data: missing required fields');
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');
  const encrypted = encryptedData.encrypted;

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask an API key for display (show last 4 characters)
 *
 * @param apiKey - The API key to mask
 * @returns Masked string like "••••••••abcd"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 4) {
    return '••••••••';
  }

  const lastFour = apiKey.slice(-4);
  return `••••••••${lastFour}`;
}

/**
 * Validate API key format (basic validation)
 *
 * @param provider - The provider type
 * @param apiKey - The API key to validate
 * @returns Validation result with error message if invalid
 */
export function validateApiKeyFormat(
  provider: 'openai' | 'anthropic' | 'google' | 'local',
  apiKey: string
): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key cannot be empty' };
  }

  switch (provider) {
    case 'openai':
      // OpenAI keys start with 'sk-' and are ~50 chars
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI API keys should start with "sk-"' };
      }
      if (apiKey.length < 40) {
        return { valid: false, error: 'OpenAI API key appears too short' };
      }
      break;

    case 'anthropic':
      // Anthropic keys start with 'sk-ant-'
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, error: 'Anthropic API keys should start with "sk-ant-"' };
      }
      break;

    case 'google':
      // Google API keys are typically 39 characters
      if (apiKey.length < 30) {
        return { valid: false, error: 'Google API key appears too short' };
      }
      break;

    case 'local':
      // Local models may not need API keys
      return { valid: true };
  }

  return { valid: true };
}

/**
 * Check if encryption key is configured
 */
export function isEncryptionConfigured(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new encryption key (for setup)
 * @returns Base64 encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}
