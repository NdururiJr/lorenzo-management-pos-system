/**
 * Geocoding Utilities
 *
 * Convert addresses to coordinates and vice versa using Google Maps Geocoding API.
 *
 * @module lib/maps/geocoding
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  formattedAddress: string;
  coordinates: Coordinates;
  placeId?: string;
}

/**
 * Convert address to coordinates
 *
 * @param address - Street address to geocode
 * @returns Promise<GeocodeResult>
 * @throws Error if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for the given address');
    }

    const result = data.results[0];

    return {
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error instanceof Error ? error : new Error('Failed to geocode address');
  }
}

/**
 * Convert coordinates to address (reverse geocoding)
 *
 * @param coordinates - Latitude and longitude
 * @returns Promise<GeocodeResult>
 * @throws Error if reverse geocoding fails
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for the given coordinates');
    }

    const result = data.results[0];

    return {
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error instanceof Error ? error : new Error('Failed to reverse geocode coordinates');
  }
}

/**
 * Get autocomplete suggestions for an address
 *
 * @param input - Partial address input
 * @param bounds - Optional bounds to restrict results
 * @returns Promise<string[]>
 */
export async function getAddressSuggestions(
  input: string,
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): Promise<Array<{ description: string; placeId: string }>> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  if (!input || input.length < 3) {
    return [];
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${apiKey}`;

    if (bounds) {
      url += `&bounds=${bounds.south},${bounds.west}|${bounds.north},${bounds.east}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Autocomplete failed: ${data.status}`);
    }

    if (!data.predictions) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.predictions.map((prediction: any) => ({
      description: prediction.description,
      placeId: prediction.place_id,
    }));
  } catch (error) {
    console.error('Address autocomplete error:', error);
    return [];
  }
}

/**
 * Get place details by place ID
 *
 * @param placeId - Google Place ID
 * @returns Promise<GeocodeResult>
 */
export async function getPlaceDetails(placeId: string): Promise<GeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place details failed: ${data.status}`);
    }

    const result = data.result;

    return {
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('Place details error:', error);
    throw error instanceof Error ? error : new Error('Failed to get place details');
  }
}
