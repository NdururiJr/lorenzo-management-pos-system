/**
 * Company Settings Database Operations
 *
 * This file provides type-safe CRUD operations for company-wide settings
 * and branch-specific configurations. Used by dashboards to fetch targets
 * and by admin UI to configure branch settings.
 *
 * Firestore Structure:
 * - system_config/company_settings - Company-wide defaults
 * - branches/{branchId} - Branch-specific config in branch.config field
 * - branchStats/{branchId}/{date} - Pre-computed daily statistics
 *
 * @module lib/db/company-settings
 */

import { Timestamp } from 'firebase/firestore';
import {
  getDocument,
  setDocument,
  updateDocument,
  DocumentNotFoundError,
  DatabaseError,
} from './index';
import type {
  CompanySettings,
  BranchConfig,
  BranchStats,
  Branch,
  BranchOperatingHours,
} from './schema';

// ============================================
// CONSTANTS
// ============================================

const SYSTEM_CONFIG_COLLECTION = 'system_config';
const COMPANY_SETTINGS_DOC = 'company_settings';
const BRANCHES_COLLECTION = 'branches';
const BRANCH_STATS_COLLECTION = 'branchStats';

/**
 * Default company settings - used when no settings exist in database
 */
export const DEFAULT_COMPANY_SETTINGS: Omit<CompanySettings, 'settingsId' | 'lastUpdatedAt' | 'lastUpdatedBy'> = {
  // Performance Targets
  defaultRetentionTarget: 80,        // 80%
  defaultPremiumTarget: 20,          // 20%
  defaultGrowthTarget: 10,           // 10%
  defaultTurnaroundHours: 24,        // 24 hours

  // Inventory
  defaultLowStockThreshold: 1.2,     // Alert at 120% of minimum

  // Payment Limits
  mpesaMinAmount: 10,                // 10 KES minimum
  mpesaMaxAmount: 150000,            // 150,000 KES maximum
  cardMinAmount: 100,                // 100 KES minimum

  // Financial
  operatingCostRatio: 0.35,          // 35% operating costs

  // Delivery
  defaultDeliveryFee: 300,           // 300 KES default
  defaultDistanceKm: 5,              // 5km default assumption
};

/**
 * Default operating hours
 */
export const DEFAULT_OPERATING_HOURS: BranchOperatingHours = {
  weekday: { open: '07:30', close: '20:00' },
  saturday: { open: '08:00', close: '18:00' },
  sunday: { open: '10:00', close: '16:00' },
  is24Hours: false,
};

/**
 * Default branch config - used when branch has no config
 */
export function getDefaultBranchConfig(branchType: 'main' | 'satellite'): BranchConfig {
  const defaults = DEFAULT_COMPANY_SETTINGS;

  return {
    dailyRevenueTarget: branchType === 'main' ? 100000 : 30000,
    monthlyRevenueTarget: branchType === 'main' ? 3000000 : 900000,
    retentionTarget: defaults.defaultRetentionTarget,
    premiumServiceTarget: defaults.defaultPremiumTarget,
    growthTarget: defaults.defaultGrowthTarget,
    turnaroundTargetHours: defaults.defaultTurnaroundHours,
    operatingHours: DEFAULT_OPERATING_HOURS,
    hasEquipment: branchType === 'main',
    lowStockThreshold: defaults.defaultLowStockThreshold,
  };
}

// ============================================
// COMPANY SETTINGS OPERATIONS
// ============================================

/**
 * Get company-wide settings
 * Returns default settings if none exist in database
 */
export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const settings = await getDocument<CompanySettings>(
      SYSTEM_CONFIG_COLLECTION,
      COMPANY_SETTINGS_DOC
    );
    return settings;
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      // Return default settings
      return {
        ...DEFAULT_COMPANY_SETTINGS,
        settingsId: COMPANY_SETTINGS_DOC,
        lastUpdatedBy: 'system',
        lastUpdatedAt: Timestamp.now(),
      };
    }
    throw new DatabaseError('Failed to get company settings', error);
  }
}

/**
 * Set company-wide settings
 */
