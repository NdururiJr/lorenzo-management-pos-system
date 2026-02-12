/**
 * Database Types
 *
 * Simplified types for website (read-only access to public data).
 * Based on POS database schema but contains only publicly visible fields.
 *
 * @module website/lib/db/types
 */

/**
 * Branch type
 */
export type BranchType = 'main' | 'satellite';

/**
 * Branch interface (simplified for website/public access)
 */
export interface Branch {
  /** Unique branch identifier */
  branchId: string;
  /** Branch name (e.g., "Village Market", "Westgate") */
  name: string;
  /** Branch type: main store (with workstation) or satellite (collection point only) */
  branchType: BranchType;
  /** Branch location details */
  location: {
    /** Full address */
    address: string;
    /** Geographic coordinates */
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  /** Contact phone number */
  contactPhone: string;
  /** Whether the branch is active */
  active: boolean;
}

/**
 * Branch operating hours (for display on location pages)
 */
export interface BranchHours {
  /** Monday-Friday hours */
  weekday: string; // e.g., "8:00 AM - 6:00 PM"
  /** Saturday hours */
  saturday: string;
  /** Sunday hours (or "Closed" if not open) */
  sunday: string | null;
  /** Whether branch operates 24 hours */
  is24Hours: boolean;
}
