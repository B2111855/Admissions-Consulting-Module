'use client';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCounselorKPIStatistics } from '@/hooks/useKpi';

interface SectionCardsProps {
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  refetch?: () => void;
}

export function SectionCards({
  startDate,
  endDate,
  enabled = true,
}: SectionCardsProps = {}) {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useCounselorKPIStatistics({
    startDate,
    endDate,
    enabled,
  });
  const otherCounts = apiResponse?.data?.otherCounts;

  if (isLoading || !apiResponse) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Có lỗi xảy ra khi tải dữ liệu KPI: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!apiResponse?.data?.statistics || !apiResponse?.data?.kpi) {
    return (
      <div className="px-4 lg:px-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">Không có dữ liệu KPI</p>
        </div>
      </div>
    );
  }

  const statistics = apiResponse?.data?.statistics;
  const kpi = apiResponse?.data?.kpi;

  const renderTrendBadge = (trend: number) => {
    if (trend > 0) {
      return (
        <Badge variant="outline" className="text-green-600">
          <IconTrendingUp className="size-3" />+{trend.toFixed(1)}%
        </Badge>
      );
    } else if (trend < 0) {
      return (
        <Badge variant="outline" className="text-red-600">
          <IconTrendingDown className="size-3" />
          {trend.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600">
          0%
        </Badge>
      );
    }
  };

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <IconTrendingUp className="size-4 text-green-600" />;
    } else if (trend < 0) {
      return <IconTrendingDown className="size-4 text-red-600" />;
    } else {
      return null;
    }
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{statistics.consulting.title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {statistics.consulting.percentage}%
          </CardTitle>
          <CardAction>
            {renderTrendBadge(statistics.consulting.trend)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            Có {statistics.consulting.count} mục đang tương tác trong tháng
            {renderTrendIcon(statistics.consulting.trend)}
          </div>
          <div className="text-muted-foreground">
            Tổng số lượng đang tương tác: {otherCounts?.engaging ?? 0}
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 2: Tỷ lệ Đã đăng ký */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{statistics.registration.title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {statistics.registration.percentage}%
          </CardTitle>
          <CardAction>
            {renderTrendBadge(statistics.registration.trend)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            Có {statistics.registration.count} học viên đã đăng ký
            {renderTrendIcon(statistics.registration.trend)}
          </div>
          <div className="text-muted-foreground">
            Có {otherCounts?.studentregister ?? 0} học viên đăng ký hơn 1 khóa
            học
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 3: Tỷ lệ Tiềm năng */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{statistics.potential.title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {statistics.potential.percentage}%
          </CardTitle>
          <CardAction>
            {renderTrendBadge(statistics.potential.trend)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            Có {statistics.potential.count} mục tiềm năng trong tháng
            {renderTrendIcon(statistics.potential.trend)}
          </div>
          <div className="text-muted-foreground">
            Tổng số lượng đang tiềm năng: {otherCounts?.lead ?? 0}{' '}
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 4: KPI Performance & Enrollments */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Hiệu suất KPI</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpi.performanceRate}%
          </CardTitle>
          <CardAction>
            <Badge
              variant={kpi.isWarning ? 'destructive' : 'outline'}
              className={kpi.isWarning ? 'text-red-600' : 'text-green-600'}
            >
              {kpi.isWarning ? (
                <IconTrendingDown className="size-3" />
              ) : (
                <IconTrendingUp className="size-3" />
              )}
              {kpi.currentEnrollments}/{kpi.monthlyTarget}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            {statistics.enrollments.count} đăng ký / {kpi.monthlyTarget} mục
            tiêu
            {renderTrendIcon(statistics.enrollments.trend)}
          </div>
          <div className="text-muted-foreground">
            {kpi.isWarning ? kpi.warningMessage : 'Đạt mục tiêu KPI'}
          </div>
        </CardFooter>
      </Card>
      {/* <div className="grid grid-cols-1 gap-2 mt-4 text-sm text-muted-foreground lg:grid-cols-2 @5xl/main:grid-cols-4 px-4 lg:px-6">
        <div>📝 Đăng ký: </div>
        <div>📌 Đăng ký duy nhất: {otherCounts?.studentregisteronce ?? 0}</div>
      </div> */}
    </div>
  );
}
