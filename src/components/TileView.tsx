import { Property } from '../types/Property'

interface TileViewProps {
    properties: Property[];
    onDelete: (id: number) => void;
    onPropertyClick: (property: Property) => void;
}

export function TileView({
    properties,
    onDelete,
    onPropertyClick
}: TileViewProps) {
    return (
        <div className="tiles-container">
            {properties.map((property, index) => (
                <div
                    key={property.id}
                    className="property-tile"
                    onClick={() => onPropertyClick(property)}
                >
                    <div className="tile-header">
                        <span className="tile-index">#{index + 1}</span>
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
                            {property.notes || 'No notes'}
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