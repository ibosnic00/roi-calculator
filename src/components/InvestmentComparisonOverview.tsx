import '../styles/InvestmentComparisonOverview.css'

interface InvestmentComparisonOverviewProps {
    InitialValue: number
    BankLoanLengthInYears: number
    TotalInvestmentLength: number
    BankLoanAmount: number
    TotalInterest: number
    DownpaymentAmount: number
    TotalRentIncome: number
    TotalAppreciation: number
    TotalMaintenance: number
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

export function InvestmentComparisonOverview({
    InitialValue,
    BankLoanLengthInYears,
    TotalInvestmentLength,
    BankLoanAmount,
    TotalInterest,
    DownpaymentAmount,
    TotalRentIncome,
    TotalAppreciation,
    TotalMaintenance,
}: InvestmentComparisonOverviewProps) {
    const rentPerYear = TotalRentIncome / TotalInvestmentLength
    const rentPerMonth = rentPerYear / 12
    const finalTotal = TotalRentIncome + TotalAppreciation - TotalMaintenance - TotalInterest + InitialValue
    const monthlyPayment = (BankLoanAmount + TotalInterest) / BankLoanLengthInYears / 12

    return (
        <div className="investment-overview">
            <div className="overview-grid">
                {/* Initial Values Section */}
                <div className="overview-box initial-values">
                    <h2>INITIAL VALUES</h2>
                    <div className="value-content">
                        <div className="amount">{formatCurrency(InitialValue)}</div>
                        <div className="years">{TotalInvestmentLength} years</div>
                    </div>
                </div>

                {/* Bank Loan Section */}
                <div className="overview-box loan-breakdown">
                    <h2>BANK LOAN</h2>
                    <div className="loan-content">
                        <div className="loan-amount">
                            <span>{formatCurrency(BankLoanAmount)}</span>
                            <span>LOAN</span>
                        </div>
                        <div className="loan-years">
                            <span>{BankLoanLengthInYears}</span>
                            <span>YEARS</span>
                        </div>
                        <div className="loan-interest">
                            <span>{formatCurrency(TotalInterest)}</span>
                            <span className="label">INTEREST</span>
                        </div>
                        <div className="loan-interest">
                            <span>{formatCurrency(monthlyPayment)}</span>
                            <span className="label">MONTHLY PAYMENT</span>
                        </div>
                        <div className="loan-downpayment">
                            <span>{formatCurrency(DownpaymentAmount)}</span>
                            <span className="label">downpayment</span>
                        </div>
                    </div>
                </div>

                {/* After Investment Section */}
                <div className="overview-box after-investment">
                    <h2>AFTER INVESTMENT</h2>
                    <div className="investment-content">
                        <div className="rent-section">
                            <div className="rent-total">
                                <span>+ RENT</span>
                                <span>{formatCurrency(TotalRentIncome)}</span>
                            </div>
                            <div className="rent-breakdown">
                                <div>per year {formatCurrency(rentPerYear)}</div>
                                <div>per month {formatCurrency(rentPerMonth)}</div>
                            </div>
                        </div>
                        <div className="appreciation">
                            <span>+ APPRECIATION</span>
                            <span>{formatCurrency(TotalAppreciation)}</span>
                        </div>
                        <div className="maintenance">
                            <span>- MAINTENANCE</span>
                            <span>{formatCurrency(TotalMaintenance)}</span>
                        </div>
                        <div className="interest-deduction">
                            <span>- INTEREST</span>
                            <span>{formatCurrency(TotalInterest)}</span>
                        </div>
                        <div className="final-total">
                            <span>{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

