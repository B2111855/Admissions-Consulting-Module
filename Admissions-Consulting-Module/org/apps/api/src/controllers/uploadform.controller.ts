import { JsonController, Post, Get, Body } from 'routing-controllers';
import jsend from '../jsend';
import { SendEmail } from '../services/Auto-send-email';
import {
  // getAllStudentsOnly,
  getCountIdStudent,
  AddStudent,
  IDisEmailExists,
  getDataCourse,
  getInfoCourse,
  addStudentInterestedCourse,
  isStudentInterestedCourseExists,
  getUser,
} from '../services/data.service';

interface FormData {
  student_name: string;
  email: string;
  phone_number: string;
  zalo_phone?: string | null;
  link_facebook?: string | null;
  date_of_birth: string;
  gender?: string;
  current_education_level: string;
  other_education_level_description?: string | null;
  high_school_name?: string | null;
  city?: string | null;
  source?: string;
  other_source_description?: string | null;
  notification_consent?: string;
  other_notification_consent_description?: string | null;
  registration_date: string;
  interested_courses_details: string;
}

@JsonController('/uploadform')
export class UploadFormController {
  @Post('/submitform')
  async submitForm(@Body() formData: FormData) {
    try {
      //Kiem tra da co du lieu hoc sinh trong he thong chua
      let countId = await IDisEmailExists(formData.email);
      //Lay thong tin khoa hoc
      let courseInfo = await getInfoCourse(formData.interested_courses_details);
      // Lay user thich hop de tu van
      if (!courseInfo?.program_type) return null; // hoặc throw new Error("Missing program_type");
      let userId = await getUser(courseInfo.program_type);

      if (countId === null) {
        //Neu chua , them du lieu moi
        //Tao id moi
        const getMax = await getCountIdStudent();
        countId = (getMax ?? 0) + 1;

        //Xu ly current_education_level theo dung mau
        let current_education_level = formData.current_education_level;
        if (current_education_level === 'Học sinh THPT') {
          current_education_level = 'THPT';
        } else if (current_education_level === 'Sinh viên') {
          current_education_level = 'SinhVien';
        } else {
          current_education_level = 'Other';
        }

        // Xử lý notification_consent theo dung mau
        let notification_consent = '';
        if (formData.notification_consent === 'Đồng ý') {
          notification_consent = 'Agree';
        } else {
          notification_consent = 'Other';
        }

        // Xu lu source theo dung mau
        let fsource = formData.source;
        if (fsource === 'Khác') {
          fsource = 'Other';
        }
        // //Xu ly ngay dang ky theo dung mau
        // const parts = formData.registration_date.split(' ');
        // const [day, month, year] = parts[1].split('/').map(Number);
        // const currentDate = new Date(year, month - 1, day);
        // const curDate = new Date(currentDate);

        const inputData = {
          id: countId,
          student_name: formData.student_name,
          email: formData.email,
          phone_number: formData.phone_number,
          zalo_phone:
            !formData.zalo_phone || formData.zalo_phone.trim() === ''
              ? formData.phone_number
              : formData.zalo_phone,
          link_facebook:
            !formData.link_facebook || formData.link_facebook.trim() === ''
              ? null
              : formData.link_facebook,
          date_of_birth: formData.date_of_birth
            ? new Date(formData.date_of_birth)
            : null,
          gender: formData.gender?.trim() || null,
          current_education_level: current_education_level,
          other_education_level_description:
            formData.other_education_level_description?.trim() || null,
          high_school_name: formData.high_school_name,
          city:
            !formData.city || formData.city.trim() === ''
              ? null
              : formData.city,
          source: fsource ?? null,
          other_source_description: formData.other_source_description ?? null,
          notification_consent: notification_consent,
          other_notification_consent_description:
            formData.other_notification_consent_description ?? null,
          current_status: 'Lead',
          assigned_counselor_id: userId?.id ?? 1,
          status_change_date: new Date(),
          registration_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Them du lieu moi vao
        await AddStudent(inputData);
        await addStudentInterestedCourse({
          studentId: countId,
          courseId: courseInfo?.id!,
          interestDate: new Date(),
        });
      } else {
        //Kiem tra da tung dang ky khoa hoc do chua
        const Student_CourseExists = await isStudentInterestedCourseExists(
          countId,
          courseInfo?.id!
        );

        if (!Student_CourseExists) {
          await addStudentInterestedCourse({
            studentId: countId,
            courseId: courseInfo?.id!,
            interestDate: new Date(),
          });
        }
      }
      return jsend.success({
        message: 'Đăng ký thành công',
      });
    } catch (error) {
      console.error('❌ submitForm error:', error);
      return jsend.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  @Post('/sendemail')
  async sendEmail(
    @Body()
    body: {
      to?: string;
      subject?: string;
      text?: string;
      html?: string;
    }
  ) {
    const { to, subject, text, html } = body;
    if (!to || !subject || !text) {
      return jsend.error('Thiếu trường bắt buộc');
    }

    try {
      await SendEmail(to, subject, text, html);
      return jsend.success({ message: 'Email đã được gửi' });
    } catch (error) {
      console.error('Error in SendEmailController:', error);
      return jsend.error('Lỗi khi gửi email');
    }
  }

  @Get('/DataCourse')
  async getStaticData() {
    const coursecategoriesRaw = await getDataCourse();

    // Định dạng lại coursecategories
    const coursecategories = coursecategoriesRaw.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      courses: category.courses.map((course) => ({
        id: course.id,
        name: course.name,
        program_type: course.program_type,
        duration: course.duration_text,
        description: course.description,
      })),
    }));

    return jsend.success({
      coursecategories,
    });
  }
}

// function removeVietnameseTones(str: string): string {
//   return str
//     .normalize('NFD')
//     .replace(/\p{Diacritic}/gu, '')
//     .replace(/đ/g, 'd')
//     .replace(/Đ/g, 'D')
//     .replace(/\s+/g, ' ')
//     .toLowerCase()
//     .trim();
// }
