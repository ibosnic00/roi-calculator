import { useState } from 'react';
import '../styles/Popup.css';

interface RentEditPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newRent: number) => void;
    currentRent: number;
    neighborhood: string;
}

export function RentEditPopup({ isOpen, onClose, onSave, currentRent, neighborhood }: RentEditPopupProps) {
    const [inputValue, setInputValue] = useState(currentRent.toString());

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(Number(inputValue));
        onClose();
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <h3>Edit Rent for {neighborhood}</h3>
                <div>
                    <div className="popup-link-text">
                        Current value: €{currentRent}
                    </div>
                    <input
                        type="number"
                        className="popup-link-input"
                        placeholder="Enter new rent value..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoFocus
                    />
                    <div className="popup-buttons">
                        <button className="popup-save" onClick={handleSave}>Save</button>
                        <button className="popup-cancel" onClick={onClose}>Cancel</button>
                    </div>
                </div>
                <button className="popup-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
} 