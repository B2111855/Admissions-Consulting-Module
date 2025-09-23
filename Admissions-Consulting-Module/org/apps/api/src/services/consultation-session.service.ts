import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces for return types - Updated to match radar chart structure
interface ConsultationRadarData {
  month: string;
  phoneCall: number;
  onlineMeeting: number;
  inPerson: number;
  email: number;
  chat: number;
}

interface ConsultationChartData {
  chartData: ConsultationRadarData[];
  config: {
    phoneCall: {
      label: string;
      color: string;
    };
    onlineMeeting: {
      label: string;
      color: string;
    };
    inPerson: {
      label: string;
      color: string;
    };
    email: {
      label: string;
      color: string;
    };
    chat: {
      label: string;
      color: string;
    };
  };
}

interface ConsultationSummary {
  totalConsultations: number;
  averageDuration: number;
  growthRate: string;
  period: string;
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

class DashboardAnalyticsService {
  /**
   * Lấy dữ liệu lượt tư vấn theo tháng cho radar chart
   * @param year - Năm cần lấy dữ liệu (mặc định là năm hiện tại)
   * @param status - Trạng thái session (mặc định: 'Completed')
   * @returns Dữ liệu cho radar chart
   */
  async getConsultationsByMonth(
    year: number = new Date().getFullYear(), 
    status: 'Scheduled' | 'Completed' | 'Canceled' | 'No_Show' = 'Completed'
  ): Promise<ConsultationAnalyticsResult | null> {
    try {
      // Lấy dữ liệu chi tiết theo tháng và loại session
      const monthlyData = await prisma.$queryRaw<{
        month: number;
        month_name: string;
        session_type: string;
        consultation_count: bigint;
        avg_duration: number | null;
      }[]>`
        SELECT 
          MONTH(session_date) as month,
          MONTHNAME(session_date) as month_name,
          session_type,
          COUNT(*) as consultation_count,
          AVG(duration_minutes) as avg_duration
        FROM consultationsessions 
        WHERE YEAR(session_date) = ${year}
          AND session_status = ${status}
          AND session_date IS NOT NULL
        GROUP BY MONTH(session_date), MONTHNAME(session_date), session_type
        ORDER BY MONTH(session_date), session_type
      `;

      // Setup months array
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      // Initialize radar chart data structure
      const radarData: ConsultationRadarData[] = months.map(month => ({
        month,
        phoneCall: 0,
        onlineMeeting: 0,
        inPerson: 0,
        email: 0,
        chat: 0
      }));

      // Fill data from query results
      monthlyData.forEach(row => {
        const monthIndex = row.month - 1; // Convert to 0-based index
        const count = Number(row.consultation_count);
        
        switch (row.session_type) {
          case 'Phone Call':
            radarData[monthIndex].phoneCall = count;
            break;
          case 'Online Meeting':
            radarData[monthIndex].onlineMeeting = count;
            break;
          case 'In-Person':
            radarData[monthIndex].inPerson = count;
            break;
          case 'Email':
            radarData[monthIndex].email = count;
            break;
          case 'Chat':
            radarData[monthIndex].chat = count;
            break;
        }
      });

      // Chart configuration for radar chart
      const chartConfig = {
        phoneCall: {
          label: "Phone Call",
          color: "hsl(var(--chart-C-1))",
        },
        onlineMeeting: {
          label: "Online Meeting",
          color: "hsl(var(--chart-C-2))",
        },
        inPerson: {
          label: "In-Person",
          color: "hsl(var(--chart-C-3))",
        },
        email: {
          label: "Email",
          color: "hsl(var(--chart-C-4))",
        },
        chat: {
          label: "Chat",
          color: "hsl(var(--chart-C-5))",
        },
      };

      const chartData: ConsultationChartData = {
        chartData: radarData,
        config: chartConfig
      };

      // Tính toán thống kê tổng quan
      const totalConsultations = monthlyData.reduce((sum, row) => sum + Number(row.consultation_count), 0);
      const avgDuration = monthlyData.reduce((sum, row) => sum + (row.avg_duration || 0), 0) / monthlyData.length;
      
      // Tính growth rate (so với cùng kỳ năm trước)
      const previousYearData = await prisma.consultationsessions.count({
        where: {
          session_date: {
            gte: new Date(`${year - 1}-01-01`),
            lte: new Date(`${year - 1}-12-31`)
          },
          session_status: status
        }
      });
      
      const growthRate = previousYearData > 0 
        ? ((totalConsultations - previousYearData) / previousYearData * 100).toFixed(1)
        : '0.0';

      const summary: ConsultationSummary = {
        totalConsultations,
        averageDuration: Math.round(avgDuration || 0),
        growthRate: `${growthRate}%`,
        period: `January - December ${year}`,
        trendingText: `Trending ${parseFloat(growthRate) >= 0 ? 'up' : 'down'} by ${Math.abs(parseFloat(growthRate))}% this year`
      };

      return {
        chartData,
        summary
      };

    } catch (e) {
      console.error('Error in DashboardAnalyticsService.getConsultationsByMonth:', e);
      return null;
    }
  }

