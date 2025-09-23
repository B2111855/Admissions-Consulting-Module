import { Get, JsonController, QueryParam, Res } from 'routing-controllers';
import jsend from '../jsend';
import DashboardAnalyticsService from '../services/consultation-session.service';
import 'reflect-metadata';

@JsonController('/dashboard-analytics')
export class DashboardAnalyticsController {
  /**
   * Lấy dữ liệu tổng quan của dashboard
   * GET /dashboard-analytics/overview
   */
  @Get('/overview')
  async getDashboardOverview(@Res() res: any) {
    try {
      const overview = await DashboardAnalyticsService.getDashboardOverview();
      if (!overview) {
        return res
          .status(500)
          .json(jsend.error('Failed to fetch dashboard overview'));
      }
      return res.json(jsend.success(overview));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  /**
   * Lấy dữ liệu lượt tư vấn theo tháng cho radar chart
   * GET /dashboard-analytics/consultations
   * @param year - Năm cần lấy dữ liệu (mặc định: năm hiện tại)
   * @param status - Trạng thái session (mặc định: 'Completed')
   */
  @Get('/consultations')
  async getConsultationsByMonth(
    @Res() res: any,
    @QueryParam('year') year?: number,
    @QueryParam('status')
    status?: 'Scheduled' | 'Completed' | 'Canceled' | 'No_Show' | 'No Show'
  ) {
    try {
      const currentYear = year || new Date().getFullYear();
      // Convert "No Show" to "No_Show" for compatibility
      const normalizedStatus = status === 'No Show' ? 'No_Show' : status;
      const sessionStatus = normalizedStatus || 'Completed';

      const consultationsData =
        await DashboardAnalyticsService.getConsultationsByMonth(
          currentYear,
          sessionStatus
        );

      if (!consultationsData) {
        return res
          .status(500)
          .json(jsend.error('Failed to fetch consultations data'));
      }

      return res.json(jsend.success(consultationsData));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  /**
   * Lấy dữ liệu hiệu quả chiến dịch cho gauge chart
   * GET /dashboard-analytics/campaigns
   * @param monthsBack - Số tháng lùi lại (mặc định: 6 tháng)
   */
  @Get('/campaigns')
  async getCampaignEffectiveness(
    @Res() res: any,
    @QueryParam('monthsBack') monthsBack?: number
  ) {
    try {
      const months = monthsBack || 6;

      const campaignData =
        await DashboardAnalyticsService.getCampaignEffectiveness(months);

      if (!campaignData) {
        return res
          .status(500)
          .json(jsend.error('Failed to fetch campaign effectiveness data'));
      }

      return res.json(jsend.success(campaignData));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  /**
   * Lấy dữ liệu hiệu quả chiến dịch theo source
   * GET /dashboard-analytics/campaigns/sources
   * @param monthsBack - Số tháng lùi lại (mặc định: 6 tháng)
   * @param limit - Giới hạn số lượng source trả về (mặc định: 10)
   */
  @Get('/campaigns/sources')
  async getCampaignSourceBreakdown(
    @Res() res: any,
    @QueryParam('monthsBack') monthsBack?: number,
    @QueryParam('limit') limit?: number
  ) {
    try {
      const months = monthsBack || 6;
      const maxLimit = limit || 10;

      const campaignData =
        await DashboardAnalyticsService.getCampaignEffectiveness(months);

      if (!campaignData) {
        return res
          .status(500)
          .json(jsend.error('Failed to fetch campaign source data'));
      }

      // Trả về danh sách source breakdown với giới hạn
      const limitedSourceBreakdown = campaignData.sourceBreakdown.slice(
        0,
        maxLimit
      );

      return res.json(
        jsend.success({
          sourceBreakdown: limitedSourceBreakdown,
          topPerformingSources: campaignData.topPerformingSources,
          summary: {
            totalSources: campaignData.sourceBreakdown.length,
            period: campaignData.summary.period,
          },
        })
      );
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  /**
   * Lấy top sources có hiệu quả cao nhất
   * GET /dashboard-analytics/campaigns/top-sources
   * @param monthsBack - Số tháng lùi lại (mặc định: 6 tháng)
   * @param limit - Giới hạn số lượng source trả về (mặc định: 5)
   */
  @Get('/campaigns/top-sources')
  async getTopPerformingSources(
    @Res() res: any,
    @QueryParam('monthsBack') monthsBack?: number,
    @QueryParam('limit') limit?: number
  ) {
    try {
      const months = monthsBack || 6;
      const maxLimit = limit || 5;

      const campaignData =
        await DashboardAnalyticsService.getCampaignEffectiveness(months);

      if (!campaignData) {
        return res
          .status(500)
          .json(jsend.error('Failed to fetch top performing sources'));
      }

      // Lấy top sources với giới hạn tùy chỉnh
      const topSources = campaignData.sourceBreakdown
        .sort(
          (a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
        )
        .slice(0, maxLimit);

      return res.json(
        jsend.success({
          topSources,
          period: campaignData.summary.period,
          totalSources: campaignData.sourceBreakdown.length,
        })
      );
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }
}
