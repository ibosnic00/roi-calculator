import { useState, useEffect } from 'react'
import { useRentalData } from '../contexts/RentalDataContext'
import { Property } from '../types/Property'
import { TableView } from '../components/TableView'
import { GraphView } from '../components/GraphView'

export function CalculationPage() {
  const { rentalData } = useRentalData()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    askingPrice: '',
    apartmentSize: '',
    neighbourhood: '',
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
        const newRent = getAverageRentFromContext(property.neighbourhood, property.apartmentSize)
        const newRoi = calculateROI(property.expectedPrice, newRent, property.renovationCost)
        return {
          ...property,
          monthlyRent: newRent,
          roi: newRoi
        }
      })
    )
  }, [rentalData])

  const getAverageRentFromContext = (neighbourhood: string, size: number): number => {
    const range = rentalData.find(range => 
      size >= range.minSize && size <= range.maxSize
    )

    if (!range) return 0

    return range.averageRents[neighbourhood] || 0
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
    
    const monthlyRent = getAverageRentFromContext(formData.neighbourhood, size)
    const roi = calculateROI(price, monthlyRent, renovationCost)

    // Calculate maintenance cost with 2 decimal places
    const maintenanceCost = Number((((price + renovationCost) / size) * 0.01).toFixed(2))

    const newProperty: Property = {
      id: Date.now(),
      askingPrice: price,
      expectedPrice: price,
      apartmentSize: size,
      neighbourhood: formData.neighbourhood,
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
      neighbourhood: '',
      renovationCost: ''
    })
    setIsFormVisible(false) // Hide form after submission
  }

  const handleExpectedPriceChange = (id: number, price: string) => {
    const cleanPrice = price.replace(/[^0-9.]/g, '')
    
    setProperties(prev => 
      prev.map(property => {
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
    )
  }

  const handleNotesChange = (id: number, notes: string) => {
    setProperties(prev => 
      prev.map(property => 
        property.id === id 
          ? { ...property, notes } 
          : property
      )
    )
  }

  const handleDelete = (id: number) => {
    setProperties(prev => prev.filter(property => property.id !== id))
  }

  const handleYearChange = (id: number, year: string) => {
    const yearValue = year.replace(/\D/g, '').slice(0, 4)
    setProperties(prev => 
      prev.map(property => 
        property.id === id 
          ? { ...property, year: yearValue } 
          : property
      )
    )
  }

  const handleMaintenanceCostChange = (id: number, cost: string) => {
    setProperties(prev => prev.map(property => 
      property.id === id 
        ? { ...property, maintenanceCostPerSqm: Number(Number(cost).toFixed(2)) || 0 }
        : property
    ));
  };

  const getAvailableNeighbourhoods = (): string[] => {
    const neighbourhoodSet = new Set<string>()
    rentalData.forEach(range => {
      Object.keys(range.averageRents).forEach(neighbourhood => {
        neighbourhoodSet.add(neighbourhood)
      })
    })
    return Array.from(neighbourhoodSet).sort()
  }

  const neighbourhoods = getAvailableNeighbourhoods()

  return (
    <>
      {!isFormVisible ? (
        <div className="add-property-button-container">
          <button 
            className="add-property-button"
            onClick={() => setIsFormVisible(true)}
          >
            + Add Property
          </button>
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
                  <label htmlFor="neighbourhood">Neighbourhood</label>
                  <select
                    id="neighbourhood"
                    name="neighbourhood"
                    value={formData.neighbourhood}
                    onChange={handleInputChange}
                    required
                    className="popup-input"
                  >
                    <option value="">Select</option>
                    {neighbourhoods.map(hood => (
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
            <TableView
              properties={properties}
              onExpectedPriceChange={handleExpectedPriceChange}
              onNotesChange={handleNotesChange}
              onYearChange={handleYearChange}
              onDelete={handleDelete}
              onMaintenanceCostChange={handleMaintenanceCostChange}
            />
            <GraphView properties={properties} />
          </>
        )}
      </div>
    </>
  )
} 