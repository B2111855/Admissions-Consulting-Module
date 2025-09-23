// import { PrismaClient } from '@prisma/client';
// import axios from 'axios';

// const prisma = new PrismaClient();

// async function buildCourseContext(): Promise<string> {
//   const courses = await prisma.courses.findMany({
//     where: { is_active: true },
//     include: { coursecategories: true },
//   });

//   if (!courses.length) {
//     return 'Hiện tại không có khóa học nào đang được mở.';
//   }

//   // Lấy danh sách các ngành duy nhất có khóa học đang mở
//   const categories = Array.from(
//     new Set(courses.map((c) => c.coursecategories.name))
//   );

//   let context = `Thông tin các ngành đang đào tạo: ${categories.join(
//     ', '
//   )}.\n\n`;
//   context += 'Chi tiết thông tin các khóa học đang mở tại trung tâm:\n';

//   for (const course of courses) {
//     const {
//       name,
//       description,
//       duration_text,
//       price,
//       program_type,
//       coursecategories,
//     } = course;

//     const formattedPrice =
//       typeof price === 'number'
//         ? new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
//         : 'Liên hệ';

//     context += `- ${name} (${coursecategories.name})\n`;
//     context += ` Loại chương trình: ${program_type}\n`;
//     context += ` Thời lượng: ${duration_text || 'Không rõ'}\n`;
//     context += ` Học phí: ${formattedPrice}\n`;
//     context += ` Mô tả: ${description || 'Không có mô tả.'}\n\n`;
//   }

//   return context;
// }

// export async function answerQuestion(question: string): Promise<string> {
//   const context = await buildCourseContext();
//   const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

//   const Info = `Địa chỉ trung tâm : Khu III, Đại học Cần Thơ – 01 Lý Tự Trọng, TP.Cần Thơ.

//     Thong tin lien he:
//     - dien thoai: +84 292 383 5581
//     – Email: cusc@ctu.edu.10.
//      - Fax : +84 292 373 1071
//      - Hotline: 0901990665 0911204994.

//      Quá trình đăng ký online từng bước:
//      B1: Truy cập website của trung tâm tư vấn tuyển sinh
//      B2: Lựa chọn khóa học muốn đăng ký
//      B3: Điền thông tin cần thiết theo mẫu có sẵn
//      B4: Đợi liên hệ từ tư vấn viên để được tư vấn và giải đáp thắc mắc
//      B5: Xác nhận đăng ký khóa học và hoàn tất thanh toán
//      B6: Điền đầy đủ thông tin vào giấy đăng ký của trung tâm
//      B7: Đợi thông báo thời gian nhập học và thông tin cần thiết từ trung tâm

//      Ngoài ra có thể đến trực tiếp trung tâm để đăng ký và được tư vấn

//      Trong quá trình nếu có vấn đề có thể trực tiếp liên hệ trung tâm qua thông tin liên lạc hoặc nhóm zalo do trung tâm cung cấp thông qua email trả lời tự động

//      Thời gian làm việc của trung tâm là : thứ 2 đến thứ 6, khung giờ từ 7h đến 11h, 13h đến 17h

//      CUSC là trung tâm đào tạo CNTT chất lượng cao & tư vấn tuyển sinh

//      Mở đầu là : Đây là trợ lý tư vấn tuyển sinh của CUSC. Sẽ giải đáp một số thắc mắc cho bạn
//   `;

//   const fullPrompt = `
// Bạn là trợ lý tuyển sinh tại Trung tâm công nghệ phần mềm đại học Cần Thơ-CUSC. Dưới đây là các thông tin cần thiết:
// ${context}
// ${Info}
// Hãy trả lời ngắn gọn, dễ hiểu và tự nhiên cho câu hỏi sau:

// "${question}"
// `;

//   try {
//     const res = await axios.post(
//       'https://api.together.xyz/v1/chat/completions',
//       {
//         model: 'mistralai/Mistral-7B-Instruct-v0.2',
//         messages: [
//           {
//             role: 'system',
//             content: 'Bạn là trợ lý tuyển sinh của Trung tâm CUSC.',
//           },
//           { role: 'user', content: fullPrompt },
//         ],
//         temperature: 0.7,
//         max_tokens: 300,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${TOGETHER_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const result = res.data;
//     return (
//       result.choices?.[0]?.message?.content?.trim() ||
//       'Không thể tạo câu trả lời.'
//     );
//   } catch (err: any) {
//     console.error(
//       'Lỗi khi gọi Together.ai:',
//       err.response?.data || err.message
//     );
//     return 'Đã xảy ra lỗi khi tạo câu trả lời.';
//   }
// }

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function getCourses(): Promise<any[]> {
  return prisma.courses.findMany({
    where: { is_active: true },
    include: { coursecategories: true },
  });
}

