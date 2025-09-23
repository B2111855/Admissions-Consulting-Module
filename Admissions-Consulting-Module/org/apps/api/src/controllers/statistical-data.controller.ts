import {
  Get,
  JsonController,
  QueryParam, // Đảm bảo QueryParam được import
  Req,
  Res,
  UseBefore,
} from 'routing-controllers'; // Import từ routing-controllers
import jsend from '../jsend';
import 'reflect-metadata';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  countStudentsByStatus,
  countConsultationSessionsByType,
  getAllConsultationSessions,
  GetCountEnrollments,
  GetStudentRegistrationDistribution,
} from '../services/data.service';
// import studentEnrollmentService from '../services/student-enrollment.service';
// import { students_current_education_level } from '@prisma/client';

@JsonController('/Statistical-data')
export class StudentStatistical {
  @Get('')
  @UseBefore(authenticateToken())
  async getStatistical(
    @Req() req: any,
    @Res() res: any,
    @QueryParam('startDate') startDateStr?: string,
    @QueryParam('endDate') endDateStr?: string,
    @QueryParam('educationLevel') educationLevel?: string,
    @QueryParam('users') users?: string
  ) {
    try {
      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;
      const counselorId = req.user?.id; // ✅ Lấy từ token đã xác thực

      const consultationStats = await countConsultationSessionsByType({
        counselorId,
        educationLevel,
        startDate,
        endDate,
        users,
      });

      const studentStats = await countStudentsByStatus({
        counselorId,
        educationLevel,
        startDate,
        endDate,
        users,
      });

      const EnrollmentStats = await GetCountEnrollments({
        counselorId,
        educationLevel,
        startDate,
        endDate,
        users,
      });

      const DistributionRegistration = await GetStudentRegistrationDistribution(
        {
          counselorId,
          educationLevel,
          startDate,
          endDate,
          users,
        }
      );

      const allSession_time = await getAllConsultationSessions({
        counselorId,
        educationLevel,
        startDate,
        endDate,
        users,
      });
      const allsession_status = [
        'In_Person',
        'Phone_Call',
        'Online_Meeting',
        'Email',
        'Chat',
      ];
      const allStatuses = ['Lead', 'Registered', 'Engaging', 'Dropped_Out'];

      function normalizeStats(
        rawStats: Array<{
          current_status: string;
          _count: { current_status: number };
        }>
      ) {
        const statsMap = Object.fromEntries(
          rawStats.map((item) => [
            item.current_status,
            item._count.current_status,
          ])
        );

        return allStatuses.map((status) => ({
          current_status: status,
          count: statsMap[status] ?? 0,
        }));
      }
      function normalizeConsultationStats(
        rawStats: Array<{
          session_type: string;
          _count: { session_type: number };
        }>
      ) {
        const statsMap = Object.fromEntries(
          rawStats.map((item) => [item.session_type, item._count.session_type])
        );

        return allsession_status.map((type) => ({
          session_type: type,
          count: statsMap[type] ?? 0,
        }));
      }

      const normalizedStudentStats = normalizeStats(studentStats);
      const normalizedConsultationStats =
        normalizeConsultationStats(consultationStats);

      const statusMap = Object.fromEntries(
        normalizedStudentStats.map((item) => [item.current_status, item.count])
      );

      const ConsultationStatsMap = Object.fromEntries(
        normalizedConsultationStats.map((item) => [
          item.session_type,
          item.count,
        ])
      );

      const totalVisitors =
        statusMap.Lead +
        statusMap.Registered +
        statusMap.Engaging +
        statusMap.Dropped_Out;

      const totalConsultations =
        ConsultationStatsMap.Phone_Call +
        ConsultationStatsMap.Online_Meeting +
        ConsultationStatsMap.In_Person +
        ConsultationStatsMap.Email +
        ConsultationStatsMap.Chat;

      const maxGrowthType = Object.entries(ConsultationStatsMap).reduce(
        (max, [type, value]) => (value > max.value ? { type, value } : max),
        { type: '', value: -Infinity }
      );

      const getBackendConsultType = (status: string): string => {
        switch (status) {
          case 'Phone_Call':
            return 'Cuộc gọi điện thoại';
          case 'Online_Meeting':
            return 'Họp trực tuyến';
          case 'In_Person':
            return 'Trực tiếp';
          case 'Email':
            return 'Email';
          case 'Chat':
            return 'Trò chuyện';
          default:
            console.error(`Trạng thái không hợp lệ: ${status}`);
            throw new Error(`Trạng thái không hợp lệ: ${status}`);
        }
      };
      const trendingText = `Loại tư vấn ${getBackendConsultType(
        maxGrowthType.type
      )} tăng mạnh nhất`;

      const total = allSession_time.reduce(
        (acc, session) => acc + (session.duration_minutes ?? 0),
        0
      );

      const averageDuration =
        allSession_time.length > 0
          ? Math.round(total / allSession_time.length)
          : 0;

      const result = {
        summary: {
          totalVisitors: totalVisitors,
          totalRegistered: statusMap.Registered,
          totalEngaging: statusMap.Engaging,
          totalDropout: statusMap.Dropped_Out,
          conversionRate:
            totalVisitors - statusMap.Lead > 0
              ? (
                  (statusMap.Registered / (totalVisitors - statusMap.Lead)) *
                  100
                ).toFixed(2) + '%'
              : '0%',
          engagementRate:
            totalVisitors > 0
              ? (
                  ((totalVisitors - statusMap.Lead) / totalVisitors) *
                  100
                ).toFixed(2) + '%'
              : '0%',
          trendingText: 'Tăng trưởng ổn định ',
        },
        chartData: {
          phoneCall: ConsultationStatsMap.Phone_Call ?? 0,
          onlineMeeting: ConsultationStatsMap.Online_Meeting,
          inPerson: ConsultationStatsMap.In_Person,
          email: ConsultationStatsMap.Email,
          chat: ConsultationStatsMap.Chat,
        },
        summaryChart: {
          totalConsultations: totalConsultations,
          averageDuration: averageDuration,
          trendingText: trendingText,
        },
      };

      return res.json(
        jsend.success({
          result,
          allSession_time,
          EnrollmentStats,
          statusMap,
          DistributionRegistration,
        })
      );
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }
}
