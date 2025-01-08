import { useState, useEffect } from 'react';
import { Property } from '../types/Property'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
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

  // Add state for line visibility with persistence
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>(() => {
    const savedVisibility = localStorage.getItem('graphVisibility')
    if (savedVisibility) {
      return JSON.parse(savedVisibility)
    }
    const initial: { [key: string]: boolean } = {
      sp500Value: false
    }
    properties.forEach((_, index) => {
      initial[`property${index}`] = true
    })
    return initial
  })

  // Save visibility state to localStorage
  useEffect(() => {
    localStorage.setItem('graphVisibility', JSON.stringify(visibleLines))
  }, [visibleLines])

  const calculateValues = (): DataPoint[] => {
    const data: DataPoint[] = [];
    
    // Get selected property's value or default to first property
    const selectedProperty = properties.find(p => p.id === parameters.initialValueProperty) || properties[0];
    const initialSP500Value = selectedProperty ? (selectedProperty.expectedPrice + selectedProperty.renovationCost) : 0;
    let sp500Value = initialSP500Value;

    // Initialize data array with years
    for (let year = 0; year <= parameters.years; year++) {
      data[year] = {
        year,
        // Only include S&P 500 if visible
        ...(visibleLines.sp500Value && {
          sp500Value: Math.round(sp500Value)
        })
      };
      sp500Value *= (1 + parameters.sp500Return / 100);
    }

    // Calculate values for each visible property
    properties.forEach((property, index) => {
      const propertyKey = `property${index}`;
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

  const data = calculateValues();
  const colors = ['#82ca9d', '#8884d8', '#ffc658', '#ff7300', '#00C49F'];

  // Create a separate array for legend items
  const getLegendItems = () => {
    const items = properties.map((property, index) => ({
      id: property.id,
      dataKey: `property${index}`,
      name: `Property ${index + 1} (ROI: ${property.roi.toFixed(1)}%)`,
      color: colors[index % colors.length],
      visible: visibleLines[`property${index}`]
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
      <ul className="custom-legend">
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
    );
  };

  const formatTooltipName = (name: string): string => {
    if (name.startsWith('Property ')) {
      return name.split(' ')[1].split('(')[0].trim();
    }
    if (name === 'S&P 500 Investment') {
      return 'S&P';
    }
    return name;
  };

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
          <div className="graph-parameters">
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
          {renderCustomLegend()}
          <LineChartView
            data={calculateValues()}
            visibleLines={visibleLines}
            properties={properties}
            formatTooltipName={formatTooltipName}
          />
        </>
      )}

      {activeTab === 'bar' && (
        <BarChartView properties={properties} />
      )}
    </div>
  );
} 