async function getCourseCategories(): Promise<any[]> {
  return prisma.coursecategories.findMany({
    include: {
      courses: {
        where: { is_active: true }, // Lấy các khóa học đang hoạt động thuộc ngành
      },
    },
  });
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function buildCourseContext(
  question: string,
  allCourses: any[]
): Promise<string> {
  const normalizedQuestion = normalize(question);

  const formatCourse = (course: any): string => {
    const {
      name,
      description,
      duration_text,
      price,
      program_type,
      coursecategories,
    } = course;

    const formattedPrice =
      typeof price === 'number'
        ? new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
        : 'Liên hệ';

    return [
      `- Tên khóa học: ${name}`,
      `  Ngành: ${coursecategories?.name || 'Không rõ'}`,
      `  Loại chương trình: ${program_type || 'Không rõ'}`,
      `  Thời lượng: ${duration_text || 'Không rõ'}`,
      `  Học phí: ${formattedPrice}`,
      `  Mô tả: ${description || 'Không có mô tả.'}`,
    ].join('\n');
  };

  // Tìm khóa học được hỏi
  const matchedCourse = allCourses.find(
    (course) =>
      normalize(course.name).includes(normalizedQuestion) ||
      normalizedQuestion.includes(normalize(course.name))
  );

  if (matchedCourse) {
    return `Thông tin khóa học bạn hỏi:\n\n${formatCourse(matchedCourse)}`;
  }

  // Gom ngành
  const categories = Array.from(
    new Set(allCourses.map((c) => c.coursecategories?.name || 'Khác'))
  );

  // Tìm ngành được hỏi
  const matchedCategory = categories.find((category) =>
    normalizedQuestion.includes(normalize(category))
  );

  if (matchedCategory) {
    const matchedCourses = allCourses.filter(
      (c) =>
        normalize(c.coursecategories?.name || '') === normalize(matchedCategory)
    );

    if (matchedCourses.length === 0)
      return `Hiện chưa có khóa học cho ngành ${matchedCategory}.`;

    const formattedCourses = matchedCourses.map(formatCourse).join('\n\n');

    return `Các khóa học thuộc ngành ${matchedCategory}:\n\n${formattedCourses}`;
  }

  // Nếu không khớp gì cả
  return '';
}

export async function answerQuestion(question: string): Promise<string> {
  const allCourses = await getCourses();
  const allCategories = await getCourseCategories();
  const categoryNames = Array.from(
    new Set(allCategories.map((cat) => cat.name))
  );

  // Lấy danh sách tên khóa học (loại bỏ trùng)
  const courseNames = Array.from(
    new Set(allCourses.map((course) => course.name))
  );

  // Gộp thành chuỗi để đưa vào prompt
  const categoryList = `Các ngành đào tạo: ${categoryNames.join(', ')}.`;
  const courseList = `Các khóa học hiện có: ${courseNames.join(', ')}.`;

  const context = await buildCourseContext(question, allCourses);
  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

  const Address = 'Khu III, Đại học Cần Thơ – 01 Lý Tự Trọng, TP.Cần Thơ';

  const Contact = `
- Điện thoại: +84 292 383 5581
- Email: cusc@ctu.edu.10.
- Fax: +84 292 373 1071
- Hotline: 0901990665, 0911204994
`;

  const RegistrationSteps = `
B1: Truy cập website
B2: Chọn khóa học
B3: Điền thông tin
B4: Tư vấn viên liên hệ
B5: Xác nhận & thanh toán
B6: Hoàn thành giấy tờ
B7: Nhập học
`;

  const WorkingHours = `
Thứ 2–6, 7h–11h & 13h–17h
`;

  const CUSCIntro = `
CUSC là trung tâm đào tạo CNTT chất lượng cao & tư vấn tuyển sinh.
`;

  const Guidance = `
Đây là trợ lý tư vấn tuyển sinh của CUSC. Sẽ giải đáp một số thắc mắc cho bạn.
Ngoài ra, bạn có thể đến trực tiếp trung tâm để đăng ký và được tư vấn.
`;

  const SupportNote = `
Trong quá trình nếu có vấn đề, bạn có thể liên hệ trực tiếp trung tâm qua thông tin liên lạc
hoặc qua nhóm Zalo do trung tâm cung cấp thông qua email trả lời tự động.
`;

  //   const Info = `Địa chỉ trung tâm : Khu III, Đại học Cần Thơ – 01 Lý Tự Trọng, TP.Cần Thơ.

  // Thông tin liên hệ:
  // - Điện thoại: +84 292 383 5581
  // - Email: cusc@ctu.edu.10.
  // - Fax: +84 292 373 1071
  // - Hotline: 0901990665 0911204994

  // Quy trình đăng ký online:
  // B1: Truy cập website
  // B2: Chọn khóa học
  // B3: Điền thông tin
  // B4: Tư vấn viên liên hệ
  // B5: Xác nhận & thanh toán
  // B6: Hoàn thành giấy tờ
  // B7: Nhập học

  // Làm việc: Thứ 2–6, 7h–11h & 13h–17h`;

  const prompt = `
${Guidance}
${CUSCIntro}
Dưới đây là thông tin hỗ trợ:
Các khóa học đang có : ${courseList}
Các ngành đang có : ${categoryList}
${context}
Địa chỉ trung tâm: ${Address}
Thông tin liên hệ: ${Contact}
Quy trình đăng ký: ${RegistrationSteps}
Thời gian làm việc: ${WorkingHours}
${SupportNote}
Trả lời ngắn gọn, tự nhiên cho câu hỏi sau:
"${question}"
`;

  try {
    const res = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
          {
            role: 'system',
            content: 'Bạn là trợ lý tuyển sinh của Trung tâm CUSC.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = res.data;
    return (
      result.choices?.[0]?.message?.content?.trim() ||
      'Không thể tạo câu trả lời.'
    );
  } catch (err: any) {
    console.error(
      'Lỗi khi gọi Together.ai:',
      err.response?.data || err.message
    );
    return 'Đã xảy ra lỗi khi tạo câu trả lời.';
  }
}
