import { loadLocationData } from './locationData';

interface District {
    name: string;
    averageRentSmall: number | null;
    averageRentMedium: number | null;
    averageRentLarge: number | null;
}

interface CityData {
    districts: District[];
}

interface LocationData {
    [city: string]: CityData;
}

export const getAverageRentFromContext = async (city: string, district: string, size: number): Promise<number | null> => {
    const locationData: LocationData = await loadLocationData();
    const cityData = locationData[city];
    if (!cityData) return null;

    const districtData = cityData.districts.find((d: District) => d.name === district);
    if (!districtData) return null;

    // Find the appropriate size range and return the average rent
    if (size <= 35) {
        return districtData.averageRentSmall || null;
    } else if (size <= 60) {
        return districtData.averageRentMedium || null;
    } else {
        return districtData.averageRentLarge || null;
    }
}; 