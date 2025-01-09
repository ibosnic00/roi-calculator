import { useState, useEffect } from 'react'
import { useRentalData } from '../contexts/RentalDataContext'
import { getAvailableneighborhoods } from '../utils/rentalData'

export function SettingsPage() {
  const { rentalData, removeRent, addRent } = useRentalData()
  const [selectedRange, setSelectedRange] = useState(rentalData[0])
  const [isAdding, setIsAdding] = useState(false)
  const [newData, setNewData] = useState({
    sizeRange: '',
    neighborhood: '',
    rent: ''
  })
  const [isCustomneighborhood, setIsCustomneighborhood] = useState(false)
  const [sortField, setSortField] = useState<'neighborhood' | 'rent'>('neighborhood')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Update selectedRange when rentalData changes
  useEffect(() => {
    const updatedRange = rentalData.find(range => range.minSize === selectedRange.minSize)
    if (updatedRange) {
      setSelectedRange(updatedRange)
    }
  }, [rentalData])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newData.neighborhood && newData.rent && newData.sizeRange) {
      const [minSize] = newData.sizeRange.split('-').map(Number)
      addRent(minSize, newData.neighborhood, Number(newData.rent))
      setNewData({ sizeRange: '', neighborhood: '', rent: '' })
      setIsAdding(false)
      setIsCustomneighborhood(false)
    }
  }

  const handleSort = (field: 'neighborhood' | 'rent') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="settings-container">
      <h2 color='black'>Rental Data</h2>
      <div className={isAdding ? 'content-blur' : ''}>
        <div className="rental-data-tabs">
          {rentalData.map(range => (
            <button
              key={range.minSize}
              className={`tab-button ${selectedRange.minSize === range.minSize ? 'active' : ''}`}
              onClick={() => setSelectedRange(range)}
            >
              {range.minSize} - {range.maxSize} m²
            </button>
          ))}
        </div>

        <div className="add-data-section">
          {!isAdding ? (
            <button 
              className="add-data-button"
              onClick={() => {
                setNewData(prev => ({
                  ...prev,
                  sizeRange: `${selectedRange.minSize}-${selectedRange.maxSize}`
                }));
                setIsAdding(true);
              }}
            >
              + Add Data
            </button>
          ) : null}
        </div>

        <div className="rental-data-container">
          <table className="rental-data-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('neighborhood')}
                  style={{ cursor: 'pointer' }}
                >
                  neighborhood {sortField === 'neighborhood' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('rent')}
                  style={{ cursor: 'pointer' }}
                >
                  Monthly Rent (€) {sortField === 'rent' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(selectedRange.averageRents)
                .sort(([aneighborhood, aRent], [bneighborhood, bRent]) => {
                  if (sortField === 'neighborhood') {
                    return sortDirection === 'asc' 
                      ? aneighborhood.localeCompare(bneighborhood)
                      : bneighborhood.localeCompare(aneighborhood)
                  } else {
                    return sortDirection === 'asc'
                      ? aRent - bRent
                      : bRent - aRent
                  }
                })
                .map(([neighborhood, rent]) => (
                  <tr key={neighborhood}>
                    <td>{neighborhood}</td>
                    <td>{rent}</td>
                    <td>
                      <button
                        className="delete-button rental-delete-button"
                        onClick={() => removeRent(selectedRange.minSize, neighborhood)}
                        title="Remove entry"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="form-overlay">
          <div className="form-container">
            <form onSubmit={handleAdd} className="rental-data-form">
              <div className="form-header">
                <h3>Add Rental Data</h3>
                <button 
                  type="button" 
                  className="close-form-button"
                  onClick={() => {
                    setIsAdding(false)
                    setIsCustomneighborhood(false)
                  }}
                >
                  ×
                </button>
              </div>

              <select
                value={newData.sizeRange}
                onChange={e => setNewData(prev => ({ ...prev, sizeRange: e.target.value }))}
                required
                className="popup-input"
              >
                <option value="">Select Size Range</option>
                {rentalData.map(range => (
                  <option key={range.minSize} value={`${range.minSize}-${range.maxSize}`}>
                    {range.minSize} - {range.maxSize} m²
                  </option>
                ))}
              </select>
              
              {isCustomneighborhood ? (
                <input
                  type="text"
                  placeholder="neighborhood"
                  value={newData.neighborhood}
                  onChange={e => setNewData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  required
                  className="popup-input"
                />
              ) : (
                <select
                  value={newData.neighborhood}
                  onChange={e => {
                    if (e.target.value === "new") {
                      setIsCustomneighborhood(true);
                      setNewData(prev => ({ ...prev, neighborhood: "" }));
                    } else {
                      setNewData(prev => ({ ...prev, neighborhood: e.target.value }));
                    }
                  }}
                  required
                  className="popup-input"
                >
                  <option value="">Select neighborhood</option>
                  {getAvailableneighborhoods().map(hood => (
                    <option key={hood} value={hood}>
                      {hood}
                    </option>
                  ))}
                  <option value="new">Enter New neighborhood</option>
                </select>
              )}
              
              <input
                type="number"
                placeholder="Monthly Rent (€)"
                value={newData.rent}
                onChange={e => setNewData(prev => ({ ...prev, rent: e.target.value }))}
                required
                className="popup-input"
              />
              
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Add Data
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setIsAdding(false)
                    setIsCustomneighborhood(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 