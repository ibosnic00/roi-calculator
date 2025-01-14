import { useState, useEffect } from 'react'
import { useRentalData } from '../contexts/RentalDataContext'
import { Property } from '../types/Property'
import { TableView } from '../components/TableView'
import { GraphView } from '../components/GraphView'
import { TileView } from '../components/TileView'
import {
  GetSubneighbourhoodsInNeighbourhood,
  GetAllSubneighbourhoods,
  GetNeighbourhoodFromSubneighbourhood,
  GetFullName,
  GetShortName
} from '../utils/districtsZagreb';
import { NeighborhoodPopup } from '../components/NeighborhoodPopup';
import { RentEditPopup } from '../components/RentEditPopup';

export function CalculationPage() {
  const { rentalData } = useRentalData()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    askingPrice: '',
    apartmentSize: '',
    neighborhood: '',
    subneighborhood: '',
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

    // Convert short name to full name before looking up rent
    const fullName = GetFullName(neighborhood)
    return range.averageRents[fullName] || 0
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

  const resetForm = () => {
    setFormData({
      askingPrice: '',
      apartmentSize: '',
      neighborhood: '',
      subneighborhood: '',
      renovationCost: '0'
    })
    setIsFormVisible(false)
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
      neighborhood: GetShortName(formData.neighborhood),
      renovationCost: renovationCost,
      monthlyRent: monthlyRent,
      subneighborhood: formData.subneighborhood,
      roi: roi,
      notes: '',
      year: '',
      maintenanceCostPerSqm: maintenanceCost
    }

    setProperties(prev => [...prev, newProperty])
    resetForm()
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

  const handleReorder = (startIndex: number, endIndex: number) => {
    setProperties(prevProperties => {
      const result = Array.from(prevProperties);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const handleNeighborhoodChange = (id: number, neighborhood: string, subneighborhood: string | null) => {
    setProperties(properties.map(property =>
      property.id === id
        ? { ...property, neighborhood, subneighborhood: subneighborhood || '' }
        : property
    ));
  };

  const [isNeighborhoodPopupOpen, setIsNeighborhoodPopupOpen] = useState(false);

  // Initialize show controls state with localStorage values
  const [showSold, setShowSold] = useState(() => {
    const saved = localStorage.getItem('showSold');
    return saved ? JSON.parse(saved) : true;  // Default to true
  });

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(() => {
    const saved = localStorage.getItem('showOnlyFavorites');
    return saved ? JSON.parse(saved) : false;  // Default to false
  });

  // Add effects to save state changes
  useEffect(() => {
    localStorage.setItem('showSold', JSON.stringify(showSold));
  }, [showSold]);

  useEffect(() => {
    localStorage.setItem('showOnlyFavorites', JSON.stringify(showOnlyFavorites));
  }, [showOnlyFavorites]);

  // Add handler for toggling favorite status
  const handleFavoriteToggle = (id: number) => {
    setProperties(properties.map(property =>
      property.id === id
        ? { ...property, isFavorite: !property.isFavorite }
        : property
    ));
  };

  // Update handleSoldToggle function
  const handleSoldToggle = (id: number) => {
    setProperties(properties.map(property =>
        property.id === id
            ? { ...property, isSold: !property.isSold }
            : property
    ));
  };

  // Modify the filtering logic
  const filteredProperties = properties.filter(p => {
    // If showing only favorites, property must be favorite
    if (showOnlyFavorites && !p.isFavorite) return false;
    
    // If not showing sold properties, hide them (even if they're favorites)
    if (!showSold && p.isSold) return false;
    
    return true;
  });

  // Add new handler for rent changes
  const handleRentChange = (id: number, rent: number) => {
    setProperties(properties.map(property => {
      if (property.id === id) {
        const newRoi = calculateROI(property.expectedPrice, rent, property.renovationCost);
        return {
          ...property,
          monthlyRent: rent,
          roi: newRoi
        };
      }
      return property;
    }));
  };

  // Add new state for rent editing
  const [editingRentId, setEditingRentId] = useState<number | null>(null);

  return (
    <>
      {!isFormVisible ? (
        <div className="page-header">
          <div className="add-property-button-container">
            <button
              className="add-property-button"
              onClick={() => setIsFormVisible(true)}
            >
              + ADD NEW
            </button>
          </div>
          <div className="view-controls">

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

            
            <div className="show-controls">
              <span className="show-label">Show</span>
              <div className="show-buttons">
                <button
                  className={`show-button ${showSold ? 'active' : ''}`}
                  onClick={() => setShowSold(!showSold)}
                  title="Show/Hide Sold"
                >
                  💸
                </button>
                <button
                  className={`show-button ${showOnlyFavorites ? 'active' : ''}`}
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  title="Show Favorites Only"
                >
                  ★
                </button>
              </div>
            </div>
            
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
                  onClick={resetForm}
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
                  <label htmlFor="neighborhood">Neighbourhood</label>
                  <select
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={e => {
                      const newNeighborhood = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        neighborhood: newNeighborhood,
                        subneighborhood: ''
                      }));
                    }}
                    required
                    className="popup-input"
                  >
                    <option value="">Select Neighborhood</option>
                    {getAvailableneighborhoods().map(hood => (
                      <option key={hood} value={hood}>{hood}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subneighborhood">Subneighborhood</label>
                  <select
                    name="subneighborhood"
                    value={formData.subneighborhood}
                    onChange={e => {
                      const newSubneighborhood = e.target.value;
                      if (!formData.neighborhood) {
                        const parentNeighborhood = GetNeighbourhoodFromSubneighbourhood(newSubneighborhood);
                        if (parentNeighborhood) {
                          setFormData(prev => ({
                            ...prev,
                            neighborhood: parentNeighborhood,
                            subneighborhood: newSubneighborhood
                          }));
                        }
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          subneighborhood: newSubneighborhood
                        }));
                      }
                    }}
                    required
                    className="popup-input"
                  >
                    <option value="">Select Subneighborhood</option>
                    {formData.neighborhood
                      ? GetSubneighbourhoodsInNeighbourhood(formData.neighborhood)
                        .map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))
                      : GetAllSubneighbourhoods()
                        .map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))
                    }
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
                  onClick={resetForm}
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
            {viewMode === 'tiles' && (
              <div className="drag-hint">
                Hold any tile for a second to reorder
              </div>
            )}
            {viewMode === 'table' ? (
              <TableView
                properties={filteredProperties}
                onExpectedPriceChange={handleExpectedPriceChange}
                onNotesChange={handleNotesChange}
                onYearChange={handleYearChange}
                onDelete={handleDelete}
                onMaintenanceCostChange={handleMaintenanceCostChange}
                onLinkChange={handleLinkChange}
                onNeighborhoodChange={handleNeighborhoodChange}
                onFavoriteToggle={handleFavoriteToggle}
                onSoldToggle={handleSoldToggle}
                onRentChange={handleRentChange}
              />
            ) : (
              <TileView
                properties={filteredProperties}
                onDelete={handleDelete}
                onPropertyClick={setSelectedProperty}
                onLinkChange={handleLinkChange}
                onReorder={handleReorder}
                onNeighborhoodChange={handleNeighborhoodChange}
                onFavoriteToggle={handleFavoriteToggle}
                onSoldToggle={handleSoldToggle}
              />
            )}
            <GraphView 
              properties={showOnlyFavorites ? filteredProperties : properties} 
            />
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
                  <label>Neighbourhood:</label>
                  <span onClick={() => {
                    if (selectedProperty) {
                      setSelectedProperty(selectedProperty);
                      setIsNeighborhoodPopupOpen(true);
                    }
                  }} style={{ cursor: 'pointer' }}>
                    {selectedProperty.subneighborhood ?
                      `${selectedProperty.subneighborhood} (${GetFullName(selectedProperty.neighborhood)})` :
                      GetFullName(selectedProperty.neighborhood)
                    }
                  </span>
                </div>
                <div className="detail-row">
                  <label>Monthly Rent:</label>
                  <span 
                    onClick={() => {
                      setEditingRentId(selectedProperty.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    €{selectedProperty.monthlyRent.toLocaleString()}
                  </span>
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

      {/* Neighborhood Popup */}
      <NeighborhoodPopup
        isOpen={isNeighborhoodPopupOpen}
        onClose={() => setIsNeighborhoodPopupOpen(false)}
        onSave={(neighborhood, subneighborhood) => {
          if (selectedProperty) {
            handleNeighborhoodChange(selectedProperty.id, neighborhood, subneighborhood);
            setIsNeighborhoodPopupOpen(false);
          }
        }}
        initialNeighborhood={selectedProperty?.neighborhood}
        initialSubneighborhood={selectedProperty?.subneighborhood}
      />

      {/* Add RentEditPopup */}
      <RentEditPopup
        isOpen={editingRentId !== null}
        onClose={() => setEditingRentId(null)}
        onSave={(rent) => {
          if (editingRentId) {
            handleRentChange(editingRentId, rent);
            setEditingRentId(null);
          }
        }}
        currentRent={properties.find(p => p.id === editingRentId)?.monthlyRent || 0}
        neighborhood={selectedProperty?.neighborhood || ''}
      />
    </>
  )
} 