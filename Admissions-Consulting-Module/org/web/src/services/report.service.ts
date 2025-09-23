import apiClient from '@/lib/axios.lib';

// Interfaces cho return types
interface ConsultationRadarData {
  // month: string;
  phoneCall: number;
  onlineMeeting: number;
  inPerson: number;
  email: number;
  chat: number;
}

interface ConsultationChartData {
  chartData: ConsultationRadarData[];
  // config: {
  //   phoneCall: {
  //     label: string;
  //     color: string;
  //   };
  //   onlineMeeting: {
  //     label: string;
  //     color: string;
  //   };
  //   inPerson: {
  //     label: string;
  //     color: string;
  //   };
  //   email: {
  //     label: string;
  //     color: string;
  //   };
  //   chat: {
  //     label: string;
  //     color: string;
  //   };
  // };
}

interface ConsultationSummary {
  totalConsultations: number;
  averageDuration: number;
  // growthRate: string;
  // period: string;
  trendingText: string;
}

interface ConsultationAnalyticsResult {
  chartData: ConsultationChartData;
  summary: ConsultationSummary;
}

interface CampaignGaugeData {
  value: number;
  maxValue: number;
  color: string;
  status: string;
  title: string;
}

interface CampaignSummary {
  totalVisitors: number;
  totalRegistered: number;
  totalEngaging: number;
  conversionRate: string;
  engagementRate: string;
  growthRate: string;
  period: string;
  trendingText: string;
}

interface SourceBreakdown {
  source: string;
  totalLeads: number;
  engagingCount: number;
  registeredCount: number;
  droppedCount: number;
  conversionRate: string;
  engagementRate: string;
  avgConversionDays: number;
}

interface CampaignAnalyticsResult {
  gaugeData: CampaignGaugeData;
  summary: CampaignSummary;
  sourceBreakdown: SourceBreakdown[];
  topPerformingSources: SourceBreakdown[];
}

interface DashboardOverview {
  consultations: ConsultationAnalyticsResult;
  campaigns: CampaignAnalyticsResult;
  lastUpdated: string;
}

// API Response wrapper type
interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

class DashboardAnalyticsApiService {
  private readonly baseEndpoint = '/dashboard-analytics';

  /**
   * Lấy dữ liệu tổng quan của dashboard
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardOverview>>(
        `${this.baseEndpoint}/overview`
      );

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Failed to fetch dashboard overview'
      );
    } catch (error: any) {
      console.error('Error fetching dashboard overview:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch dashboard overview'
      );
    }
  }

  /**
   * Lấy dữ liệu lượt tư vấn theo tháng cho radar chart
   * @param params - Query parameters
   */
  async getConsultationsByMonth(params?: {
    year?: number;
    status?: 'Scheduled' | 'Completed' | 'Canceled' | 'No Show';
  }): Promise<ConsultationAnalyticsResult> {
    try {
      const response = await apiClient.get<
        ApiResponse<ConsultationAnalyticsResult>
      >(`${this.baseEndpoint}/consultations`, { params });

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Failed to fetch consultations data'
      );
    } catch (error: any) {
      console.error('Error fetching consultations data:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch consultations data'
      );
    }
  }

  /**
   * Lấy dữ liệu hiệu quả chiến dịch cho gauge chart
   * @param params - Query parameters
   */
  async getCampaignEffectiveness(params?: {
    monthsBack?: number;
  }): Promise<CampaignAnalyticsResult> {
    try {
      const response = await apiClient.get<
        ApiResponse<CampaignAnalyticsResult>
      >(`${this.baseEndpoint}/campaigns`, { params });

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Failed to fetch campaign effectiveness data'
      );
    } catch (error: any) {
      console.error('Error fetching campaign effectiveness data:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch campaign effectiveness data'
      );
    }
  }

  /**
   * Lấy dữ liệu breakdown theo source
   * @param params - Query parameters
   */
  async getCampaignSourceBreakdown(params?: {
    monthsBack?: number;
    limit?: number;
  }): Promise<{
    sourceBreakdown: SourceBreakdown[];
    topPerformingSources: SourceBreakdown[];
    summary: {
      totalSources: number;
      period: string;
    };
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          sourceBreakdown: SourceBreakdown[];
          topPerformingSources: SourceBreakdown[];
          summary: {
            totalSources: number;
            period: string;
          };
        }>
      >(`${this.baseEndpoint}/campaigns/sources`, { params });

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Failed to fetch campaign source breakdown'
      );
    } catch (error: any) {
      console.error('Error fetching campaign source breakdown:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch campaign source breakdown'
      );
    }
  }

  /**
   * Lấy top sources có hiệu quả cao nhất
   * @param params - Query parameters
   */
  async getTopPerformingSources(params?: {
    monthsBack?: number;
    limit?: number;
  }): Promise<{
    topSources: SourceBreakdown[];
    period: string;
    totalSources: number;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          topSources: SourceBreakdown[];
          period: string;
          totalSources: number;
        }>
      >(`${this.baseEndpoint}/campaigns/top-sources`, { params });

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Failed to fetch top performing sources'
      );
    } catch (error: any) {
      console.error('Error fetching top performing sources:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch top performing sources'
      );
    }
  }
}

// Export singleton instance
const dashboardAnalyticsApi = new DashboardAnalyticsApiService();
export default dashboardAnalyticsApi;

// Export types for use in components
export type {
  ConsultationAnalyticsResult,
  CampaignAnalyticsResult,
  DashboardOverview,
  ConsultationRadarData,
  ConsultationSummary,
  CampaignSummary,
  SourceBreakdown,
  CampaignGaugeData,
};
