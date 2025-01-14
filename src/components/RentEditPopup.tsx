import { useState, useEffect } from 'react';
import '../styles/Popup.css';

interface RentEditPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rent: number) => void;
    currentRent: number;
    neighborhood: string;
}

export function RentEditPopup({ isOpen, onClose, onSave, currentRent, neighborhood }: RentEditPopupProps) {
    const [inputValue, setInputValue] = useState('0');

    useEffect(() => {
        setInputValue('0');
    }, [currentRent, isOpen]);

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
                <h3>Edit Rent for {neighborhood}</h3>
                <div>
                    <div className="popup-link-text">
                        Current value: €{currentRent}
                    </div>
                    
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