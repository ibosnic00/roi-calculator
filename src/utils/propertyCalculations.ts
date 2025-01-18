import { Property } from '../types/Property';

interface CalculationParameters {
  sp500Return: number;
  baseAppreciation: number;
  years: number;
  initialValueProperty: number | null;
  calculationMethod: 'roi' | 'roi_minus_maintenance' | 'appreciation' | 'roi_plus_appreciation' | 'appreciation_minus_maintenance' | 'roi_plus_appreciation_minus_maintenance';
}

interface DataPoint {
  year: number;
  [key: string]: number;
}

interface VisibleLines {
  [key: string]: boolean;
  sp500Value: boolean;
}

export const calculatePropertyValue = (
  property: Property,
  parameters: CalculationParameters,
  years: number
): number => {
  let currentValue = property.expectedPrice;
  let rentIncome = 0;
  let bankLoanPaidAmount = 0;
  let yearlyMaintenanceAmount = 0;
  let dataToReturn = 0;
  const rentTax = 0.13;
  // Calculate property appreciation based on calculation method
  const propertyAppreciation = (parameters.baseAppreciation || 0) / 100;
  const yearlyRent = (property.monthlyRent || 0) * 12 * (1 - rentTax);
  const maintenance = property.maintenanceCostPerSqm * property.apartmentSize;
  const maintenancePercentage = maintenance / currentValue;
  let totalMaintenance = 0;

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      let propertyValueIncreaseFactor = 0;
      let maintenanceDecreaseFactor = 0;
      yearlyMaintenanceAmount = 0;

      switch (parameters.calculationMethod) {
        case 'roi':
          rentIncome += yearlyRent;
          break;
        case 'roi_minus_maintenance':
          maintenanceDecreaseFactor = maintenancePercentage;
          rentIncome += yearlyRent;
          break;
        case 'roi_plus_appreciation':
          propertyValueIncreaseFactor = propertyAppreciation;
          rentIncome += yearlyRent;
          break;
        case 'appreciation_minus_maintenance':
        case 'roi_plus_appreciation_minus_maintenance':
          propertyValueIncreaseFactor = propertyAppreciation;
          maintenanceDecreaseFactor = maintenancePercentage;
          rentIncome += yearlyRent;
          break;
        default: // 'appreciation'
          propertyValueIncreaseFactor = propertyAppreciation;
          break;
      }

      currentValue = Number((currentValue * (1 + propertyValueIncreaseFactor)).toFixed(0));
      yearlyMaintenanceAmount = Number((currentValue * maintenanceDecreaseFactor).toFixed(0));
      totalMaintenance += yearlyMaintenanceAmount;
    }

    switch (parameters.calculationMethod) {
      case 'roi':
      case 'roi_plus_appreciation':
        dataToReturn = currentValue + rentIncome;
        break;
      case 'roi_minus_maintenance':
        dataToReturn = currentValue + rentIncome - totalMaintenance;
        break;
      case 'roi_plus_appreciation_minus_maintenance':
        dataToReturn = currentValue + rentIncome - bankLoanPaidAmount - totalMaintenance;
        break;
      case 'appreciation_minus_maintenance':
      default: // 'appreciation'        
        dataToReturn = currentValue - totalMaintenance;
        break;
    }
  }

  return dataToReturn;
};

export const calculateValues = (
  properties: Property[],
  parameters: CalculationParameters,
  visibleLines: VisibleLines,
  setVisibleLines: (value: React.SetStateAction<VisibleLines>) => void
): DataPoint[] => {
  const data: DataPoint[] = [];

  const selectedProperty = properties.find(p => p.id === parameters.initialValueProperty) || properties[0];
  const initialSP500Value = selectedProperty ? (selectedProperty.expectedPrice + selectedProperty.renovationCost) : 0;
  let sp500Value = initialSP500Value;

  for (let year = 0; year <= parameters.years; year++) {
    data[year] = {
      year,
      ...(visibleLines.sp500Value && {
        sp500Value: Math.round(sp500Value)
      })
    };
    sp500Value *= (1 + parameters.sp500Return / 100);
  }

  properties.forEach((property) => {
    const propertyKey = `property-${property.id}`;
    // Initialize visibility for new properties
    if (visibleLines[propertyKey] === undefined) {
      setVisibleLines(prev => ({
        ...prev,
        [propertyKey]: true
      }));
    }
    if (visibleLines[propertyKey]) {
      let currentValue = property.expectedPrice;
      let rentIncome = 0;
      let bankLoanPaidAmount = 0;
      let yearlyMaintenanceAmount = 0;
      let dataToReturn = 0;
      const rentTax = 0.13;
      // Calculate property appreciation based on calculation method
      const propertyAppreciation = (parameters.baseAppreciation || 0) / 100;
      const yearlyRent = (property.monthlyRent || 0) * 12 * (1 - rentTax);
      const maintenance = property.maintenanceCostPerSqm * property.apartmentSize;
      const maintenancePercentage = maintenance / currentValue;
      let totalMaintenance = 0;

      for (let year = 0; year <= parameters.years; year++) {
        if (year > 0) {
          let propertyValueIncreaseFactor = 0;
          let maintenanceDecreaseFactor = 0;
          yearlyMaintenanceAmount = 0;

          switch (parameters.calculationMethod) {
            case 'roi':
              rentIncome += yearlyRent;
              break;
            case 'roi_minus_maintenance':
              maintenanceDecreaseFactor = maintenancePercentage;
              rentIncome += yearlyRent;
              break;
            case 'roi_plus_appreciation':
              propertyValueIncreaseFactor = propertyAppreciation;
              rentIncome += yearlyRent;
              break;
            case 'appreciation_minus_maintenance':
            case 'roi_plus_appreciation_minus_maintenance':
              propertyValueIncreaseFactor = propertyAppreciation;
              maintenanceDecreaseFactor = maintenancePercentage;
              rentIncome += yearlyRent;
              break;
            default: // 'appreciation'
              propertyValueIncreaseFactor = propertyAppreciation;
              break;
          }

          currentValue = Number((currentValue * (1 + propertyValueIncreaseFactor)).toFixed(0));
          yearlyMaintenanceAmount = Number((currentValue * maintenanceDecreaseFactor).toFixed(0));
          totalMaintenance += yearlyMaintenanceAmount;
        }

        switch (parameters.calculationMethod) {
          case 'roi':
          case 'roi_plus_appreciation':
            dataToReturn = currentValue + rentIncome;
            break;
          case 'roi_minus_maintenance':
            dataToReturn = currentValue + rentIncome - totalMaintenance;
            break;
          case 'roi_plus_appreciation_minus_maintenance':
            dataToReturn = currentValue + rentIncome - bankLoanPaidAmount - totalMaintenance;
            break;
          case 'appreciation_minus_maintenance':
          default: // 'appreciation'        
            dataToReturn = currentValue - totalMaintenance;
            break;
        }

        data[year][propertyKey] = Number((dataToReturn).toFixed(0));
      }
    }
  });

  return data;
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