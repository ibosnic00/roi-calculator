import { useState, useEffect } from 'react'
import { initializeRentalData, RentalData, RentRange } from '../utils/importedData'
import LocationTreeView from '../components/LocationTreeView'
import { loadLocationData } from '../utils/locationData'

export function SettingsPage() {
  const [importedData, setImportedData] = useState<RentalData[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('Zagreb')
  const [isLoading, setIsLoading] = useState(true)
  const [locationData, setLocationData] = useState({})
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);

  // Format city name consistently
  const formatCityName = (name: string) => 
    name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Get the current city's rental data
  const currentCityData = importedData.find(data => data.city === formatCityName(selectedCity));
  
  // Initialize selectedRange from the current city's data
  const [selectedRange, setSelectedRange] = useState<RentRange>(() => {
    const defaultRange: RentRange = { minSize: 0, maxSize: 0, averageRents: {} };
    return currentCityData?.rentData?.[0] || defaultRange;
  });

  // Update selectedRange when city or importedData changes
  useEffect(() => {
    const rentData = currentCityData?.rentData;
    if (rentData && rentData.length > 0) {
      setSelectedRange(rentData[0]);
    }
  }, [selectedCity, importedData, currentCityData]);

  // Load imported data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await initializeRentalData()
        setImportedData(data)
      } catch (error) {
        console.error('Error loading rental data:', error)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Load location data
  useEffect(() => {
    const loadData = async () => {
      const data = await loadLocationData()
      setLocationData(data)
    }
    loadData()
  }, [])

  return (
    <div className="p-4">
      
      {/* Location Tree View */}
      <div className="settings-section">
        <h2 className="section-title">Location Browser</h2>
        <LocationTreeView 
          data={locationData}
          rentalData={importedData}
          onSelect={({ city, district, neighborhood }) => {
            if (city) {
              setSelectedCity(city);
              setSelectedDistrict(district || null);
              setSelectedNeighborhood(neighborhood || null);
            }
          }}
        />
      </div>
      
      <div className="page-header">
        <h2>Rental Data for {formatCityName(selectedCity)}</h2>
      </div>
      <div className="settings-container">
        <div className={isLoading ? 'content-blur' : ''}>
          {currentCityData ? (
            <>
              <div className="rental-data-tabs">
                {currentCityData.rentData
                  .sort((a, b) => a.minSize - b.minSize)
                  .map(range => (
                    <button
                      key={range.minSize}
                      className={`tab-button ${selectedRange.minSize === range.minSize ? 'active' : ''}`}
                      onClick={() => setSelectedRange(range)}
                    >
                      {range.minSize}{range.maxSize === 999999 ? '+' : ` - ${range.maxSize}`} m²
                    </button>
                  ))}
              </div>

              <div className="rental-data-container">
                <table className="rental-data-table">
                  <thead>
                    <tr>
                      <th>Neighborhood</th>
                      <th>Monthly Rent (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedRange.averageRents)
                      .filter(([neighborhood]) => {
                        if (selectedNeighborhood || selectedDistrict) {
                          return neighborhood === selectedDistrict;
                        }
                        return true;
                      })
                      .sort(([, a], [, b]) => b.rent - a.rent)
                      .map(([neighborhood, data]) => (
                        <tr key={neighborhood}>
                          <td>{neighborhood}</td>
                          <td>€{data.rent} ({data.sampleSize} samples)</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-data-message">
              No rental data available for {formatCityName(selectedCity)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}