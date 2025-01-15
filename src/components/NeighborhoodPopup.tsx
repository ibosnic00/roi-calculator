import { useState, useEffect } from 'react';
import { GetAllDistricts, GetSubneighbourhoodsInNeighbourhood, GetShortName } from '../utils/districtsZagreb';
import '../styles/Popup.css';

interface NeighborhoodPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (neighborhood: string, subneighborhood: string | null) => void;
    initialNeighborhood?: string;
    initialSubneighborhood?: string | null;
}

export function NeighborhoodPopup({
    isOpen,
    onClose,
    onSave,
    initialNeighborhood,
    initialSubneighborhood
}: NeighborhoodPopupProps) {
    const [neighborhood, setNeighborhood] = useState(initialNeighborhood || '');
    const [subneighborhood, setSubneighborhood] = useState(initialSubneighborhood || '');

    useEffect(() => {
        setNeighborhood(initialNeighborhood || '');
        setSubneighborhood(initialSubneighborhood || '');
    }, [initialNeighborhood, initialSubneighborhood]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (neighborhood) {
            onSave(GetShortName(neighborhood), subneighborhood || null);
        }
        onClose();
    };

    const subneighborhoods = neighborhood ? GetSubneighbourhoodsInNeighbourhood(neighborhood) : [];
    const districts = GetAllDistricts();

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit Neighborhood</h2>
                <div className="popup-form">
                    <select
                        value={neighborhood}
                        onChange={(e) => {
                            setNeighborhood(e.target.value);
                            setSubneighborhood('');
                        }}
                        className="popup-input"
                    >
                        <option value="">Select Neighbourhood</option>
                        {districts.map((district) => (
                            <option key={district} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>

                    {subneighborhoods.length > 0 && (
                        <select
                            value={subneighborhood}
                            onChange={(e) => setSubneighborhood(e.target.value)}
                        >
                            <option value="">Select subneighborhood</option>
                            {subneighborhoods.map((sub) => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="popup-buttons">
                        <button 
                            className="popup-save"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                        <button 
                            className="popup-cancel" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 