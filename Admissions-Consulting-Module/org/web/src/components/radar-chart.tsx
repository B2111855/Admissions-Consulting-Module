'use client';

import { Activity } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { ConsultationAnalyticsResult } from '@/services/report.service';

interface RadarChartProps {
  colorSet: 'C' | 'D';
  title?: string;
  description?: string;
  data?: ConsultationAnalyticsResult;
}

const config = {
  phoneCall: { label: 'Gọi điện', color: '#3b82f6' },
  onlineMeeting: {
    label: 'Họp online',
    color: '#10b981',
  },
  inPerson: {
    label: 'Gặp trực tiếp',
    color: '#f59e0b',
  },
  email: { label: 'Email', color: '#ef4444' },
  chat: { label: 'Chat', color: '#8b5cf6' },
};

function transformTotalDataToChartData(apiData: ConsultationAnalyticsResult) {
  // const config = apiData.chartData.config;
  const items = apiData.chartData.chartData;

  const methodKeys: (keyof typeof config)[] = Object.keys(
    config
  ) as (keyof typeof config)[];

  const totals: Record<string, number> = {};

  items.forEach((item) => {
    methodKeys.forEach((key) => {
      totals[key] = (totals[key] || 0) + item[key]!;
    });
  });

  return methodKeys.map((key) => ({
    method: config[key].label,
    value: totals[key],
  }));
}

export function RadarChartGridCircle({
  colorSet,
  title,
  description,
  data,
}: RadarChartProps) {
  if (colorSet !== 'C' || !data) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title || 'Lượt tư vấn theo hình thức'}
          </CardTitle>
          <CardDescription>
            {description || 'Không có dữ liệu để hiển thị'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="mx-auto aspect-square max-h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = transformTotalDataToChartData(data);
  // const config = data.chartData.config;

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer className="mx-auto max-h-[270px]" config={config}>
          <RadarChart data={chartData} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel={true}
                  formatter={(value) => [
                    `Tổng: ${Number(value) || 0} lượt`,
                    '',
                  ]}
                />
              }
            />

            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="method" className="text-xs" />
            <Radar
              name="Lượt tư vấn"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 1 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        {/* Tổng quan */}
        <div className="text-muted-foreground">
          Tổng lượt:{' '}
          <strong>{data.summary.totalConsultations.toLocaleString()}</strong> |
          TB thời lượng: <strong>{data.summary.averageDuration} phút</strong>
        </div>

        {/* Danh sách từng hình thức và số lượng */}
        <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs w-full mt-2">
          {chartData.map((item) => (
            <div
              key={item.method}
              className="flex justify-between border-b pb-1"
            >
              <span>{item.method}</span>
              <span className="font-semibold text-right">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Text xu hướng nếu có */}
        {data.summary.trendingText && (
          <div className="text-md text-center text-muted-foreground border-t pt-2 mt-1">
            {data.summary.trendingText}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
