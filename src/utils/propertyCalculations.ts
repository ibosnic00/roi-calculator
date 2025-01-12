import { Property } from '../types/Property';

interface CalculationParameters {
  sp500Return: number;
  baseAppreciation: number;
  years: number;
  initialValueProperty: number | null;
  calculationMethod: 'appreciation' | 'roi_plus_appreciation' | 'appreciation_minus_maintenance' | 'roi_plus_appreciation_minus_maintenance';
}

export const calculatePropertyValue = (
  property: Property,
  parameters: CalculationParameters,
  year: number
): number => {
  const initialValue = property.expectedPrice;
  let value = initialValue;

  // Calculate yearly value based on selected method
  for (let i = 0; i < year; i++) {
    const appreciation = value * (parameters.baseAppreciation / 100);
    const maintenance = property.maintenanceCostPerSqm * property.apartmentSize;
    const roi = (property.monthlyRent * 12);

    switch (parameters.calculationMethod) {
      case 'appreciation':
        value += appreciation;
        break;
      case 'roi_plus_appreciation':
        value += appreciation + roi;
        break;
      case 'appreciation_minus_maintenance':
        value += appreciation - maintenance;
        break;
      case 'roi_plus_appreciation_minus_maintenance':
        value += appreciation + roi - maintenance;
        break;
    }
  }

  return value;
};

export const calculateReturnPercentage = (
  property: Property,
  parameters: CalculationParameters,
  years: number
): number => {
  const initialValue = property.expectedPrice + property.renovationCost;
  const finalValue = calculatePropertyValue(property, parameters, years);
  return ((finalValue - initialValue) / initialValue) * 100;
}; 