import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import dashboardAnalyticsApi, {
  DashboardOverview,
  ConsultationAnalyticsResult,
  CampaignAnalyticsResult,
  SourceBreakdown,
} from '@/services/report.service';

export const DASHBOARD_QUERY_KEYS = {
  overview: 'dashboard-overview',
  consultations: 'dashboard-consultations',
  campaigns: 'dashboard-campaigns',
  campaignSources: 'dashboard-campaign-sources',
  topSources: 'dashboard-top-sources',
} as const;

interface UseConsultationsOptions {
  year?: number;
  status?: 'Scheduled' | 'Completed' | 'Canceled' | 'No Show';
  enabled?: boolean;
}

interface UseCampaignEffectivenessOptions {
  monthsBack?: number;
  enabled?: boolean;
}

interface UseCampaignSourcesOptions {
  monthsBack?: number;
  limit?: number;
  enabled?: boolean;
}

interface UseTopSourcesOptions {
  monthsBack?: number;
  limit?: number;
  enabled?: boolean;
}

export const useDashboardOverview = (
  options?: UseQueryOptions<DashboardOverview, Error>
) => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.overview],
    queryFn: () => dashboardAnalyticsApi.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useConsultationsByMonth = (
  params?: UseConsultationsOptions,
  options?: UseQueryOptions<ConsultationAnalyticsResult, Error>
) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.consultations, queryParams],
    queryFn: () => dashboardAnalyticsApi.getConsultationsByMonth(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useCampaignEffectiveness = (
  params?: UseCampaignEffectivenessOptions,
  options?: UseQueryOptions<CampaignAnalyticsResult, Error>
) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.campaigns, queryParams],
    queryFn: () => dashboardAnalyticsApi.getCampaignEffectiveness(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    ...options,
  });
};

export const useCampaignSourceBreakdown = (
  params?: UseCampaignSourcesOptions,
  options?: UseQueryOptions<
    {
      sourceBreakdown: SourceBreakdown[];
      topPerformingSources: SourceBreakdown[];
      summary: {
        totalSources: number;
        period: string;
      };
    },
    Error
  >
) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.campaignSources, queryParams],
    queryFn: () =>
      dashboardAnalyticsApi.getCampaignSourceBreakdown(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000, // 20 minutes
    ...options,
  });
};

export const useTopPerformingSources = (
  params?: UseTopSourcesOptions,
  options?: UseQueryOptions<
    {
      topSources: SourceBreakdown[];
      period: string;
      totalSources: number;
    },
    Error
  >
) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.topSources, queryParams],
    queryFn: () => dashboardAnalyticsApi.getTopPerformingSources(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000,
    ...options,
  });
};

export const useDashboardData = (params?: {
  consultations?: UseConsultationsOptions;
  campaigns?: UseCampaignEffectivenessOptions;
  sources?: UseCampaignSourcesOptions;
  topSources?: UseTopSourcesOptions;
  enabled?: boolean;
}) => {
  const { enabled = true } = params || {};

  const overview = useDashboardOverview({
    enabled,
    queryKey: [],
  });
  const consultations = useConsultationsByMonth(params?.consultations, {
    enabled,
    queryKey: [],
  });
  const campaigns = useCampaignEffectiveness(params?.campaigns, {
    enabled,
    queryKey: [],
  });
  const sources = useCampaignSourceBreakdown(params?.sources, {
    enabled,
    queryKey: [],
  });
  const topSources = useTopPerformingSources(params?.topSources, {
    enabled,
    queryKey: [],
  });

  return {
    overview,
    consultations,
    campaigns,
    sources,
    topSources,
    isLoading:
      overview.isLoading ||
      consultations.isLoading ||
      campaigns.isLoading ||
      sources.isLoading ||
      topSources.isLoading,
    isError:
      overview.isError ||
      consultations.isError ||
      campaigns.isError ||
      sources.isError ||
      topSources.isError,
    error:
      overview.error ||
      consultations.error ||
      campaigns.error ||
      sources.error ||
      topSources.error,
    refetchAll: () => {
      overview.refetch();
      consultations.refetch();
      campaigns.refetch();
      sources.refetch();
      topSources.refetch();
    },
  };
};

/**
 * Utility hook để invalidate tất cả dashboard queries
 */
export const useInvalidateDashboard = () => {
  const { useQueryClient } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.overview],
      });
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.consultations],
      });
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.campaigns],
      });
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.campaignSources],
      });
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.topSources],
      });
    },
    invalidateOverview: () => {
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.overview],
      });
    },
    invalidateConsultations: () => {
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.consultations],
      });
    },
    invalidateCampaigns: () => {
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.campaigns],
      });
    },
    invalidateSources: () => {
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.campaignSources],
      });
      queryClient.invalidateQueries({
        queryKey: [DASHBOARD_QUERY_KEYS.topSources],
      });
    },
  };
};
