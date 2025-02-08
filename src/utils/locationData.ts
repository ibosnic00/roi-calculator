interface LocationData {
  [city: string]: {
    [district: string]: string[];
  };
}

export async function loadLocationData(): Promise<LocationData> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}neighbourhood_configuration.json`);
    if (!response.ok) {
      throw new Error('Failed to load neighborhood configuration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading location data:', error);
    return {};
  }
}

export function getAllNeighborhoods(locationData: LocationData): string[] {
  const allNeighborhoods = new Set<string>();
  
  Object.values(locationData).forEach((cityData) => {
    Object.values(cityData).forEach((districts) => {
      districts.forEach(neighborhood => {
        allNeighborhoods.add(neighborhood);
      });
    });
  });

  return Array.from(allNeighborhoods).sort();
}

export function getCityNeighborhoods(locationData: LocationData, city: string): string[] {
  if (!locationData[city]) return [];
  
  const cityNeighborhoods = new Set<string>();
  Object.values(locationData[city]).forEach((districts) => {
    districts.forEach(neighborhood => {
      cityNeighborhoods.add(neighborhood);
    });
  });

  return Array.from(cityNeighborhoods).sort();
} 