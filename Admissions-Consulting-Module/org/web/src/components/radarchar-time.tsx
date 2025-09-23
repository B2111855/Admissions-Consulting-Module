'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ConsultationSession {
  session_date: string;
  duration_minutes: number;
}

interface Props {
  sessions: ConsultationSession[];
  title?: string;
  description?: string;
  bucketCount?: number;
}

// ✅ Sửa ở đây: dùng ISO date string cho label
function bucketByTime(sessions: ConsultationSession[], maxBucketCount = 100) {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );

  if (sorted.length === 0) return [];

  // Tính danh sách các ngày duy nhất
  const uniqueDates = Array.from(
    new Set(sorted.map((s) => s.session_date.slice(0, 10)))
  ).sort();

  const shouldBucket = uniqueDates.length > maxBucketCount;

  // ✅ Trường hợp đơn giản: dưới 100 ngày → group theo từng ngày
  if (!shouldBucket) {
    const grouped: Record<string, number[]> = {};

    for (const s of sorted) {
      const day = s.session_date.slice(0, 10);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(s.duration_minutes);
    }

    return Object.entries(grouped).map(([date, durations]) => ({
      date, // dùng ngày trực tiếp
      range: date, // để hiện tooltip
      averageDuration: Math.round(
        durations.reduce((sum, d) => sum + d, 0) / durations.length
      ),
    }));
  }

  // ✅ Trường hợp chia bucket: > 100 ngày
  const min = new Date(sorted[0].session_date).getTime();
  const max = new Date(sorted[sorted.length - 1].session_date).getTime();
  const range = max - min;
  const step = range / maxBucketCount;

  const buckets = Array.from({ length: maxBucketCount }, (_, i) => {
    const from = new Date(min + i * step);
    const to = new Date(i === maxBucketCount - 1 ? max : min + (i + 1) * step);
    return { from, to, values: [] as number[] };
  });

  for (const s of sorted) {
    const t = new Date(s.session_date).getTime();
    const index = Math.min(Math.floor((t - min) / step), maxBucketCount - 1);
    buckets[index].values.push(s.duration_minutes);
  }

  return buckets.map((b) => ({
    date: b.from.toISOString().slice(0, 10), // dùng để định vị trên trục X
    range:
      b.from.toISOString().slice(0, 10) === b.to.toISOString().slice(0, 10)
        ? b.from.toISOString().slice(0, 10)
        : `${b.from.toISOString().slice(0, 10)} → ${b.to
            .toISOString()
            .slice(0, 10)}`,
    averageDuration:
      b.values.length > 0
        ? Math.round(b.values.reduce((sum, d) => sum + d, 0) / b.values.length)
        : 0,
  }));
}

export function ConsultationDurationAreaChart({
  sessions,
  title,
  description,
  bucketCount = 100,
}: Props) {
  const chartData = bucketByTime(sessions, bucketCount);
  const total = sessions.length;
  const avg =
    total > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / total
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title || 'Phân tích thời lượng tư vấn'}
        </CardTitle>

        <CardDescription>
          {description ||
            `Biểu đồ dao động trung bình thời lượng tư vấn chia theo ${bucketCount} mốc thời gian`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis unit=" phút" />
              <CartesianGrid strokeDasharray="3 3" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey="range"
                    formatter={(value, _name, props) => {
                      const range = props?.payload?.range || '';
                      return (
                        <div>
                          <div>Thời lượng TB: {value} phút</div>
                          <div>Khoảng: {range}</div>
                        </div>
                      );
                    }}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="averageDuration"
                stroke="#3b82f6"
                fill="url(#color)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Tổng lượt: <strong>{total}</strong> | TB: <strong>{avg} phút</strong>
      </CardFooter>
    </Card>
  );
}
