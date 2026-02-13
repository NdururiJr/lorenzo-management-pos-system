/**
 * Location Helpers
 *
 * Utility functions for working with location pages:
 * - Slug mapping (BRANCH_ID → url-slug)
 * - Neighborhood extraction
 * - Nearby areas computation
 *
 * @module website/lib/utils/location-helpers
 */

/**
 * Slug mapping: Branch ID → URL-friendly slug
 * Maps UPPERCASE_BRANCH_IDS to lowercase-slugs for SEO-friendly URLs
 */
export const slugMap: Record<string, string> = {
  VILLAGE_MARKET: 'village-market',
  WESTGATE: 'westgate',
  WESTLANDS: 'westlands',
  DENNIS_PRITT: 'dennis-pritt',
  MUTHAIGA: 'muthaiga',
  ADLIFE: 'adlife',
  NAIVAS_KILIMANI: 'kilimani',
  HURLINGHAM: 'hurlingham',
  LAVINGTON: 'lavington',
  GREENPARK: 'greenpark',
  SOUTH_C_NAIVAS: 'south-c',
  LANGATA_KOBIL: 'langata',
  BOMAS: 'bomas',
  WATERFRONT_KAREN: 'karen',
  FREEDOM_HEIGHTS: 'freedom-heights',
  NGONG_SHELL: 'ngong',
  IMARA: 'imara',
  NEXTGEN_SOUTH_C: 'nextgen-south-c',
  KILELESHWA: 'kileleshwa',
  ARBORETUM: 'arboretum',
  SHUJAH_MALL: 'shujah',
  MYTOWN_KAREN: 'mytown-karen',
};

/**
 * Reverse slug map: slug → Branch ID
 */
export const reverseSlugMap: Record<string, string> = Object.entries(slugMap).reduce(
  (acc, [branchId, slug]) => {
    acc[slug] = branchId;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Extract neighborhood name from branch name
 * Examples:
 *   - "Village Market" → "Village Market"
 *   - "Naivas Kilimani" → "Kilimani"
 *   - "Waterfront Karen" → "Karen"
 *
 * @param branchName - Full branch name
 * @returns Simplified neighborhood name
 */
export function extractNeighborhood(branchName: string): string {
  // Remove common prefixes/suffixes
  const cleaned = branchName
    .replace(/^Naivas\s+/i, '')
    .replace(/^Waterfront\s+/i, '')
    .replace(/^NextGen\s+/i, '')
    .replace(/^MyTown\s+/i, '')
    .replace(/^Shujah\s+/i, '')
    .replace(/\s+Mall$/i, '')
    .replace(/\s+Kobil$/i, '')
    .replace(/\s+Shell$/i, '');

  return cleaned.trim();
}

/**
 * Get nearby areas for a given neighborhood
 * Used for "We Also Serve" section on location pages
 *
 * @param neighborhoodName - The current neighborhood
 * @returns Array of nearby area objects with name and slug
 */
export function getNearbyAreas(neighborhoodName: string): Array<{ name: string; slug: string }> {
  // Define neighborhood clusters
  const clusters: Record<string, string[]> = {
    // Westlands cluster
    'Village Market': ['Westgate', 'Parklands', 'Highridge', 'Kangemi'],
    Westgate: ['Village Market', 'Parklands', 'Highridge'],
    'Dennis Pritt': ['Kilimani', 'Hurlingham', 'Kileleshwa'],

    // Kilimani cluster
    Kilimani: ['Hurlingham', 'Lavington', 'Kileleshwa', 'Dennis Pritt'],
    Hurlingham: ['Kilimani', 'Lavington', 'Kileleshwa'],
    Lavington: ['Kilimani', 'Hurlingham', 'Westlands'],
    Kileleshwa: ['Kilimani', 'Hurlingham', 'Lavington'],

    // Karen/Langata cluster
    Karen: ['Langata', 'Ngong', 'Hardy'],
    Langata: ['Karen', 'Ngong', 'Bomas', 'South C'],
    Bomas: ['Langata', 'Karen', 'Ngong'],
    Ngong: ['Karen', 'Langata', 'Rongai'],

    // South of Nairobi cluster
    'South C': ['Langata', 'Imara', 'Pipeline', 'Nyayo'],
    Imara: ['South C', 'Pipeline', 'Embakasi'],
  };

  const nearby = clusters[neighborhoodName] || [];

  // Map to slug if available
  return nearby
    .map((name) => {
      const slug = Object.entries(slugMap).find(
        ([_, s]) => s.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(s)
      )?.[1];
      return slug ? { name, slug } : null;
    })
    .filter((area): area is { name: string; slug: string } => area !== null);
}

/**
 * Format operating hours for display
 * @param hours - Operating hours string or object
 * @returns Formatted hours string
 */
export function formatOperatingHours(hours?: unknown): string {
  // Default hours
  return 'Mon-Sat: 8:00 AM - 6:00 PM';
}

/**
 * Get branch ID from slug
 * @param slug - URL slug
 * @returns Branch ID or null if not found
 */
export function getBranchIdFromSlug(slug: string): string | null {
  return reverseSlugMap[slug] || null;
}

/**
 * Get slug from branch ID
 * @param branchId - Branch ID
 * @returns URL slug or null if not found
 */
export function getSlugFromBranchId(branchId: string): string | null {
  return slugMap[branchId] || null;
}

/**
 * Format phone number for display
 * @param phone - Phone number
 * @returns Formatted phone number (e.g., "0728 400 200")
 */
export function formatPhoneNumber(phone: string): string {
  // Remove +254 prefix and format as 0XXX XXX XXX
  const cleaned = phone.replace('+254', '0').replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