  /**
   * Lấy dữ liệu hiệu quả chiến dịch cho gauge chart
   * @param monthsBack - Số tháng lùi lại (mặc định: 6 tháng)
   * @returns Dữ liệu cho gauge chart
   */
  async getCampaignEffectiveness(monthsBack: number = 6): Promise<CampaignAnalyticsResult | null> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      // Lấy dữ liệu chi tiết theo source
      const sourceData = await prisma.$queryRaw<{
        source: string;
        total_leads: bigint;
        engaging_count: bigint;
        registered_count: bigint;
        dropped_count: bigint;
        avg_conversion_days: number | null;
      }[]>`
        SELECT 
          source,
          COUNT(*) as total_leads,
          SUM(CASE WHEN current_status = 'Engaging' THEN 1 ELSE 0 END) as engaging_count,
          SUM(CASE WHEN current_status = 'Registered' THEN 1 ELSE 0 END) as registered_count,
          SUM(CASE WHEN current_status = 'Dropped Out' THEN 1 ELSE 0 END) as dropped_count,
          AVG(CASE WHEN registration_date IS NOT NULL 
              THEN DATEDIFF(registration_date, created_at) 
              ELSE NULL END) as avg_conversion_days
        FROM students 
        WHERE created_at >= ${startDate}
        GROUP BY source
        ORDER BY total_leads DESC
      `;

      // Tính toán tổng số visitors và conversion rate
      const totalVisitors = sourceData.reduce((sum, row) => sum + Number(row.total_leads), 0);
      const totalRegistered = sourceData.reduce((sum, row) => sum + Number(row.registered_count), 0);
      const totalEngaging = sourceData.reduce((sum, row) => sum + Number(row.engaging_count), 0);
      
      const conversionRate = totalVisitors > 0 ? (totalRegistered / totalVisitors * 100).toFixed(1) : '0.0';
      const engagementRate = totalVisitors > 0 ? (totalEngaging / totalVisitors * 100).toFixed(1) : '0.0';

      // Tạo data cho gauge chart
      const gaugeValue = parseFloat(conversionRate);
      let gaugeColor = '#22c55e'; // Green
      let gaugeStatus = 'EXCELLENT';
      
      if (gaugeValue < 10) {
        gaugeColor = '#ef4444'; // Red
        gaugeStatus = 'NEEDS_IMPROVEMENT';
      } else if (gaugeValue < 20) {
        gaugeColor = '#f59e0b'; // Yellow
        gaugeStatus = 'GOOD';
      }

      // Chi tiết theo từng source
      const sourceBreakdown: SourceBreakdown[] = sourceData.map(row => ({
        source: row.source,
        totalLeads: Number(row.total_leads),
        engagingCount: Number(row.engaging_count),
        registeredCount: Number(row.registered_count),
        droppedCount: Number(row.dropped_count),
        conversionRate: Number(row.total_leads) > 0 ? (Number(row.registered_count) / Number(row.total_leads) * 100).toFixed(1) : '0.0',
        engagementRate: Number(row.total_leads) > 0 ? (Number(row.engaging_count) / Number(row.total_leads) * 100).toFixed(1) : '0.0',
        avgConversionDays: Math.round(row.avg_conversion_days || 0)
      }));

      // Tính growth rate so với kỳ trước
      const previousPeriodStart = new Date();
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - (monthsBack * 2));
      const previousPeriodEnd = new Date();
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - monthsBack);

      const previousPeriodCount = await prisma.students.count({
        where: {
          created_at: {
            gte: previousPeriodStart,
            lt: previousPeriodEnd
          }
        }
      });
      
      const growthRate = previousPeriodCount > 0 
        ? ((totalVisitors - previousPeriodCount) / previousPeriodCount * 100).toFixed(1)
        : '0.0';

      const gaugeData: CampaignGaugeData = {
        value: gaugeValue,
        maxValue: 100,
        color: gaugeColor,
        status: gaugeStatus,
        title: 'Conversion Rate'
      };

      const summary: CampaignSummary = {
        totalVisitors,
        totalRegistered,
        totalEngaging,
        conversionRate: `${conversionRate}%`,
        engagementRate: `${engagementRate}%`,
        growthRate: `${growthRate}%`,
        period: `Last ${monthsBack} months`,
        trendingText: `Trending ${parseFloat(growthRate) >= 0 ? 'up' : 'down'} by ${Math.abs(parseFloat(growthRate))}% this period`
      };

      const topPerformingSources = [...sourceBreakdown]
        .sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))
        .slice(0, 5);

      return {
        gaugeData,
        summary,
        sourceBreakdown,
        topPerformingSources
      };

    } catch (e) {
      console.error('Error in DashboardAnalyticsService.getCampaignEffectiveness:', e);
      return null;
    }
  }

  /**
   * Lấy dữ liệu dashboard tổng quan
   * @returns Dữ liệu tổng quan
   */
  async getDashboardOverview(): Promise<DashboardOverview | null> {
    try {
      const [consultationData, campaignData] = await Promise.all([
        this.getConsultationsByMonth(),
        this.getCampaignEffectiveness()
      ]);

      if (!consultationData || !campaignData) {
        return null;
      }

      return {
        consultations: consultationData,
        campaigns: campaignData,
        lastUpdated: new Date().toISOString()
      };
    } catch (e) {
      console.error('Error in DashboardAnalyticsService.getDashboardOverview:', e);
      return null;
    }
  }
}

export default new DashboardAnalyticsService();