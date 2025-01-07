export interface Property {
  id: number;
  askingPrice: number;
  expectedPrice: number;
  apartmentSize: number;
  neighborhood: string;
  renovationCost: number;
  monthlyRent: number;
  roi: number;
  notes: string;
  year: string;
  maintenanceCostPerSqm: number;
  link?: string;
} 