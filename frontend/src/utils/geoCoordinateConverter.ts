/**
 * Geographic Coordinate Conversion Utilities
 * 
 * Converts physical tabletop coordinates (cm) to geographic coordinates (lat/lng)
 * Uses dynamic map configuration loaded from backend API
 */

interface MapConfig {
  width: number;
  height: number;
  geographic_bounds: {
    topLeft: { lat: number; lng: number };
    topRight: { lat: number; lng: number };
    bottomRight: { lat: number; lng: number };
    bottomLeft: { lat: number; lng: number };
  };
  config_version: string;
}

// Cache for map configuration
let mapConfig: MapConfig | null = null;

/**
 * Load map configuration from backend API
 */
async function loadMapConfig(): Promise<MapConfig> {
  try {
    const response = await fetch('http://localhost:8000/api/map-config/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const config = await response.json();
    
    // Validate required fields
    if (!config.width || !config.height || !config.geographic_bounds) {
      throw new Error('Invalid map configuration: missing required fields');
    }
    
    return config;
    
  } catch (error) {
    console.error('Error loading map configuration:', error);
    
    // Return fallback configuration if API fails
    return {
      width: 35,
      height: 23,
      geographic_bounds: {
        topLeft: { lat: 32.561065, lng: -117.083997 },
        topRight: { lat: 32.561065, lng: -117.075475 },
        bottomRight: { lat: 32.558361, lng: -117.075475 },
        bottomLeft: { lat: 32.558361, lng: -117.083997 },
      },
      config_version: 'fallback'
    };
  }
}

/**
 * Load map configuration (cached after first load)
 */
async function getMapConfig(): Promise<MapConfig> {
  if (!mapConfig) {
    mapConfig = await loadMapConfig();
  }
  return mapConfig;
}

/**
 * Converts backend map coordinates (in cm) to geographic coordinates (lat/lng)
 * @param x_cm - X coordinate from backend (0 to map width cm)
 * @param y_cm - Y coordinate from backend (0 to map height cm)
 * @returns Promise with lat and lng coordinates
 */
export async function physicalToGeographic(x_cm: number, y_cm: number): Promise<{ lat: number; lng: number }> {
  const config = await getMapConfig();
  
  // Normalize coordinates to 0-1 range
  const u = x_cm / config.width;   // horizontal position (0 = left edge, 1 = right edge)
  const v = y_cm / config.height;  // vertical position (0 = top edge, 1 = bottom edge)
  
  // Clamp coordinates to valid range with small tolerance
  const clampedU = Math.max(0, Math.min(1, u));
  const clampedV = Math.max(0, Math.min(1, v));
  
  // Log warning if coordinates were clamped
  if (u !== clampedU || v !== clampedV) {
    console.warn(`Coordinates clamped: (${x_cm}, ${y_cm}) -> normalized (${clampedU}, ${clampedV})`);
  }
  
  // Apply bilinear interpolation using the four corner points
  const bounds = config.geographic_bounds;
  
  // Bilinear interpolation formula (fixed from your original)
  const lat = (1 - clampedU) * (1 - clampedV) * bounds.topLeft.lat +
              clampedU * (1 - clampedV) * bounds.topRight.lat +
              clampedU * clampedV * bounds.bottomRight.lat +
              (1 - clampedU) * clampedV * bounds.bottomLeft.lat;
              
  const lng = (1 - clampedU) * (1 - clampedV) * bounds.topLeft.lng +
              clampedU * (1 - clampedV) * bounds.topRight.lng +
              clampedU * clampedV * bounds.bottomRight.lng +
              (1 - clampedU) * clampedV * bounds.bottomLeft.lng;
  
  return { lat, lng };
}

/**
 * Synchronous version for cases where config is already loaded
 * @param x_cm - X coordinate from backend
 * @param y_cm - Y coordinate from backend
 * @param config - Map configuration (must be pre-loaded)
 * @returns lat and lng coordinates
 */
export function physicalToGeographicSync(x_cm: number, y_cm: number, config: MapConfig): { lat: number; lng: number } {
  // Normalize coordinates to 0-1 range
  const u = x_cm / config.width;
  const v = y_cm / config.height;
  
  // Clamp coordinates to valid range
  const clampedU = Math.max(0, Math.min(1, u));
  const clampedV = Math.max(0, Math.min(1, v));
  
  // Apply bilinear interpolation
  const bounds = config.geographic_bounds;
  
  const lat = (1 - clampedU) * (1 - clampedV) * bounds.topLeft.lat +
              clampedU * (1 - clampedV) * bounds.topRight.lat +
              clampedU * clampedV * bounds.bottomRight.lat +
              (1 - clampedU) * clampedV * bounds.bottomLeft.lat;
              
  const lng = (1 - clampedU) * (1 - clampedV) * bounds.topLeft.lng +
              clampedU * (1 - clampedV) * bounds.topRight.lng +
              clampedU * clampedV * bounds.bottomRight.lng +
              (1 - clampedU) * clampedV * bounds.bottomLeft.lng;
  
  return { lat, lng };
}

/**
 * Get current map configuration (for debugging or other uses)
 */
export async function getCurrentMapConfig(): Promise<MapConfig> {
  return await getMapConfig();
}

/**
 * Clear cached configuration (useful for testing)
 */
export function clearConfigCache(): void {
  mapConfig = null;
}