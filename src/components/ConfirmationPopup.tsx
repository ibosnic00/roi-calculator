import '../styles/Popup.css';

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyInfo?: {
    neighborhood: string;
    expectedPrice: number;
  };
}

export function ConfirmationPopup({ isOpen, onClose, onConfirm, propertyInfo }: ConfirmationPopupProps) {
  if (!isOpen) return null;

  const message = propertyInfo 
    ? <>
        Are you sure you want to delete property<br/>
        <span style={{
          fontWeight: 'bold',
          color: '#01020e',  // Blue color
          fontSize: '1.1em',
          display: 'block',
          margin: '0.5rem 0'
        }}>
          {propertyInfo.neighborhood} - €{propertyInfo.expectedPrice.toLocaleString()}
        </span>
      </>
    : "Are you sure you want to delete this property?";

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <h3>Confirm Action</h3>
        <p>{message}</p>
        <div className="popup-buttons">
          <button className="popup-save" onClick={onConfirm}>
            Yes, delete
          </button>
          <button className="popup-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 