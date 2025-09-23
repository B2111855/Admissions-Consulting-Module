import {
  PrismaClient,
  users_user_type,
  consultationsessions_session_type,
  consultationsessions_session_status,
  students_current_education_level,
  students_notification_consent,
  students_current_status,
  studentstatushistory_old_status,
  studentstatushistory_new_status,
  students,
} from '@prisma/client';
import Paginator from '../paginator';
import { StudentUpdateApiDto } from '../../dtos/student/student-update.dto';
import { ConsultationHistory } from '../../dtos/student/student-history.dto';
// import { error } from 'console';
const prisma = new PrismaClient();

export interface StudentApiResponse {
  student_id: number;
  student_name: string;
  email: string;
  phone_number: string;
  gender: string;
  zalo_phone: string;
  link_facebook: string;
  date_of_birth: string;
  current_education_level: string;
  other_education_level_description: string | null;
  high_school_name: string;
  city: string;
  source: string;
  notification_consent: string;
  current_status: string;
  status_change_date: string;
  registration_date: string | null;
  student_created_at: string;
  student_updated_at: string;
  assigned_counselor_name: string;
  assigned_counselor_type: string;
  interested_courses_details: string | null;
  enrolled_courses_details: string | null;
  student_status_history: string;
  last_consultation_date: string | null;
  last_consultation_duration_minutes: number | null;
  last_consultation_notes: string | null;
  last_consultation_type: string | null;
  last_consultation_status: string | null;
  last_consultation_counselor_name: string | null;
}

export interface StudentEromentApiResponse {
  student_id: number;
  student_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string | null;
  city: string;
  current_education_level: string;
  source: string;
  // assigned_counselor_name: string;
  // assigned_counselor_type: string;
  enrolled_courses_details: string | null;
  // last_consultation_date: string | null;
  // last_consultation_duration_minutes: number | null;
  // last_consultation_notes: string | null;
  // last_consultation_type: string | null;
  // last_consultation_status: string | null;
  // last_consultation_counselor_name: string | null;
}

