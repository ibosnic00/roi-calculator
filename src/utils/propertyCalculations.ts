import { Property } from '../types/Property';

interface CalculationParameters {
  sp500Return: number;
  baseAppreciation: number;
  years: number;
  initialValueProperty: number | null;
  calculationMethod: 'roi' | 'roi_minus_maintenance' | 'appreciation' | 'roi_plus_appreciation' | 'appreciation_minus_maintenance' | 'roi_plus_appreciation_minus_maintenance';
}

export const calculatePropertyValue = (
  property: Property,
  parameters: CalculationParameters,
  year: number
): number => {
  let currentValue = property.expectedPrice;
  let rentIncome = 0;
  const rentTax = 0.13;

  // Calculate yearly value based on selected method
  for (let i = 0; i < year; i++) {
    const propertyAppreciation = (parameters.baseAppreciation || 0) / 100;
    const maintenance = property.maintenanceCostPerSqm * property.apartmentSize;


    const yearlyRent = (property.monthlyRent || 0) * 12 * (1 - rentTax);
    const maintenancePercentage = maintenance / currentValue;

    let totalReturn = propertyAppreciation;

    switch (parameters.calculationMethod) {
      case 'roi':
        totalReturn = 0;
        rentIncome += yearlyRent;
        break;
      case 'roi_minus_maintenance':
        totalReturn = -maintenancePercentage;
        rentIncome += yearlyRent;
        break;
      case 'roi_plus_appreciation':
        totalReturn = propertyAppreciation;
        rentIncome += yearlyRent;
        break;
      case 'appreciation_minus_maintenance':
      case 'roi_plus_appreciation_minus_maintenance':
        totalReturn = Number((propertyAppreciation - maintenancePercentage).toFixed(2));
        rentIncome += yearlyRent;
        break;
      default: // 'appreciation'
        totalReturn = propertyAppreciation;
        break;
    }
    currentValue *= (1 + totalReturn);

  }

  return currentValue + rentIncome;
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