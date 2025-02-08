export interface AverageRents {
    [key: string]: {
        rent: number;
        sampleSize: number;
    };
}

export interface RentRange {
    minSize: number;
    maxSize: number;
    averageRents: AverageRents;
}

export interface RentalData {
    city: string;
    rentData: RentRange[];
}

const cities = [
    'zagreb', 'split', 'rijeka', 'osijek', 'zadar', 
    'velika-gorica', 'pula', 'varazdin', 'karlovac', 
    'slavonski-brod', 'solin'
];

async function parseCSVContent(content: string): Promise<RentRange[]> {
    const lines = content.split('\n').filter(line => line.trim());
    const rentRanges: RentRange[] = [];
    let currentRange: RentRange | null = null;

    for (const line of lines) {
        if (line.startsWith('Average Rent for')) {
            // Extract size range from the header
            const sizeMatch = line.match(/(\d+)(?:\s*-\s*(\d+)|[+])/);
            if (sizeMatch) {
                if (currentRange) {
                    rentRanges.push(currentRange);
                }
                currentRange = {
                    minSize: parseInt(sizeMatch[1]),
                    maxSize: sizeMatch[2] ? parseFloat(sizeMatch[2]) : 999999,
                    averageRents: {}
                };
            }
        } else if (currentRange && line.includes(',')) {
            const [neighborhood, rent, sampleSize] = line.split(',');
            if (neighborhood !== 'Neighborhood') { // Skip header row
                currentRange.averageRents[neighborhood] = {
                    rent: parseInt(rent.replace('€', '')),
                    sampleSize: parseInt(sampleSize)
                };
            }
        }
    }

    if (currentRange) {
        rentRanges.push(currentRange);
    }

    return rentRanges;
}

export async function loadRentalData(): Promise<RentalData[]> {
    const rentalData: RentalData[] = [];

    try {
        await Promise.all(cities.map(async (city) => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}generated_data/${city}.csv`);
                const content = await response.text();
                const rentRanges = await parseCSVContent(content);
                
                // Format city name consistently
                const formattedCity = city.split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                rentalData.push({
                    city: formattedCity,
                    rentData: rentRanges
                });
            } catch (error) {
                console.error(`Error loading data for ${city}:`, error);
            }
        }));

        return rentalData;
    } catch (error) {
        console.error('Error loading rental data:', error);
        return [];
    }
}

export const initializeRentalData = async (): Promise<RentalData[]> => {
    return await loadRentalData();
};
