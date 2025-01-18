import { Investment, ChartData, SummaryData } from '../types/Investment';


export const calculateMortgagePayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)
    / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

export const generateInvestmentData = (investment: Investment, years: number = 30, rentTax: number = 0.13): ChartData[] => {
  const data: ChartData[] = [];
  const monthlyPayment = investment.type.includes('loan') && investment.interestRate && investment.loanTerm
    ? calculateMortgagePayment(investment.loanAmount || 0, investment.interestRate, investment.loanTerm)
    : 0;

  let currentValue = investment.initialAmount;
  let rentIncome = 0;
  let bankLoanPaidAmount = 0;
  let bankInterestPaidAmount = 0;
  let yearlyLoanPayment = monthlyPayment * 12;
  let yearlyMaintenanceAmount = 0;
  const loanWithInterest = yearlyLoanPayment * (investment.loanTerm || 0);
  let remainingLoans = investment.type.includes('loan') ? loanWithInterest : 0;
  let remainingInterest = remainingLoans - (investment.loanAmount || 0);
  const yearlyInterest = remainingInterest / (investment.loanTerm || 0);
  // Calculate property appreciation based on calculation method
  const propertyAppreciation = (investment.propertyAppreciation || 0) / 100;
  const yearlyRent = (investment.monthlyRent || 0) * 12 * (1 - rentTax);
  const maintenancePercentage = 0.01;
  let totalMaintenance = 0;

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      if (investment.type.includes('property')) {
        let propertyValueIncreaseFactor = 0;
        let maintenanceDecreaseFactor = 0;
        yearlyMaintenanceAmount = 0;

        switch (investment.calculationMethod) {
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
      } else if (investment.type.includes('sp500')) {
        const return_rate = (investment.sp500Return || 0) / 100;

        if (investment.type === 'sp500_monthly' && investment.monthlyContribution) {
          // For monthly contributions, add them throughout the year with compound interest
          for (let month = 0; month < 12; month++) {
            currentValue *= (1 + return_rate / 12); // Monthly compound interest on existing value
            currentValue += Number(investment.monthlyContribution); // Add monthly contribution
          }
        } else {
          currentValue *= (1 + return_rate); // Annual compound interest
        }
      }
      // Subtract mortgage payments only if loan is not yet paid off
      if (investment.type.includes('loan') && remainingInterest > 0) {
        const paymentThisYear = Math.min(yearlyLoanPayment, remainingLoans);
        const interestThisYear = Math.min(yearlyInterest, remainingInterest);
        bankLoanPaidAmount += paymentThisYear;
        bankInterestPaidAmount += interestThisYear;
        remainingLoans -= paymentThisYear;
        remainingInterest -= interestThisYear;
      }
    }

    let dataToPush = 0;
    switch (investment.calculationMethod) {
      case 'roi':
      case 'roi_plus_appreciation':
        dataToPush = currentValue + rentIncome;
        break;
      case 'roi_minus_maintenance':
        dataToPush = currentValue + rentIncome - totalMaintenance;
        break;
      case 'roi_plus_appreciation_minus_maintenance':
        dataToPush = currentValue + rentIncome - bankInterestPaidAmount - totalMaintenance;
        break;
      case 'appreciation_minus_maintenance':
      default: // 'appreciation'        
        dataToPush = currentValue - totalMaintenance;
        break;
    }

    data.push({
      year,
      [`investment-${investment.id}`]: dataToPush
    });
  }



  return data;
};

export const generateSummaryData = (investment: Investment, years: number = 30, rentTax: number = 0.13): SummaryData => {
  const data: SummaryData = {
    initialValue: investment.initialAmount,
    totalInvestmentLengthInYears: years,
    totalApreciation: 0,
    totalRentIncome: 0,
    totalMaintenance: 0,
    bankLoanLengthInYears: investment.loanTerm || 0,
    bankLoanAmount: investment.loanAmount || 0,
    downpayment: 0,
    totalLoanInterest: 0,
  };


  let currentValue = data.initialValue;
  let rentIncome = 0;
  let bankLoanPaidAmount = 0;
  let maintenance = 0;

  let originalLoan = data.bankLoanAmount;
  const monthlyPayment = investment.type.includes('loan') && investment.interestRate && investment.loanTerm
    ? calculateMortgagePayment(investment.loanAmount || 0, investment.interestRate, investment.loanTerm)
    : 0;
  const loanWithInterest = monthlyPayment * 12 * (investment.loanTerm || 0);
  let remainingLoan = investment.type.includes('loan') ? loanWithInterest : 0;
  let yearlyLoanReturn = (remainingLoan) / (investment.loanTerm || 0);

  // Calculate property appreciation based on calculation method
  const propertyAppreciation = (investment.propertyAppreciation || 0) / 100;
  const yearlyRent = (investment.monthlyRent || 0) * 12 * (1 - rentTax);
  const maintenancePercentage = 0.01;

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      if (investment.type.includes('property')) {
        rentIncome += yearlyRent;
        currentValue = Number((currentValue * (1 + propertyAppreciation)).toFixed(0));
        maintenance += Number((currentValue * maintenancePercentage).toFixed(0));

      } else if (investment.type.includes('sp500')) {
        const return_rate = (investment.sp500Return || 0) / 100;

        if (investment.type === 'sp500_monthly' && investment.monthlyContribution) {
          // For monthly contributions, add them throughout the year with compound interest
          for (let month = 0; month < 12; month++) {
            currentValue *= (1 + return_rate / 12); // Monthly compound interest on existing value
            currentValue += Number(investment.monthlyContribution); // Add monthly contribution
            data.initialValue += Number(investment.monthlyContribution);
          }
        } else {
          currentValue *= (1 + return_rate); // Annual compound interest
        }
      }
      // Subtract mortgage payments only if loan is not yet paid off
      if (investment.type.includes('loan') && remainingLoan > 0) {
        const paymentThisYear = Math.min(yearlyLoanReturn, remainingLoan);
        bankLoanPaidAmount += paymentThisYear;
        remainingLoan -= paymentThisYear;
      }
    }
  }

  data.totalApreciation = currentValue - data.initialValue;
  data.totalRentIncome = rentIncome;
  data.totalMaintenance = maintenance;
  data.totalLoanInterest = (loanWithInterest - originalLoan);
  data.downpayment = data.initialValue - originalLoan;


  return data;
};

export const mergeChartData = (investmentsData: ChartData[][]): ChartData[] => {
  const mergedData: ChartData[] = [];

  investmentsData.forEach(investmentData => {
    investmentData.forEach((dataPoint, index) => {
      if (!mergedData[index]) {
        mergedData[index] = { year: dataPoint.year };
      }
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key !== 'year') {
          mergedData[index][key] = value;
        }
      });
    });
  });

  return mergedData;
}; 