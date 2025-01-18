import { Card } from './Card'
import '../styles/InvestmentComparisonDetails.css'

interface InvestmentComparisonDetailsProps {
    InitialValue: number
    BankLoanLengthInYears: number
    TotalInvestmentLength: number
    TotalAppreciation: number
    TotalMaintenance: number
    BankLoanAmount: number
    TotalInterest: number
    DownpaymentAmount: number
    TotalRentIncome: number
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

export function InvestmentComparisonDetails({
    InitialValue,
    BankLoanLengthInYears,
    TotalInvestmentLength,
    TotalAppreciation,
    TotalMaintenance,
    BankLoanAmount,
    TotalInterest,
    DownpaymentAmount,
    TotalRentIncome,
}: InvestmentComparisonDetailsProps) {
    const withAppreciation = InitialValue + TotalAppreciation
    const afterMaintenance = withAppreciation - TotalMaintenance
    const withoutInterest = afterMaintenance + TotalRentIncome
    const withInterest = withoutInterest - TotalInterest

    const rentPerYear = TotalRentIncome / TotalInvestmentLength
    const rentPerMonth = rentPerYear / 12

    return (
        <div className="investment-container">
            <div className="left-column">
                <Card className="initial-values">
                    <h2>INITIAL VALUES</h2>
                    <div className="values-content">
                        <p className="amount">{formatCurrency(InitialValue)}</p>
                        <p className="years">{TotalInvestmentLength} YEARS</p>
                    </div>
                </Card>

                <div className="financial-breakdown">
                    <div className="bank-loan">
                        <p>
                            <span>BANK LOAN</span>
                            <span>{formatCurrency(BankLoanAmount)}</span>
                        </p>
                        <p className="loan-years">{BankLoanLengthInYears} YEARS</p>
                    </div>
                    <div className="interest">
                        <p>
                            <span>INTEREST</span>
                            <span>{formatCurrency(TotalInterest)}</span>
                        </p>
                    </div>
                    <div className="downpayment">
                        <p>
                            <span>DOWNPAYMENT</span>
                            <span>{formatCurrency(DownpaymentAmount)}</span>
                        </p>
                    </div>
                    <div className="rent">
                        <p>
                            <span>RENT</span>
                            <span>{formatCurrency(TotalRentIncome)}</span>
                        </p>
                        <p className="rent-breakdown">
                            <span>per year</span>
                            <span>{formatCurrency(rentPerYear)}</span>
                        </p>
                        <p className="rent-breakdown">
                            <span>per month</span>
                            <span>{formatCurrency(rentPerMonth)}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="right-column">
                <div className="appreciation-section">
                    <div className="with-appreciation">
                        <h3>WITH APPRECIATION</h3>
                        <p className="amount">{formatCurrency(withAppreciation)}</p>
                        <p className="detail">Appreciation: {formatCurrency(TotalAppreciation)}</p>
                    </div>
                    <div className="after-maintenance">
                        <p>
                            <span>After Maintenance</span>
                            <span>{formatCurrency(afterMaintenance)}</span>
                        </p>
                        <p className="maintenance-detail">
                            Maintenance: {formatCurrency(TotalMaintenance)}
                        </p>
                    </div>
                </div>

                <Card className="comparison-section">
                    <h3>COMPARISON</h3>
                    <div className="comparison-content">
                        <div className="with-interest">
                            <p>
                                <span>WITH INTEREST</span>
                                <span>{formatCurrency(withInterest)}</span>
                            </p>
                        </div>
                        <div className="without-interest">
                            <p>
                                <span>WITHOUT INTEREST</span>
                                <span>{formatCurrency(withoutInterest)}</span>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}