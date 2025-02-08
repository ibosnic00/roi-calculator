import { useState, useEffect } from 'react';
import '../styles/Popup.css';
import { useRentalData } from '../contexts/RentalDataContext';
import { GetFullName } from '../utils/districtsZagreb';

interface RentEditPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rent: number) => void;
    currentRent: number;
    district: string;
    city?: string;
    apartmentSize?: number;
}

export function RentEditPopup({ 
    isOpen, 
    onClose, 
    onSave, 
    currentRent, 
    district,
    city,
    apartmentSize
}: RentEditPopupProps) {
    const { rentalData } = useRentalData();
    const [inputValue, setInputValue] = useState('0');
    const [suggestedRent, setSuggestedRent] = useState<number | null>(null);

    useEffect(() => {
        setInputValue(currentRent.toString());

        // Calculate suggested rent if we have all the necessary data
        if (city && district && apartmentSize) {
            // Find the city data
            const cityData = rentalData.find(data => 
                data.city.toLowerCase() === city.toLowerCase()
            );

            if (cityData) {
                // Find the appropriate size range
                const range = cityData.rentData.find(range =>
                    apartmentSize >= range.minSize && apartmentSize <= range.maxSize
                );

                if (range) {
                    // For Zagreb, convert district name to full name
                    const districtName = city.toLowerCase() === 'zagreb' 
                        ? GetFullName(district)
                        : district;

                    const rent = range.averageRents[districtName]?.rent || null;
                    setSuggestedRent(rent);
                }
            }
        }
    }, [currentRent, isOpen, city, district, apartmentSize, rentalData]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(Number(inputValue));
        onClose();
    };

    const handleClose = () => {
        setInputValue(currentRent.toString());
        onClose();
    };

    return (
        <div className="popup-overlay" onClick={handleClose}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <h3>Edit Rent for {district}</h3>
                <div>
                    <div className="popup-link-text">
                        Current value: €{currentRent}
                    </div>
                    
                    {suggestedRent !== null && (
                        <div className="popup-link-text">
                            Suggested value: €{suggestedRent}
                        </div>
                    )}
                    
                    <div className="input-wrapper">
                        <div className="popup-link-text">
                            New value:
                        </div>
                        <input
                            type="number"
                            className="popup-link-input"
                            placeholder="Enter new rent value..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                        />
                    </div>
                    <div className="popup-buttons">
                        <button className="popup-save" onClick={handleSave}>Save</button>
                        <button className="popup-cancel" onClick={handleClose}>Cancel</button>
                    </div>
                </div>
                <button className="popup-close" onClick={handleClose}>×</button>
            </div>
        </div>
    );
} 