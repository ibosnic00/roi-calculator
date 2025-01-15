import { Property } from '../types/Property'
import { useState } from 'react';
import { Popup } from './Popup';
import { NeighborhoodPopup } from './NeighborhoodPopup';
import { GetFullName } from '../utils/districtsZagreb';
import { RentEditPopup } from './RentEditPopup';
import { ConfirmationPopup } from './ConfirmationPopup';

interface TableViewProps {
  properties: Property[];
  onExpectedPriceChange: (id: number, price: string) => void;
  onNotesChange: (id: number, notes: string) => void;
  onYearChange: (id: number, year: string) => void;
  onDelete: (id: number) => void;
  onMaintenanceCostChange: (id: number, cost: string) => void;
  onLinkChange: (id: number, link: string) => void;
  onNeighborhoodChange: (id: number, neighborhood: string, subneighborhood: string | null) => void;
  onFavoriteToggle: (id: number) => void;
  onSoldToggle: (id: number) => void;
  onRentChange: (id: number, rent: number) => void;
}

export function TableView({
  properties,
  onExpectedPriceChange,
  onNotesChange,
  onYearChange,
  onDelete,
  onMaintenanceCostChange,
  onLinkChange,
  onNeighborhoodChange,
  onFavoriteToggle,
  onSoldToggle,
  onRentChange
}: TableViewProps) {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<number | null>(null);
  const [editingYearId, setEditingYearId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isNeighborhoodPopupOpen, setIsNeighborhoodPopupOpen] = useState(false);
  const [editingRentId, setEditingRentId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleIndexClick = (property: Property) => {
    if (property.link) {
      window.open(property.link, '_blank');
    } else {
      setSelectedPropertyId(property.id);
      setIsPopupOpen(true);
    }
  };

  const handleLinkChange = (id: number, link: string) => {
    onLinkChange(id, link);
  };

  const handleIndexRightClick = (e: React.MouseEvent, property: Property) => {
    e.preventDefault(); // Prevent default context menu
    setSelectedPropertyId(property.id);
    setIsPopupOpen(true);
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="table-container">
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

      <RentEditPopup
        isOpen={editingRentId !== null}
        onClose={() => setEditingRentId(null)}
        onSave={(rent) => {
          if (editingRentId) {
            onRentChange(editingRentId, rent);
            setEditingRentId(null);
          }
        }}
        currentRent={properties.find(p => p.id === editingRentId)?.monthlyRent || 0}
        neighborhood={selectedProperty?.neighborhood || ''}
      />

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

      <table className="properties-table">
        <thead>
          <tr>
            <th className="index-column">#
              <div className="unit">(link)</div></th>
            <th>Neighborhood</th>
            <th>
              Asking Price
              <div className="unit">(€)</div>
            </th>
            <th>
              Expected Price
              <div className="unit">(€)</div>
            </th>
            <th>
              Size
              <div className="unit">(m²)</div>
            </th>
            <th>
              Price/m²
              <div className="unit">(€)</div>
            </th>
            <th>
              Rent
              <div className="unit">(€)</div>
            </th>
            <th>
              Renovation
              <div className="unit">(€)</div>
            </th>
            <th>
              Maintenance
              <div className="unit">(€/m²/y)</div>
            </th>
            <th>
              ROI
              <div className="unit">(%)</div>
            </th>
            <th>
              ROI
              <div className="unit">(years)</div>
            </th>
            <th>Year
              <div className="unit">(construction)</div></th>
            <th>Notes</th>
            <th>Favorite</th>
            <th>Sold</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => (
            <tr key={property.id} className={property.isSold ? 'sold-row' : ''}>
              <td
                className={`index-column ${property.link ? 'has-link' : ''}`}
                onClick={() => handleIndexClick(property)}
                onContextMenu={(e) => handleIndexRightClick(e, property)}
                style={{ cursor: property.link ? 'pointer' : 'default' }}
              >
                {index + 1}
              </td>
              {property.subneighborhood ? (
                <td onClick={() => {
                  setSelectedPropertyId(property.id);
                  setIsNeighborhoodPopupOpen(true);
                }} style={{ cursor: 'pointer' }}>
                  {property.subneighborhood}
                  <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                    {GetFullName(property.neighborhood)}
                  </div>
                </td>
              ) : (
                <td onClick={() => {
                  setSelectedPropertyId(property.id);
                  setIsNeighborhoodPopupOpen(true);
                }} style={{ cursor: 'pointer' }}>
                  {GetFullName(property.neighborhood)}
                </td>
              )}
              <td>{property.askingPrice?.toLocaleString() || '0'}</td>
              <td>
                {editingPriceId === property.id ? (
                  <input
                    type="text"
                    value={property.expectedPrice || ''}
                    onChange={(e) => onExpectedPriceChange(property.id, e.target.value)}
                    onBlur={() => setEditingPriceId(null)}
                    className="expected-price-input"
                    placeholder="Expected price"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingPriceId(property.id)}
                    className="expected-price-text"
                    style={{ cursor: 'pointer' }}
                  >
                    {property.expectedPrice?.toLocaleString() || 'Add price...'}
                  </div>
                )}
              </td>
              <td>{property.apartmentSize}</td>
              <td>
                {(((property.expectedPrice || 0) + (property.renovationCost || 0)) / (property.apartmentSize || 1)).toFixed(2)}
              </td>
              <td 
                onClick={() => setEditingRentId(property.id)}
                style={{ cursor: 'pointer' }}
              >
                {property.monthlyRent?.toLocaleString() || '0'}
              </td>
              <td>{property.renovationCost?.toLocaleString() || '0'}</td>
              <td>
                {editingMaintenanceId === property.id ? (
                  <input
                    type="number"
                    value={property.maintenanceCostPerSqm || ''}
                    onChange={(e) => onMaintenanceCostChange(property.id, e.target.value)}
                    onBlur={() => setEditingMaintenanceId(null)}
                    className="maintenance-input"
                    placeholder="€/m²/y"
                    step="0.5"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingMaintenanceId(property.id)}
                    className="maintenance-text"
                    style={{ cursor: 'pointer' }}
                  >
                    {property.maintenanceCostPerSqm || 'Add cost...'}
                  </div>
                )}
              </td>
              <td>{property.roi?.toFixed(2) || '0'}%</td>
              <td>{((100 / (property.roi || 1))).toFixed(1)}</td>
              <td>
                {editingYearId === property.id ? (
                  <input
                    type="text"
                    value={property.year || ''}
                    onChange={(e) => onYearChange(property.id, e.target.value)}
                    onBlur={() => setEditingYearId(null)}
                    className="year-input"
                    placeholder="Year"
                    maxLength={4}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingYearId(property.id)}
                    className="year-text"
                    style={{ cursor: 'pointer' }}
                  >
                    {property.year || 'Add year...'}
                  </div>
                )}
              </td>
              <td>
                {editingNoteId === property.id ? (
                  <input
                    type="text"
                    value={property.notes || ''}
                    onChange={(e) => onNotesChange(property.id, e.target.value)}
                    onBlur={() => setEditingNoteId(null)}
                    className="notes-input"
                    placeholder="Add notes..."
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingNoteId(property.id)}
                    className="notes-text"
                    style={{ cursor: 'pointer' }}
                  >
                    {property.notes || 'Add notes...'}
                  </div>
                )}
              </td>
              <td>
                <button
                  className={`favorite-button ${property.isFavorite ? 'active' : ''}`}
                  onClick={() => onFavoriteToggle(property.id)}
                >
                  {property.isFavorite ? '★' : '☆'}
                </button>
              </td>
              <td>
                <button
                  className={`sold-button ${property.isSold ? 'active' : ''}`}
                  onClick={() => onSoldToggle(property.id)}
                >
                  💸
                </button>
              </td>
              <td>
                <button
                  onClick={() => setDeleteId(property.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 