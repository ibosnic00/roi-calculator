import { useState, useEffect } from 'react';
import { Property } from '../types/Property'
import { LineChartView } from './LineChartView';
import { BarChartView } from './BarChartView';

interface GraphViewProps {
  properties: Property[];
}

interface DataPoint {
  year: number;
  [key: string]: number | undefined;
  sp500Value?: number;
}

interface Parameters {
  sp500Return: number;
  baseAppreciation: number;
  years: number;
  initialValueProperty: number | null;
  calculationMethod: 'appreciation' | 'roi_plus_appreciation' | 'appreciation_minus_maintenance' | 'roi_plus_appreciation_minus_maintenance';
}

interface VisibilityState {
  [key: string]: boolean;
  sp500Value: boolean;
}

export function GraphView({ properties }: GraphViewProps) {
  const [activeTab, setActiveTab] = useState<'line' | 'bar'>('line');
  // Load initial parameters from localStorage or use defaults
  const [parameters, setParameters] = useState<Parameters>(() => {
    const savedParams = localStorage.getItem('graphParameters')
    return savedParams ? JSON.parse(savedParams) : {
      sp500Return: 10,
      baseAppreciation: 3,
      years: 30,
      initialValueProperty: properties[0]?.id || null,
      calculationMethod: 'roi_plus_appreciation_minus_maintenance'
    }
  })

  // Save parameters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('graphParameters', JSON.stringify(parameters))
  }, [parameters])

  // Update initialValueProperty when properties change
  useEffect(() => {
    if (properties.length > 0 && !properties.find(p => p.id === parameters.initialValueProperty)) {
      setParameters(prev => ({
        ...prev,
        initialValueProperty: properties[0].id
      }))
    }
  }, [properties])

  // Modify visibility state to use property IDs
  const [visibleLines, setVisibleLines] = useState<VisibilityState>(() => {
    const savedVisibility = localStorage.getItem('graphVisibility')
    if (savedVisibility) {
      return JSON.parse(savedVisibility)
    }
    const initial: VisibilityState = {
      sp500Value: false
    }
    properties.forEach(property => {
      initial[`property-${property.id}`] = true
    })
    return initial
  })

  // Save visibility state to localStorage
  useEffect(() => {
    localStorage.setItem('graphVisibility', JSON.stringify(visibleLines))
  }, [visibleLines])

  const [isLegendCollapsed, setIsLegendCollapsed] = useState(() => {
    const saved = localStorage.getItem('legendCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('legendCollapsed', JSON.stringify(isLegendCollapsed));
  }, [isLegendCollapsed]);

  // Add new state for parameters collapse
  const [isParametersCollapsed, setIsParametersCollapsed] = useState(() => {
    const saved = localStorage.getItem('parametersCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Add effect to save parameters collapse state
  useEffect(() => {
    localStorage.setItem('parametersCollapsed', JSON.stringify(isParametersCollapsed));
  }, [isParametersCollapsed]);

  const calculateValues = (): DataPoint[] => {
    const data: DataPoint[] = [];
    
    const selectedProperty = properties.find(p => p.id === parameters.initialValueProperty) || properties[0];
    const initialSP500Value = selectedProperty ? (selectedProperty.expectedPrice + selectedProperty.renovationCost) : 0;
    let sp500Value = initialSP500Value;

    for (let year = 0; year <= parameters.years; year++) {
      data[year] = {
        year,
        ...(visibleLines.sp500Value && {
          sp500Value: Math.round(sp500Value)
        })
      };
      sp500Value *= (1 + parameters.sp500Return / 100);
    }

    properties.forEach((property) => {
      const propertyKey = `property-${property.id}`;
      // Initialize visibility for new properties
      if (visibleLines[propertyKey] === undefined) {
        setVisibleLines(prev => ({
          ...prev,
          [propertyKey]: true
        }));
      }
      if (visibleLines[propertyKey]) {
        const totalInvestment = property.expectedPrice + property.renovationCost;
        let propertyValue = totalInvestment;
        const yearlyNetRental = property.monthlyRent * 12 * 0.8;
        
        const propertyAppreciation = (() => {
          switch (parameters.calculationMethod) {
            case 'appreciation':
              return parameters.baseAppreciation / 100;
            case 'roi_plus_appreciation':
              return parameters.baseAppreciation / 100 + (property.roi / 100);
            case 'appreciation_minus_maintenance':
            case 'roi_plus_appreciation_minus_maintenance': {
              const yearlyMaintenanceCost = property.maintenanceCostPerSqm * property.apartmentSize;
              const maintenancePercentage = (yearlyMaintenanceCost / (property.expectedPrice + property.renovationCost)) * 100;
              return parameters.calculationMethod === 'appreciation_minus_maintenance'
                ? parameters.baseAppreciation / 100 - (maintenancePercentage / 100)
                : parameters.baseAppreciation / 100 + (property.roi / 100) - (maintenancePercentage / 100);
            }
            default:
              return parameters.baseAppreciation / 100;
          }
        })();

        for (let year = 0; year <= parameters.years; year++) {
          data[year][propertyKey] = Math.round(propertyValue + yearlyNetRental * year);
          propertyValue *= (1 + propertyAppreciation);
        }
      }
    });

    return data;
  };

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: name === 'calculationMethod' 
        ? value 
        : name === 'initialValueProperty' 
          ? Number(value) || null 
          : Number(value)
    }));
  };

  // Add handler for legend clicks
  const handleLegendClick = (dataKey: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  const colors = ['#82ca9d', '#8884d8', '#ffc658', '#ff7300', '#00C49F'];

  // Update getLegendItems to use property IDs
  const getLegendItems = () => {
    const items = properties.map((property, index) => ({
      id: property.id,
      dataKey: `property-${property.id}`,
      name: `Property ${index + 1} (ROI: ${property.roi.toFixed(1)}%)`,
      color: colors[index % colors.length],
      visible: visibleLines[`property-${property.id}`]
    }));

    items.push({
      id: 500,
      dataKey: 'sp500Value',
      name: 'S&P 500 Investment',
      color: '#ff0000',
      visible: visibleLines.sp500Value
    });

    return items;
  };

  const renderCustomLegend = () => {
    const items = getLegendItems();
    
    return (
      <div className={`legend-container ${isLegendCollapsed ? 'collapsed' : ''}`}>
        <div className="legend-header">
          <span className="legend-title">Legend</span>
          <button 
            className="collapse-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLegendCollapsed((prev: boolean) => !prev);
            }}
            title={isLegendCollapsed ? "Expand legend" : "Collapse legend"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>
        <ul className={`custom-legend ${isLegendCollapsed ? 'collapsed' : ''}`}>
          {items.map(item => (
            <li 
              key={item.id}
              className={`legend-item ${!item.visible ? 'inactive' : ''}`}
              onClick={() => handleLegendClick(item.dataKey)}
            >
              <span className="legend-color" style={{ backgroundColor: item.color }}></span>
              <span className="legend-text" style={{ color: item.visible ? item.color : '#718096' }}>
                {item.visible ? '☑' : '☐'} {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Add effect to handle sold properties visibility
  useEffect(() => {
    setVisibleLines(prev => {
      const newVisibility = { ...prev };
      properties.forEach(property => {
        const propertyKey = `property-${property.id}`;
        // If property is sold and currently visible, hide it
        if (property.isSold && newVisibility[propertyKey]) {
          newVisibility[propertyKey] = false;
        }
        // If property is unsold and was previously hidden due to being sold, show it
        else if (!property.isSold && newVisibility[propertyKey] === false) {
          newVisibility[propertyKey] = true;
        }
        // Initialize visibility for new properties
        else if (newVisibility[propertyKey] === undefined) {
          newVisibility[propertyKey] = !property.isSold;
        }
      });
      return newVisibility;
    });
  }, [properties]);

  return (
    <div className="graph-container">
      <div className="graph-header">
        <h3>Investment Comparison</h3>
        <div className="graph-tabs">
          <button
            className={`tab-button ${activeTab === 'line' ? 'active' : ''}`}
            onClick={() => setActiveTab('line')}
          >
            Line Chart
          </button>
          <button
            className={`tab-button ${activeTab === 'bar' ? 'active' : ''}`}
            onClick={() => setActiveTab('bar')}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {activeTab === 'line' && (
        <>
          <div className={`parameters-container ${isParametersCollapsed ? 'collapsed' : ''}`}>
            <div className="parameters-header">
              <span className="parameters-title">Parameters</span>
              <button 
                className="collapse-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsParametersCollapsed((prev: boolean) => !prev);
                }}
                title={isParametersCollapsed ? "Expand parameters" : "Collapse parameters"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </button>
            </div>
            <div className={`graph-parameters ${isParametersCollapsed ? 'collapsed' : ''}`}>
              <div className="parameter-group">
                <label htmlFor="sp500Return">S&P 500 Return (%)</label>
                <input
                  type="number"
                  id="sp500Return"
                  name="sp500Return"
                  value={parameters.sp500Return}
                  onChange={handleParameterChange}
                  step="0.1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="baseAppreciation">Base Property Appreciation (%)</label>
                <input
                  type="number"
                  id="baseAppreciation"
                  name="baseAppreciation"
                  value={parameters.baseAppreciation}
                  onChange={handleParameterChange}
                  step="0.1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="years">Years</label>
                <input
                  type="number"
                  id="years"
                  name="years"
                  value={parameters.years}
                  onChange={handleParameterChange}
                  min="1"
                  max="100"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="initialValueProperty">Initial S&P 500 Investment</label>
                <select
                  id="initialValueProperty"
                  name="initialValueProperty"
                  value={parameters.initialValueProperty || ''}
                  onChange={handleParameterChange}
                  className="parameter-select"
                >
                  {properties.map((property, index) => (
                    <option key={property.id} value={property.id}>
                      Property {index + 1} ({(property.expectedPrice + property.renovationCost).toLocaleString()}€)
                    </option>
                  ))}
                </select>
              </div>
              <div className="parameter-group">
                <label htmlFor="calculationMethod">Property Value Calculation</label>
                <select
                  id="calculationMethod"
                  name="calculationMethod"
                  value={parameters.calculationMethod}
                  onChange={handleParameterChange}
                  className="parameter-select"
                >
                  <option value="appreciation">Property Appreciation</option>
                  <option value="roi_plus_appreciation">ROI + Property Appreciation</option>
                  <option value="appreciation_minus_maintenance">Appreciation - Maintenance</option>
                  <option value="roi_plus_appreciation_minus_maintenance">ROI + Appreciation - Maintenance</option>
                </select>
              </div>
            </div>
          </div>
          {renderCustomLegend()}
          <LineChartView
            data={calculateValues()}
            visibleLines={visibleLines}
            properties={properties}
          />
        </>
      )}

      {activeTab === 'bar' && (
        <BarChartView 
          properties={properties} 
          parameters={parameters}
        />
      )}
    </div>
  );
} 