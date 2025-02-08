import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import '../styles/LocationTreeView.css';
import { RentalData } from '../utils/importedData';

interface LocationData {
  [city: string]: {
    [district: string]: string[];
  };
}

interface LocationTreeViewProps {
  data: LocationData;
  rentalData?: RentalData[];
  onSelect?: (location: { city: string; district?: string; neighborhood?: string }) => void;
}

export const LocationTreeView: React.FC<LocationTreeViewProps> = ({ data, rentalData = [], onSelect }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedNeighborhood, setHighlightedNeighborhood] = useState<string | null>(null);

  const handleSelection = (city: string, district?: string, neighborhood?: string) => {
    if (onSelect) {
      onSelect({ city, district, neighborhood });
    }
  };

  const formatName = (name: string) => 
    name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const normalizeString = (str: string) => {
    return str
      .normalize('NFKD')                // Normalize special characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[čć]/g, 'c')           // Replace specific Croatian characters
      .replace(/š/g, 's')
      .replace(/ž/g, 'z')
      .replace(/đ/g, 'd')
      .toLowerCase()                    // Convert to lowercase
      .replace(/\s+/g, ' ')            // Normalize spaces
      .trim();                         // Remove leading/trailing spaces
  };

  const getSampleSize = (city: string, district: string) => {
    // Format city name consistently for comparison
    const formattedCity = formatName(city);
    const cityData = rentalData.find(data => data.city === formattedCity);
    if (!cityData) return 0;

    let totalSamples = 0;

    // Sum up samples from all size ranges for this district
    for (const range of cityData.rentData) {
      // Try to find the district by normalized name
      const normalizedDistrict = normalizeString(district);
      const districtData = Object.entries(range.averageRents)
        .find(([key]) => normalizeString(key) === normalizedDistrict)?.[1];

      if (districtData?.sampleSize) {
        totalSamples += districtData.sampleSize;
      }
    }

    return totalSamples;
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setHighlightedNeighborhood(null);
    
    if (!term) return;

    const normalizedSearch = normalizeString(term);
    
    // Search through all cities and districts
    for (const [city, districts] of Object.entries(data)) {
      for (const [district, neighborhoods] of Object.entries(districts)) {
        // Check if any neighborhood matches the search term
        const matchingNeighborhood = neighborhoods.find(
          neighborhood => normalizeString(neighborhood).includes(normalizedSearch)
        );

        if (matchingNeighborhood) {
          setSelectedCity(city);
          setSelectedDistrict(district);
          setHighlightedNeighborhood(matchingNeighborhood);
          handleSelection(city, district, matchingNeighborhood);
          return;
        }
      }
    }
  };

  return (
    <div className="location-tree-view">
      <div className="search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search neighborhoods..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="city-tabs">
        {Object.keys(data).map((city) => (
          <button
            key={city}
            className={`city-tab ${selectedCity === city ? 'active' : ''}`}
            onClick={() => {
              // If clicking the same city, close it
              if (selectedCity === city) {
                setSelectedCity(null);
                setSelectedDistrict(null);
              } else {
                setSelectedCity(city);
                setSelectedDistrict(null);
                handleSelection(city);
              }
            }}
          >
            <MapPin size={16} />
            <span>{formatName(city)}</span>
          </button>
        ))}
      </div>
      
      {selectedCity && (
        <>
          <div className="district-tabs">
            {Object.keys(data[selectedCity]).map((district) => {
              const sampleSize = getSampleSize(selectedCity, district);
              return (
                <button
                  key={district}
                  className={`district-tab ${selectedDistrict === district ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDistrict(district);
                    handleSelection(selectedCity, district);
                  }}
                >
                  <span className="sample-size">{sampleSize}</span>
                  <span>{district}</span>
                </button>
              );
            })}
          </div>

          {selectedDistrict && (
            <div className="neighborhood-list">
              {data[selectedCity][selectedDistrict].map((neighborhood) => (
                <div 
                  key={neighborhood} 
                  className={`neighborhood-item ${neighborhood === highlightedNeighborhood ? 'highlighted' : ''}`}
                  onClick={() => handleSelection(selectedCity, selectedDistrict, neighborhood)}
                >
                  <span>{neighborhood}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LocationTreeView; 