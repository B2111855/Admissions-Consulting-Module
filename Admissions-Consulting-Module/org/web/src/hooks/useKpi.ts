import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kpiService, KPIApiResponse } from '@/services/kpi.service';

export const KPI_QUERY_KEYS = {
  all: ['kpi'] as const,
  overall: (startDate?: string, endDate?: string) =>
    ['kpi', 'overall', { startDate, endDate }] as const,
  counselor: (startDate?: string, endDate?: string) =>
    ['kpi', 'counselor', { startDate, endDate }] as const,
  warnings: (startDate?: string, endDate?: string) =>
    ['kpi', 'warnings', { startDate, endDate }] as const,
  summary: () => ['kpi', 'summary'] as const,
};

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export const useOverallKPIStatistics = ({
  startDate,
  endDate,
}: DateRangeParams = {}) => {
  return useQuery({
    queryKey: KPI_QUERY_KEYS.overall(startDate, endDate),
    queryFn: () => kpiService.getOverallKPIStatistics(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCounselorKPIStatistics = ({
  startDate,
  endDate,
  enabled = true,
}: DateRangeParams & { enabled?: boolean } = {}) => {
  return useQuery<KPIApiResponse>({
    queryKey: KPI_QUERY_KEYS.counselor(startDate, endDate),
    queryFn: () => kpiService.getCounselorKPIStatistics(startDate, endDate),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};

export const useKPIWarnings = ({
  startDate,
  endDate,
}: DateRangeParams = {}) => {
  return useQuery({
    queryKey: KPI_QUERY_KEYS.warnings(startDate, endDate),
    queryFn: () => kpiService.getKPIWarnings(startDate, endDate),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useKPISummary = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: KPI_QUERY_KEYS.summary(),
    queryFn: () => kpiService.getKPISummary(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};

export const useKPIDashboard = ({
  startDate,
  endDate,
  enabled = true,
}: DateRangeParams & { enabled?: boolean } = {}) => {
  const overallStats = useOverallKPIStatistics({ startDate, endDate });
  const counselorStats = useCounselorKPIStatistics({
    startDate,
    endDate,
    enabled,
  });
  const warnings = useKPIWarnings({ startDate, endDate });
  const summary = useKPISummary({ enabled });

  return {
    overallStats: {
      data: overallStats.data,
      isLoading: overallStats.isLoading,
      error: overallStats.error,
      refetch: overallStats.refetch,
    },
    counselorStats: {
      data: counselorStats.data,
      isLoading: counselorStats.isLoading,
      error: counselorStats.error,
      refetch: counselorStats.refetch,
    },
    warnings: {
      data: warnings.data,
      isLoading: warnings.isLoading,
      error: warnings.error,
      refetch: warnings.refetch,
    },
    summary: {
      data: summary.data,
      isLoading: summary.isLoading,
      error: summary.error,
      refetch: summary.refetch,
    },

    isLoading:
      overallStats.isLoading ||
      counselorStats.isLoading ||
      warnings.isLoading ||
      summary.isLoading,

    hasError: !!(
      overallStats.error ||
      counselorStats.error ||
      warnings.error ||
      summary.error
    ),

    refetchAll: () => {
      overallStats.refetch();
      counselorStats.refetch();
      warnings.refetch();
      summary.refetch();
    },
  };
};

export const useKPIInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: KPI_QUERY_KEYS.all });
  };

  const invalidateOverall = (startDate?: string, endDate?: string) => {
    queryClient.invalidateQueries({
      queryKey: KPI_QUERY_KEYS.overall(startDate, endDate),
    });
  };

  const invalidateCounselor = (startDate?: string, endDate?: string) => {
    queryClient.invalidateQueries({
      queryKey: KPI_QUERY_KEYS.counselor(startDate, endDate),
    });
  };

  const invalidateWarnings = (startDate?: string, endDate?: string) => {
    queryClient.invalidateQueries({
      queryKey: KPI_QUERY_KEYS.warnings(startDate, endDate),
    });
  };

  const invalidateSummary = () => {
    queryClient.invalidateQueries({
      queryKey: KPI_QUERY_KEYS.summary(),
    });
  };

  return {
    invalidateAll,
    invalidateOverall,
    invalidateCounselor,
    invalidateWarnings,
    invalidateSummary,
  };
};

export const useKPIWithDateRange = (days: number = 30) => {
  const endDate = new Date().toISOString().split('T')[0]; // Today
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return useKPIDashboard({ startDate, endDate });
};
