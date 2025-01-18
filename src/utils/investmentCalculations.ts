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
  let yearlyLoanPayment = monthlyPayment * 12;
  const loanWithInterest = yearlyLoanPayment * (investment.loanTerm || 0);
  let remainingLoans = investment.type.includes('loan') ? loanWithInterest : 0;
  let remainingInterest = (remainingLoans) / (investment.loanTerm || 0);

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      if (investment.type.includes('property')) {
        // Calculate property appreciation based on calculation method
        const propertyAppreciation = (investment.propertyAppreciation || 0) / 100;
        const yearlyRent = (investment.monthlyRent || 0) * 12 * (1 - rentTax);
        const maintenancePercentage = 0.01;

        let totalReturn = 0;

        switch (investment.calculationMethod) {
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
        bankLoanPaidAmount += paymentThisYear;
        remainingLoans -= paymentThisYear;
      }
    }

    let dataToPush = 0;
    switch (investment.calculationMethod) {
      case 'roi':
      case 'roi_plus_appreciation':
      case 'roi_minus_maintenance':
        dataToPush = currentValue + rentIncome;
        break;
      case 'roi_plus_appreciation_minus_maintenance':
        dataToPush = currentValue + rentIncome - bankLoanPaidAmount;
        break;
      case 'appreciation_minus_maintenance':
      default: // 'appreciation'        
        dataToPush = currentValue;
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
        currentValue *= (1 + propertyAppreciation);
        maintenance += currentValue * maintenancePercentage;

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