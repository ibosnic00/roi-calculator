export type InvestmentType = 
  | 'property_cash' 
  | 'property_loan' 
  | 'sp500_cash' 
  | 'sp500_loan'
  | 'sp500_monthly';

export type CalculationMethod = 
  | 'appreciation'
  | 'roi'
  | 'roi_minus_maintenance'
  | 'roi_plus_appreciation'
  | 'appreciation_minus_maintenance'
  | 'roi_plus_appreciation_minus_maintenance';

export interface Investment {
  id: number;
  type: InvestmentType;
  calculationMethod?: CalculationMethod;
  initialAmount: number;
  loanAmount?: number;
  monthlyRent?: number;
  interestRate?: number;
  loanTerm?: number;
  propertyAppreciation?: number;
  sp500Return?: number;
  name: string;
  monthlyContribution?: number;
}

export interface DataPoint {
  year: number;
  value: number;
}

export interface ChartData {
  year: number;
  [key: string]: number;
} 


export interface SummaryData {
  initialValue: number;
  totalInvestmentLengthInYears: number;
  totalApreciation: number;
  totalRentIncome: number;
  totalMaintenance: number;
  bankLoanLengthInYears: number;
  bankLoanAmount: number;
  downpayment: number;
  totalLoanInterest: number;
} 