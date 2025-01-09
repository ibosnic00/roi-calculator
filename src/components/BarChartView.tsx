import { Property } from '../types/Property';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useRef, useEffect } from 'react';
import { calculateReturnPercentage } from '../utils/propertyCalculations';

interface BarChartViewProps {
  properties: Property[];
  parameters: {
    sp500Return: number;
    baseAppreciation: number;
    years: number;
    initialValueProperty: number | null;
    calculationMethod: 'appreciation' | 'roi_plus_appreciation' | 'appreciation_minus_maintenance' | 'roi_plus_appreciation_minus_maintenance';
  };
}

type MetricType = 'roi' | 'return10' | 'return20' | 'pricePerSqm';

export function BarChartView({ properties, parameters }: BarChartViewProps) {
  const [metric, setMetric] = useState<MetricType>('roi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chartHeight, setChartHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjust height based on screen width
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setChartHeight(width < 600 ? 300 : 400);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const getData = () => {
    return properties.map(property => {
      let value: number;
      switch (metric) {
        case 'roi':
          value = property.roi;
          break;
        case 'return10':
          value = calculateReturnPercentage(property, parameters, 10);
          break;
        case 'return20':
          value = calculateReturnPercentage(property, parameters, 20);
          break;
        case 'pricePerSqm':
          value = property.expectedPrice / property.apartmentSize;
          break;
      }
      return {
        name: `Property ${properties.indexOf(property) + 1}`,
        value: Number(value.toFixed(2))
      };
    }).sort((a, b) => 
      sortOrder === 'asc' ? a.value - b.value : b.value - a.value
    );
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'roi':
        return 'ROI (%)';
      case 'return10':
        return '10 Year Return (%)';
      case 'return20':
        return '20 Year Return (%)';
      case 'pricePerSqm':
        return 'Price per m²';
    }
  };

  const formatTooltipValue = (value: number) => {
    switch (metric) {
      case 'pricePerSqm':
        return `€${value.toLocaleString()}`;
      default:
        return `${value}%`;
    }
  };

  return (
    <div ref={containerRef} className="bar-chart-view">
      <div className="bar-chart-controls">
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricType)}
          className="popup-input"
        >
          <option value="roi">ROI</option>
          <option value="return10">10 Year Return</option>
          <option value="return20">20 Year Return</option>
          <option value="pricePerSqm">Price per m²</option>
        </select>
        <button
          className="sort-button"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: window.innerWidth < 600 ? 12 : 14 }}
            />
            <YAxis 
              label={{ 
                value: getMetricLabel(), 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: window.innerWidth < 600 ? 12 : 14 }
              }}
              tick={{ fontSize: window.innerWidth < 600 ? 12 : 14 }}
              tickFormatter={(value) => 
                metric === 'pricePerSqm' 
                  ? `€${value.toLocaleString()}`
                  : `${value}%`
              }
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), getMetricLabel()]}
            />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 