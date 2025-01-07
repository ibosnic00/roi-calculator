import { Property } from '../types/Property'
import { useState } from 'react';
import { Popup } from './Popup';

interface TileViewProps {
    properties: Property[];
    onDelete: (id: number) => void;
    onPropertyClick: (property: Property) => void;
    onLinkChange: (id: number, link: string) => void;
}

export function TileView({
    properties,
    onDelete,
    onPropertyClick,
    onLinkChange
}: TileViewProps) {
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleIndexClick = (e: React.MouseEvent, propertyId: number) => {
        e.stopPropagation(); // Prevent tile click event
        setSelectedPropertyId(propertyId);
        setIsPopupOpen(true);
    };

    const handleLinkChange = (id: number, link: string) => {
        onLinkChange(id, link);
    };

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    return (
        <div className="tiles-container">
            <Popup 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)}
                onSave={selectedPropertyId ? (link) => handleLinkChange(selectedPropertyId, link) : undefined}
                initialValue={selectedProperty?.link}
                isReadOnly={!!selectedProperty?.link}
            />

            {properties.map((property, index) => (
                <div
                    key={property.id}
                    className="property-tile"
                    onClick={() => onPropertyClick(property)}
                >
                    <div className="tile-header">
                        <span 
                            className="tile-index"
                            onClick={(e) => handleIndexClick(e, property.id)}
                        >
                            #{index + 1}
                            <span className="notes">
                                {property.notes || 'No notes'}
                            </span>
                        </span>
                        <button
                            className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(property.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div className="tile-content">
                        <div className="tile-notes">
                            {property.neighborhood || 'No neighborhood'}
                        </div>
                        <div className="tile-price">
                            €{property.expectedPrice.toLocaleString()}
                        </div>
                        <div className="tile-roi">
                            ROI: {property.roi.toFixed(2)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
} 