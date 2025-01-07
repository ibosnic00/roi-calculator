import { useState } from 'react';
import '../styles/Popup.css';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (value: string) => void;
  initialValue?: string;
  isReadOnly?: boolean;
}

export function Popup({ isOpen, onClose, onSave, initialValue = '', isReadOnly = false }: PopupProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(inputValue);
    }
    setIsEditing(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(initialValue);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        {isReadOnly && !isEditing ? (
          <div className="popup-link-text">
            <h3>Property Link</h3>
            <div className="link-container">
              <a href={initialValue} target="_blank" rel="noopener noreferrer">
                {initialValue}
              </a>
              <button className="popup-edit" onClick={handleEdit}>Edit</button>
            </div>
          </div>
        ) : (
          <div>
            <h3>{isEditing ? 'Edit Property Link' : 'Add Property Link'}</h3>
            <input
              type="url"
              className="popup-link-input"
              placeholder="Paste property link here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <div className="popup-buttons">
              <button className="popup-save" onClick={handleSave}>Save</button>
              <button className="popup-cancel" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
} 