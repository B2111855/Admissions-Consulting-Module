import apiClient from '@/lib/axios.lib';

export interface KPIPeriod {
  startDate: string;
  endDate: string;
}

export interface KPICounselor {
  id: number;
  programType: string;
}

export interface KPIWarning {
  monthlyTarget: number;
  annualTarget: number;
  currentEnrollments: number;
  performanceRate: number;
  isWarning: boolean;
  warningMessage: string;
}

export interface KPIStatisticItem {
  title: string;
  percentage: number;
  count: number;
  total: number;
  trend: number;
  description: string;
}

export interface KPIEnrollmentsStatistic {
  title: string;
  count: number;
  trend: number;
  description: string;
}

export interface KPIStatistics {
  consulting: KPIStatisticItem;
  registration: KPIStatisticItem;
  potential: KPIStatisticItem;
  enrollments: KPIEnrollmentsStatistic;
}

export interface KPIDetails {
  enrollmentsByProgram: Record<string, number>;
  totalRevenue: number;
}

export interface KPIData {
  period: KPIPeriod;
  counselor: KPICounselor;
  kpi: KPIWarning;
  statistics: KPIStatistics;
  details: KPIDetails;
}

export interface KPIApiResponse {
  status: 'success' | 'fail' | 'error';
  data?: {
    statistics: {
      consulting: {
        title: string;
        percentage: number;
        count: number;
        total: number;
        trend: number;
        description: string;
      };
      registration: {
        title: string;
        percentage: number;
        count: number;
        total: number;
        trend: number;
        description: string;
      };
      potential: {
        title: string;
        percentage: number;
        count: number;
        total: number;
        trend: number;
        description: string;
      };
      enrollments: {
        title: string;
        count: number;
        trend: number;
        description: string;
      };
    };
    kpi: {
      monthlyTarget: number;
      annualTarget: number;
      currentEnrollments: number;
      performanceRate: number;
      isWarning: boolean;
      warningMessage: string;
    };
    otherCounts?: {
      lead: number;
      engaging: number;
      studentregister: number;
      studentregisteronce: number;
    };
    // Add other fields if needed
  };
  message?: string;
}

export const kpiService = {
  /**
   * Get overall KPI statistics
   * @param startDate - Start date in YYYY-MM-DD format (optional)
   * @param endDate - End date in YYYY-MM-DD format (optional)
   */
  getOverallKPIStatistics: async (
    startDate?: string,
    endDate?: string
  ): Promise<KPIApiResponse> => {
    try {
      console.log(
        `kpi.service.ts: Fetching overall KPI statistics (startDate: ${startDate}, endDate: ${endDate})`
      );

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/kpi-statistics/overall', {
        params,
      });

      console.log(
        'kpi.service.ts: Response for overall KPI statistics:',
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching overall KPI statistics:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }

      throw error;
    }
  },

  /**
   * Get KPI statistics for authenticated counselor
   * @param startDate - Start date in YYYY-MM-DD format (optional)
   * @param endDate - End date in YYYY-MM-DD format (optional)
   */
  getCounselorKPIStatistics: async (
    startDate?: string,
    endDate?: string
  ): Promise<KPIApiResponse> => {
    try {
      console.log(
        `kpi.service.ts: Fetching counselor KPI statistics (startDate: ${startDate}, endDate: ${endDate})`
      );

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/kpi-statistics/counselor', {
        params,
      });

      console.log(
        'kpi.service.ts: Response for counselor KPI statistics:',
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching counselor KPI statistics:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        // Handle specific error cases
        if (error.response.status === 400) {
          throw new Error('Invalid counselor ID provided.');
        } else if (error.response.status === 404) {
          throw new Error('KPI statistics not found for counselor.');
        } else if (error.response.status === 401) {
          throw new Error('Authentication required.');
        }
      }

      throw error;
    }
  },

  /**
   * Get KPI warnings for all counselors
   * @param startDate - Start date in YYYY-MM-DD format (optional)
   * @param endDate - End date in YYYY-MM-DD format (optional)
   */
  getKPIWarnings: async (
    startDate?: string,
    endDate?: string
  ): Promise<KPIApiResponse> => {
    try {
      console.log(
        `kpi.service.ts: Fetching KPI warnings (startDate: ${startDate}, endDate: ${endDate})`
      );

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/kpi-statistics/warnings', {
        params,
      });

      console.log('kpi.service.ts: Response for KPI warnings:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching KPI warnings:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }

      throw error;
    }
  },

  /**
   * Get KPI summary for authenticated counselor dashboard
   */
  getKPISummary: async (): Promise<KPIApiResponse> => {
    try {
      console.log('kpi.service.ts: Fetching KPI summary for dashboard');

      const response = await apiClient.get('/kpi-statistics/summary');

      console.log('kpi.service.ts: Response for KPI summary:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching KPI summary:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        // Handle specific error cases
        if (error.response.status === 400) {
          throw new Error('Invalid counselor ID provided.');
        } else if (error.response.status === 404) {
          throw new Error('KPI summary not found or an error occurred.');
        } else if (error.response.status === 401) {
          throw new Error('Authentication required.');
        }
      }

      throw error;
    }
  },
};