class ConsultingInformationManagementService {
  // --- Helper Functions ---
  private formatDateTime(date: Date | null | undefined): string | null {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private formatDate(date: Date | null | undefined): string | null {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapEducationLevel(
    level: students_current_education_level | null
  ): string {
    if (level === null) return '';
    switch (level) {
      case 'THPT':
        return 'THPT';
      case 'SinhVien':
        return 'Sinh viên';
      case 'Other':
        return 'Khác';
      default:
        return String(level);
    }
  }

  private mapSource(source: string | null): string {
    if (source === null) return '';
    switch (source) {
      case 'Mail':
        return 'Mail';
      case 'Fanpage':
        return 'Fanpage';
      case 'Zalo':
        return 'Zalo';
      case 'Website':
        return 'Website';
      case 'Friend':
        return 'Bạn bè';
      case 'SMS':
        return 'SMS';
      case 'Banderole':
        return 'Băng rôn';
      case 'Poster':
        return 'Poster';
      case 'Brochure':
        return 'Brochure';
      case 'Google':
        return 'Google';
      case 'Brand':
        return 'Thương hiệu';
      case 'Event':
        return 'Sự kiện';
      case 'Other':
        return 'Khác';
      default:
        return String(source);
    }
  }

  private mapNotificationConsent(
    consent: students_notification_consent | null
  ): string {
    if (consent === null) return '';
    switch (consent) {
      case 'Agree':
        return 'Đồng ý';
      case 'Disagree':
        return 'Không đồng ý';
      case 'Other':
        return 'Khác';
      default:
        return String(consent);
    }
  }

  private mapStudentStatus(status: students_current_status | null): string {
    if (status === null) return '';
    switch (status) {
      case 'Lead':
        return 'Tiềm năng';
      case 'Engaging':
        return 'Đang tương tác';
      case 'Registered':
        return 'Đã đăng ký';
      case 'Dropped_Out':
        return 'Thôi học';
      case 'Archived':
        return 'Lưu trữ';
      default:
        return String(status);
    }
  }

  private mapUserType(userType: users_user_type): string {
    switch (userType) {
      case 'admin':
        return 'Quản trị viên';
      case 'counselor':
        return 'tư vấn viên';
      case 'manager':
        return 'Quản lý';
      default:
        return userType;
    }
  }

  private mapOldStatusHistory(
    status: studentstatushistory_old_status | null
  ): string {
    if (status === null) return 'null';
    switch (status) {
      case 'Lead':
        return 'Tiềm năng';
      case 'Engaging':
        return 'Đang tương tác';
      case 'Registered':
        return 'Đã đăng ký';
      case 'Dropped_Out':
        return 'Thôi học';
      case 'Archived':
        return 'Lưu trữ';
      default:
        return String(status);
    }
  }

  private mapNewStatusHistory(status: studentstatushistory_new_status): string {
    switch (status) {
      case 'Lead':
        return 'Tiềm năng';
      case 'Engaging':
        return 'Đang tương tác';
      case 'Registered':
        return 'Đã đăng ký';
      case 'Dropped_Out':
        return 'Thôi học';
      case 'Archived':
        return 'Lưu trữ';
      default:
        return String(status);
    }
  }

  private mapConsultationSessionType(
    type: consultationsessions_session_type | null
  ): string | null {
    if (type === null) return null;
    switch (type) {
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
        return String(type);
    }
  }

  private mapConsultationSessionStatus(
    status: consultationsessions_session_status | null
  ): string | null {
    if (status === null) return null;
    switch (status) {
      case 'Scheduled':
        return 'Đã lên lịch';
      case 'Completed':
        return 'Hoàn thành';
      case 'Canceled':
        return 'Đã hủy';
      case 'No_Show':
        return 'Không tham dự';
      default:
        return String(status);
    }
  }
  private areDatesEqual(date1: Date | null, date2: Date | null): boolean {
    if (!date1 && !date2) return true;
    if (!date1 || !date2) return false;
    return date1.getTime() === date2.getTime();
  }

  private parseRegistrationDate(dateString: string): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // --- End Helper Functions ---

  async getAllConsultingInformation(
    page: number = 1,
    limit: number = 10,
    assigned_counselor_id: number
  ): Promise<{
    consultingInformation: StudentEromentApiResponse[];
    metadata: any;
  }> {
    try {
      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.max(1, Math.floor(limit));
      const paginator = new Paginator(validPage, validLimit);
      const offset = paginator.offset;

      const whereAssigned_counselor_id: any = {}; // hoặc `Record<string, any>` nếu muốn rõ type
      const wherecounselor_id: any = {}; // hoặc `Record<string, any>` nếu muốn rõ type

      const userType = await prisma.users.findUnique({
        where: {
          id: assigned_counselor_id,
        },
        select: {
          user_type: true,
        },
      });
      if (userType?.user_type === 'counselor') {
        whereAssigned_counselor_id.assigned_counselor_id =
          assigned_counselor_id;
        wherecounselor_id.counselor_id = assigned_counselor_id;
      }

      const totalConsultingInformationCount = await prisma.students.count({
        where: {
          ...whereAssigned_counselor_id,
          studentenrollments: {
            some: {},
          },
        },
      });

      if (totalConsultingInformationCount === 0) {
        return {
          consultingInformation: [],
          metadata: paginator.getMetadata(0),
        };
      }

      const studentsWithDetails = await prisma.students.findMany({
        where: {
          studentenrollments: {
            some: {
              ...wherecounselor_id,
            },
          },
        },
        skip: offset,
        // take: validLimit,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          student_name: true,
          email: true,
          phone_number: true,
          current_education_level: true,
          source: true,
          date_of_birth: true,
          city: true,
          gender: true,
          zalo_phone: true,
          link_facebook: true,
          other_education_level_description: true,
          high_school_name: true,
          other_source_description: true,
          notification_consent: true,
          other_notification_consent_description: true,
          current_status: true,
          status_change_date: true,
          registration_date: true,
          created_at: true,
          updated_at: true,
          studentenrollments: {
            select: {
              enrollment_date: true,
              fee_paid: true,
              payment_status: true,
              notes: true,
              users: {
                select: {
                  full_name: true,
                  program_type: true,
                },
              },
              courses: {
                select: {
                  name: true,
                  // coursecategories: {
                  //   select: {
                  //     name: true,
                  //   },
                  // },
                },
              },
              consultationsessions: {
                select: {
                  session_date: true,
                  duration_minutes: true,
                  session_type: true,
                  session_status: true,
                  users: {
                    select: {
                      full_name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const formatted: StudentEromentApiResponse[] = studentsWithDetails.map(
        (student) => {
          const enrollments = student.studentenrollments;

          const enrolled_courses_details = enrollments
            .map((enroll) => {
              const courseStr = `${enroll.courses.name}`;
              const Infosessions = `Ngày tư vấn cuối cùng:${this.formatDate(
                enroll.consultationsessions?.session_date
              )}, Thời lượng tư vấn cuối cùng:${
                enroll.consultationsessions?.duration_minutes
              } phút, Loại tư vấn cuối cùng:${
                enroll.consultationsessions?.session_type
              }, Trạng thái tư vấn cuối cùng:${
                enroll.consultationsessions?.session_status
              }, Người phụ trách cuối cùng:${
                enroll.consultationsessions?.users.full_name
              }`;
              // const infoenro = `${enroll.enrollment_date.notes}`;
              const enrollmentInfo = `Ngày đăng ký: ${this.formatDate(
                enroll.enrollment_date
              )}, Notes: ${enroll.notes}, Trạng thái thanh toán: ${
                enroll.payment_status
              }, Phí đã trả:${Number(enroll.fee_paid)})`;
              return `${courseStr}*${enrollmentInfo}*${Infosessions}`;
            })
            .join(';\n');

          // const allSessions = enrollments.flatMap(
          //   (e) => e.consultationsessions ?? []
          // );
          // const validSessions = allSessions.filter(
          //   (s): s is NonNullable<typeof s> => s !== null
          // );
          // const latestSession = validSessions
          //   .filter((s) => s.session_date !== null)
          //   .sort(
          //     (a, b) =>
          //       new Date(b.session_date!).getTime() -
          //       new Date(a.session_date!).getTime()
          //   )[0];

          return {
            student_id: student.id,
            student_name: student.student_name,
            email: student.email || '',
            phone_number: student.phone_number || '',
            date_of_birth: student.date_of_birth
              ? this.formatDate(student.date_of_birth)
              : null,
            city: student.city || '',
            current_education_level: this.mapEducationLevel(
              student.current_education_level
            ),
            source: this.mapSource(student.source),
            enrolled_courses_details: enrolled_courses_details || null,

            link_facebook: student.link_facebook || '',
            // current_education_level: this.mapEducationLevel(
            //   student.current_education_level
            // ),
            other_education_level_description:
              student.other_education_level_description,
            high_school_name: student.high_school_name || '',
            // city: student.city || '',
            // source: this.mapSource(student.source),
            other_source_description: student.other_source_description,
            notification_consent: this.mapNotificationConsent(
              student.notification_consent
            ),
            other_notification_consent_description:
              student.other_notification_consent_description,
            current_status: this.mapStudentStatus(student.current_status), // Vẫn map để hiển thị tiếng Việt ở frontend
            status_change_date:
              this.formatDateTime(student.status_change_date) || '',

            assigned_counselor_name: '',
            assigned_counselor_type: '',
            interested_courses_details: '',
            student_status_history: '', // nếu không có dữ liệu thực
            last_consultation_date: '',
            last_consultation_duration_minutes: null,
            last_consultation_notes: '',
            last_consultation_type: '',
            last_consultation_status: '',
            last_consultation_counselor_name: '',
            gender: student.gender, // nếu không lấy từ DB, phải để mặc định
            zalo_phone: '', // hoặc null tùy schema
            // link_facebook: '',
            // other_education_level_description: '',
            // high_school_name: '',
            // notification_consent: '',
            // other_notification_consent_description: '',
            // current_status: '',
            // status_change_date: '',
            registration_date: '',
            student_created_at: '',
            student_updated_at: '',
            // other_source_description: '', // hoặc null nếu bạn không có
            // assigned_counselor_name: enrollments[0]?.users?.full_name || 'N/A',
            // assigned_counselor_type:
            //   enrollments[0]?.users?.program_type || 'N/A',
            // interested_courses_details: null,
            // student_status_history: '',
            // last_consultation_date: latestSession
            //   ? this.formatDateTime(latestSession.session_date)
            //   : null,
            // last_consultation_duration_minutes:
            //   latestSession?.duration_minutes || null,
            // last_consultation_notes: latestSession?.notes || null,
            // last_consultation_type: latestSession
            //   ? this.mapConsultationSessionType(latestSession.session_type)
            //   : null,
            // last_consultation_status: latestSession
            //   ? this.mapConsultationSessionStatus(latestSession.session_status)
            //   : null,
            // last_consultation_counselor_name:
            //   latestSession?.users?.full_name || null,
          };
        }
      );

      return {
        consultingInformation: formatted,
        metadata: paginator.getMetadata(totalConsultingInformationCount),
      };
    } catch (error: any) {
      console.error(
        'CRITICAL ERROR in getAllConsultingInformation:',
        error.message || error
      );
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // async getAllConsultingInformation(
  //   page: number = 1,
  //   limit: number = 10
  // ): Promise<{
  //   consultingInformation: StudentApiResponse[];
  //   metadata: any;
  // }> {
  //   try {
  //     const validPage = Math.max(1, Math.floor(page));
  //     const validLimit = Math.max(1, Math.floor(limit));
  //     const paginator = new Paginator(validPage, validLimit);
  //     const offset = paginator.offset;

  //     // Đếm số lượt enroll hợp lệ
  //     const totalEnrollments = await prisma.studentenrollments.count();

  //     if (totalEnrollments === 0) {
  //       return {
  //         consultingInformation: [],
  //         metadata: paginator.getMetadata(0),
  //       };
  //     }

  //     const enrollments = await prisma.studentenrollments.findMany({
  //       skip: offset,
  //       take: validLimit,
  //       orderBy: {
  //         enrollment_date: 'desc',
  //       },
  //       select: {
  //         enrollment_date: true,
  //         fee_paid: true,
  //         students: {
  //           select: {
  //             id: true,
  //             student_name: true,
  //             email: true,
  //             phone_number: true,
  //             gender: true,
  //             zalo_phone: true,
  //             link_facebook: true,
  //             date_of_birth: true,
  //             current_education_level: true,
  //             other_education_level_description: true,
  //             high_school_name: true,
  //             city: true,
  //             source: true,
  //             other_source_description: true,
  //             notification_consent: true,
  //             other_notification_consent_description: true,
  //             current_status: true,
  //             status_change_date: true,
  //             registration_date: true,
  //             created_at: true,
  //             updated_at: true,
  //             users: {
  //               select: {
  //                 full_name: true,
  //                 user_type: true,
  //               },
  //             },
  //             student_interested_courses: {
  //               select: {
  //                 courses: {
  //                   select: {
  //                     name: true,
  //                     description: true,
  //                     coursecategories: {
  //                       select: {
  //                         name: true,
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //             studentstatushistory: {
  //               select: {
  //                 old_status: true,
  //                 new_status: true,
  //                 change_date: true,
  //                 notes: true,
  //                 users: {
  //                   select: {
  //                     full_name: true,
  //                   },
  //                 },
  //               },
  //               orderBy: {
  //                 change_date: 'asc',
  //               },
  //             },
  //             consultationsessions: {
  //               select: {
  //                 session_date: true,
  //                 duration_minutes: true,
  //                 notes: true,
  //                 session_type: true,
  //                 session_status: true,
  //                 users: {
  //                   select: {
  //                     full_name: true,
  //                   },
  //                 },
  //               },
  //               orderBy: {
  //                 session_date: 'desc',
  //               },
  //               take: 1,
  //             },
  //           },
  //         },
  //         courses: {
  //           select: {
  //             name: true,
  //             coursecategories: {
  //               select: {
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const consultingInformation: StudentApiResponse[] = enrollments.map(
  //       (enrollment) => {
  //         const s = enrollment.students!;
  //         const course = enrollment.courses;
  //         const assignedCounselorName = s.users?.full_name || 'N/A';
  //         const assignedCounselorType = s.users
  //           ? this.mapUserType(s.users.user_type)
  //           : 'N/A';

  //         const interestedCoursesDetails =
  //           s.student_interested_courses.length > 0
  //             ? s.student_interested_courses
  //                 .map(
  //                   (sic) =>
  //                     `${sic.courses.coursecategories.name} - ${
  //                       sic.courses.name
  //                     } (Mô tả: ${sic.courses.description || 'N/A'})`
  //                 )
  //                 .join(';\n')
  //             : null;

  //         const studentStatusHistory =
  //           s.studentstatushistory.length > 0
  //             ? s.studentstatushistory
  //                 .map((ssh) => {
  //                   const oldStatusMapped = this.mapOldStatusHistory(
  //                     ssh.old_status
  //                   );
  //                   const newStatusMapped = this.mapNewStatusHistory(
  //                     ssh.new_status
  //                   );
  //                   const notesPart = ssh.notes
  //                     ? `, Ghi chú: ${ssh.notes}`
  //                     : '';
  //                   return `Từ: ${oldStatusMapped} Đến: ${newStatusMapped} (Ngày: ${this.formatDateTime(
  //                     ssh.change_date
  //                   )}, Bởi: ${ssh.users.full_name}${notesPart})`;
  //                 })
  //                 .join(';\n')
  //             : '';

  //         const latestConsultation = s.consultationsessions[0] || null;

  //         return {
  //           student_id: s.id,
  //           student_name: s.student_name,
  //           email: s.email || '',
  //           phone_number: s.phone_number,
  //           gender: s.gender,
  //           zalo_phone: s.zalo_phone || '',
  //           link_facebook: s.link_facebook || '',
  //           date_of_birth: this.formatDate(s.date_of_birth) || '',
  //           current_education_level: this.mapEducationLevel(
  //             s.current_education_level
  //           ),
  //           other_education_level_description:
  //             s.other_education_level_description,
  //           high_school_name: s.high_school_name || '',
  //           city: s.city || '',
  //           source: this.mapSource(s.source),
  //           other_source_description: s.other_source_description,
  //           notification_consent: this.mapNotificationConsent(
  //             s.notification_consent
  //           ),
  //           other_notification_consent_description:
  //             s.other_notification_consent_description,
  //           current_status: this.mapStudentStatus(s.current_status),
  //           status_change_date: this.formatDateTime(s.status_change_date) || '',
  //           registration_date: this.formatDate(s.registration_date),
  //           student_created_at: this.formatDateTime(s.created_at) || '',
  //           student_updated_at: this.formatDateTime(s.updated_at) || '',
  //           assigned_counselor_name: assignedCounselorName,
  //           assigned_counselor_type: assignedCounselorType,
  //           interested_courses_details: interestedCoursesDetails,
  //           enrolled_courses_details: `${course.coursecategories.name} - ${
  //             course.name
  //           } (Ngày đăng ký: ${this.formatDate(
  //             enrollment.enrollment_date
  //           )}, Phí đã trả: ${enrollment.fee_paid.toFixed(2)})`,
  //           student_status_history: studentStatusHistory,
  //           last_consultation_date: latestConsultation
  //             ? this.formatDateTime(latestConsultation.session_date)
  //             : null,
  //           last_consultation_duration_minutes:
  //             latestConsultation?.duration_minutes || null,
  //           last_consultation_notes: latestConsultation?.notes || null,
  //           last_consultation_type: latestConsultation
  //             ? this.mapConsultationSessionType(latestConsultation.session_type)
  //             : null,
  //           last_consultation_status: latestConsultation
  //             ? this.mapConsultationSessionStatus(
  //                 latestConsultation.session_status
  //               )
  //             : null,
  //           last_consultation_counselor_name:
  //             latestConsultation?.users.full_name || null,
  //         };
  //       }
  //     );

  //     const metadata = paginator.getMetadata(totalEnrollments);

  //     return {
  //       consultingInformation,
  //       metadata,
  //     };
  //   } catch (error: any) {
  //     console.error('Lỗi nghiêm trọng:', error.message || error);
  //     throw error;
  //   }
  // }

  // async getAllConsultingInformationByCounselor(
  //   assigned_counselor_id: number,
  //   page: number = 1,
  //   limit: number = 10
  // ): Promise<{
  //   consultingInformation: StudentApiResponse[];
  //   metadata: any;
  // }> {
  //   try {
  //     const validPage = Math.max(1, Math.floor(page));
  //     const validLimit = Math.max(1, Math.floor(limit));
  //     const paginator = new Paginator(validPage, validLimit);
  //     const offset = paginator.offset;

  //     // Đếm tổng số học sinh được phân công cho counselor này
  //     const totalConsultingInformationCount = await prisma.students.count({
  //       where: {
  //         assigned_counselor_id: assigned_counselor_id,
  //       },
  //     });

  //     console.log('Total count for counselor:', totalConsultingInformationCount);

  //     if (totalConsultingInformationCount === 0) {
  //       return {
  //         consultingInformation: [],
  //         metadata: paginator.getMetadata(0),
  //       };
  //     }

  //     const studentsWithDetails = await prisma.students.findMany({
  //       where: {
  //         assigned_counselor_id: assigned_counselor_id,
  //       },
  //       skip: offset,
  //       take: validLimit,
  //       select: {
  //         id: true,
  //         student_name: true,
  //         email: true,
  //         phone_number: true,
  //         gender: true,
  //         zalo_phone: true,
  //         link_facebook: true,
  //         date_of_birth: true,
  //         current_education_level: true,
  //         other_education_level_description: true,
  //         high_school_name: true,
  //         city: true,
  //         source: true,
  //         other_source_description: true,
  //         notification_consent: true,
  //         other_notification_consent_description: true,
  //         current_status: true,
  //         status_change_date: true,
  //         registration_date: true,
  //         created_at: true,
  //         updated_at: true,
  //         users: {
  //           select: {
  //             full_name: true,
  //             user_type: true,
  //           },
  //         },
  //         student_interested_courses: {
  //           select: {
  //             courses: {
  //               select: {
  //                 name: true,
  //                 description: true,
  //                 coursecategories: {
  //                   select: {
  //                     name: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         studentenrollments: {
  //           select: {
  //             enrollment_date: true,
  //             fee_paid: true,
  //             courses: {
  //               select: {
  //                 name: true,
  //                 coursecategories: {
  //                   select: {
  //                     name: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         studentstatushistory: {
  //           select: {
  //             old_status: true,
  //             new_status: true,
  //             change_date: true,
  //             notes: true,
  //             users: {
  //               select: {
  //                 full_name: true,
  //               },
  //             },
  //           },
  //           orderBy: {
  //             change_date: 'asc',
  //           },
  //         },
  //         consultationsessions: {
  //           select: {
  //             session_date: true,
  //             duration_minutes: true,
  //             notes: true,
  //             session_type: true,
  //             session_status: true,
  //             users: {
  //               select: {
  //                 full_name: true,
  //               },
  //             },
  //           },
  //           orderBy: {
  //             session_date: 'desc',
  //           },
  //           take: 1,
  //         },
  //       },
  //       orderBy: {
  //         id: 'asc',
  //       },
  //     });

  //     const formattedConsultingInformation: StudentApiResponse[] =
  //       studentsWithDetails.map((student) => {
  //         const assignedCounselorName = student.users?.full_name || 'N/A';
  //         const assignedCounselorType = student.users
  //           ? this.mapUserType(student.users.user_type)
  //           : 'N/A';

  //         const interestedCoursesDetails =
  //           student.student_interested_courses.length > 0
  //             ? student.student_interested_courses
  //                 .map(
  //                   (sic) =>
  //                     `${sic.courses.coursecategories.name} - ${
  //                       sic.courses.name
  //                     } (Mô tả: ${sic.courses.description || 'N/A'})`
  //                 )
  //                 .join(';\n')
  //             : null;

  //         const enrolledCoursesDetails =
  //           student.studentenrollments.length > 0
  //             ? student.studentenrollments
  //                 .map(
  //                   (se) =>
  //                     `${se.courses.coursecategories.name} - ${
  //                       se.courses.name
  //                     } (Ngày đăng ký: ${this.formatDate(
  //                       se.enrollment_date
  //                     )}, Phí đã trả: ${se.fee_paid.toFixed(2)})`
  //                 )
  //                 .join(';\n')
  //             : null;

  //         const studentStatusHistory =
  //           student.studentstatushistory.length > 0
  //             ? student.studentstatushistory
  //                 .map((ssh) => {
  //                   const oldStatusMapped = this.mapOldStatusHistory(
  //                     ssh.old_status
  //                   );
  //                   const newStatusMapped = this.mapNewStatusHistory(
  //                     ssh.new_status
  //                   );
  //                   const notesPart = ssh.notes
  //                     ? `, Ghi chú: ${ssh.notes}`
  //                     : '';
  //                   return `Từ: ${oldStatusMapped} Đến: ${newStatusMapped} (Ngày: ${this.formatDateTime(
  //                     ssh.change_date
  //                   )}, Bởi: ${ssh.users.full_name}${notesPart})`;
  //                 })
  //                 .join(';\n')
  //             : '';

  //         const latestConsultation = student.consultationsessions[0] || null;

  //         return {
  //           student_id: student.id,
  //           student_name: student.student_name,
  //           email: student.email || '',
  //           phone_number: student.phone_number,
  //           gender: student.gender,
  //           zalo_phone: student.zalo_phone || '',
  //           link_facebook: student.link_facebook || '',
  //           date_of_birth: this.formatDate(student.date_of_birth) || '',
  //           current_education_level: this.mapEducationLevel(
  //             student.current_education_level
  //           ),
  //           other_education_level_description:
  //             student.other_education_level_description,
  //           high_school_name: student.high_school_name || '',
  //           city: student.city || '',
  //           source: this.mapSource(student.source),
  //           other_source_description: student.other_source_description,
  //           notification_consent: this.mapNotificationConsent(
  //             student.notification_consent
  //           ),
  //           other_notification_consent_description:
  //             student.other_notification_consent_description,
  //           current_status: this.mapStudentStatus(student.current_status),
  //           status_change_date:
  //             this.formatDateTime(student.status_change_date) || '',
  //           registration_date: this.formatDate(student.registration_date),
  //           student_created_at: this.formatDateTime(student.created_at) || '',
  //           student_updated_at: this.formatDateTime(student.updated_at) || '',
  //           assigned_counselor_name: assignedCounselorName,
  //           assigned_counselor_type: assignedCounselorType,
  //           interested_courses_details: interestedCoursesDetails,
  //           enrolled_courses_details: enrolledCoursesDetails,
  //           student_status_history: studentStatusHistory,
  //           last_consultation_date: latestConsultation
  //             ? this.formatDateTime(latestConsultation.session_date)
  //             : null,
  //           last_consultation_duration_minutes:
  //             latestConsultation?.duration_minutes || null,
  //           last_consultation_notes: latestConsultation?.notes || null,
  //           last_consultation_type: latestConsultation
  //             ? this.mapConsultationSessionType(latestConsultation.session_type)
  //             : null,
  //           last_consultation_status: latestConsultation
  //             ? this.mapConsultationSessionStatus(
  //                 latestConsultation.session_status
  //               )
  //             : null,
  //           last_consultation_counselor_name:
  //             latestConsultation?.users.full_name || null,
  //         };
  //       });

  //     const metadata = paginator.getMetadata(totalConsultingInformationCount);
  //     console.log('Generated metadata for counselor:', metadata);

  //     return {
  //       consultingInformation: formattedConsultingInformation,
  //       metadata,
  //     };
  //   } catch (error: any) {
  //     console.error(
  //       'CRITICAL ERROR in ConsultingInformationManagementService.getAllConsultingInformationByCounselor:',
  //       error.message || error
  //     );
  //     console.error('Error stack:', error.stack);
  //     throw error;
  //   }
  // }
  async getAllConsultingInformationByCounselor(
    assigned_counselor_id: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    consultingInformation: StudentApiResponse[];
    metadata: any;
  }> {
    try {
      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.max(1, Math.floor(limit));
      const paginator = new Paginator(validPage, validLimit);
      const offset = paginator.offset;

      const excludeStatusCondition = {
        NOT: {
          // current_status: 'Registered' as students_current_status,
        },
      };

      const whereAssigned_counselor_id: any = {}; // hoặc `Record<string, any>` nếu muốn rõ type

      const userType = await prisma.users.findUnique({
        where: {
          id: assigned_counselor_id,
        },
        select: {
          user_type: true,
        },
      });
      if (userType?.user_type === 'counselor') {
        whereAssigned_counselor_id.assigned_counselor_id =
          assigned_counselor_id;
      }

      const totalConsultingInformationCount = await prisma.students.count({
        where: {
          ...whereAssigned_counselor_id,
          ...excludeStatusCondition,
        },
      });

      console.log(
        'Total count for counselor (excluding Registered):',
        totalConsultingInformationCount
      );

      if (totalConsultingInformationCount === 0) {
        return {
          consultingInformation: [],
          metadata: paginator.getMetadata(0),
        };
      }

      const studentsWithDetails = await prisma.students.findMany({
        where: {
          ...whereAssigned_counselor_id,
          ...excludeStatusCondition,
        },
        skip: offset,
        take: validLimit,
        select: {
          id: true,
          student_name: true,
          email: true,
          phone_number: true,
          gender: true,
          zalo_phone: true,
          link_facebook: true,
          date_of_birth: true,
          current_education_level: true,
          other_education_level_description: true,
          high_school_name: true,
          city: true,
          source: true,
          other_source_description: true,
          notification_consent: true,
          other_notification_consent_description: true,
          current_status: true,
          status_change_date: true,
          registration_date: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              full_name: true,
              user_type: true,
            },
          },
          student_interested_courses: {
            select: {
              courses: {
                select: {
                  name: true,
                  description: true,
                  coursecategories: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          studentenrollments: {
            select: {
              enrollment_date: true,
              fee_paid: true,
              courses: {
                select: {
                  name: true,
                  coursecategories: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          studentstatushistory: {
            select: {
              old_status: true,
              new_status: true,
              change_date: true,
              notes: true,
              users: {
                select: {
                  full_name: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
          },
          consultationsessions: {
            select: {
              session_date: true,
              duration_minutes: true,
              notes: true,
              session_type: true,
              session_status: true,
              users: {
                select: {
                  full_name: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          id: 'asc',
        },
      });

      const formattedConsultingInformation: StudentApiResponse[] =
        studentsWithDetails.map((student) => {
          const assignedCounselorName = student.users?.full_name || 'N/A';
          const assignedCounselorType = student.users
            ? this.mapUserType(student.users.user_type)
            : 'N/A';

          const interestedCoursesDetails =
            student.student_interested_courses.length > 0
              ? student.student_interested_courses
                  .map(
                    (sic) =>
                      `${sic.courses.coursecategories.name} - ${
                        sic.courses.name
                      } (Mô tả: ${sic.courses.description || 'N/A'})`
                  )
                  .join(';\n')
              : null;

          const enrolledCoursesDetails =
            student.studentenrollments.length > 0
              ? student.studentenrollments
                  .map(
                    (se) =>
                      `${se.courses.coursecategories.name} - ${
                        se.courses.name
                      } (Ngày đăng ký: ${this.formatDate(
                        se.enrollment_date
                      )}, Phí đã trả: ${se.fee_paid.toFixed(2)})`
                  )
                  .join(';\n')
              : null;

          const studentStatusHistory =
            student.studentstatushistory.length > 0
              ? student.studentstatushistory
                  .map((ssh) => {
                    const oldStatusMapped = this.mapOldStatusHistory(
                      ssh.old_status
                    );
                    const newStatusMapped = this.mapNewStatusHistory(
                      ssh.new_status
                    );
                    const notesPart = ssh.notes
                      ? `, Ghi chú: ${ssh.notes}`
                      : '';
                    return `Từ: ${oldStatusMapped} Đến: ${newStatusMapped} (Ngày: ${this.formatDateTime(
                      ssh.change_date
                    )}, Bởi: ${ssh.users.full_name}${notesPart})`;
                  })
                  .join(';\n')
              : '';

          const latestConsultation = student.consultationsessions[0] || null;

          return {
            student_id: student.id,
            student_name: student.student_name,
            email: student.email || '',
            phone_number: student.phone_number,
            gender: student.gender,
            zalo_phone: student.zalo_phone || '',
            link_facebook: student.link_facebook || '',
            date_of_birth: this.formatDate(student.date_of_birth) || '',
            current_education_level: this.mapEducationLevel(
              student.current_education_level
            ),
            other_education_level_description:
              student.other_education_level_description,
            high_school_name: student.high_school_name || '',
            city: student.city || '',
            source: this.mapSource(student.source),
            other_source_description: student.other_source_description,
            notification_consent: this.mapNotificationConsent(
              student.notification_consent
            ),
            other_notification_consent_description:
              student.other_notification_consent_description,
            current_status: this.mapStudentStatus(student.current_status), // Vẫn map để hiển thị tiếng Việt ở frontend
            status_change_date:
              this.formatDateTime(student.status_change_date) || '',
            registration_date: this.formatDate(student.registration_date),
            student_created_at: this.formatDateTime(student.created_at) || '',
            student_updated_at: this.formatDateTime(student.updated_at) || '',
            assigned_counselor_name: assignedCounselorName,
            assigned_counselor_type: assignedCounselorType,
            interested_courses_details: interestedCoursesDetails,
            enrolled_courses_details: enrolledCoursesDetails,
            student_status_history: studentStatusHistory,
            last_consultation_date: latestConsultation
              ? this.formatDateTime(latestConsultation.session_date)
              : null,
            last_consultation_duration_minutes:
              latestConsultation?.duration_minutes || null,
            last_consultation_notes: latestConsultation?.notes || null,
            last_consultation_type: latestConsultation
              ? this.mapConsultationSessionType(latestConsultation.session_type)
              : null,
            last_consultation_status: latestConsultation
              ? this.mapConsultationSessionStatus(
                  latestConsultation.session_status
                )
              : null,
            last_consultation_counselor_name:
              latestConsultation?.users.full_name || null,
          };
        });

      const metadata = paginator.getMetadata(totalConsultingInformationCount);
      console.log('Generated metadata for counselor:', metadata);

      return {
        consultingInformation: formattedConsultingInformation,
        metadata,
      };
    } catch (error: any) {
      console.error(
        'CRITICAL ERROR in ConsultingInformationManagementService.getAllConsultingInformationByCounselor:',
        error.message || error
      );
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async getConsultingInformationById(
    studentId: number
  ): Promise<StudentApiResponse | null> {
    try {
      // Đảm bảo studentId là một số nguyên
      const parsedStudentId = parseInt(String(studentId), 10);
      if (isNaN(parsedStudentId)) {
        console.error(`Invalid studentId provided: ${studentId}`);
        return null; // Hoặc throw một lỗi cụ thể hơn nếu muốn
      }

      const studentWithDetails = await prisma.students.findUnique({
        where: {
          id: parsedStudentId, // Sử dụng parsedStudentId
        },
        select: {
          id: true,
          student_name: true,
          email: true,
          phone_number: true,
          gender: true,
          zalo_phone: true,
          link_facebook: true,
          date_of_birth: true,
          current_education_level: true,
          other_education_level_description: true,
          high_school_name: true,
          city: true,
          source: true,
          other_source_description: true,
          notification_consent: true,
          other_notification_consent_description: true,
          current_status: true,
          status_change_date: true,
          registration_date: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              full_name: true,
              user_type: true,
            },
          },
          student_interested_courses: {
            select: {
              courses: {
                select: {
                  name: true,
                  description: true,
                  coursecategories: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          studentenrollments: {
            select: {
              enrollment_date: true,
              fee_paid: true,
              courses: {
                select: {
                  name: true,
                  coursecategories: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          studentstatushistory: {
            select: {
              old_status: true,
              new_status: true,
              change_date: true,
              notes: true,
              users: {
                select: {
                  full_name: true,
                },
              },
            },
            orderBy: {
              change_date: 'asc',
            },
          },
          consultationsessions: {
            select: {
              session_date: true,
              duration_minutes: true,
              notes: true,
              session_type: true,
              session_status: true,
              users: {
                select: {
                  full_name: true,
                },
              },
            },
            orderBy: {
              session_date: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!studentWithDetails) {
        return null;
      }

      // Ánh xạ dữ liệu sang định dạng StudentApiResponse
      const assignedCounselorName =
        studentWithDetails.users?.full_name || 'N/A';
      const assignedCounselorType = studentWithDetails.users
        ? this.mapUserType(studentWithDetails.users.user_type)
        : 'N/A';

      const interestedCoursesDetails =
        studentWithDetails.student_interested_courses.length > 0
          ? studentWithDetails.student_interested_courses
              .map(
                (sic) =>
                  `${sic.courses.coursecategories.name} - ${
                    sic.courses.name
                  } (Mô tả: ${sic.courses.description || 'N/A'})`
              )
              .join(';\n')
          : null;

      const enrolledCoursesDetails =
        studentWithDetails.studentenrollments.length > 0
          ? studentWithDetails.studentenrollments
              .map(
                (se) =>
                  `${se.courses.coursecategories.name} - ${
                    se.courses.name
                  } (Ngày đăng ký: ${this.formatDate(
                    se.enrollment_date
                  )}, Phí đã trả: ${se.fee_paid.toFixed(2)})`
              )
              .join(';\n')
          : null;

      const studentStatusHistory =
        studentWithDetails.studentstatushistory.length > 0
          ? studentWithDetails.studentstatushistory
              .map((ssh) => {
                const oldStatusMapped = this.mapOldStatusHistory(
                  ssh.old_status
                );
                const newStatusMapped = this.mapNewStatusHistory(
                  ssh.new_status
                );
                const notesPart = ssh.notes ? `, Ghi chú: ${ssh.notes}` : '';
                return `Từ: ${oldStatusMapped} Đến: ${newStatusMapped} (Ngày: ${this.formatDateTime(
                  ssh.change_date
                )}, Bởi: ${ssh.users.full_name}${notesPart})`;
              })
              .join(';\n')
          : '';

      const latestConsultation =
        studentWithDetails.consultationsessions[0] || null;

      return {
        student_id: studentWithDetails.id,
        student_name: studentWithDetails.student_name,
        email: studentWithDetails.email || '',
        phone_number: studentWithDetails.phone_number,
        gender: studentWithDetails.gender,
        zalo_phone: studentWithDetails.zalo_phone || '',
        link_facebook: studentWithDetails.link_facebook || '',
        date_of_birth: this.formatDate(studentWithDetails.date_of_birth) || '',
        current_education_level: this.mapEducationLevel(
          studentWithDetails.current_education_level
        ),
        other_education_level_description:
          studentWithDetails.other_education_level_description || 'Không có',
        high_school_name: studentWithDetails.high_school_name || '',
        city: studentWithDetails.city || '',
        source: this.mapSource(studentWithDetails.source),
        notification_consent: this.mapNotificationConsent(
          studentWithDetails.notification_consent
        ),
        current_status: this.mapStudentStatus(
          studentWithDetails.current_status
        ),
        status_change_date:
          this.formatDateTime(studentWithDetails.status_change_date) || '',
        registration_date: this.formatDate(
          studentWithDetails.registration_date
        ),
        student_created_at:
          this.formatDateTime(studentWithDetails.created_at) || '',
        student_updated_at:
          this.formatDateTime(studentWithDetails.updated_at) || '',
        assigned_counselor_name: assignedCounselorName,
        assigned_counselor_type: assignedCounselorType,
        interested_courses_details: interestedCoursesDetails,
        enrolled_courses_details: enrolledCoursesDetails,
        student_status_history: studentStatusHistory,
        last_consultation_date: latestConsultation
          ? this.formatDateTime(latestConsultation.session_date)
          : null,
        last_consultation_duration_minutes:
          latestConsultation?.duration_minutes || 0,
        last_consultation_notes: latestConsultation?.notes || 'Chưa tư vấn',
        last_consultation_type: latestConsultation
          ? this.mapConsultationSessionType(latestConsultation.session_type)
          : null,
        last_consultation_status: latestConsultation
          ? this.mapConsultationSessionStatus(latestConsultation.session_status)
          : null,
        last_consultation_counselor_name:
          latestConsultation?.users.full_name || null,
      };
    } catch (error: any) {
      console.error(
        `CRITICAL ERROR in ConsultingInformationManagementService.getConsultingInformationById (for ID: ${studentId}):`,
        error.message || error
      );
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async getConsultationHistoryForCounselorAssignedStudents(
    counselorId: number,
    page: number = 1,
    limit: number = 10 // Đổi tên thành 'limit' cho nhất quán với hàm kia
  ): Promise<{ consultationHistory: ConsultationHistory[]; metadata: any }> {
    // Cập nhật kiểu trả về
    try {
      // Khởi tạo Paginator
      const paginator = new Paginator(page, limit);
      const offset = paginator.offset;
      // const validLimit = paginator.limit; // Sử dụng limit đã được validate bởi Paginator

      const whereAssigned_counselor_id: any = {}; // hoặc `Record<string, any>` nếu muốn rõ type
      const wherecounselorId: any = {}; // hoặc `Record<string, any>` nếu muốn rõ type

      const userType = await prisma.users.findUnique({
        where: {
          id: counselorId,
        },
        select: {
          user_type: true,
        },
      });
      if (userType?.user_type === 'counselor') {
        whereAssigned_counselor_id.assigned_counselor_id = counselorId;
        wherecounselorId.counselor_id = counselorId;
      }

      // Bước 1: Tìm tất cả học sinh được gán cho người tư vấn này
      // Không phân trang ở đây vì chúng ta cần tất cả student_id để lọc consultation sessions
      const students = await prisma.students.findMany({
        where: {
          ...whereAssigned_counselor_id,
        },
        select: {
          id: true,
        },
      });

      if (!students || students.length === 0) {
        return {
          consultationHistory: [],
          metadata: paginator.getMetadata(0),
        };
      }

      const studentIds = students.map((s) => s.id);

      // Bước 2a: Đếm tổng số phiên tư vấn phù hợp
      const totalConsultationHistoryCount =
        await prisma.consultationsessions.count({
          where: {
            student_id: {
              in: studentIds,
            },
            ...wherecounselorId,
          },
        });

      console.log(
        'Total consultation history count for counselor:',
        totalConsultationHistoryCount
      );

      if (totalConsultationHistoryCount === 0) {
        return {
          consultationHistory: [],
          metadata: paginator.getMetadata(0),
        };
      }

      // Bước 2b: Lấy các phiên tư vấn đã được phân trang
      const consultationSessions = await prisma.consultationsessions.findMany({
        where: {
          // student_id: {
          //   in: studentIds,
          // },
          ...wherecounselorId,
        },
        select: {
          id: true,
          session_date: true,
          duration_minutes: true,
          notes: true,
          session_type: true,
          session_status: true,
          users: {
            select: {
              full_name: true,
              email: true,
            },
          },
          students: {
            select: {
              student_name: true,
              email: true,
              phone_number: true,
            },
          },
        },
        orderBy: {
          session_date: 'desc',
        },
        skip: offset, // Áp dụng offset từ Paginator
        // take: validLimit, // Áp dụng limit từ Paginator
      });

      // Bước 3: Ánh xạ dữ liệu sang định dạng ConsultationHistory
      const consultationHistory: ConsultationHistory[] =
        consultationSessions.map((session) => ({
          consultation_session_id: session.id,
          session_date: this.formatDateTime(session.session_date) || '',
          duration_minutes: session.duration_minutes,
          session_type:
            this.mapConsultationSessionType(session.session_type) || '',
          session_status:
            this.mapConsultationSessionStatus(session.session_status) || '',
          session_notes: session.notes ?? '',
          counselor_name: session.users.full_name ?? '',
          counseler_email: session.users.email ?? '',
          student_name: session.students.student_name ?? '',
          student_email: session.students.email ?? '',
          student_phone_number: session.students.phone_number ?? '',
        }));

      // Lấy metadata từ Paginator
      const metadata = paginator.getMetadata(totalConsultationHistoryCount);
      console.log('Generated metadata for consultation history:', metadata);

      return {
        consultationHistory: consultationHistory,
        metadata,
      };
    } catch (error: any) {
      console.error(
        `CRITICAL ERROR in ConsultingInformationService.getConsultationHistoryForCounselorAssignedStudents (for counselor ID: ${counselorId}):`,
        error.message || error
      );
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async searchConsultingInformationByName(
    name: string,
    page: number = 1,
    limit: number = 10,
    counselorId?: number | null // counselorId là tùy chọn, có thể là null
  ): Promise<{
    consultingInformation: StudentApiResponse[];
    metadata: any;
  }> {
    try {
      // Validate và sanitize input
      const searchName = name?.trim();
      // Không cần return sớm nếu searchName trống nếu counselorId có thể được dùng một mình
      // Nếu bạn muốn chỉ tìm kiếm khi CÓ tên HOẶC CÓ ID, thì logic này OK.
      // Nếu muốn tìm kiếm tất cả nếu searchName và counselorId đều trống, bạn cần thay đổi.
      if (!searchName && !counselorId) {
        return {
          consultingInformation: [],
          metadata: new Paginator(1, limit).getMetadata(0),
        };
      }

      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.max(1, Math.floor(limit));
      const paginator = new Paginator(validPage, validLimit);
      const offset = paginator.offset;

      // Xây dựng điều kiện WHERE động
      const whereClause: any = {};

      if (searchName) {
        whereClause.student_name = {
          contains: searchName,
        };
      }

      if (!counselorId) {
        return {
          consultingInformation: [],
          metadata: new Paginator(1, limit).getMetadata(0),
        };
      }

      const userType = await prisma.users.findUnique({
        where: {
          id: counselorId,
        },
        select: {
          user_type: true,
        },
      });

      if (
        counselorId !== undefined &&
        counselorId !== null &&
        userType?.user_type === 'counselor'
      ) {
        whereClause.assigned_counselor_id = counselorId;
        console.log(
          `Service: Filtering by assigned_counselor_id: ${counselorId}`
        );
      } else {
        console.log(
          `Service: Not filtering by assigned_counselor_id (counselorId is ${counselorId}).`
        );
      }

      // Debugging: Log điều kiện tìm kiếm
      console.log(`Searching with conditions:`, whereClause);

      // Đếm tổng số bản ghi phù hợp với điều kiện tìm kiếm
      const totalCountResult = await prisma.students.findMany({
        where: whereClause,
        select: {
          id: true, // Chỉ cần select một trường bất kỳ để kích hoạt count
        },
        // Không cần skip/take ở đây vì chúng ta chỉ đếm
      });
      const totalCount = totalCountResult.length;

      // Tìm kiếm sinh viên với điều kiện tên và/hoặc counselorId
      const studentsWithDetails = await prisma.students.findMany({
        where: whereClause, // Sử dụng whereClause động
        skip: offset,
        take: validLimit,
        select: {
          id: true,
          student_name: true,
          email: true,
          phone_number: true,
          gender: true,
          zalo_phone: true,
          link_facebook: true,
          date_of_birth: true,
          current_education_level: true,
          other_education_level_description: true,
          high_school_name: true,
          city: true,
          source: true,
          other_source_description: true,
          notification_consent: true,
          other_notification_consent_description: true,
          current_status: true,
          status_change_date: true,
          registration_date: true,
          created_at: true,
          updated_at: true,
          assigned_counselor_id: true, // Đảm bảo trường này được select để map user
          users: {
            select: {
              full_name: true,
              user_type: true,
            },
          },
          student_interested_courses: {
            select: {
              courses: {
                select: {
                  name: true,
                  description: true,
                  coursecategories: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          studentenrollments: {
            select: {
              enrollment_date: true,
              fee_paid: true,
              courses: {
                select: {
                  name: true,
                  coursecategories: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          studentstatushistory: {
            select: {
              old_status: true,
              new_status: true,
              change_date: true,
              notes: true,
              users: {
                select: {
                  full_name: true,
                },
              },
            },
            orderBy: {
              change_date: 'asc',
            },
          },
          consultationsessions: {
            select: {
              session_date: true,
              duration_minutes: true,
              notes: true,
              session_type: true,
              session_status: true,
              users: {
                select: {
                  full_name: true,
                },
              },
            },
            orderBy: {
              session_date: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          student_name: 'asc', // Sắp xếp theo tên để dễ đọc kết quả
        },
      });

      // Format dữ liệu trả về (giống hệt hàm getAllConsultingInformation)
      const formattedConsultingInformation: StudentApiResponse[] =
        studentsWithDetails.map((student) => {
          const assignedCounselorName = student.users?.full_name || 'N/A';
          const assignedCounselorType = student.users
            ? this.mapUserType(student.users.user_type)
            : 'N/A';

          const interestedCoursesDetails =
            student.student_interested_courses.length > 0
              ? student.student_interested_courses
                  .map(
                    (sic) =>
                      `${sic.courses.coursecategories.name} - ${
                        sic.courses.name
                      } (Mô tả: ${sic.courses.description || 'N/A'})`
                  )
                  .join(';\n')
              : null;

          const enrolledCoursesDetails =
            student.studentenrollments.length > 0
              ? student.studentenrollments
                  .map(
                    (se) =>
                      `${se.courses.coursecategories.name} - ${
                        se.courses.name
                      } (Ngày đăng ký: ${this.formatDate(
                        se.enrollment_date
                      )}, Phí đã trả: ${se.fee_paid.toFixed(2)})`
                  )
                  .join(';\n')
              : null;

          const studentStatusHistory =
            student.studentstatushistory.length > 0
              ? student.studentstatushistory
                  .map((ssh) => {
                    const oldStatusMapped = this.mapOldStatusHistory(
                      ssh.old_status
                    );
                    const newStatusMapped = this.mapNewStatusHistory(
                      ssh.new_status
                    );
                    const notesPart = ssh.notes
                      ? `, Ghi chú: ${ssh.notes}`
                      : '';
                    return `Từ: ${oldStatusMapped} Đến: ${newStatusMapped} (Ngày: ${this.formatDateTime(
                      ssh.change_date
                    )}, Bởi: ${ssh.users.full_name}${notesPart})`;
                  })
                  .join(';\n')
              : '';

          const latestConsultation = student.consultationsessions[0] || null;

          return {
            student_id: student.id,
            student_name: student.student_name,
            email: student.email || '',
            phone_number: student.phone_number,
            gender: student.gender,
            zalo_phone: student.zalo_phone || '',
            link_facebook: student.link_facebook || '',
            date_of_birth: this.formatDate(student.date_of_birth) || '',
            current_education_level: this.mapEducationLevel(
              student.current_education_level
            ),
            other_education_level_description:
              student.other_education_level_description,
            high_school_name: student.high_school_name || '',
            city: student.city || '',
            source: this.mapSource(student.source),
            other_source_description: student.other_source_description,
            notification_consent: this.mapNotificationConsent(
              student.notification_consent
            ),
            other_notification_consent_description:
              student.other_notification_consent_description,
            current_status: this.mapStudentStatus(student.current_status),
            status_change_date:
              this.formatDateTime(student.status_change_date) || '',
            registration_date: this.formatDate(student.registration_date),
            student_created_at: this.formatDateTime(student.created_at) || '',
            student_updated_at: this.formatDateTime(student.updated_at) || '',
            assigned_counselor_name: assignedCounselorName,
            assigned_counselor_type: assignedCounselorType,
            interested_courses_details: interestedCoursesDetails,
            enrolled_courses_details: enrolledCoursesDetails,
            student_status_history: studentStatusHistory,
            last_consultation_date: latestConsultation
              ? this.formatDateTime(latestConsultation.session_date)
              : null,
            last_consultation_duration_minutes:
              latestConsultation?.duration_minutes || null,
            last_consultation_notes: latestConsultation?.notes || null,
            last_consultation_type: latestConsultation
              ? this.mapConsultationSessionType(latestConsultation.session_type)
              : null,
            last_consultation_status: latestConsultation
              ? this.mapConsultationSessionStatus(
                  latestConsultation.session_status
                )
              : null,
            last_consultation_counselor_name:
              latestConsultation?.users.full_name || null,
          };
        });

      const metadata = paginator.getMetadata(totalCount);
      console.log(`Search metadata for "${searchName}":`, metadata);

      // Đảm bảo định dạng JSend đầy đủ với "status" và "data"
      // Đây là nơi bạn cần điều chỉnh để khớp với schema frontend mong đợi
      // Nếu service này là phần của backend API, nó nên trả về JSend.
      // Nếu nó là một service layer trong frontend, bạn có thể trả về trực tiếp dữ liệu.
      // Dựa trên ZodError bạn đã thấy, hàm này cần trả về JSend format.

      return {
        status: 'success', // Thêm trường status
        data: {
          consultingInformation: formattedConsultingInformation,
          metadata,
        },
      } as any; // Tạm thời dùng any để bỏ qua lỗi type nếu chưa có JSend wrapper type
      // Hoặc nếu bạn đã có ConsultingApiResponse, thì:
      // return { status: "success", data: { consultingInformation: formattedConsultingInformation, metadata } } as ConsultingApiResponse;
    } catch (error: any) {
      console.error(
        `CRITICAL ERROR in searchConsultingInformationByName for "${name}" (counselorId: ${counselorId}):`,
        error.message || error
      );
      console.error('Error stack:', error.stack);
      throw error; // Quan trọng là throw lỗi để hook React Query bắt được
    }
  }

  async updateConsultingInformation(
    studentId: number,
    updateData: Partial<StudentUpdateApiDto>,
    updatedByUserId: number // ID của user thực hiện cập nhật
  ): Promise<StudentUpdateApiDto | null> {
    try {
      const existingStudent = await prisma.students.findUnique({
        where: { id: studentId },
        include: {
          student_interested_courses: {
            include: { courses: true },
          },
          consultationsessions: {
            orderBy: { session_date: 'desc' },
            take: 1, // Still take 1 to get the latest existing for comparison if needed, but not for direct update.
            include: {
              users: true,
            },
          },
          studentenrollments: {
            include: { courses: true },
          },
          studentstatushistory: {
            orderBy: { change_date: 'desc' },
            take: 5,
          },
        },
      });

      if (!existingStudent) {
        console.error(`Student with ID ${studentId} not found.`);
        return null;
      }

      // Tạo đối tượng để lưu trữ chỉ các trường cần cập nhật cho bảng students
      const dataToUpdate: { [key: string]: any } = {};
      let hasStudentChanges = false;

      if (
        updateData.student_name !== undefined &&
        existingStudent.student_name !== updateData.student_name
      ) {
        dataToUpdate.student_name = updateData.student_name;
        hasStudentChanges = true;
      }
      if (
        updateData.email !== undefined &&
        existingStudent.email !== updateData.email
      ) {
        dataToUpdate.email = updateData.email;
        hasStudentChanges = true;
      }
      if (
        updateData.phone_number !== undefined &&
        existingStudent.phone_number !== updateData.phone_number
      ) {
        dataToUpdate.phone_number = updateData.phone_number;
        hasStudentChanges = true;
      }
      if (
        updateData.zalo_phone !== undefined &&
        existingStudent.zalo_phone !== updateData.zalo_phone
      ) {
        dataToUpdate.zalo_phone = updateData.zalo_phone;
        hasStudentChanges = true;
      }
      if (
        updateData.link_facebook !== undefined &&
        existingStudent.link_facebook !== updateData.link_facebook
      ) {
        dataToUpdate.link_facebook = updateData.link_facebook;
        hasStudentChanges = true;
      }
      if (updateData.current_education_level === 'Sinh viên') {
        updateData.current_education_level = 'SinhVien';
      } else if (updateData.current_education_level === 'Khác') {
        updateData.current_education_level = 'Other';
      }
      if (
        updateData.current_education_level !== undefined &&
        existingStudent.current_education_level !==
          updateData.current_education_level
      ) {
        dataToUpdate.current_education_level =
          updateData.current_education_level;
        hasStudentChanges = true;
      }
      if (
        updateData.other_education_level_description !== undefined &&
        existingStudent.other_education_level_description !==
          updateData.other_education_level_description
      ) {
        dataToUpdate.other_education_level_description =
          updateData.other_education_level_description;
        hasStudentChanges = true;
      }
      if (
        updateData.high_school_name !== undefined &&
        existingStudent.high_school_name !== updateData.high_school_name
      ) {
        dataToUpdate.high_school_name = updateData.high_school_name;
        hasStudentChanges = true;
      }
      if (
        updateData.city !== undefined &&
        existingStudent.city !== updateData.city
      ) {
        dataToUpdate.city = updateData.city;
        hasStudentChanges = true;
      }
      if (
        updateData.source !== undefined &&
        existingStudent.source !== updateData.source
      ) {
        dataToUpdate.source = updateData.source;
        hasStudentChanges = true;
      }
      if (
        updateData.other_source_description !== undefined &&
        existingStudent.other_source_description !==
          updateData.other_source_description
      ) {
        dataToUpdate.other_source_description =
          updateData.other_source_description;
        hasStudentChanges = true;
      }
      if (
        updateData.notification_consent !== undefined &&
        existingStudent.notification_consent !== updateData.notification_consent
      ) {
        dataToUpdate.notification_consent = updateData.notification_consent;
        hasStudentChanges = true;
      }
      if (
        updateData.other_notification_consent_description !== undefined &&
        existingStudent.other_notification_consent_description !==
          updateData.other_notification_consent_description
      ) {
        dataToUpdate.other_notification_consent_description =
          updateData.other_notification_consent_description;
        hasStudentChanges = true;
      }
      if (
        updateData.gender !== undefined &&
        existingStudent.gender !== updateData.gender
      ) {
        dataToUpdate.gender = updateData.gender;
        hasStudentChanges = true;
      }

      if (updateData.date_of_birth !== undefined) {
        const newDate = updateData.date_of_birth
          ? new Date(updateData.date_of_birth)
          : null;
        if (!this.areDatesEqual(existingStudent.date_of_birth, newDate)) {
          dataToUpdate.date_of_birth = newDate;
          hasStudentChanges = true;
        }
      }

      if (updateData.registration_date !== undefined) {
        const newRegistrationDate = updateData.registration_date
          ? this.parseRegistrationDate(updateData.registration_date)
          : null;
        if (
          !this.areDatesEqual(
            existingStudent.registration_date,
            newRegistrationDate
          )
        ) {
          dataToUpdate.registration_date = newRegistrationDate;
          hasStudentChanges = true;
        }
      }

      let counselorChanged = false;
      // if (
      //   updateData.assigned_counselor_id !== undefined &&
      //   existingStudent.assigned_counselor_id !==
      //     updateData.assigned_counselor_id
      // ) {
      //   dataToUpdate.assigned_counselor_id = updateData.assigned_counselor_id;
      //   hasStudentChanges = true;
      //   counselorChanged = true;
      // }

      let statusChanged = false;
      let oldStatus = existingStudent.current_status;
      if (
        updateData.current_status !== undefined &&
        existingStudent.current_status !== updateData.current_status
      ) {
        dataToUpdate.current_status = updateData.current_status;
        dataToUpdate.status_change_date = new Date();
        hasStudentChanges = true;
        statusChanged = true;
      }

      let needUpdateConsultation = false;
      const consultationFields = [
        'last_consultation_date',
        'last_consultation_duration_minutes',
        'last_consultation_notes',
        'last_consultation_type',
        'last_consultation_status',
        'last_consultation_counselor_name',
      ];

      consultationFields.forEach((field) => {
        if (updateData[field as keyof StudentUpdateApiDto] !== undefined) {
          needUpdateConsultation = true;
        }
      });

      // Kiểm tra xem có cần cập nhật interested courses không
      let needUpdateInterestedCourses = false;
      if (updateData.interested_courses_details !== undefined) {
        needUpdateInterestedCourses = true;
        console.log(
          `Interested courses details provided: ${updateData.interested_courses_details}`
        );
      }

      // Kiểm tra xem có cần cập nhật enrolled courses không
      let needUpdateEnrolledCourses = false;
      if (updateData.enrolled_courses_details !== undefined) {
        needUpdateEnrolledCourses = true;
      }

      // Nếu không có thay đổi gì
      if (
        !hasStudentChanges &&
        !needUpdateConsultation && // Still check, even if it always creates a new one
        !needUpdateInterestedCourses &&
        !needUpdateEnrolledCourses
      ) {
        console.log(
          `No changes detected for student ID ${studentId}. No update performed.`
        );
        return this.mapToStudentUpdateApiDto(existingStudent);
      }

      // Sử dụng transaction để đảm bảo tính nhất quán
      const result = await prisma.$transaction(async (prisma) => {
        let updatedStudent = existingStudent; // Initialize with existing student

        // 1. Cập nhật bảng students nếu có thay đổi
        if (statusChanged && updateData.current_status) {
          await prisma.studentstatushistory.create({
            data: {
              student_id: studentId,
              old_status: oldStatus,
              new_status:
                updateData.current_status as studentstatushistory_new_status,
              change_date: new Date(),
              changed_by_user_id: updatedByUserId,
              notes: `Status changed from ${oldStatus} to ${updateData.current_status}`,
            },
          });
        }

        // ✅ 2. CẬP NHẬT STUDENT SAU
        if (hasStudentChanges) {
          updatedStudent = await prisma.students.update({
            where: { id: studentId },
            data: dataToUpdate,
            include: {
              student_interested_courses: {
                include: { courses: true },
              },
              consultationsessions: {
                orderBy: { session_date: 'desc' },
                take: 1, // Keep this to always fetch the latest after any changes
                include: {
                  users: true,
                },
              },
              studentenrollments: {
                include: { courses: true },
              },
              studentstatushistory: {
                orderBy: { change_date: 'desc' },
                take: 5, // ✅ Đảm bảo lấy status history mới nhất
              },
            },
          });
        }

        // 3. Xử lý consultation session: LUÔN TẠO MỚI nếu có dữ liệu cập nhật
        if (needUpdateConsultation) {
          let counselorIdForNewSession =
            updateData.assigned_counselor_id ||
            existingStudent.assigned_counselor_id ||
            updatedByUserId;

          // Nếu có counselor name mới, tìm counselor_id tương ứng
          if (updateData.last_consultation_counselor_name !== undefined) {
            const counselor = await prisma.users.findFirst({
              where: {
                full_name: {
                  contains: updateData.last_consultation_counselor_name
                    ? updateData.last_consultation_counselor_name
                        .split('(')[0]
                        .trim()
                    : '',
                },
              },
            });
            if (counselor) {
              counselorIdForNewSession = counselor.id;
            }
          }
          const Train = true;
          if (!Train) {
            await prisma.consultationsessions.create({
              data: {
                student_id: studentId,
                counselor_id: counselorIdForNewSession,
                session_date: updateData.last_consultation_date
                  ? new Date(updateData.last_consultation_date)
                  : new Date(),
                session_type: (updateData.last_consultation_type ||
                  'Phone_Call') as consultationsessions_session_type,
                session_status: (updateData.last_consultation_status ||
                  'Scheduled') as consultationsessions_session_status,
                notes: updateData.last_consultation_notes || '',
                duration_minutes:
                  updateData.last_consultation_duration_minutes || null,
              },
            });
          }

          // After creating a new consultation, the `updatedStudent` object
          // fetched earlier might not have this new session.
          // To ensure the final returned object reflects the *latest* state,
          // we re-fetch the student at the end of the transaction.
        }

        // 4. Xử lý student_interested_courses nếu có thông tin về khóa học quan tâm
        if (needUpdateInterestedCourses) {
          // ✅ Parse danh sách course IDs từ interested_courses_details (ASYNC)
          const interestedCourseIds = await this.parseInterestedCourses(
            updateData.interested_courses_details ?? null
          );

          console.log(
            'Parsing interested courses:',
            updateData.interested_courses_details
          );
          console.log('Parsed course IDs:', interestedCourseIds);

          if (interestedCourseIds && interestedCourseIds.length > 0) {
            // Lấy danh sách khóa học hiện tại
            const currentInterestedCourses =
              existingStudent.student_interested_courses.map(
                (sic) => sic.course_id
              );

            // Tìm courses cần thêm mới
            const coursesToAdd = interestedCourseIds.filter(
              (courseId) => !currentInterestedCourses.includes(courseId)
            );

            // Tìm courses cần xóa
            const coursesToRemove = currentInterestedCourses.filter(
              (courseId) => !interestedCourseIds.includes(courseId)
            );

            // Xóa các khóa học không còn quan tâm
            if (coursesToRemove.length > 0) {
              await prisma.student_interested_courses.deleteMany({
                where: {
                  student_id: studentId,
                  course_id: { in: coursesToRemove },
                },
              });
            }

            // Thêm các khóa học mới quan tâm
            if (coursesToAdd.length > 0) {
              const newInterestedCourses = coursesToAdd.map((courseId) => ({
                student_id: studentId,
                course_id: courseId,
                interest_date: new Date(),
                notes: 'Updated via consulting information update',
              }));

              await prisma.student_interested_courses.createMany({
                data: newInterestedCourses,
                skipDuplicates: true,
              });
            }
          } else if (updateData.interested_courses_details === '') {
            // Nếu gửi chuỗi rỗng, xóa tất cả interested courses
            await prisma.student_interested_courses.deleteMany({
              where: { student_id: studentId },
            });
          }
        }

        // 5. Xử lý enrolled courses
        if (needUpdateEnrolledCourses) {
          // ✅ Parse enrolled courses (ASYNC)
          const enrolledCourseIds = await this.parseEnrolledCourses(
            updateData.enrolled_courses_details ?? null
          );

          console.log(
            'Parsing enrolled courses:',
            updateData.enrolled_courses_details
          );
          console.log('Parsed enrolled course IDs:', enrolledCourseIds);

          if (enrolledCourseIds && enrolledCourseIds.length > 0) {
            // Lấy danh sách enrollment hiện tại
            const currentEnrollments = existingStudent.studentenrollments.map(
              (se) => se.course_id
            );

            // Tìm courses cần thêm mới
            const coursesToEnroll = enrolledCourseIds.filter(
              (courseId) => !currentEnrollments.includes(courseId)
            );

            // Tìm courses cần xóa enrollment
            const coursesToUnenroll = currentEnrollments.filter(
              (courseId) => !enrolledCourseIds.includes(courseId)
            );

            // Xóa các enrollment không còn cần
            if (coursesToUnenroll.length > 0) {
              await prisma.studentenrollments.deleteMany({
                where: {
                  student_id: studentId,
                  course_id: { in: coursesToUnenroll },
                },
              });
            }

            // Thêm các enrollment mới
            if (coursesToEnroll.length > 0) {
              const newEnrollments = coursesToEnroll.map((courseId) => ({
                student_id: studentId,
                course_id: courseId,
                enrollment_date: new Date(),
                fee_paid: 0,
                payment_status: 'Pending' as any,
                counselor_id:
                  updateData.assigned_counselor_id ||
                  existingStudent.assigned_counselor_id ||
                  updatedByUserId,
                notes: 'Enrolled via consulting information update',
              }));

              await prisma.studentenrollments.createMany({
                data: newEnrollments,
                skipDuplicates: true,
              });
            }
          } else if (updateData.enrolled_courses_details === '') {
            // Nếu gửi chuỗi rỗng, xóa tất cả enrollments
            await prisma.studentenrollments.deleteMany({
              where: { student_id: studentId },
            });
          }
        }

        const res = true;
        if (!res) {
          if (
            counselorChanged &&
            updateData.assigned_counselor_id &&
            !needUpdateConsultation // Only create if consultation wasn't already handled by updateData
          ) {
            await prisma.consultationsessions.create({
              data: {
                counselor_id: updateData.assigned_counselor_id,
                student_id: studentId,
                session_date: new Date(),
                session_type: 'Phone_Call',
                session_status: 'Scheduled',
                notes: `Counselor assignment changed. New consultation scheduled.`,
                duration_minutes: null,
              },
            });
          }
        }
        // 6. Tạo consultation session mới nếu counselor thay đổi (và chưa có consultation update từ updateData)

        // 7. Auto-enrollment nếu trạng thái chuyển thành 'Registered'
        if (
          statusChanged &&
          updateData.current_status === 'Registered' &&
          !needUpdateEnrolledCourses // Only auto-enroll if enrollment wasn't already handled by updateData
        ) {
          const existingEnrollment = await prisma.studentenrollments.findFirst({
            where: { student_id: studentId },
          });

          if (!existingEnrollment) {
            // Auto-enroll vào các khóa học đang quan tâm
            const interestedCourses =
              existingStudent.student_interested_courses;
            if (interestedCourses.length > 0) {
              // const enrollments = interestedCourses.map((sic) => ({
              //   student_id: studentId,
              //   course_id: sic.course_id,
              //   enrollment_date: new Date(),
              //   fee_paid: 0,
              //   payment_status: 'Pending' as any,
              //   counselor_id:
              //     updateData.assigned_counselor_id ||
              //     existingStudent.assigned_counselor_id ||
              //     updatedByUserId,
              //   notes: 'Auto-enrolled when status changed to Registered',
              // }));
              // await prisma.studentenrollments.createMany({
              //   data: enrollments,
              //   skipDuplicates: true,
              // });
            }
          }
        }

        // Lấy lại student data với tất cả quan hệ đã cập nhật
        const finalStudent = await prisma.students.findUnique({
          where: { id: studentId },
          include: {
            student_interested_courses: {
              include: { courses: true },
            },
            consultationsessions: {
              orderBy: { session_date: 'desc' },
              take: 1, // Still taking 1 to get the latest (which might be the newly created one)
              include: {
                users: true,
              },
            },
            studentenrollments: {
              include: { courses: true },
            },
            studentstatushistory: {
              orderBy: { change_date: 'desc' },
              take: 5,
            },
          },
        });

        return finalStudent || updatedStudent;
      });

      console.log(`Student with ID ${studentId} updated successfully.`);
      return this.mapToStudentUpdateApiDto(result);
    } catch (e) {
      console.error('Error in StudentService.updateConsultingInformation:', e);
      throw e;
    }
  }

  private async parseInterestedCourses(
    interestedCoursesDetails: string | null
  ): Promise<number[]> {
    if (!interestedCoursesDetails) return [];

    try {
      // Format: "Thiết kế Đồ họa Arena___Kỹ sư Phần mềm Aptech"
      const courseNames = interestedCoursesDetails
        .split('___')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      console.log('Parsed course names:', courseNames);

      if (courseNames.length === 0) return [];

      // Tìm course_id dựa trên tên khóa học
      const courses = await prisma.courses.findMany({
        where: {
          name: {
            in: courseNames,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      console.log('Found courses from DB:', courses);

      const courseIds = courses.map((course) => course.id);

      // Log những course name không tìm thấy
      const foundCourseNames = courses.map((course) => course.name);
      const notFoundCourses = courseNames.filter(
        (name) => !foundCourseNames.includes(name)
      );
      if (notFoundCourses.length > 0) {
        console.warn('Course names not found in database:', notFoundCourses);
      }

      return courseIds;
    } catch (error) {
      console.error('Error parsing interested courses:', error);
      return [];
    }
  }

  private async parseEnrolledCourses(
    enrolledCoursesDetails: string | null
  ): Promise<number[]> {
    if (!enrolledCoursesDetails) return [];

    try {
      // Tương tự như parseInterestedCourses
      const courseNames = enrolledCoursesDetails
        .split('___')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      console.log('Parsed enrolled course names:', courseNames);

      if (courseNames.length === 0) return [];

      // Tìm course_id dựa trên tên khóa học
      const courses = await prisma.courses.findMany({
        where: {
          name: {
            in: courseNames,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      console.log('Found enrolled courses from DB:', courses);

      const courseIds = courses.map((course) => course.id);

      // Log những course name không tìm thấy
      const foundCourseNames = courses.map((course) => course.name);
      const notFoundCourses = courseNames.filter(
        (name) => !foundCourseNames.includes(name)
      );
      if (notFoundCourses.length > 0) {
        console.warn(
          'Enrolled course names not found in database:',
          notFoundCourses
        );
      }

      return courseIds;
    } catch (error) {
      console.error('Error parsing enrolled courses:', error);
      return [];
    }
  }

  private mapToStudentUpdateApiDto(student: students): StudentUpdateApiDto {
    return {
      student_name: student.student_name,
      email: student.email || '', // Đảm bảo các trường string? được map thành string
      phone_number: student.phone_number,
      gender: student.gender,
      zalo_phone: student.zalo_phone || '',
      link_facebook: student.link_facebook || '',
      date_of_birth: student.date_of_birth
        ? student.date_of_birth.toISOString().split('T')[0]
        : '',
      current_education_level: student.current_education_level,
      other_education_level_description:
        student.other_education_level_description || '',
      high_school_name: student.high_school_name || '',
      city: student.city || '',
      source: student.source || '',
      notification_consent: student.notification_consent,
      other_source_description: student.other_source_description || '',
      other_notification_consent_description:
        student.other_notification_consent_description || '',
      current_status: student.current_status,
      status_change_date: student.status_change_date
        ? student.status_change_date.toISOString()
        : '',
      registration_date: student.registration_date
        ? student.registration_date.toISOString()
        : '',
    };
  }
}

export default new ConsultingInformationManagementService();
