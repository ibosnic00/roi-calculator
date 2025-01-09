import { Property } from '../types/Property';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

const COLORS = {
  default: '#8884d8',
  byNeighborhood: {
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#008400', '#FFBB28', '#FF8042', '#0088FE'],
  }
};

export function BarChartView({ properties, parameters }: BarChartViewProps) {
  const [metric, setMetric] = useState<MetricType>('roi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chartHeight, setChartHeight] = useState(400);
  const [colorByNeighborhood, setColorByNeighborhood] = useState(false);
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

  const getNeighborhoodColor = (neighborhood: string) => {
    const uniqueNeighborhoods = Array.from(new Set(properties.map(p => p.neighborhood)));
    const index = uniqueNeighborhoods.indexOf(neighborhood);
    return COLORS.byNeighborhood.colors[index % COLORS.byNeighborhood.colors.length];
  };

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
        value: Number(value.toFixed(2)),
        neighborhood: property.neighborhood,
        color: colorByNeighborhood ? getNeighborhoodColor(property.neighborhood) : COLORS.default
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

  const renderLegend = () => {
    if (!colorByNeighborhood) return null;

    const uniqueNeighborhoods = Array.from(new Set(properties.map(p => p.neighborhood)));
    
    return (
      <div className="neighborhood-legend">
        {uniqueNeighborhoods.map((neighborhood, index) => (
          <div key={neighborhood} className="neighborhood-legend-item">
            <span 
              className="color-box" 
              style={{ backgroundColor: COLORS.byNeighborhood.colors[index % COLORS.byNeighborhood.colors.length] }}
            />
            <span className="neighborhood-name">{neighborhood}</span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.neighborhood}</p>
          <div className="tooltip-content">
            <p>{label}</p>
            <p>{formatTooltipValue(data.value)}</p>
          </div>
        </div>
      );
    }
    return null;
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
        <button
          className={`color-toggle-button ${colorByNeighborhood ? 'active' : ''}`}
          onClick={() => setColorByNeighborhood(prev => !prev)}
          title="Color by Neighborhood"
        >
          🎨
        </button>
      </div>
      {colorByNeighborhood && renderLegend()}
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
              content={<CustomTooltip />}
            />
            <Bar 
              dataKey="value" 
              fill="#8884d8"
              stroke={colorByNeighborhood ? '#fff' : undefined}
              strokeWidth={colorByNeighborhood ? 1 : 0}
            >
              {getData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 