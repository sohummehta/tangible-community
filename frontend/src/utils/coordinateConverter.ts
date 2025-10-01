/**
 * Coordinate Conversion Utilities
 * 
 * Backend coordinates: Map coordinates in cm (0-35 width, 0-23 height)
 * Frontend coordinates: Canvas system (600x394 base dimensions, auto-calculated from physical aspect ratio)
 */

// Backend map dimensions in cm
const BACKEND_MAP_WIDTH = 35;
const BACKEND_MAP_HEIGHT = 23;

// Frontend base dimensions
export const FRONTEND_BASE_WIDTH = 600;
export const FRONTEND_BASE_HEIGHT = Math.round(FRONTEND_BASE_WIDTH / (BACKEND_MAP_WIDTH / BACKEND_MAP_HEIGHT)); 
/**
 * Converts backend map coordinates (in cm) to frontend pixel coordinates
 * @param backendX - X coordinate from backend (0-35 cm)
 * @param backendY - Y coordinate from backend (0-23 cm)
 * @returns Object with x and y in frontend pixel coordinates
 */
export function convertBackendToFrontend(backendX: number, backendY: number): { x: number; y: number } {
  // Calculate scaling factors
  const scaleX = FRONTEND_BASE_WIDTH / BACKEND_MAP_WIDTH;
  const scaleY = FRONTEND_BASE_HEIGHT / BACKEND_MAP_HEIGHT;
  
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
export function scaleBackendSize(backendSize: number, dimension: 'width' | 'height'): number {
  if (dimension === 'width') {
    return backendSize * (FRONTEND_BASE_WIDTH / BACKEND_MAP_WIDTH);
  } else {
    return backendSize * (FRONTEND_BASE_HEIGHT / BACKEND_MAP_HEIGHT);
  }
}

/**
 * Checks if coordinates are within valid bounds
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns true if within bounds
 */
export function isWithinBounds(x: number, y: number): boolean {
  return x >= 0 && x <= FRONTEND_BASE_WIDTH && y >= 0 && y <= FRONTEND_BASE_HEIGHT;
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
export function convertPhysicalToDisplaySize(physicalWidth: number, physicalHeight: number): { width: number; height: number } {
  // Convert physical dimensions to frontend coordinates using the same scaling as coordinates
  const scaleX = FRONTEND_BASE_WIDTH / BACKEND_MAP_WIDTH;
  const scaleY = FRONTEND_BASE_HEIGHT / BACKEND_MAP_HEIGHT;
  
  return {
    width: physicalWidth * scaleX,
    height: physicalHeight * scaleY
  };
}

