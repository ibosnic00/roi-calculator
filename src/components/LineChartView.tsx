import { Property } from '../types/Property'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts'

interface LineChartViewProps {
    data: any[];
    visibleLines: { [key: string]: boolean };
    properties: Property[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload) return null;

    const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return (
        <div className="custom-tooltip">
            <p className="tooltip-label">Year {label}</p>
            <div className="tooltip-content">
                <div className="tooltip-column">
                    {sortedPayload.slice(0, Math.ceil(sortedPayload.length / 2)).map((entry, index) => (
                        <div key={index} className="tooltip-item">
                            <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
                            <span className="tooltip-name">{entry.name}</span>
                            <span className="tooltip-value">{entry.value?.toLocaleString()}€</span>
                        </div>
                    ))}
                </div>
                {payload.length > 1 && (
                    <div className="tooltip-column">
                        {sortedPayload.slice(Math.ceil(sortedPayload.length / 2)).map((entry, index) => (
                            <div key={index} className="tooltip-item">
                                <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
                                <span className="tooltip-name">{entry.name}</span>
                                <span className="tooltip-value">{entry.value?.toLocaleString()}€</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export function LineChartView({ data, visibleLines, properties }: LineChartViewProps) {
    const colors = ['#82ca9d', '#8884d8', '#ffc658', '#ff7300', '#00C49F'];

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="year"
                    label={{ value: 'Years', position: 'bottom' }}
                />
                <YAxis
                    label={{
                        value: 'Value (€)',
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                            textAnchor: 'middle',
                            fontSize: '0.75rem',
                            display: window.innerWidth <= 768 ? 'none' : 'block'
                        }
                    }}
                    tickFormatter={(value) => {
                        if (window.innerWidth <= 768) {
                            return `${(value / 1000)}k`;
                        }
                        return `${(value / 1000).toFixed(0)}k`;
                    }}
                    width={window.innerWidth <= 768 ? 35 : 60}
                />
                <Tooltip content={<CustomTooltip />} />

                {properties.map((property, index) => {
                    const propertyKey = `property${index}`;
                    return visibleLines[propertyKey] ? (
                        <Line
                            key={property.id}
                            type="monotone"
                            dataKey={propertyKey}
                            name={`Property ${index + 1} (ROI: ${property.roi.toFixed(1)}%)`}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={false}
                        />
                    ) : null;
                })}

                {visibleLines.sp500Value && (
                    <Line
                        type="monotone"
                        dataKey="sp500Value"
                        name="S&P 500 Investment"
                        stroke="#ff0000"
                        strokeWidth={2}
                        dot={false}
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
} 