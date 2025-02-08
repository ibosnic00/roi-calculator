export interface Property {
  id: number;
  askingPrice: number;
  expectedPrice: number;
  apartmentSize: number;
  district: string;
  neighborhoodz?: string;
  renovationCost: number;
  monthlyRent: number;
  customRent?: number;
  additionalCosts?: number;
  roi: number;
  notes: string;
  year: string;
  maintenanceCostPerSqm: number;
  link?: string;
  isFavorite?: boolean;
  isSold?: boolean;
  isCustomRent?: boolean;
  city: string;
} 