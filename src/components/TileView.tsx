import { useState } from 'react';
import { Property } from '../types/Property';
import { Popup } from './Popup';
import {
    DndContext,
    useSensor,
    useSensors,
    DragOverlay,
    PointerSensor,
    TouchSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Active, DragEndEvent } from '@dnd-kit/core';
import { NeighborhoodPopup } from './NeighborhoodPopup';
import { GetFullName } from '../utils/districtsZagreb';
import { ConfirmationPopup } from './ConfirmationPopup';

interface TileViewProps {
    properties: Property[];
    onDelete: (id: number) => void;
    onPropertyClick: (property: Property) => void;
    onLinkChange: (id: number, link: string) => void;
    onReorder: (startIndex: number, endIndex: number) => void;
    onNeighborhoodChange: (id: number, neighborhood: string, subneighborhood: string | null) => void;
    onFavoriteToggle: (id: number) => void;
    onSoldToggle: (id: number) => void;
}

const SortableTile = ({ property, index, onPropertyClick, onIndexClick, onFavoriteToggle, onSoldToggle, onDeleteClick }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: property.id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`property-tile ${isDragging ? 'dragging' : ''} ${property.isSold ? 'sold' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="tile-content" onClick={() => !isDragging && onPropertyClick(property)}>
                <div className="tile-header">
                    <span
                        className="tile-index"
                        onClick={(e) => onIndexClick(e, property.id)}
                    >
                        #{index + 1}
                        <span className="notes">
                            {property.subneighborhood || GetFullName(property.neighborhood) || 'No neighborhood'}
                        </span>
                    </span>
                    <div className="tile-actions">
                        <button
                            className={`favorite-button ${property.isFavorite ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFavoriteToggle(property.id);
                            }}
                        >
                            {property.isFavorite ? '★' : '☆'}
                        </button>
                        <button
                            className={`sold-button ${property.isSold ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSoldToggle(property.id);
                            }}
                        >
                            💸
                        </button>
                        <button
                            className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(property.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
                <div className="tile-content">
                    <div className="tile-price">
                        €{property.expectedPrice.toLocaleString()}
                    </div>
                    <div className="tile-roi">
                        ROI: {property.roi.toFixed(2)}%
                    </div>
                    <div className="tile-notes">
                        {property.notes || ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

export function TileView({ properties, onDelete, onPropertyClick, onLinkChange, onReorder, onNeighborhoodChange, onFavoriteToggle, onSoldToggle }: TileViewProps) {
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeId, setActiveId] = useState<Active | null>(null);
    const [isNeighborhoodPopupOpen, setIsNeighborhoodPopupOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 250, // 250ms press before drag starts
                tolerance: 5, // 5px movement tolerance during delay
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = properties.findIndex((p) => p.id === active.id);
            const newIndex = properties.findIndex((p) => p.id === over.id);
            onReorder(oldIndex, newIndex);
        }
        setActiveId(null);
    };

    const handleDragStart = (event: { active: Active }) => {
        setActiveId(event.active);
    };

    const handleIndexClick = (e: React.MouseEvent, propertyId: number) => {
        e.stopPropagation();
        setSelectedPropertyId(propertyId);
        setIsPopupOpen(true);
    };

    const handleLinkChange = (id: number, link: string) => {
        onLinkChange(id, link);
    };

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    const activeProperty = properties.find(p => p.id === activeId?.id);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="tiles-container">
                <Popup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    onSave={selectedPropertyId ? (link) => handleLinkChange(selectedPropertyId, link) : undefined}
                    initialValue={selectedProperty?.link}
                    isReadOnly={!!selectedProperty?.link}
                />

                <NeighborhoodPopup
                    isOpen={isNeighborhoodPopupOpen}
                    onClose={() => setIsNeighborhoodPopupOpen(false)}
                    onSave={(neighborhood, subneighborhood) => {
                        if (selectedPropertyId) {
                            onNeighborhoodChange(selectedPropertyId, neighborhood, subneighborhood);
                            setIsNeighborhoodPopupOpen(false);
                        }
                    }}
                    initialNeighborhood={selectedProperty?.neighborhood}
                    initialSubneighborhood={selectedProperty?.subneighborhood}
                />

                <SortableContext items={properties.map(p => p.id)} strategy={rectSortingStrategy}>
                    {properties.map((property, index) => (
                        <SortableTile
                            key={property.id}
                            property={property}
                            index={index}
                            onDelete={onDelete}
                            onDeleteClick={setDeleteId}
                            onPropertyClick={onPropertyClick}
                            onIndexClick={handleIndexClick}
                            onFavoriteToggle={onFavoriteToggle}
                            onSoldToggle={onSoldToggle}
                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeProperty ? (
                        <div className="property-tile dragging">
                            <div className="tile-content">
                                <div className="tile-header">
                                    <span className="tile-index">
                                        #{properties.findIndex(p => p.id === activeProperty.id) + 1}
                                    </span>
                                </div>
                                <div className="tile-content">
                                    <div className="tile-notes">
                                        {activeProperty.neighborhood || 'No neighborhood'}
                                    </div>
                                    <div className="tile-price">
                                        €{activeProperty.expectedPrice.toLocaleString()}
                                    </div>
                                    <div className="tile-roi">
                                        ROI: {activeProperty.roi.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>

                <ConfirmationPopup
                    isOpen={deleteId !== null}
                    onClose={() => setDeleteId(null)}
                    onConfirm={() => {
                        if (deleteId !== null) {
                            onDelete(deleteId);
                            setDeleteId(null);
                        }
                    }}
                    propertyInfo={properties.find(p => p.id === deleteId) && {
                        neighborhood: GetFullName(properties.find(p => p.id === deleteId)!.subneighborhood),
                        expectedPrice: properties.find(p => p.id === deleteId)!.expectedPrice
                    }}
                />
            </div>
        </DndContext>
    );
} 