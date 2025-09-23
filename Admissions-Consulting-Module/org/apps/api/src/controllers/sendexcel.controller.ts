// src/controllers/ExportController.ts
import { JsonController, Get, Res, UseBefore, Req } from 'routing-controllers';
// import type { Response } from 'express';
import ExcelJS from 'exceljs';
import {
  getStudent,
  getEnrollments,
  getConsultationSessions,
} from '../services/data.service';
import { authenticateToken } from '../middlewares/auth.middleware';

@JsonController('/exportexcel')
export class ExportController {
  @Get('/studentData')
  @UseBefore(authenticateToken())
  async studentData(@Req() req: any, @Res() res: any) {
    const counselorId = req.user?.id; // ✅ Lấy từ token đã xác thực

    const buffer = await createStudentsExcelBuffer(counselorId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=DataExcel.xlsx');
    return res.send(buffer);
  }

  @Get('/enrollmentsData')
  @UseBefore(authenticateToken())
  async enrollmentsData(@Req() req: any, @Res() res: any) {
    const counselorId = req.user?.id; // ✅ Lấy từ token đã xác thực

    const buffer = await createEnrollmentsExcelBuffer(counselorId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=enrollmentsData.xlsx'
    );
    return res.send(buffer);
  }

  @Get('/consultationsessionsData')
  @UseBefore(authenticateToken())
  async usersData(@Req() req: any, @Res() res: any) {
    const counselorId = req.user?.id; // ✅ Lấy từ token đã xác thực

    const buffer = await createConsultationsessionsExcelBuffer(counselorId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=DataExcel.xlsx');
    res.send(buffer);
  }
}

export const createEnrollmentsExcelBuffer = async (counselorId: number) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Enrollments', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const enrollments = await getEnrollments(counselorId);

  // Thiết lập cột
  sheet.columns = [
    { header: 'STT', key: 'id', width: 10 },
    { header: 'ID học viên', key: 'student_id', width: 25 },
    { header: 'Tên học viên', key: 'students', width: 25 },
    { header: 'Khóa học', key: 'courses', width: 50 },
    { header: 'Ngày ghi danh', key: 'enrollment_date', width: 20 },
    { header: 'Số tiền đã trả', key: 'fee_paid', width: 15 },
    { header: 'Trạng thái thanh toán', key: 'payment_status', width: 20 },
    { header: 'Tư vấn viên thực hiện', key: 'counselor_id', width: 20 },
    {
      header: 'ID phiên tư vấn cuối cùng',
      key: 'consultation_session_id',
      width: 35,
    },
    { header: 'Ghi chú tư vấn cuối cùng', key: 'notes', width: 30 },
    { header: 'Ngày tạo', key: 'created_at', width: 20 },
    { header: 'Ngày cập nhật', key: 'updated_at', width: 20 },
  ];

  const paymentStatusMap: Record<string, string> = {
    Paid: 'Đã thanh toán',
    Pending: 'Chờ thanh toán',
    Partially_Paid: 'Thanh toán một phần',
    Refunded: 'Đã hoàn tiền',
  };

  // Format ngày kiểu dd/mm/yyyy
  const formatDate = (date?: Date) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '';

  // Đưa dữ liệu vào bảng
  enrollments.forEach((e, index) => {
    sheet.addRow({
      id: index + 1, // STT tự động
      student_id: e.student_id,
      students: e.students,
      courses: e.courses,
      enrollment_date: formatDate(e.enrollment_date),
      fee_paid: e.fee_paid,
      payment_status: paymentStatusMap[e.payment_status] || '',
      counselor_id: e.counselor_id,
      consultation_session_id: e.consultation_session_id,
      notes: e.notes,
      created_at: e.created_at?.toISOString().split('T')[0],
      updated_at: e.updated_at?.toISOString().split('T')[0],
    });
  });

  // 👉 Thêm dropdown "Trạng thái thanh toán"
  const paymentStatuses = [
    'Đã thanh toán',
    'Chờ thanh toán',
    'Thanh toán một phần',
    'Đã hoàn tiền',
  ];
  // const paymentStatuses = Object.values(paymentStatusMap); // ['Đã thanh toán', 'Chờ xử lý', 'Hoàn tiền']

  for (let i = 2; i <= enrollments.length + 1; i++) {
    sheet.getCell(`G${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${paymentStatuses.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Giá trị không hợp lệ',
      error: 'Vui lòng chọn từ danh sách có sẵn.',
    };
  }

  // Gọi hàm tùy chỉnh style nếu có
  styleSheet(sheet);

  // Trả về buffer để lưu/xuất file
  return await workbook.xlsx.writeBuffer();
};

// export const createUsersExcelBuffer = async () => {
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet('Users', {
//     views: [{ state: 'frozen', ySplit: 1 }],
//   });

//   const users = await getAllUser();

//   sheet.columns = [
//     { header: 'ID', key: 'id', width: 10 },
//     { header: 'Tên đầy đủ', key: 'full_name', width: 25 },
//     { header: 'Email', key: 'email', width: 25 },
//     { header: 'Loại người dùng', key: 'user_type', width: 20 },
//     { header: 'Ngày tạo', key: 'created_at', width: 20 },
//     { header: 'Ngày cập nhật', key: 'updated_at', width: 20 },
//   ];

//   users.forEach((u) => {
//     sheet.addRow({
//       ...u,
//       created_at: u.created_at?.toISOString().split('T')[0],
//       updated_at: u.updated_at?.toISOString().split('T')[0],
//     });
//   });

//   styleSheet(sheet);
//   return await workbook.xlsx.writeBuffer();
// };

export const createStudentsExcelBuffer = async (counselorId: number) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Students', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const students = await getStudent(counselorId);

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Tên học viên', key: 'student_name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Môn học quan tâm', key: 'student_interested_course', width: 30 },
    { header: 'SĐT', key: 'phone_number', width: 15 },
    { header: 'Zalo', key: 'zalo_phone', width: 15 },
    { header: 'Facebook', key: 'link_facebook', width: 25 },
    { header: 'Giới tính', key: 'gender', width: 10 },
    { header: 'Ngày sinh', key: 'date_of_birth', width: 15 },
    { header: 'Trình độ học vấn', key: 'current_education_level', width: 20 },
    {
      header: 'Mô tả học vấn khác',
      key: 'other_education_level_description',
      width: 25,
    },
    { header: 'Trường cấp 3', key: 'high_school_name', width: 25 },
    { header: 'Tỉnh/TP', key: 'city', width: 15 },
    { header: 'Nguồn', key: 'source', width: 25 },
    { header: 'Mô tả nguồn khác', key: 'other_source_description', width: 25 },
    { header: 'Đồng ý nhận tin', key: 'notification_consent', width: 25 },
    {
      header: 'Mô tả đồng ý nhận tin khác',
      key: 'other_notification_consent_description',
      width: 25,
    },
    { header: 'Trạng thái hiện tại', key: 'current_status', width: 20 },
    { header: 'Tư vấn viên', key: 'assigned_counselor_id', width: 20 },
    // { header: 'Ngày đổi trạng thái', key: 'status_change_date', width: 20 },
    { header: 'Ngày đăng ký', key: 'created_at', width: 20 },
    // { header: 'Ngày tạo', key: 'created_at', width: 20 },
    { header: 'Ngày cập nhật', key: 'updated_at', width: 20 },
    {
      header: 'Ngày tư vấn gần nhất',
      key: 'latest_consultation_date',
      width: 20,
    },
    {
      header: 'Thời lượng tư vấn',
      key: 'latest_consultation_duration',
      width: 20,
    },
    { header: 'Ghi chú tư vấn', key: 'latest_consultation_notes', width: 30 },
    { header: 'Loại tư vấn', key: 'latest_consultation_type', width: 20 },
    {
      header: 'Trạng thái phiên tư vấn',
      key: 'latest_consultation_status',
      width: 20,
    },
    {
      header: 'Tư vấn viên tư vấn gần nhất',
      key: 'latest_consultation_counselor',
      width: 25,
    },
  ];
  const STUDENT_CURRENT_STATUS_OPTIONS: Record<string, string> = {
    Lead: 'Tiềm năng',
    Engaging: 'Đang tư vấn',
    Registered: 'Đã đăng ký',
    Dropped_Out: 'Đã ngừng',
    Archived: 'Đã lưu trữ',
  };

  const EDUCATION_LEVEL_OPTIONS: Record<string, string> = {
    THPT: 'THPT',
    SinhVien: 'Sinh viên',
    Other: 'Khác',
  };

  // Các giá trị hợp lệ cho dropdown
  const educationLevels = ['THPT', 'Sinh viên', 'Khác'];
  const studentStatuses = [
    'Tiềm năng',
    'Đang tư vấn',
    'Đã đăng ký',
    'Đã ngừng',
    'Đã lưu trữ',
  ];

  // Áp dụng dropdown cho từng hàng (bắt đầu từ hàng 2)

  students.forEach((student, index) => {
    const educationLabel =
      EDUCATION_LEVEL_OPTIONS[student.current_education_level] ||
      student.current_education_level;

    const statusLabel =
      STUDENT_CURRENT_STATUS_OPTIONS[student.current_status] ||
      student.current_status;

    const courseNames = Array.isArray(student.student_interested_courses)
      ? student.student_interested_courses.join('\n')
      : '';

    const row = sheet.addRow({
      stt: index + 1, // STT tự động
      id: student.id,
      student_name: student.student_name,
      email: student.email,
      student_interested_course: courseNames,
      phone_number: student.phone_number,
      zalo_phone: student.zalo_phone,
      link_facebook: student.link_facebook,
      gender: student.gender,
      date_of_birth: student.date_of_birth?.toLocaleDateString('vi-VN'),
      current_education_level: educationLabel,
      other_education_level_description:
        student.other_education_level_description,
      high_school_name: student.high_school_name,
      city: student.city,
      source:
        student.source === 'Other' && student.other_source_description
          ? student.other_source_description
          : student.source,
      other_source_description: student.other_source_description,
      notification_consent:
        student.notification_consent === 'Other' &&
        student.other_notification_consent_description
          ? student.other_notification_consent_description
          : student.notification_consent,
      other_notification_consent_description:
        student.other_notification_consent_description,
      current_status: statusLabel,
      assigned_counselor_id: student.assigned_counselor_id,
      // status_change_date:
      //   student.status_change_date?.toLocaleDateString('vi-VN'),
      // registration_date: student.registration_date?.toLocaleDateString('vi-VN'),
      created_at: student.created_at?.toLocaleDateString('vi-VN'),
      updated_at: student.updated_at?.toLocaleDateString('vi-VN'),
      latest_consultation_date: student.latest_consultation_date
        ? new Date(student.latest_consultation_date).toLocaleDateString('vi-VN')
        : '',
      latest_consultation_duration: student.latest_consultation_duration,
      latest_consultation_notes: student.latest_consultation_notes,
      latest_consultation_type: student.latest_consultation_type,
      latest_consultation_status: student.latest_consultation_status,
      latest_consultation_counselor: student.latest_consultation_counselor,
    });

    row.getCell('student_interested_course').alignment = {
      wrapText: true,
      vertical: 'top',
    };
  });

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' };
    });
  });

  const maxRow = students.length + 1;
  for (let row = 2; row <= maxRow; row++) {
    sheet.getCell(`K${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${educationLevels.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Lỗi',
      error: 'Chỉ chọn trong danh sách trình độ học vấn.',
    };

    sheet.getCell(`S${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${studentStatuses.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Lỗi',
      error: 'Chỉ chọn trong danh sách trạng thái.',
    };
  }

  styleSheet(sheet); // Gọi hàm style nếu có

  return await workbook.xlsx.writeBuffer();
};

export const createConsultationsessionsExcelBuffer = async (
  counselorId: number
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Students', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const ConsultationSessions = await getConsultationSessions(counselorId);

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'ID phiên tư vấn', key: 'id', width: 20 },
    { header: 'ID học viên', key: 'id_student', width: 20 },
    { header: 'Tên học viên', key: 'student_name', width: 25 },
    { header: 'Tên tư vấn viên', key: 'counselorName', width: 25 },

    { header: 'Ngày tư vấn', key: 'session_date', width: 20 },
    { header: 'Thời lượng (phút)', key: 'duration', width: 25 },
    { header: 'Hình thức', key: 'session_type', width: 20 },
    { header: 'Trạng thái', key: 'session_status', width: 20 },
    { header: 'Ghi chú', key: 'notes', width: 50 },
  ];

  const Status: Record<string, string> = {
    Scheduled: 'Đã lên lịch',
    Completed: 'Hoàn thành',
    Canceled: 'Đã hủy',
    No_Show: 'Không tham dự',
  };

  const Type: Record<string, string> = {
    Phone_Call: 'Cuộc gọi điện thoại',
    Online_Meeting: 'Họp trực tuyến',
    In_Person: 'Trực tiếp',
    Email: 'Email',
    Chat: 'Trò chuyện',
  };

  const getSessionTypeLabel = [
    'Cuộc gọi điện thoại',
    'Họp trực tuyến',
    'Trực tiếp',
    'Email',
    'Trò chuyện',
  ];
  const getSessionStatusLabel = [
    'Đã lên lịch',
    'Hoàn thành',
    'Đã hủy',
    'Không tham dự',
  ];

  // // Các giá trị hợp lệ cho dropdown
  // const educationLevels = ['THPT', 'Sinh viên', 'Khác'];
  // const studentStatuses = [
  //   'Tiềm năng',
  //   'Đang tư vấn',
  //   'Đã đăng ký',
  //   'Đã ngừng',
  //   'Đã lưu trữ',
  // ];

  // Áp dụng dropdown cho từng hàng (bắt đầu từ hàng 2)

  ConsultationSessions.forEach((ConsultationSessions, index) => {
    const Status_op = Status[ConsultationSessions.sessionStatus];

    const typeSession = Type[ConsultationSessions.sessionType];

    // const courseNames = Array.isArray(student.student_interested_courses)
    //   ? student.student_interested_courses.join('\n')

    sheet.addRow({
      stt: index + 1, // STT tự động
      id: ConsultationSessions.sessionId,
      id_student: ConsultationSessions.id_student,
      student_name: ConsultationSessions.studentName,
      counselorName: ConsultationSessions.counselorName,
      session_date: ConsultationSessions.sessionDate
        ? new Date(ConsultationSessions.sessionDate).toLocaleDateString('vi-VN')
        : '',
      duration: ConsultationSessions.duration,
      session_type: typeSession,
      session_status: Status_op,
      notes: ConsultationSessions.notes,
    });
  });

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' };
    });
  });

  const maxRow = ConsultationSessions.length + 1;
  for (let row = 2; row <= maxRow; row++) {
    // Cột Học vấn: cột K (11) nếu thêm 2 cột ở cuối
    sheet.getCell(`H${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${getSessionTypeLabel.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Lỗi',
      error: 'Chỉ chọn trong danh sách trình độ học vấn.',
    };

    // Cột Trạng thái học viên: cột L (12)
    sheet.getCell(`I${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${getSessionStatusLabel.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Lỗi',
      error: 'Chỉ chọn trong danh sách trạng thái học viên.',
    };
  }

  styleSheet(sheet); // Gọi hàm style nếu có

  return await workbook.xlsx.writeBuffer();
};

function styleSheet(sheet: ExcelJS.Worksheet) {
  // Định dạng dòng tiêu đề (header row)
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDCE6F1' },
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Căn giữa mặc định cho tất cả các cột và wrap text
  sheet.columns?.forEach((column) => {
    column.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
  });

  // Căn giữa và chỉnh chiều cao cho tất cả các dòng
  sheet.eachRow((row, rowNumber) => {
    row.height = 22;
    row.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
    });
  });
}
