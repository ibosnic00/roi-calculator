interface District {
    name: string;
    averageRentSmall: number | null;
    averageRentMedium: number | null;
    averageRentLarge: number | null;
}

interface CityData {
    districts: District[];
}

interface RentLocationData {
    [city: string]: CityData;
}

async function loadRentData(): Promise<RentLocationData> {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}rent_data.json`);
        if (!response.ok) {
            throw new Error('Failed to load rent data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading rent data:', error);
        return {};
    }
}

export const getAverageRentFromContext = async (city: string, district: string, size: number): Promise<number | null> => {
    const locationData = await loadRentData();
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