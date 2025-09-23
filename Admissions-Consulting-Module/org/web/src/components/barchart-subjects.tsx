'use client';

import { Activity } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

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

interface SubjectStat {
  subject: string;
  count: number;
}

interface BarChartScrollableSubjectsProps {
  title?: string;
  description?: string;
  data?: SubjectStat[];
  onlyregister?: number;
  manyregister?: number;
}

export function BarChartScrollableSubjects({
  title = 'Thống kê môn học',
  description = 'Số lượng sinh viên theo từng môn học',
  data = [],
  onlyregister,
  manyregister,
}: BarChartScrollableSubjectsProps) {
  const hasData = data && data.length > 0;

  const chartConfig = {
    count: {
      label: 'Số lượng',
      color: '#3b82f6',
    },
  };

  const minBarWidth = 60;
  const maxBarWidth = 200;

  const maxChartWidth =
    typeof window !== 'undefined'
      ? Math.min(window.innerWidth - 360, 700)
      : 700;

  const padding = 40;

  const idealBarSize = Math.floor((maxChartWidth - padding) / data.length) - 10;
  const barSize = Math.max(minBarWidth, Math.min(idealBarSize, maxBarWidth));
  const estimatedWidth = data.length * (barSize + 10) + padding;
  const isScrollable = estimatedWidth > maxChartWidth;
  const chartWidth = isScrollable ? estimatedWidth : maxChartWidth;

  const registrationDistribution = data.reduce((acc, curr) => {
    const count = curr.count;
    acc[count] = (acc[count] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  //   const distributionEntries = Object.entries(registrationDistribution).sort(
  //     (a, b) => Number(a[0]) - Number(b[0])
  //   );

  return (
    <div className="relative">
      {/* 🔹 Bảng chú thích góc trái trên */}

      <div className="absolute top-2 right-4 z-10 bg-muted/80 backdrop-blur-sm px-3 py-2 rounded-md border shadow-sm text-sm text-muted-foreground font-semibold space-y-1">
        <div className="whitespace-nowrap">
          Có {onlyregister} học viên đăng ký duy nhất 1 khóa học
        </div>
        <div className="whitespace-nowrap">
          Có {manyregister} học viên đăng ký từ 2 khóa học
        </div>
      </div>

      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="pb-0">
          {hasData ? (
            <div className="w-full overflow-x-auto">
              <ChartContainer
                config={chartConfig}
                className="min-w-full"
                style={{
                  width: `${chartWidth}px`,
                  height: '320px',
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="subject"
                      angle={-45}
                      textAnchor="end"
                      height={1}
                    />
                    <YAxis domain={[0, 'dataMax + 20']} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value} `, 'đăng ký']}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      barSize={barSize}
                      radius={[4, 4, 0, 0]}
                      label={{ position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>

        {hasData && (
          <CardFooter className="text-sm text-muted-foreground justify-end">
            Tổng môn: {data.length}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
