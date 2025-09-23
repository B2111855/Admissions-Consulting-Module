import 'reflect-metadata';
import {
  Get,
  JsonController,
  QueryParam,
  Res,
  Req,
  UseBefore,
} from 'routing-controllers';
import jsend from '../jsend';
import kpiStatisticsService from '../services/kpi-definition.service';
import { authenticateToken } from '../middlewares/auth.middleware';

@JsonController('/kpi-statistics')
export class KPIStatisticsController {
  @Get('/overall')
  async getOverallKPIStatistics(
    @QueryParam('startDate') startDate: string | undefined,
    @QueryParam('endDate') endDate: string | undefined,
    @Res() res: any
  ) {
    try {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const statistics = await kpiStatisticsService.getOverallStatistics(
        start,
        end
      );

      if (statistics) {
        return res.json(jsend.success(statistics));
      } else {
        // Use jsend.fail for data not found, as per your example's pattern
        return res
          .status(404)
          .json(
            jsend.fail('Overall KPI statistics not found or an error occurred.')
          );
      }
    } catch (e: any) {
      console.error(
        'Error in KPIStatisticsController.getOverallKPIStatistics:',
        e
      );
      return res
        .status(500)
        .json(
          jsend.error(
            e.message ||
              'Internal server error while fetching overall KPI statistics.'
          )
        );
    }
  }

  /**
   * GET /api/kpi-statistics/counselor/:counselorId
   * Get KPI statistics for a specific counselor.
   * Path parameters: counselorId
   * Query parameters: startDate (optional, YYYY-MM-DD), endDate (optional, YYYY-MM-DD)
   */
  @Get('/counselor')
  @UseBefore(authenticateToken())
  async getCounselorKPIStatistics(
    @QueryParam('startDate') startDate: string | undefined,
    @QueryParam('endDate') endDate: string | undefined,
    @Res() res: any,
    @Req() req: any
  ) {
    try {
      const counselorId = req.user?.id;

      if (!counselorId) {
        return res
          .status(400)
          .json(jsend.fail('Invalid counselor ID provided.'));
      }

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const statistics = await kpiStatisticsService.getCounselorStatistics(
        counselorId,
        start,
        end
      );

      if (statistics) {
        return res.json(jsend.success(statistics));
      } else {
        return res
          .status(404)
          .json(
            jsend.fail(
              `KPI statistics not found for counselor ID ${counselorId}.`
            )
          );
      }
    } catch (e: any) {
      console.error(
        'Error in KPIStatisticsController.getCounselorKPIStatistics:',
        e
      );
      return res
        .status(500)
        .json(
          jsend.error(
            e.message ||
              'Internal server error while fetching counselor KPI statistics.'
          )
        );
    }
  }

  /**
   * GET /api/kpi-statistics/warnings
   * Get KPI warnings for all counselors.
   * Query parameters: startDate (optional, YYYY-MM-DD), endDate (optional, YYYY-MM-DD)
   */
  @Get('/warnings')
  async getKPIWarnings(
    @QueryParam('startDate') startDate: string | undefined,
    @QueryParam('endDate') endDate: string | undefined,
    @Res() res: any
  ) {
    try {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const warnings = await kpiStatisticsService.getKPIWarnings(start, end);

      if (warnings) {
        return res.json(jsend.success(warnings));
      } else {
        return res
          .status(200)
          .json(
            jsend.success([], 'No KPI warnings found for the specified period.')
          );
      }
    } catch (e: any) {
      console.error('Error in KPIStatisticsController.getKPIWarnings:', e);
      return res
        .status(500)
        .json(
          jsend.error(
            e.message || 'Internal server error while fetching KPI warnings.'
          )
        );
    }
  }

  /**
   * GET /api/kpi-statistics/summary
   * Get a KPI summary for the dashboard.
   * Query parameters: counselorId (optional)
   */
  @Get('/summary')
  @UseBefore(authenticateToken())
  async getKPISummary(@Res() res: any, @Req() req: any) {
    try {
      const counselorId = req.user?.id;

      if (!counselorId) {
        return res
          .status(400)
          .json(jsend.fail('Invalid counselor ID provided.'));
      }

      const summary = await kpiStatisticsService.getKPISummary(counselorId);

      if (summary) {
        return res.json(jsend.success(summary));
      } else {
        return res
          .status(404)
          .json(jsend.fail('KPI summary not found or an error occurred.'));
      }
    } catch (e: any) {
      console.error('Error in KPIStatisticsController.getKPISummary:', e);
      return res
        .status(500)
        .json(
          jsend.error(
            e.message || 'Internal server error while fetching KPI summary.'
          )
        );
    }
  }
}
