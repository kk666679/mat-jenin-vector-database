'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  // BarChart3Icon, 
  TrendingUpIcon, 
  TrendingDownIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface DashboardChartsProps {
  title?: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'list';
  className?: string;
  showTrend?: boolean;
  colors?: {
    primary?: string;
    success?: string;
    warning?: string;
    danger?: string;
    neutral?: string;
  };
}

/**
 * DashboardCharts - Simple chart component for dashboard metrics
 * Supports bar charts and list views
 */
export function DashboardCharts({
  title = 'Overview',
  data,
  type = 'bar',
  className,
  showTrend = false,
  colors = {},
}: DashboardChartsProps) {
  const {
    primary = 'bg-primary',
    success = 'bg-green-500',
    warning = 'bg-yellow-500',
    danger = 'bg-red-500',
    neutral = 'bg-muted',
  } = colors;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Calculate trend (comparing first half to second half)
  const calculateTrend = () => {
    if (data.length < 2) return null;
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid).reduce((a, b) => a + b.value, 0);
    const secondHalf = data.slice(mid).reduce((a, b) => a + b.value, 0);
    if (firstHalf === 0) return null;
    const change = ((secondHalf - firstHalf) / firstHalf) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  const trend = showTrend ? calculateTrend() : null;

  // Get color based on status
  const getStatusColor = (value: number, index: number) => {
    if (value === 0) return neutral;
    const percentage = (value / maxValue) * 100;
    if (percentage > 75) return danger;
    if (percentage > 50) return warning;
    return index < 3 ? primary : success;
  };

  if (type === 'list') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {trend && (
              <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="gap-1">
                {trend.isPositive ? (
                  <TrendingUpIcon className="h-3 w-3" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3" />
                )}
                {trend.value}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      getStatusColor(item.value, index)
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Bar chart
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {trend && (
            <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="gap-1">
              {trend.isPositive ? (
                <TrendingUpIcon className="h-3 w-3" />
              ) : (
                <TrendingDownIcon className="h-3 w-3" />
              )}
              {trend.value}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', getStatusColor(item.value, index))}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * StatusBadge - Helper to display status with color coding
 */
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    processing: { variant: 'outline', label: 'Processing' },
    completed: { variant: 'default', label: 'Completed' },
    failed: { variant: 'destructive', label: 'Failed' },
    active: { variant: 'default', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
  };

  const config = statusConfig[status.toLowerCase()] || { variant: 'outline', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * ProgressBar - Simple progress indicator
 */
export function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = true,
  className 
}: { 
  value: number; 
  max?: number; 
  showLabel?: boolean;
  className?: string;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all bg-primary')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

