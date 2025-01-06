import { useState, useEffect } from 'react'
import { useRentalData } from '../contexts/RentalDataContext'
import { getAvailableNeighbourhoods } from '../utils/rentalData'

export function SettingsPage() {
  const { rentalData, removeRent, addRent } = useRentalData()
  const [selectedRange, setSelectedRange] = useState(rentalData[0])
  const [isAdding, setIsAdding] = useState(false)
  const [newData, setNewData] = useState({
    neighbourhood: '',
    rent: ''
  })
  const [isCustomNeighbourhood, setIsCustomNeighbourhood] = useState(false)
  const [sortField, setSortField] = useState<'neighbourhood' | 'rent'>('neighbourhood')
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
    if (newData.neighbourhood && newData.rent) {
      addRent(selectedRange.minSize, newData.neighbourhood, Number(newData.rent))
      setNewData({ neighbourhood: '', rent: '' })
      setIsAdding(false)
      setIsCustomNeighbourhood(false)
    }
  }

  const handleSort = (field: 'neighbourhood' | 'rent') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="settings-container">
      <h2>Rental Data</h2>
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
            onClick={() => setIsAdding(true)}
          >
            + Add Data
          </button>
        ) : (
          <form onSubmit={handleAdd} className="add-data-form">
            {isCustomNeighbourhood ? (
              <input
                type="text"
                placeholder="Neighbourhood"
                value={newData.neighbourhood}
                onChange={e => setNewData(prev => ({ ...prev, neighbourhood: e.target.value }))}
                required
              />
            ) : (
              <select
                value={newData.neighbourhood}
                onChange={e => {
                  if (e.target.value === "new") {
                    setIsCustomNeighbourhood(true);
                    setNewData(prev => ({ ...prev, neighbourhood: "" }));
                  } else {
                    setNewData(prev => ({ ...prev, neighbourhood: e.target.value }));
                  }
                }}
                required
              >
                <option value="">Select Neighbourhood</option>
                {getAvailableNeighbourhoods().map(hood => (
                  <option key={hood} value={hood}>
                    {hood}
                  </option>
                ))}
                <option value="new">Enter New Neighbourhood</option>
              </select>
            )}
            <input
              type="number"
              placeholder="Monthly Rent (€)"
              value={newData.rent}
              onChange={e => setNewData(prev => ({ ...prev, rent: e.target.value }))}
              required
              step="1"
            />
            <button type="submit">Add</button>
            <button 
              type="button" 
              onClick={() => {
                setIsAdding(false)
                setIsCustomNeighbourhood(false)
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <div className="rental-data-container">
        <table className="rental-data-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('neighbourhood')}
                style={{ cursor: 'pointer' }}
              >
                Neighbourhood {sortField === 'neighbourhood' && (sortDirection === 'asc' ? '↑' : '↓')}
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
              .sort(([aNeighbourhood, aRent], [bNeighbourhood, bRent]) => {
                if (sortField === 'neighbourhood') {
                  return sortDirection === 'asc' 
                    ? aNeighbourhood.localeCompare(bNeighbourhood)
                    : bNeighbourhood.localeCompare(aNeighbourhood)
                } else {
                  return sortDirection === 'asc'
                    ? aRent - bRent
                    : bRent - aRent
                }
              })
              .map(([neighbourhood, rent]) => (
                <tr key={neighbourhood}>
                  <td>{neighbourhood}</td>
                  <td>{rent}</td>
                  <td>
                    <button
                      className="delete-button rental-delete-button"
                      onClick={() => removeRent(selectedRange.minSize, neighbourhood)}
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
  )
} 