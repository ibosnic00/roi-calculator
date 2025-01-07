import { useState, useEffect } from 'react'
import { useRentalData } from '../contexts/RentalDataContext'
import { Property } from '../types/Property'
import { TableView } from '../components/TableView'
import { GraphView } from '../components/GraphView'
import { TileView } from '../components/TileView'

export function CalculationPage() {
  const { rentalData } = useRentalData()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    askingPrice: '',
    apartmentSize: '',
    neighborhood: '',
    renovationCost: ''
  })

  // Load initial properties from localStorage
  const [properties, setProperties] = useState<Property[]>(() => {
    const savedProperties = localStorage.getItem('properties')
    return savedProperties ? JSON.parse(savedProperties) : []
  })

  // Save properties to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties))
  }, [properties])

  // Update existing properties when rental data changes
  useEffect(() => {
    setProperties(prevProperties =>
      prevProperties.map(property => {
        const newRent = getAverageRentFromContext(property.neighborhood, property.apartmentSize)
        const newRoi = calculateROI(property.expectedPrice, newRent, property.renovationCost)
        return {
          ...property,
          monthlyRent: newRent,
          roi: newRoi
        }
      })
    )
  }, [rentalData])

  const getAverageRentFromContext = (neighborhood: string, size: number): number => {
    const range = rentalData.find(range =>
      size >= range.minSize && size <= range.maxSize
    )

    if (!range) return 0

    return range.averageRents[neighborhood] || 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateROI = (price: number, rent: number, renovationCost: number): number => {
    const yearlyRent = rent * 12;
    const totalInvestment = price + renovationCost;
    return (yearlyRent / totalInvestment) * 100;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const price = Number(formData.askingPrice)
    const size = Number(formData.apartmentSize)
    const renovationCost = Number(formData.renovationCost)

    const monthlyRent = getAverageRentFromContext(formData.neighborhood, size)
    const roi = calculateROI(price, monthlyRent, renovationCost)

    // Calculate maintenance cost with 2 decimal places
    const maintenanceCost = Number((((price + renovationCost) / size) * 0.01).toFixed(2))

    const newProperty: Property = {
      id: Date.now(),
      askingPrice: price,
      expectedPrice: price,
      apartmentSize: size,
      neighborhood: formData.neighborhood,
      renovationCost: renovationCost,
      monthlyRent: monthlyRent,
      roi: roi,
      notes: '',
      year: '',
      maintenanceCostPerSqm: maintenanceCost
    }

    setProperties(prev => [...prev, newProperty])

    // Reset form
    setFormData({
      askingPrice: '',
      apartmentSize: '',
      neighborhood: '',
      renovationCost: ''
    })
    setIsFormVisible(false) // Hide form after submission
  }

  const handleExpectedPriceChange = (id: number, price: string) => {
    const cleanPrice = price.replace(/[^0-9.]/g, '')

    const updatedProperties = properties.map(property => {
      if (property.id === id) {
        const expectedPrice = cleanPrice ? parseFloat(cleanPrice) : property.askingPrice
        const roi = calculateROI(expectedPrice, property.monthlyRent, property.renovationCost)
        return {
          ...property,
          expectedPrice: isNaN(expectedPrice) ? property.askingPrice : expectedPrice,
          roi: isNaN(roi) ? property.roi : roi
        }
      }
      return property
    })
    setProperties(updatedProperties)
  }

  const handleNotesChange = (id: number, notes: string) => {
    const updatedProperties = properties.map(property =>
      property.id === id
        ? { ...property, notes }
        : property
    )
    setProperties(updatedProperties)
  }

  const handleDelete = (id: number) => {
    setProperties(prev => prev.filter(property => property.id !== id))
  }

  const handleYearChange = (id: number, year: string) => {
    const yearValue = year.replace(/\D/g, '').slice(0, 4)
    const updatedProperties = properties.map(property =>
      property.id === id
        ? { ...property, year: yearValue }
        : property
    )
    setProperties(updatedProperties)
  }

  const handleMaintenanceCostChange = (id: number, cost: string) => {
    const updatedProperties = properties.map(property =>
      property.id === id
        ? { ...property, maintenanceCostPerSqm: Number(Number(cost).toFixed(2)) || 0 }
        : property
    )
    setProperties(updatedProperties)
  }

  const handleLinkChange = (id: number, link: string) => {
    setProperties(properties.map(property => 
      property.id === id 
        ? { ...property, link }
        : property
    ));
  };

  const getAvailableneighborhoods = (): string[] => {
    const neighborhoodSet = new Set<string>()
    rentalData.forEach(range => {
      Object.keys(range.averageRents).forEach(neighborhood => {
        neighborhoodSet.add(neighborhood)
      })
    })
    return Array.from(neighborhoodSet).sort()
  }

  const neighborhoods = getAvailableneighborhoods()

  const [viewMode, setViewMode] = useState<'table' | 'tiles'>(() => {
    const savedViewMode = localStorage.getItem('viewMode')
    return (savedViewMode === 'table' || savedViewMode === 'tiles') ? savedViewMode : 'tiles'
  })

  // Add effect to save viewMode changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode)
  }, [viewMode])

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Add this effect to keep selectedProperty in sync with properties
  useEffect(() => {
    if (selectedProperty) {
      const updatedProperty = properties.find(p => p.id === selectedProperty.id)
      if (updatedProperty) {
        setSelectedProperty(updatedProperty)
      }
    }
  }, [properties])

  return (
    <>
      {!isFormVisible ? (
        <div className="page-header">
          <div className="add-property-button-container">
            <button
              className="add-property-button"
              onClick={() => setIsFormVisible(true)}
            >
              + Add Property
            </button>
          </div>
          <div className="view-toggle">
            <button
              className={`toggle-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button
              className={`toggle-button ${viewMode === 'tiles' ? 'active' : ''}`}
              onClick={() => setViewMode('tiles')}
            >
              Tiles
            </button>
          </div>
        </div>
      ) : (
        <div className="form-overlay">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="roi-form">
              <div className="form-header">
                <h3>Add New Property</h3>
                <button
                  type="button"
                  className="close-form-button"
                  onClick={() => setIsFormVisible(false)}
                >
                  ×
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="askingPrice">Asking Price (€)</label>
                  <input
                    type="number"
                    id="askingPrice"
                    name="askingPrice"
                    value={formData.askingPrice}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    required
                    className="popup-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apartmentSize">Size (m²)</label>
                  <input
                    type="number"
                    id="apartmentSize"
                    name="apartmentSize"
                    value={formData.apartmentSize}
                    onChange={handleInputChange}
                    placeholder="Enter size"
                    required
                    className="popup-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="neighborhood">Neighborhood</label>
                  <select
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    required
                    className="popup-input"
                  >
                    <option value="">Select</option>
                    {neighborhoods.map(hood => (
                      <option key={hood} value={hood}>
                        {hood}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="renovationCost">Renovation (€)</label>
                  <input
                    type="number"
                    id="renovationCost"
                    name="renovationCost"
                    value={formData.renovationCost}
                    onChange={handleInputChange}
                    placeholder="Enter cost"
                    required
                    className="popup-input"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Add Property
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsFormVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={isFormVisible ? 'content-blur' : ''}>
        {properties.length > 0 && (
          <>
            {viewMode === 'table' ? (
              <TableView
                properties={properties}
                onExpectedPriceChange={handleExpectedPriceChange}
                onNotesChange={handleNotesChange}
                onYearChange={handleYearChange}
                onDelete={handleDelete}
                onMaintenanceCostChange={handleMaintenanceCostChange}
                onLinkChange={handleLinkChange}
              />
            ) : (
              <TileView
                properties={properties}
                onDelete={handleDelete}
                onPropertyClick={setSelectedProperty}
                onLinkChange={handleLinkChange}
              />
            )}
            <GraphView properties={properties} />
          </>
        )}
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="form-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="form-container" onClick={e => e.stopPropagation()}>
            <div className="property-detail">
              <div className="form-header">
                <h3>Property #{properties.findIndex(p => p.id === selectedProperty.id) + 1}</h3>
                <button
                  className="close-form-button"
                  onClick={() => setSelectedProperty(null)}
                >
                  ×
                </button>
              </div>
              <div className="detail-content">
                <div className="detail-row">
                  <label>Asking Price:</label>
                  <span>€{selectedProperty.askingPrice.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <label>Expected Price:</label>
                  <input
                    type="text"
                    value={selectedProperty.expectedPrice.toLocaleString()}
                    onChange={(e) => handleExpectedPriceChange(selectedProperty.id, e.target.value)}
                    className="detail-input"
                  />
                </div>
                <div className="detail-row">
                  <label>Size:</label>
                  <span>{selectedProperty.apartmentSize} m²</span>
                </div>
                <div className="detail-row">
                  <label>Price/m²:</label>
                  <span>€{((selectedProperty.expectedPrice || 0) / (selectedProperty.apartmentSize || 1)).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <label>neighborhood:</label>
                  <span>{selectedProperty.neighborhood}</span>
                </div>
                <div className="detail-row">
                  <label>Monthly Rent:</label>
                  <span>€{selectedProperty.monthlyRent.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <label>Renovation Cost:</label>
                  <span>€{selectedProperty.renovationCost.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <label>Maintenance Cost (€/m²/y):</label>
                  <input
                    type="number"
                    value={selectedProperty.maintenanceCostPerSqm}
                    onChange={(e) => handleMaintenanceCostChange(selectedProperty.id, e.target.value)}
                    className="detail-input"
                    step="0.5"
                  />
                </div>
                <div className="detail-row">
                  <label>ROI:</label>
                  <span>{selectedProperty.roi.toFixed(2)}%</span>
                </div>
                <div className="detail-row">
                  <label>ROI (years):</label>
                  <span>{((100 / (selectedProperty.roi || 1))).toFixed(1)}</span>
                </div>
                <div className="detail-row">
                  <label>Year:</label>
                  <input
                    type="text"
                    value={selectedProperty.year}
                    onChange={(e) => handleYearChange(selectedProperty.id, e.target.value)}
                    className="detail-input"
                    maxLength={4}
                  />
                </div>
                <div className="detail-row">
                  <label>Notes:</label>
                  <input
                    type="text"
                    value={selectedProperty.notes}
                    onChange={(e) => handleNotesChange(selectedProperty.id, e.target.value)}
                    className="detail-input"
                    placeholder="Add notes..."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="submit-button"
                  onClick={() => setSelectedProperty(null)}
                >
                  Save
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setSelectedProperty(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 