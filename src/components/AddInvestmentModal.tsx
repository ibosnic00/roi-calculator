import { useState, useEffect } from 'react';
import '../styles/Modal.css';
import { Investment, InvestmentType } from '../types/Investment';
import { Property } from '../types/Property';

interface AddInvestmentModalProps {
  onClose: () => void;
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  options: { type: InvestmentType; label: string; }[];
  editingInvestment?: Investment | null;
}

export function AddInvestmentModal({ onClose, onAdd, options, editingInvestment }: AddInvestmentModalProps) {
  const [existingProperties, setExistingProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedType, setSelectedType] = useState<InvestmentType | ''>(editingInvestment?.type || '');
  const [defaultParams] = useState(() => {
    const savedParams = localStorage.getItem('graphParameters');
    return savedParams ? JSON.parse(savedParams) : {
      sp500Return: 10,
      baseAppreciation: 3,
      calculationMethod: 'roi_plus_appreciation_minus_maintenance'
    };
  });
  const [formData, setFormData] = useState({
    name: editingInvestment?.name || '',
    initialAmount: editingInvestment?.initialAmount.toString() || '',
    loanAmount: editingInvestment?.loanAmount?.toString() || '',
    monthlyRent: editingInvestment?.monthlyRent?.toString() || '',
    interestRate: editingInvestment?.interestRate?.toString() || '',
    loanTerm: editingInvestment?.loanTerm?.toString() || '',
    propertyAppreciation: editingInvestment?.propertyAppreciation?.toString() || defaultParams.baseAppreciation.toString(),
    sp500Return: editingInvestment?.sp500Return?.toString() || defaultParams.sp500Return.toString(),
    calculationMethod: editingInvestment?.calculationMethod || defaultParams.calculationMethod,
    monthlyContribution: editingInvestment?.monthlyContribution?.toString() || ''
  });

  // Load properties from localStorage
  useEffect(() => {
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      setExistingProperties(JSON.parse(savedProperties));
    }
  }, []);

  // Update form when property is selected
  useEffect(() => {
    if (selectedProperty && selectedType.includes('property')) {
      const propertyName = selectedProperty.subneighborhood
        ? `${selectedProperty.subneighborhood} [€${selectedProperty.expectedPrice.toLocaleString()}]`
        : `${selectedProperty.neighborhood} [€${selectedProperty.expectedPrice.toLocaleString()}]`;

      setFormData(prev => ({
        ...prev,
        name: propertyName,
        initialAmount: (selectedProperty.expectedPrice + selectedProperty.renovationCost).toString(),
        monthlyRent: selectedProperty.monthlyRent.toString(),
        propertyAppreciation: defaultParams.baseAppreciation.toString()
      }));
    }
  }, [selectedProperty, defaultParams.baseAppreciation]);

  // Update the type selection effect to set default values
  useEffect(() => {
    if (selectedType && !editingInvestment) {
      setFormData(prev => ({
        ...prev,
        propertyAppreciation: selectedType.includes('property') ? defaultParams.baseAppreciation.toString() : '',
        sp500Return: selectedType.includes('sp500') ? defaultParams.sp500Return.toString() : ''
      }));
    }
  }, [selectedType, defaultParams, editingInvestment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const investment = {
      type: selectedType,
      name: formData.name,
      initialAmount: Number(formData.initialAmount),
      calculationMethod: formData.calculationMethod,
      ...(selectedType.includes('property') && {
        monthlyRent: Number(formData.monthlyRent),
        propertyAppreciation: Number(formData.propertyAppreciation)
      }),
      ...(selectedType.includes('loan') && {
        loanAmount: Number(formData.loanAmount),
        interestRate: Number(formData.interestRate),
        loanTerm: Number(formData.loanTerm)
      }),
      ...(selectedType.includes('sp500') && {
        sp500Return: Number(formData.sp500Return),
        ...(selectedType === 'sp500_monthly' && {
          monthlyContribution: Number(formData.monthlyContribution)
        })
      })
    };

    onAdd(investment);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</h3>
        <form onSubmit={handleSubmit}>
          {!editingInvestment && (
            <div className="form-group">
              <label>Investment Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as InvestmentType)}
                required
                disabled={!!editingInvestment}
              >
                <option value="">Select Investment Type</option>
                {options.map(option => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!editingInvestment && selectedType && selectedType.includes('property') && existingProperties.length > 0 && (
            <div className="form-group">
              <label>Select Property</label>
              <select
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = existingProperties.find(p => p.id === Number(e.target.value));
                  setSelectedProperty(property || null);
                }}
              >
                <option value="">Select Existing Property</option>
                {existingProperties.map((property, index) => (
                  <option key={property.id} value={property.id}>
                    {property.subneighborhood
                      ? `${index + 1} - ${property.subneighborhood} [€${property.expectedPrice.toLocaleString()}]`
                      : `${index + 1} - ${property.neighborhood} [€${property.expectedPrice.toLocaleString()}]`
                    }
                  </option>
                ))}
              </select>
            </div>
          )}


          {selectedType && (
            <>
              <div className="form-group">
                <label>Investment Name</label>
                <input
                  type="text"
                  placeholder="Investment Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                {selectedType.includes('property') && (
                  <label>Property Value + Renovation (€)</label>
                )}
                {!selectedType.includes('property') && (
                  <label>Investment Value (€)</label>
                )}
                <input
                  type="number"
                  placeholder="Initial Amount"
                  value={formData.initialAmount}
                  onChange={e => setFormData({ ...formData, initialAmount: e.target.value })}
                  required
                />
              </div>

              {selectedType.includes('property') && (
                <>
                  <div className="form-group">
                    <label>Monthly Rent (€)</label>
                    <input
                      type="number"
                      placeholder="Monthly Rent"
                      value={formData.monthlyRent}
                      onChange={e => setFormData({ ...formData, monthlyRent: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Property Appreciation (%)</label>
                    <input
                      type="number"
                      placeholder="Property Appreciation"
                      value={formData.propertyAppreciation}
                      onChange={e => setFormData({ ...formData, propertyAppreciation: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {selectedType.includes('property') && (
                <div className="form-group">
                  <label>Calculation Method</label>
                  <select
                    value={formData.calculationMethod}
                    onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value })}
                    required
                  >
                    <option value="appreciation">Property Appreciation</option>
                    <option value="roi">ROI Only</option>
                    <option value="roi_minus_maintenance">ROI - Maintenance</option>
                    <option value="roi_plus_appreciation">ROI + Property Appreciation</option>
                    <option value="appreciation_minus_maintenance">Appreciation - Maintenance</option>
                    <option value="roi_plus_appreciation_minus_maintenance">ROI + Appreciation - Maintenance</option>
                  </select>
                </div>
              )}

              {selectedType.includes('loan') && (
                <div className="bank-loan-info">
                  <label>Bank Loan Information</label>
                  <div className="bank-loan-input">
                    <div className="form-group">
                      <input
                        type="number"
                        placeholder="Interest Rate (%)"
                        value={formData.interestRate}
                        onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        placeholder="Loan Length (years)"
                        value={formData.loanTerm}
                        onChange={e => setFormData({ ...formData, loanTerm: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        placeholder="Loan Amount (€)"
                        value={formData.loanAmount}
                        onChange={e => {
                          const loanAmount = Number(e.target.value);
                          const totalAmount = Number(formData.initialAmount);
                          if (loanAmount > totalAmount) {
                            setFormData({ ...formData, loanAmount: formData.initialAmount });
                          } else {
                            setFormData({ ...formData, loanAmount: e.target.value });
                          }
                        }}
                        max={formData.initialAmount}
                        required
                      /></div>
                  </div>
                  <div className="form-group">
                    <label>Cash Payment: {(Number(formData.initialAmount) - Number(formData.loanAmount || 0)).toLocaleString()} €</label>
                  </div>
                </div>
              )}

              {selectedType.includes('sp500') && (
                <div className="form-group">
                  <label>Expected S&P 500 Return (%)</label>
                  <input
                    type="number"
                    placeholder="Expected Return"
                    value={formData.sp500Return}
                    onChange={e => setFormData({ ...formData, sp500Return: e.target.value })}
                    required
                  />
                </div>
              )}

              {selectedType === 'sp500_monthly' && (
                <div className="form-group">
                  <label>Monthly Contribution (€)</label>
                  <input
                    type="number"
                    placeholder="Monthly Contribution"
                    value={formData.monthlyContribution}
                    onChange={e => setFormData({ ...formData, monthlyContribution: e.target.value })}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="modal-actions">
            <button type="submit">{editingInvestment ? 'Save Changes' : 'Add Investment'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
} 