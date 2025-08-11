import { useState, useEffect, useRef } from 'react'
import { useRentalData } from '../contexts/RentalDataContext'
import { Property } from '../types/Property'
import { LocationData } from '../types/LocationData'
import { TableView } from '../components/TableView'
import { GraphView } from '../components/GraphView'
import { TileView } from '../components/TileView'
import { GetFullName } from '../utils/districtsZagreb';
import { NeighborhoodPopup } from '../components/NeighborhoodPopup';
import { RentEditPopup } from '../components/RentEditPopup';
import { loadLocationData, getAllNeighborhoods, getCityNeighborhoods, findLocationByNeighborhood as findLocationInData } from '../utils/locationData';
import '../styles/CalculationPage.css';

export function CalculationPage() {
  const { rentalData } = useRentalData()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [locationData, setLocationData] = useState<LocationData>({})
  const [formData, setFormData] = useState({
    askingPrice: '',
    apartmentSize: '',
    city: '',
    district: '',
    neighborhood: '',
    renovationCost: ''
  })
  const [isCustomNeighborhood, setIsCustomNeighborhood] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Load location data
  useEffect(() => {
    const loadData = async () => {
      const data = await loadLocationData()
      setLocationData(data)
    }
    loadData()
  }, [])

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
        // Only update properties that don't have custom rent
        if (!property.isCustomRent) {
          const newRent = getAverageRentFromContext(property.district, property.apartmentSize, property.city)
          const newRoi = calculateROI(property.expectedPrice, newRent, property.renovationCost)
          return {
            ...property,
            monthlyRent: newRent,
            roi: newRoi
          }
        }
        return property;
      })
    )
  }, [rentalData])

  const getAverageRentFromContext = (district: string, size: number, city?: string): number => {
    // Find the city data
    const cityData = rentalData.find(data =>
      data.city.toLowerCase() === (city || '').toLowerCase()
    );

    if (!cityData) return 0;

    // Find the appropriate size range
    const range = cityData.rentData.find(range =>
      size >= range.minSize && size <= range.maxSize
    );

    if (!range) return 0;

    // For Zagreb, convert district name to full name
    if (city?.toLowerCase() === 'zagreb') {
      const fullName = GetFullName(district);
      return range.averageRents[fullName]?.rent || 0;
    }

    // For other cities, use the district name as is
    return range.averageRents[district]?.rent || 0;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'neighborhood' && value && !isCustomNeighborhood) {
      const location = findLocationInData(locationData, value);
      if (location) {
        setFormData(prev => ({
          ...prev,
          city: location.city,
          district: location.district,
          [name]: value
        }));
        return;
      }
    }
    
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

  const formatCityName = (name: string) =>
    name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const resetForm = () => {
    setFormData({
      askingPrice: '',
      apartmentSize: '',
      city: '',
      district: '',
      neighborhood: '',
      renovationCost: '0'
    })
    setIsCustomNeighborhood(false)
    setIsFormVisible(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const price = Number(formData.askingPrice)
    const size = Number(formData.apartmentSize)
    const renovationCost = Number(formData.renovationCost)

    const monthlyRent = getAverageRentFromContext(formData.district, size, formData.city)
    const roi = calculateROI(price, monthlyRent, renovationCost)

    // Calculate maintenance cost with 2 decimal places
    const maintenanceCost = Number((((price + renovationCost) / size) * 0.01).toFixed(2))

    const newProperty: Property = {
      id: Date.now(),
      askingPrice: price,
      expectedPrice: price,
      apartmentSize: size,
      district: formData.district,
      renovationCost: renovationCost,
      monthlyRent: monthlyRent,
      neighborhoodz: formData.neighborhood || '',
      roi: roi,
      notes: '',
      year: '',
      maintenanceCostPerSqm: maintenanceCost,
      city: formData.city
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

  const [viewMode, setViewMode] = useState<'table' | 'tiles'>(() => {
    const savedViewMode = localStorage.getItem('viewMode')
    return (savedViewMode === 'table' || savedViewMode === 'tiles') ? savedViewMode : 'table'
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

  const handleNeighborhoodChange = (id: number, district: string, neighborhoodz: string | null, city: string) => {
    setProperties(properties.map(property => {
      if (property.id === id) {
        // Get new rent based on the new district and city
        const newRent = getAverageRentFromContext(district, property.apartmentSize, city);
        const newRoi = calculateROI(property.expectedPrice, newRent, property.renovationCost);
        
        return {
          ...property,
          district,
          neighborhoodz: neighborhoodz || '',
          city,
          monthlyRent: newRent,
          roi: newRoi,
          isCustomRent: false // Reset custom rent flag when district changes
        };
      }
      return property;
    }));
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
    setProperties(prevProperties => prevProperties.map(property => {
      if (property.id === id) {
        const newRoi = calculateROI(property.expectedPrice, rent, property.renovationCost);
        return {
          ...property,
          monthlyRent: rent,
          roi: newRoi,
          isCustomRent: true // Add flag to indicate manual override
        };
      }
      return property;
    }));
  };

  // Add new state for rent editing
  const [editingRentId, setEditingRentId] = useState<number | null>(null);

  const [showFavoritesHandler, setShowFavoritesHandler] = useState<(() => void) | null>(null);

  const handleShowFavoritesClick = () => {
    setShowOnlyFavorites((prev: boolean) => {
      if (!prev && showFavoritesHandler) {
        showFavoritesHandler();
      }
      return !prev;
    });
  };

  const filterNeighborhoods = (neighborhoods: string[]) => {
    if (!searchTerm) return neighborhoods;
    const search = searchTerm.toLowerCase();
    return neighborhoods.filter(n => n.toLowerCase().includes(search));
  };

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Update position when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
      // Update position on scroll or resize
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);

      // Add click outside handler
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        window.removeEventListener('scroll', updateDropdownPosition);
        window.removeEventListener('resize', updateDropdownPosition);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  return (
    <>
      {!isFormVisible ? (
        <>
          <div className="page-header">
            <h2>Investment Calculator</h2>
          </div>
          <div className="page-header">
            <div className="add-property-button-container">
              <button
                className="add-property-button"
                onClick={() => setIsFormVisible(true)}
              >
                + Add new property
              </button>
            </div>
            {properties.length > 0 && (
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
                      onClick={handleShowFavoritesClick}
                      title="Show Favorites Only"
                    >
                      ★
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div></>
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
                  <label htmlFor="city">City</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        city: e.target.value,
                        district: '',
                        neighborhood: ''
                      }));
                    }}
                    required
                    className="popup-input"
                  >
                    <option value="">Select City</option>
                    {Object.keys(locationData).map(city => (
                      <option key={city} value={city}>{formatCityName(city)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={e => {
                      const newDistrict = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        district: newDistrict,
                        neighborhood: ''
                      }));
                    }}
                    required
                    className="popup-input"
                    disabled={!formData.city}
                  >
                    <option value="">Select District</option>
                    {formData.city && Object.keys(locationData[formData.city] || {}).map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="neighborhood">
                    Neighbourhood
                  </label>
                  <div className="custom-select" ref={dropdownRef}>
                    <input
                      ref={inputRef}
                      type="text"
                      id="neighborhood"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, neighborhood: '' }));
                        }
                      }}
                      onFocus={() => {
                        setIsDropdownOpen(true);
                        updateDropdownPosition();
                      }}
                      placeholder="Type to search"
                      className="popup-input"
                      autoComplete="off"
                    />
                    {isDropdownOpen && (
                      <div 
                        className="dropdown-list"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          width: `${dropdownPosition.width}px`
                        }}
                      >
                        {filterNeighborhoods(
                          formData.city
                            ? (formData.district
                              ? locationData[formData.city][formData.district]
                              : getCityNeighborhoods(locationData, formData.city))
                            : getAllNeighborhoods(locationData)
                        ).map(neighborhood => (
                          <div
                            key={neighborhood}
                            className={`dropdown-item ${formData.neighborhood === neighborhood ? 'selected' : ''}`}
                            onClick={() => {
                              const e = {
                                target: {
                                  name: 'neighborhood',
                                  value: neighborhood
                                }
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleInputChange(e);
                              setSearchTerm(neighborhood);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {neighborhood}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                properties={properties}
                showOnlyFavorites={showOnlyFavorites}
                hideSold={showSold}
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
              onShowFavorites={(handler) => setShowFavoritesHandler(() => handler)}
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
                    {selectedProperty.neighborhoodz ?
                      `${selectedProperty.neighborhoodz} (${GetFullName(selectedProperty.district)})` :
                      GetFullName(selectedProperty.district)
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
        onSave={(district, neighborhoodz, city) => {
          if (selectedProperty) {
            handleNeighborhoodChange(selectedProperty.id, district, neighborhoodz, city);
            setIsNeighborhoodPopupOpen(false);
          }
        }}
        initialDistrict={selectedProperty?.district}
        initialNeighbourhood={selectedProperty?.neighborhoodz}
        initialCity={selectedProperty?.city}
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
        district={selectedProperty?.district || ''}
        city={selectedProperty?.city}
      />
    </>
  )
} 