interface RentalRange {
    minSize: number;
    maxSize: number;
    averageRents: { [key: string]: number };
    averagePrice: number;
}

const rentalData: RentalRange[] = [
    {
        minSize: 71,
        maxSize: 99.99,
        averagePrice: 1122,
        averageRents: {
            "Podsljeme": 1252,
            "Donja Dubrava": 1223,
            "Donji Grad": 1332,
            "Črnomerec": 1200,
            "Trešnjevka - Sjever": 1220,
            "Podsused - Vrapče": 938,
            "Gornja Dubrava": 984,
            "Pešćenica - Žitnjak": 1039,
            "Novi Zagreb - Istok": 1003,
            "Stenjevec": 963,
            "Maksimir": 1213,
            "Trešnjevka - Jug": 1102,
            "Novi Zagreb - Zapad": 917,
            "Trnje": 1147,
            "Gornji Grad - Medveščak": 1206
        }
    },
    {
        minSize: 60,
        maxSize: 70.99,
        averagePrice: 909,
        averageRents: {
            "Stenjevec": 1060,
            "Gornja Dubrava": 958,
            "Pešćenica - Žitnjak": 961,
            "Podsused - Vrapče": 812,
            "Donji Grad": 1072,
            "Novi Zagreb - Istok": 904,
            "Trešnjevka - Sjever": 898,
            "Črnomerec": 858,
            "Novi Zagreb - Zapad": 744,
            "Gornji Grad - Medveščak": 994,
            "Trnje": 931,
            "Trešnjevka - Jug": 824,
            "Maksimir": 899
        }
    },
    {
        minSize: 46,
        maxSize: 59.99,
        averagePrice: 823,
        averageRents: {
            "Gornja Dubrava": 905,
            "Novi Zagreb - Zapad": 850,
            "Pešćenica - Žitnjak": 876,
            "Novi Zagreb - Istok": 809,
            "Donji Grad": 917,
            "Črnomerec": 795,
            "Stenjevec": 709,
            "Gornji Grad - Medveščak": 968,
            "Trešnjevka - Sjever": 753,
            "Trnje": 856,
            "Trešnjevka - Jug": 771,
            "Donja Dubrava": 625,
            "Maksimir": 771
        }
    },
    {
        minSize: 36,
        maxSize: 45.99,
        averagePrice: 697,
        averageRents: {
            "Donja Dubrava": 692,
            "Donji Grad": 834,
            "Trešnjevka - Sjever": 762,
            "Novi Zagreb - Zapad": 628,
            "Gornji Grad - Medveščak": 845,
            "Pešćenica - Žitnjak": 654,
            "Črnomerec": 653,
            "Stenjevec": 576,
            "Maksimir": 720,
            "Trešnjevka - Jug": 653,
            "Trnje": 650
        }
    },
    {
        minSize: 1,
        maxSize: 35.99,
        averagePrice: 536,
        averageRents: {
            "Pešćenica - Žitnjak": 576,
            "Donji Grad": 654,
            "Trešnjevka - Sjever": 542,
            "Novi Zagreb - Istok": 468,
            "Gornji Grad - Medveščak": 636,
            "Trešnjevka - Jug": 558,
            "Trnje": 586,
            "Novi Zagreb - Zapad": 442
        }
    }
];

export function getAverageRent(neighbourhood: string, sizeInSquareMeters: number): number | null {
    // Find the appropriate size range
    const range = rentalData.find(range => 
        sizeInSquareMeters >= range.minSize && sizeInSquareMeters <= range.maxSize
    );

    if (!range) {
        return null;
    }

    // Get the rent for the specified neighbourhood
    const rent = range.averageRents[neighbourhood];
    
    return rent || null;
}

export function getAvailableNeighbourhoods(): string[] {
    // Create a Set to store unique neighborhood names
    const neighbourhoodSet = new Set<string>();
    
    // Iterate through all rental ranges and collect neighborhood names
    rentalData.forEach(range => {
        Object.keys(range.averageRents).forEach(neighbourhood => {
            neighbourhoodSet.add(neighbourhood);
        });
    });
    
    // Convert Set to array and sort alphabetically
    return Array.from(neighbourhoodSet).sort();
}

// Export the data for potential other uses
export { rentalData };

export const getRentalData = () => rentalData; 