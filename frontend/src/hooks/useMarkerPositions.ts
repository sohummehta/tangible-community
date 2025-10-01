import { useState, useEffect } from 'react';

interface MarkerPosition {
  id: number;
  x: number;
  y: number;
  rotation: number;
  asset_name: string;
  asset_type: string | null;
  physical_width: number;
  physical_height: number;
}

export function useMarkerPositions() {
  const [markerPositions, setMarkerPositions] = useState<MarkerPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkerPositions = async () => {
    try {
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/get-marker-positions/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMarkerPositions(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marker positions');
      console.error('Error fetching marker positions:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately when component loads
    fetchMarkerPositions();
    
    // Set up interval to fetch every 5 seconds
    const interval = setInterval(fetchMarkerPositions, 5000);
    
    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  return { markerPositions, loading, error };
}

