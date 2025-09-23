import {
  JsonController,
  Post,
  Body,
  UseBefore,
  Req,
} from 'routing-controllers';
import jsend from '../jsend';
import {
  addStudentInterestedCourse,
  getInfoCourse,
  updateAssignedCounselor,
  getUserIdByName,
  createStudentEnrollment,
  updateStudentEnrollment,
  addStudentStatusHistory,
  Addconsultationsessions,
  updateUserStatus,
  UpdateStatusStudent,
} from '../services/data.service';
import type { studentenrollments_payment_status } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

@JsonController('/updatedata')
export class DataUpdate {
  @Post('/InteresCourse')
  async submitForm(@Body() formData: any) {
    try {
      // Dùng hàm mới để lấy hoặc tạo sinh viên
      const { student_id, selectedCourses } = formData;

      if (Array.isArray(selectedCourses) && selectedCourses.length > 0) {
        for (const courseName of selectedCourses) {
          let courseInfo = await getInfoCourse(courseName);

          await addStudentInterestedCourse({
            studentId: student_id,
            courseId: courseInfo?.id!,
            interestDate: new Date(),
          });
        }
      }
      return jsend.success({
        message: 'Thành công',
      });
    } catch (error) {
      console.error('❌ submitForm error:', error);
      return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  @Post('/AssignCounselor')
  async assignCounselor(@Body() formData: any) {
    try {
      const {
        student_id,
        assignedCounselorName,
        current_status,
        last_consultation_counselor_name,
      } = formData;

      const assignedCounselorID = await getUserIdByName(assignedCounselorName);
      const lastassignedCounselorID = await getUserIdByName(
        last_consultation_counselor_name
      );

      if (!assignedCounselorID || !lastassignedCounselorID) {
        return jsend.error('Không tìm thấy tư vấn viên');
      }

      await updateAssignedCounselor(student_id, assignedCounselorID);
      await addStudentStatusHistory({
        student_id: student_id,
        old_status: current_status, // hoặc lấy từ DB
        new_status: current_status,
        changed_by_user_id: lastassignedCounselorID, // ID của tư vấn viên hoặc admin thay đổi
        notes: `Thay đổi tư vấn viên từ ${last_consultation_counselor_name} sang ${assignedCounselorName}`,
      });

      return jsend.success({
        message: 'Gán tư vấn viên thành công',
      });
    } catch (error) {
      console.error('❌ assignCounselor error:', error);
      return jsend.error('Gán tư vấn viên thất bại. Vui lòng thử lại.');
    }
  }

  @Post('/RegisterCourse')
  async RegisterCourse(@Body() formData: any) {
    try {
      const {
        student_id,
        selectedCoursesRegister,
        last_consultation_counselor_name,
        last_consultation_date,
        last_consultation_type,
        last_consultation_status,
        last_consultation_notes,
        last_consultation_duration_minutes,
      } = formData;

      const assignedCounselorID = await getUserIdByName(
        last_consultation_counselor_name
      );

      if (!assignedCounselorID) {
        return jsend.error('Không tìm thấy tư vấn viên');
      }

      const newSessionId = await Addconsultationsessions({
        studentId: student_id,
        counselorIdForNewSession: assignedCounselorID,
        updateData: {
          last_consultation_date: last_consultation_date,
          last_consultation_type: last_consultation_type,
          last_consultation_status: last_consultation_status,
          last_consultation_notes: last_consultation_notes,
          last_consultation_duration_minutes:
            last_consultation_duration_minutes,
        },
      });

      // const ConsultationSessions = await getconsultationsessionsID(
      //   student_id,
      //   assignedCounselorID
      // );
      // console.log(ConsultationSessions);

      if (
        Array.isArray(selectedCoursesRegister) &&
        selectedCoursesRegister.length > 0
      ) {
        for (const courseName of selectedCoursesRegister) {
          let courseInfo = await getInfoCourse(courseName);
          console.log(courseInfo);

          const add = await createStudentEnrollment({
            student_id: student_id,
            course_id: courseInfo?.id!,
            counselor_id: assignedCounselorID,
            consultation_session_id: newSessionId?.id,
            notes: last_consultation_notes || '',
          });
          if (!add) {
            return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
          }
        }
      }

      return jsend.success({
        message: 'Đăng ký thành công',
      });
    } catch (error) {
      console.error(' assignCounselor error:', error);
      return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  @Post('/Studentenrollments')
  async Studentenrollments(@Body() formData: any) {
    try {
      const { studentId, updates } = formData;

      if (!studentId) {
        return jsend.error('Thiếu dữ liệu đầu vào hợp lệ');
      }

      for (const item of updates) {
        const { amountPaid, paymentStatus, courseTitle } = item;

        if (!paymentStatus || !courseTitle || amountPaid == null) {
          console.warn('⚠️ Thiếu thông tin trong phần tử:', item);
          continue;
        }

        const IDcourse = await getInfoCourse(courseTitle);

        if (!IDcourse) {
          console.warn(`⚠️ Không tìm thấy khóa học: ${courseTitle}`);
          continue;
        }

        const result = await updateStudentEnrollment(
          studentId,
          IDcourse?.id!,
          parseFloat(amountPaid),
          paymentStatus as studentenrollments_payment_status
        );

        if (!result || result.count === 0) {
          console.warn(
            `⚠️ Không thể cập nhật enrollment cho student ${studentId}`
          );
        }
      }

      return jsend.success({
        message: 'Cập nhật thành công',
      });
    } catch (error) {
      console.error(' assignCounselor error:', error);
      return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  @Post('/Statususer')
  @UseBefore(authenticateToken())
  async Statususer(@Body() formData: any, @Req() req: any) {
    const counselorId = req.user?.id; // ✅ Lấy từ token đã xác thực

    try {
      const { id, status } = formData;

      if (counselorId === id) {
        return jsend.success({
          message: 'Tài khoản này hiện không thể thay đổi',
        });
      }

      if (!id || !status) {
        return jsend.error('Thiếu dữ liệu đầu vào hợp lệ');
      }

      updateUserStatus(id, status);

      return jsend.success({
        message: 'Cập nhật thành công',
      });
    } catch (error) {
      console.error(' assignCounselor error:', error);
      return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  @Post('/StatusStudent')
  async StatusStudent(@Body() formData: any) {
    try {
      const { student_id } = formData;

      UpdateStatusStudent(student_id);

      return jsend.success({
        message: 'Đăng ký thành công',
      });
    } catch (error) {
      console.error(' assignCounselor error:', error);
      return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }
}
