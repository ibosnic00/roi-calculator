import { useState } from 'react';
import { Property } from '../types/Property';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface BarChartViewProps {
  properties: Property[];
}

type MetricOption = {
  key: keyof Property | 'pricePerSqm';
  label: string;
  formatter: (value: number) => string;
};

export function BarChartView({ properties }: BarChartViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricOption>({
    key: 'roi',
    label: 'ROI (%)',
    formatter: (value: number) => `${value.toFixed(2)}%`
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const metricOptions: MetricOption[] = [
    {
      key: 'roi',
      label: 'ROI (%)',
      formatter: (value: number) => `${value.toFixed(2)}%`
    },
    {
      key: 'pricePerSqm',
      label: 'Price per m²',
      formatter: (value: number) => `€${value.toLocaleString()}`
    },
    {
      key: 'monthlyRent',
      label: 'Monthly Rent',
      formatter: (value: number) => `€${value.toLocaleString()}`
    }
  ];

  const getData = () => {
    const data = properties.map((property, index) => {
      const pricePerSqm = property.expectedPrice / property.apartmentSize;
      return {
        name: `Property ${index + 1}`,
        value: selectedMetric.key === 'pricePerSqm' ? pricePerSqm : property[selectedMetric.key as keyof Property],
        property
      };
    });

    return data.sort((a, b) => {
      const aValue = Number(a.value) || 0;
      const bValue = Number(b.value) || 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  return (
    <div>
      <div className="bar-chart-controls">
        <select
          value={selectedMetric.key}
          onChange={(e) => {
            const metric = metricOptions.find(m => m.key === e.target.value);
            if (metric) setSelectedMetric(metric);
          }}
          className="popup-input"
        >
          {metricOptions.map(option => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
          className="sort-button"
        >
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{
              value: selectedMetric.label,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip
            formatter={(value: number) => [selectedMetric.formatter(value), selectedMetric.label]}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 