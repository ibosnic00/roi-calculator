import { useState, useEffect } from 'react';
import { loadLocationData } from '../utils/locationData';
import '../styles/Popup.css';

interface NeighborhoodPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (district: string, neighbourhood: string | null, city: string) => void;
    initialDistrict?: string;
    initialNeighbourhood?: string | null;
    initialCity?: string;
}

interface LocationData {
    [city: string]: {
        [district: string]: string[];
    };
}

export function NeighborhoodPopup({
    isOpen,
    onClose,
    onSave,
    initialDistrict,
    initialNeighbourhood,
    initialCity
}: NeighborhoodPopupProps) {
    const [locationData, setLocationData] = useState<LocationData>({});
    const [city, setCity] = useState(initialCity || '');
    const [district, setDistrict] = useState(initialDistrict || '');
    const [neighbourhood, setNeighbourhood] = useState(initialNeighbourhood || '');

    // Load location data
    useEffect(() => {
        const loadData = async () => {
            const data = await loadLocationData();
            setLocationData(data);
        };
        loadData();
    }, []);

    // Reset form when initial values change
    useEffect(() => {
        setCity(initialCity || '');
        setDistrict(initialDistrict || '');
        setNeighbourhood(initialNeighbourhood || '');
    }, [initialCity, initialDistrict, initialNeighbourhood]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (district && city) {
            onSave(district, neighbourhood || null, city);
        }
        onClose();
    };

    const formatCityName = (name: string) =>
        name.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit Location</h2>
                <div className="popup-form">
                    <select
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            setDistrict('');
                            setNeighbourhood('');
                        }}
                        className="popup-input"
                    >
                        <option value="">Select City</option>
                        {Object.keys(locationData).map(cityName => (
                            <option key={cityName} value={cityName}>
                                {formatCityName(cityName)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={district}
                        onChange={(e) => {
                            setDistrict(e.target.value);
                            setNeighbourhood('');
                        }}
                        className="popup-input"
                        disabled={!city}
                    >
                        <option value="">Select District</option>
                        {city && Object.keys(locationData[city] || {}).map(districtName => (
                            <option key={districtName} value={districtName}>
                                {districtName}
                            </option>
                        ))}
                    </select>

                    {district && (
                        <select
                            value={neighbourhood}
                            onChange={(e) => setNeighbourhood(e.target.value)}
                            className="popup-input"
                        >
                            <option value="">Select Neighbourhood</option>
                            {city && district && locationData[city][district].map(n => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="popup-actions">
                        <button onClick={handleSave} className="save-button">
                            Save
                        </button>
                        <button onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 