export async function setCompanySettings(
  settings: Omit<CompanySettings, 'settingsId' | 'lastUpdatedAt'>,
  updatedBy: string
): Promise<void> {
  const fullSettings: CompanySettings = {
    ...settings,
    settingsId: COMPANY_SETTINGS_DOC,
    lastUpdatedAt: Timestamp.now(),
    lastUpdatedBy: updatedBy,
  };

  await setDocument<CompanySettings>(
    SYSTEM_CONFIG_COLLECTION,
    COMPANY_SETTINGS_DOC,
    fullSettings
  );
}

/**
 * Update specific fields in company settings
 */
export async function updateCompanySettings(
  updates: Partial<Omit<CompanySettings, 'settingsId' | 'lastUpdatedAt'>>,
  updatedBy: string
): Promise<void> {
  await updateDocument<CompanySettings>(
    SYSTEM_CONFIG_COLLECTION,
    COMPANY_SETTINGS_DOC,
    {
      ...updates,
      lastUpdatedAt: Timestamp.now(),
      lastUpdatedBy: updatedBy,
    }
  );
}

// ============================================
// BRANCH CONFIG OPERATIONS
// ============================================

/**
 * Get branch configuration with fallback to company defaults
 * This is the main function to use when fetching targets for a branch
 */
export async function getBranchConfig(branchId: string): Promise<BranchConfig> {
  try {
    const branch = await getDocument<Branch>(BRANCHES_COLLECTION, branchId);

    if (branch.config) {
      return branch.config;
    }

    // No branch-specific config, return defaults
    return getDefaultBranchConfig(branch.branchType);
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      // Branch not found, return main branch defaults
      return getDefaultBranchConfig('main');
    }
    throw new DatabaseError(`Failed to get branch config for ${branchId}`, error);
  }
}

/**
 * Get branch config with company settings merged for any missing values
 */
export async function getBranchConfigWithDefaults(branchId: string): Promise<BranchConfig> {
  const [branchConfig, companySettings] = await Promise.all([
    getBranchConfig(branchId),
    getCompanySettings(),
  ]);

  // Merge with company defaults for any missing values
  return {
    ...getDefaultBranchConfig('main'),
    dailyRevenueTarget: branchConfig.dailyRevenueTarget,
    monthlyRevenueTarget: branchConfig.monthlyRevenueTarget,
    retentionTarget: branchConfig.retentionTarget ?? companySettings.defaultRetentionTarget,
    premiumServiceTarget: branchConfig.premiumServiceTarget ?? companySettings.defaultPremiumTarget,
    growthTarget: branchConfig.growthTarget ?? companySettings.defaultGrowthTarget,
    turnaroundTargetHours: branchConfig.turnaroundTargetHours ?? companySettings.defaultTurnaroundHours,
    operatingHours: branchConfig.operatingHours ?? DEFAULT_OPERATING_HOURS,
    hasEquipment: branchConfig.hasEquipment,
    lowStockThreshold: branchConfig.lowStockThreshold ?? companySettings.defaultLowStockThreshold,
    whatsappNumber: branchConfig.whatsappNumber,
    configUpdatedAt: branchConfig.configUpdatedAt,
    configUpdatedBy: branchConfig.configUpdatedBy,
  };
}

/**
 * Update branch configuration
 */
export async function updateBranchConfig(
  branchId: string,
  config: Partial<BranchConfig>,
  updatedBy: string
): Promise<void> {
  // Get existing config first to merge properly
  const existingConfig = await getBranchConfig(branchId);

  const fullConfig: BranchConfig = {
    ...existingConfig,
    ...config,
    configUpdatedAt: Timestamp.now(),
    configUpdatedBy: updatedBy,
  };

  await updateDocument<Branch>(
    BRANCHES_COLLECTION,
    branchId,
    {
      config: fullConfig,
    }
  );
}

/**
 * Get branch targets (convenience function)
 */
export async function getBranchTargets(branchId: string): Promise<{
  dailyRevenueTarget: number;
  monthlyRevenueTarget: number;
  retentionTarget: number;
  premiumServiceTarget: number;
  growthTarget: number;
  turnaroundTargetHours: number;
}> {
  const config = await getBranchConfigWithDefaults(branchId);

  return {
    dailyRevenueTarget: config.dailyRevenueTarget,
    monthlyRevenueTarget: config.monthlyRevenueTarget,
    retentionTarget: config.retentionTarget,
    premiumServiceTarget: config.premiumServiceTarget,
    growthTarget: config.growthTarget,
    turnaroundTargetHours: config.turnaroundTargetHours,
  };
}

