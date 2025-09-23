// import { Request, Response } from 'express';
// // import { PrismaClient } from '@prisma/client';

// // const prisma = new PrismaClient();

// /**
//  * Lấy danh sách các khóa học cùng với lớp học tương ứng.
//  */
// // export async function getCourseCategories() {
// //   const courses = await prisma.khoahoc.findMany({
// //     include: { khoahoc_lop: true },
// //   });

// //   const formattedCourses = await Promise.all(
// //     courses.map(async (course) => {
// //       const courseLevels = await Promise.all(
// //         course.khoahoc_lop.map(async (level) => {
// //           const classes = await prisma.lop.findMany({
// //             where: { ID_KhoaHoc_Lop: level.ID },
// //           });

// //           return {
// //             id: level.ID,
// //             name: level.Name || '',
// //             class: classes.map((cls) => ({ name: cls.Name || '' })),
// //           };
// //         })
// //       );

// //       return {
// //         title: course.Name || '',
// //         course: courseLevels,
// //       };
// //     })
// //   );

// //   return formattedCourses;
// // }

// /**
//  * API trả về JSON các danh mục khóa học và lớp học.
//  */
// export const courseCategoryController = async (req: Request, res: Response) => {
//   try {
//     // const data = await getCourseCategories();
//     const data = [
//       {
//         title: 'Khóa đào tạo dài hạn',
//         course: [
//           {
//             id: 1,
//             name: 'Ngành Lập trình viên Quốc tế - Aptech',
//             class: [
//               { name: 'Kỹ sư Kỹ thuật Phần mềm' },
//               { name: 'Kỹ sư Công nghệ thông tin ' },
//               { name: 'Kỹ sư Truyền thông đa phương tiện' },
//               { name: 'Cử nhân Logistics và Quản lý chuỗi cung ứng' },
//             ],
//           },
//           {
//             id: 2,
//             name: 'Ngành Mỹ thuật Đa phương tiện Quốc tế - Arena',
//             class: [
//               { name: 'Kỹ sư Truyền thông Đa phương tiện' },
//               { name: 'Kỹ sư Công nghệ thông tin' },
//               { name: 'Kỹ sư Kỹ thuật Phần mềm' },
//               { name: 'Cử nhân Logistics và Quản lý chuỗi cung ứng' },
//             ],
//           },
//         ],
//       },
//       {
//         title: 'Khóa đào tạo ngắn hạn',
//         course: [
//           {
//             id: 1,
//             name: 'Khóa học trực tuyến',
//             class: [
//               {
//                 name: 'Xây dựng Ứng dụng Web với Node.js và Express.JS Framework',
//               },
//               { name: 'Kiểm thử phần mềm cơ bản, Module 1' },
//               { name: 'Thiết kế Đồ Họa cho Quảng cáo' },
//               { name: 'Quản trị và an ninh mạng' },
//               { name: 'Kiểm thử phần mềm tự động, Module 2' },
//               { name: 'Lập trình ứng dụng đa nền tảng với Flutter' },
//               { name: 'Phát triển ứng dụng Web với LARAVEL và ANGULARJS' },
//               { name: 'Thiết kế Web và lập trình Front-end' },
//               { name: 'Lập trình Back-end với PHP và MySQL' },
//               { name: 'Thiết kế giao diện UI/UX Website bằng Figma' },
//               {
//                 name: 'Trí tuệ nhân tạo ứng dụng ghi thanh mang đối tượng có tên name',
//               },
//             ],
//           },
//           {
//             id: 2,
//             name: 'Khóa học trực tiếp',
//             class: [
//               { name: 'Trí tuệ nhân tạo cho nhân viên văn phòng' },
//               { name: 'Thiết kế đồ họa cho quảng cáo' },
//               { name: 'Phân tích dữ liệu thông minh với Power BI và GenAI' },
//             ],
//           },
//         ],
//       },
//       {
//         title: 'Khóa đào tạo STEAM',
//         course: [
//           {
//             id: 1,
//             name: 'Khóa đào tạo STEAM',
//             class: [
//               { name: 'Phát triển tư duy với Python' },
//               { name: 'Phát triển tư duy với lập trình Arduino' },
//               { name: 'Thiết kế web sáng tạo' },
//             ],
//           },
//         ],
//       },
//     ];
//     return res.status(200).json(data);
//   } catch (error) {
//     console.error('Error fetching course categories:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };
