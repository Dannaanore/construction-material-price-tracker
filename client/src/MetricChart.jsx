import { Box } from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

/*
 * Reusable chart for MoM, YoY, and volatility.
 * MoM uses bars; YoY and volatility use lines.
 */
function MetricChart({ data, dataKey, color, dateRange, xAxisTicks }) {
    const isBarChart = dataKey === 'MoM';

    // Format dates based on the selected range
    const formatDate = (date) => {
        if (dateRange === '6m' || dateRange === '12m') {
            const [year, month] = date.split('-');

            const monthName = new Date(
                Number(year),
                Number(month) - 1
            ).toLocaleString('en-US', { month: 'short' });

            return `${monthName} '${year.slice(2)}`;
        }

        return date.substring(0, 4);
    };

    // Shared chart components
    const chartElements = (
        <>
            <CartesianGrid stroke="#e5eaf0" vertical={false} />

            <XAxis
                dataKey="date"
                ticks={xAxisTicks}
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: '#617083' }}
                tickLine={false}
                axisLine={false}
                interval={0}
            />

            <YAxis
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10, fill: '#617083' }}
                tickLine={false}
                axisLine={false}
                width={45}
            />

            <Tooltip
                formatter={(value) => [
                    value == null ? 'N/A' : `${Number(value).toFixed(2)}%`,
                    dataKey,
                ]}
            />

            {dataKey !== 'volatility' && (
                <ReferenceLine y={0} stroke="#aab5c2" />
            )}

            {isBarChart ? (
                <Bar dataKey={dataKey} maxBarSize={30}>
                    {data.map((item, index) => (
                        <Cell
                            key={index}
                            fill={item.MoM < 0 ? '#c45b17' : '#2f6fe4'}
                        />
                    ))}
                </Bar>
            ) : (
                <Line
                    type="linear"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                />
            )}
        </>
    );

    return (
        <Box sx={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
                {isBarChart ? (
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                        {chartElements}
                    </BarChart>
                ) : (
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                        {chartElements}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </Box>
    );
}

export default MetricChart;