/**
 * Get operating hours for a branch
 */
export async function getBranchOperatingHours(branchId: string): Promise<BranchOperatingHours> {
  const config = await getBranchConfig(branchId);
  return config.operatingHours ?? DEFAULT_OPERATING_HOURS;
}

/**
 * Check if branch is currently open
 */
export function isBranchOpen(operatingHours: BranchOperatingHours, now: Date = new Date()): boolean {
  if (operatingHours.is24Hours) {
    return true;
  }

  const day = now.getDay();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  let hours: { open: string; close: string } | null = null;

  if (day === 0) {
    // Sunday
    hours = operatingHours.sunday;
  } else if (day === 6) {
    // Saturday
    hours = operatingHours.saturday;
  } else {
    // Weekday
    hours = operatingHours.weekday;
  }

  if (!hours) {
    return false; // Closed on this day
  }

  return time >= hours.open && time <= hours.close;
}

// ============================================
// BRANCH STATS OPERATIONS
// ============================================

/**
 * Get branch statistics for a specific date
 */
export async function getBranchStats(
  branchId: string,
  date: string // YYYY-MM-DD format
): Promise<BranchStats | null> {
  try {
    const stats = await getDocument<BranchStats>(
      `${BRANCH_STATS_COLLECTION}/${branchId}`,
      date
    );
    return stats;
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      return null;
    }
    throw new DatabaseError(`Failed to get branch stats for ${branchId} on ${date}`, error);
  }
}

/**
 * Get branch statistics for a date range
 */
export async function getBranchStatsRange(
  branchId: string,
  startDate: string,
  endDate: string
): Promise<BranchStats[]> {
  // This would typically use a query, but for now we'll implement a simple approach
  const stats: BranchStats[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const stat = await getBranchStats(branchId, dateStr);
    if (stat) {
      stats.push(stat);
    }
  }

  return stats;
}

/**
 * Save branch statistics (typically called by Cloud Functions)
 */
export async function saveBranchStats(stats: BranchStats): Promise<void> {
  await setDocument<BranchStats>(
    `${BRANCH_STATS_COLLECTION}/${stats.branchId}`,
    stats.date,
    {
      ...stats,
      lastUpdated: Timestamp.now(),
    }
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a numeric value from company settings
 */
export async function getCompanySettingValue(
  key: keyof CompanySettings
): Promise<number | string> {
  const companySettings = await getCompanySettings();
  const value = companySettings[key];
  // Only return primitive values
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new Error(`Cannot get non-primitive value for key: ${key}`);
}

/**
 * Validate config values are within acceptable ranges
 */
export function validateBranchConfig(config: Partial<BranchConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.retentionTarget !== undefined) {
    if (config.retentionTarget < 0 || config.retentionTarget > 100) {
      errors.push('Retention target must be between 0 and 100');
    }
  }

  if (config.premiumServiceTarget !== undefined) {
    if (config.premiumServiceTarget < 0 || config.premiumServiceTarget > 100) {
      errors.push('Premium service target must be between 0 and 100');
    }
  }

  if (config.growthTarget !== undefined) {
    if (config.growthTarget < -100 || config.growthTarget > 500) {
      errors.push('Growth target must be between -100 and 500');
    }
  }

  if (config.turnaroundTargetHours !== undefined) {
    if (config.turnaroundTargetHours < 1 || config.turnaroundTargetHours > 168) {
      errors.push('Turnaround target must be between 1 and 168 hours');
    }
  }

  if (config.lowStockThreshold !== undefined) {
    if (config.lowStockThreshold < 1 || config.lowStockThreshold > 5) {
      errors.push('Low stock threshold must be between 1 and 5');
    }
  }

  if (config.dailyRevenueTarget !== undefined) {
    if (config.dailyRevenueTarget < 0) {
      errors.push('Daily revenue target must be positive');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
