import { Property } from '../types/Property'

interface TableViewProps {
  properties: Property[];
  onExpectedPriceChange: (id: number, price: string) => void;
  onNotesChange: (id: number, notes: string) => void;
  onYearChange: (id: number, year: string) => void;
  onDelete: (id: number) => void;
  onMaintenanceCostChange: (id: number, cost: string) => void;
}

export function TableView({ 
  properties, 
  onExpectedPriceChange, 
  onNotesChange, 
  onYearChange, 
  onDelete,
  onMaintenanceCostChange 
}: TableViewProps) {
  return (
    <div className="table-container">
      <table className="properties-table">
        <thead>
          <tr>
            <th className="index-column">#</th>
            <th>Notes</th>
            <th>Asking Price (€)</th>
            <th>Expected Price (€)</th>
            <th>Size (m²)</th>
            <th>Price/m²</th>
            <th>Neighborhood</th>
            <th>Rent (€)</th>
            <th title="Renovation Cost">🔨 (€)</th>
            <th>Maintenance (€/m²/y)</th>
            <th>ROI (%)</th>
            <th>ROI (years)</th>
            <th>Year</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => (
            <tr key={property.id}>
              <td className="index-column">{index + 1}</td>
              <td>
                <input
                  type="text"
                  value={property.notes || ''}
                  onChange={(e) => onNotesChange(property.id, e.target.value)}
                  className="notes-input"
                  placeholder="Add notes..."
                />
              </td>
              <td>{property.askingPrice?.toLocaleString() || '0'}</td>
              <td>
                <input
                  type="text"
                  value={property.expectedPrice || ''}
                  onChange={(e) => onExpectedPriceChange(property.id, e.target.value)}
                  className="expected-price-input"
                  placeholder="Expected price"
                />
              </td>
              <td>{property.apartmentSize}</td>
              <td>
                {((property.expectedPrice || 0) / (property.apartmentSize || 1)).toFixed(2)}
              </td>
              <td>{property.neighbourhood}</td>
              <td>{property.monthlyRent?.toLocaleString() || '0'}</td>
              <td>{property.renovationCost?.toLocaleString() || '0'}</td>
              <td>
                <input
                  type="number"
                  value={property.maintenanceCostPerSqm || ''}
                  onChange={(e) => onMaintenanceCostChange(property.id, e.target.value)}
                  className="expected-price-input"
                  placeholder="€/m²/y"
                  step="0.5"
                />
              </td>
              <td>{property.roi?.toFixed(2) || '0'}%</td>
              <td>{((100 / (property.roi || 1))).toFixed(1)}</td>
              <td>
                <input
                  type="text"
                  value={property.year || ''}
                  onChange={(e) => onYearChange(property.id, e.target.value)}
                  className="year-input"
                  placeholder="Year"
                  maxLength={4}
                />
              </td>
              <td>
                <button 
                  onClick={() => onDelete(property.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 