import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Investment, InvestmentType } from '../types/Investment';
import { AddInvestmentModal } from '../components/AddInvestmentModal';
import { generateSummaryData, generateInvestmentData, mergeChartData } from '../utils/investmentCalculations';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { InvestmentComparisonOverview } from '../components/InvestmentComparisonOverview';


export function InvestmentComparisonPage() {
  const colors = [
    '#55647e', // Purple
    '#F1C40F', // Bright Yellow
    '#E67E22', // Dark Orange
    '#008400', // Dark Green
    '#a460dc', // Violet
    '#E74C3C', // Red
    '#3498DB', // Blue
    '#1ABC9C', // Turquoise
    '#784491', // Deep Purple
    '#9b0303', // Sangria
    '#3b3b3b', // Dark Gray
    '#FFDCA3', // Light Orange
  ];

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const savedInvestments = localStorage.getItem('investments');
    return savedInvestments ? JSON.parse(savedInvestments) : [];
  });

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);

  const [years, setYears] = useState(() => {
    const savedParams = localStorage.getItem('graphParameters');
    return savedParams ? JSON.parse(savedParams).years : 30;
  });

  const [rentTax, setRentTax] = useState(13);

  const chartData = useMemo(() => {
    const allInvestmentsData = investments.map(investment =>
      generateInvestmentData(investment, years, rentTax / 100)
    );
    return mergeChartData(allInvestmentsData);
  }, [investments, years, rentTax]);

  const investmentOptions: { type: InvestmentType; label: string; }[] = [
    { type: 'property_cash', label: 'Property Bought with Cash' },
    { type: 'property_loan', label: 'Property Bought with Bank Loan' },
    { type: 'sp500_cash', label: 'S&P 500 Investment with Cash' },
    { type: 'sp500_loan', label: 'S&P 500 Investment with Bank Loan' },
    { type: 'sp500_monthly', label: 'S&P 500 Monthly Contribution' },
  ];

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowAddModal(true);
  };

  // Calculate summary data for each investment
  const summaryData = useMemo(() => {
    return investments.map(investment => {
      let summary = generateSummaryData(investment, years, rentTax / 100);

      return {
        name: investment.name,
        initialValue: summary.initialValue,
        totalInvestmentLengthInYears: summary.totalInvestmentLengthInYears,
        totalApreciation: summary.totalApreciation,
        totalRentIncome: summary.totalRentIncome,
        totalMaintenance: summary.totalMaintenance,
        bankLoanLengthInYears: summary.bankLoanLengthInYears,
        bankLoanAmount: summary.bankLoanAmount,
        downpayment: summary.downpayment,
        totalLoanInterest: summary.totalLoanInterest,
        calculationMethod: getCalculationMethodLabel(investment.calculationMethod, investment.type)
      };
    });
  }, [investments, years, rentTax]);

  // Add a helper function for formatting numbers
  function formatCurrency(value: number): string {
    return `€${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  const handleDelete = (investment: Investment) => {
    setDeletingInvestment(investment);
  };

  const confirmDelete = () => {
    if (deletingInvestment) {
      setInvestments(investments.filter(i => i.id !== deletingInvestment.id));
      setDeletingInvestment(null);
    }
  };

  // Add new state for selected investment details
  const [selectedInvestment, setSelectedInvestment] = useState<typeof summaryData[0] | null>(null);

  return (
    <div className="investment-comparison">
      <div className="page-header">
        <h2>Investment Comparison</h2>
      </div>
      <div className="page-header">
        <div className="add-investment-button-container">
          <button
            className="add-investment-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Investment
          </button>
        </div>
      </div>

      {investments.length > 0 && (
        <>
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Investment</th>
                  <th>Calculation Method</th>
                  <th>Details</th>
                  <th style={{ paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((summary, index) => (
                  <tr key={index}>
                    <td>{summary.name}</td>
                    <td>{summary.calculationMethod}</td>
                    <td>
                      <button 
                        className="details-button"
                        onClick={() => setSelectedInvestment(summary)}
                      >
                        View Details
                      </button>
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleEdit(investments[index])}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(investments[index])}
                        className="delete-button"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-controls">
            <div className="control-group">
              <label>Investment Period (Years)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Rent Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={rentTax}
                onChange={(e) => setRentTax(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="comparison-chart">
            <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : 400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                {investments.map((investment, index) => (
                  <Line
                    key={investment.id}
                    type="monotone"
                    dataKey={`investment-${investment.id}`}
                    name={investment.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {showAddModal && (
        <AddInvestmentModal
          onClose={() => {
            setShowAddModal(false);
            setEditingInvestment(null);
          }}
          onAdd={(investment) => {
            if (editingInvestment) {
              setInvestments(investments.map(i =>
                i.id === editingInvestment.id ? { ...investment, id: i.id } : i
              ));
            } else {
              setInvestments([...investments, { ...investment, id: Date.now() }]);
            }
            setShowAddModal(false);
            setEditingInvestment(null);
          }}
          options={investmentOptions}
          editingInvestment={editingInvestment}
        />
      )}

      {deletingInvestment && (
        <div className="modal-overlay" onClick={() => setDeletingInvestment(null)}>
          <div className="modal-content delete-confirmation" onClick={e => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{deletingInvestment.name}"?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="delete-button">Delete</button>
              <button onClick={() => setDeletingInvestment(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add the details modal */}
      {selectedInvestment && (
        <div className="modal-overlay" onClick={() => setSelectedInvestment(null)}>
          <div className="investment-details-container" onClick={e => e.stopPropagation()}>
            <InvestmentComparisonOverview
              InitialValue={selectedInvestment.initialValue}
              BankLoanLengthInYears={selectedInvestment.bankLoanLengthInYears}
              TotalInvestmentLength={selectedInvestment.totalInvestmentLengthInYears}
              TotalAppreciation={selectedInvestment.totalApreciation}
              TotalMaintenance={selectedInvestment.totalMaintenance}
              BankLoanAmount={selectedInvestment.bankLoanAmount}
              TotalInterest={selectedInvestment.totalLoanInterest}
              DownpaymentAmount={selectedInvestment.downpayment}
              TotalRentIncome={selectedInvestment.totalRentIncome}
            />
            <button 
              className="close-button"
              onClick={() => setSelectedInvestment(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get readable calculation method label
function getCalculationMethodLabel(method?: string, type?: string): string {
  if (type?.includes('sp500')) {
    return '';
  }

  switch (method) {
    case 'roi':
      return 'ROI Only';
    case 'roi_minus_maintenance':
      return 'ROI - Maintenance';
    case 'roi_plus_appreciation':
      return 'ROI + Appreciation';
    case 'appreciation_minus_maintenance':
      return 'Appreciation - Maintenance';
    case 'roi_plus_appreciation_minus_maintenance':
      return 'ROI + Appreciation - Maintenance';
    default:
      return 'Appreciation Only';
  }
} 