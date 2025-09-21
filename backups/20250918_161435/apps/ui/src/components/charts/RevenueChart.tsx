import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  ComposedChart,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  contracts: number;
  growth: number;
  forecast?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
  description?: string;
  showForecast?: boolean;
  height?: number;
}

export function RevenueChart({
  data,
  title = "Revenue Performance",
  description = "Monthly revenue and contract trends",
  showForecast = true,
  height = 400
}: RevenueChartProps) {
  const latestGrowth = data[data.length - 1]?.growth || 0;
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / data.length;

  const getTrendIcon = () => {
    if (latestGrowth > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (latestGrowth < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-gray-400">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name === 'Contracts' ? entry.value : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant={latestGrowth > 0 ? 'success' : latestGrowth < 0 ? 'destructive' : 'secondary'}>
              {latestGrowth > 0 ? '+' : ''}{latestGrowth.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d2ac38" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#d2ac38" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: 12 }}
              iconType="line"
            />
            <ReferenceLine 
              y={avgRevenue} 
              stroke="#6b7280" 
              strokeDasharray="5 5"
              label={{ value: "Average", position: "right", fill: "#6b7280", fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d2ac38"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Revenue"
            />
            {showForecast && (
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#forecastGradient)"
                name="Forecast"
              />
            )}
            <Bar
              dataKey="contracts"
              fill="#10b981"
              opacity={0.5}
              name="Contracts"
              yAxisId="right"
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: 12 }}
            />
            <Brush 
              dataKey="month" 
              height={30} 
              stroke="#374151"
              fill="#1f2937"
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-800">
          <div>
            <p className="text-xs text-gray-400">Total Revenue</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Average Monthly</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(avgRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Contracts</p>
            <p className="text-lg font-semibold text-white">
              {data.reduce((sum, item) => sum + item.contracts, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}