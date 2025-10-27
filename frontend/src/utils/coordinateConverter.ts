/**
 * Coordinate Conversion Utilities
 * 
 * Backend coordinates: Map coordinates in cm (dynamic width/height from backend)
 * Frontend coordinates: Canvas system (600x394 base dimensions, auto-calculated from physical aspect ratio)
 */

// Cache for map configuration
let mapConfig: any = null;

// Fallback dimensions (used when backend is unavailable)
const FALLBACK_MAP_WIDTH = 35;
const FALLBACK_MAP_HEIGHT = 23;

/**
 * Load map configuration from backend API
 */
async function loadMapConfig(): Promise<any> {
  try {
    const response = await fetch('http://localhost:8000/api/map-config/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const config = await response.json();
    
    // Validate required fields
    if (!config.width || !config.height) {
      throw new Error('Invalid map configuration: missing width or height');
    }
    
    return config;
    
  } catch (error) {
    console.error('Error loading map configuration:', error);
    
    // Return fallback configuration if API fails
    return {
      width: FALLBACK_MAP_WIDTH,
      height: FALLBACK_MAP_HEIGHT,
      config_version: 'fallback'
    };
  }
}

/**
 * Get map configuration (cached after first load)
 */
async function getMapConfig(): Promise<any> {
  if (!mapConfig) {
    mapConfig = await loadMapConfig();
  }
  return mapConfig;
}

/**
 * Get current map dimensions (width and height in cm)
 */
export async function getMapDimensions(): Promise<{ width: number; height: number }> {
  try {
    const config = await getMapConfig();
    return { width: config.width, height: config.height };
  } catch (error) {
    console.warn('Failed to load map config, using fallback dimensions:', error);
    return { width: FALLBACK_MAP_WIDTH, height: FALLBACK_MAP_HEIGHT };
  }
}

/**
 * Get frontend base dimensions (calculated from map aspect ratio)
 */
export async function getFrontendBaseDimensions(): Promise<{ width: number; height: number }> {
  const { width, height } = await getMapDimensions();
  const baseWidth = 600;
  const baseHeight = Math.round(baseWidth / (width / height));
  return { width: baseWidth, height: baseHeight };
}

// Frontend base dimensions (will be updated when config loads)
export let FRONTEND_BASE_WIDTH = 600;
export let FRONTEND_BASE_HEIGHT = Math.round(FRONTEND_BASE_WIDTH / (FALLBACK_MAP_WIDTH / FALLBACK_MAP_HEIGHT));

// Initialize frontend dimensions
getFrontendBaseDimensions().then(dims => {
  FRONTEND_BASE_WIDTH = dims.width;
  FRONTEND_BASE_HEIGHT = dims.height;
});

/**
 * Converts backend map coordinates (in cm) to frontend pixel coordinates
 * @param backendX - X coordinate from backend (0 to map width cm)
 * @param backendY - Y coordinate from backend (0 to map height cm)
 * @returns Object with x and y in frontend pixel coordinates
 */
export async function convertBackendToFrontend(backendX: number, backendY: number): Promise<{ x: number; y: number }> {
  const { width, height } = await getMapDimensions();
  const { width: frontendWidth, height: frontendHeight } = await getFrontendBaseDimensions();
  
  // Calculate scaling factors
  const scaleX = frontendWidth / width;
  const scaleY = frontendHeight / height;
  
  // Convert coordinates
  const x = backendX * scaleX;
  const y = backendY * scaleY;
  
  return { x, y };
}

/**
 * Synchronous version for cases where dimensions are already known
 * @param backendX - X coordinate from backend
 * @param backendY - Y coordinate from backend
 * @param mapWidth - Map width in cm
 * @param mapHeight - Map height in cm
 * @param frontendWidth - Frontend width in pixels
 * @param frontendHeight - Frontend height in pixels
 * @returns Object with x and y in frontend pixel coordinates
 */
export function convertBackendToFrontendSync(
  backendX: number, 
  backendY: number, 
  mapWidth: number, 
  mapHeight: number,
  frontendWidth: number,
  frontendHeight: number
): { x: number; y: number } {
  // Calculate scaling factors
  const scaleX = frontendWidth / mapWidth;
  const scaleY = frontendHeight / mapHeight;
  
  // Convert coordinates
  const x = backendX * scaleX;
  const y = backendY * scaleY;
  
  return { x, y };
}

/**
 * Scales a dimension from backend (cm) to frontend (pixels)
 * @param backendSize - Size in cm from backend
 * @param dimension - 'width' or 'height' for proper scaling
 * @returns Size in frontend pixels
 */
export async function scaleBackendSize(backendSize: number, dimension: 'width' | 'height'): Promise<number> {
  const { width, height } = await getMapDimensions();
  const { width: frontendWidth, height: frontendHeight } = await getFrontendBaseDimensions();
  
  if (dimension === 'width') {
    return backendSize * (frontendWidth / width);
  } else {
    return backendSize * (frontendHeight / height);
  }
}

/**
 * Synchronous version of scaleBackendSize
 */
export function scaleBackendSizeSync(
  backendSize: number, 
  dimension: 'width' | 'height',
  mapWidth: number,
  mapHeight: number,
  frontendWidth: number,
  frontendHeight: number
): number {
  if (dimension === 'width') {
    return backendSize * (frontendWidth / mapWidth);
  } else {
    return backendSize * (frontendHeight / mapHeight);
  }
}

/**
 * Checks if coordinates are within valid bounds
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns true if within bounds
 */
export async function isWithinBounds(x: number, y: number): Promise<boolean> {
  const { width, height } = await getFrontendBaseDimensions();
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

/**
 * Gets color for asset based on type
 * @param assetType - Type of asset from backend
 * @returns CSS color string
 */
export function getAssetColor(assetType: string | null): string {
  if (!assetType) return '#9CA3AF'; // gray for unknown
  
  const colorMap: { [key: string]: string } = {
    'playground': '#FFD700',
    'dogpark': '#22C55E',
    'dog park': '#22C55E',
    'restroom': '#ADD8E6',
    'baseball': '#EF4444',
    'baseball field': '#EF4444',
    'default': '#9CA3AF'
  };
  
  const type = assetType.toLowerCase();
  return colorMap[type] || colorMap['default'];
}

/**
 * Gets default size for asset based on type (fallback when physical dimensions not available)
 * @param assetType - Type of asset from backend
 * @returns Object with width and height in frontend pixels
 */
export function getDefaultAssetSize(assetType: string | null): { width: number; height: number } {
  if (!assetType) return { width: 60, height: 60 };
  
  const sizeMap: { [key: string]: { width: number; height: number } } = {
    'playground': { width: 80, height: 40 },
    'dogpark': { width: 100, height: 100 },
    'dog park': { width: 100, height: 100 },
    'restroom': { width: 55, height: 30 },
    'baseball': { width: 90, height: 90 },
    'baseball field': { width: 90, height: 90 },
    'default': { width: 60, height: 60 }
  };
  
  const type = assetType.toLowerCase();
  return sizeMap[type] || sizeMap['default'];
}

/**
 * Converts physical dimensions (cm) to frontend display dimensions (pixels)
 * @param physicalWidth - Physical width in cm
 * @param physicalHeight - Physical height in cm
 * @returns Object with width and height in frontend pixels
 */
export async function convertPhysicalToDisplaySize(physicalWidth: number, physicalHeight: number): Promise<{ width: number; height: number }> {
  const { width, height } = await getMapDimensions();
  const { width: frontendWidth, height: frontendHeight } = await getFrontendBaseDimensions();
  
  // Convert physical dimensions to frontend coordinates using the same scaling as coordinates
  const scaleX = frontendWidth / width;
  const scaleY = frontendHeight / height;
  
  return {
    width: physicalWidth * scaleX,
    height: physicalHeight * scaleY
  };
}

/**
 * Synchronous version of convertPhysicalToDisplaySize
 */
export function convertPhysicalToDisplaySizeSync(
  physicalWidth: number, 
  physicalHeight: number,
  mapWidth: number,
  mapHeight: number,
  frontendWidth: number,
  frontendHeight: number
): { width: number; height: number } {
  const scaleX = frontendWidth / mapWidth;
  const scaleY = frontendHeight / mapHeight;
  
  return {
    width: physicalWidth * scaleX,
    height: physicalHeight * scaleY
  };
}

