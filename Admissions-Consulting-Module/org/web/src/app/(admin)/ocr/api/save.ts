// import fs from 'fs';
// import path from 'path';
// import { NextApiRequest, NextApiResponse } from 'next';
// import ExcelJS from 'exceljs';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const { fullName, phone, zalo, email, school, field } = req.body as {
//     fullName: string;
//     phone: string;
//     zalo?: string;
//     email: string;
//     school: string;
//     field?: string;
//   };

//   const errors: string[] = [];
//   if (!fullName || fullName.trim().length < 2)
//     errors.push('Họ tên không hợp lệ');
//   if (!phone || !/^[0-9]{10,11}$/.test(phone.replace(/[\s\-]/g, '')))
//     errors.push('Số điện thoại không hợp lệ');
//   if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
//     errors.push('Email không hợp lệ');
//   if (!school || school.trim().length < 2)
//     errors.push('Tên trường không hợp lệ');

//   if (errors.length > 0) {
//     return res.status(400).json({
//       error: 'Dữ liệu không hợp lệ',
//       details: errors,
//     });
//   }

//   try {
//     const outputDir = path.join(process.cwd(), 'public', 'output');
//     if (!fs.existsSync(outputDir)) {
//       fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const timestamp = new Date().toISOString().slice(0, 10);
//     const fileName = `student_info_${timestamp}.xlsx`;
//     const filePath = path.join(outputDir, fileName);

//     const workbook = new ExcelJS.Workbook();
//     let worksheet: ExcelJS.Worksheet;

//     if (fs.existsSync(filePath)) {
//       await workbook.xlsx.readFile(filePath);
//       const found = workbook.getWorksheet('Thông tin sinh viên');
//       worksheet = found ?? workbook.addWorksheet('Thông tin sinh viên');
//     } else {
//       worksheet = workbook.addWorksheet('Thông tin sinh viên');
//     }

//     // Nếu worksheet mới chưa có dòng nào => thêm header
//     if (worksheet.rowCount === 0) {
//       const headerRow = worksheet.addRow([
//         'STT',
//         'Thời gian',
//         'Họ và tên',
//         'Số điện thoại',
//         'Số Zalo',
//         'Email',
//         'Trường',
//         'Ngành yêu thích',
//       ]);

//       headerRow.eachCell((cell) => {
//         cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FF2C3E50' },
//         };
//         cell.alignment = { vertical: 'middle', horizontal: 'center' };
//         cell.border = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' },
//         };
//       });

//       worksheet.columns = [
//         { width: 5 },
//         { width: 20 },
//         { width: 25 },
//         { width: 15 },
//         { width: 15 },
//         { width: 30 },
//         { width: 25 },
//         { width: 35 },
//       ];
//     }

//     const rowCount = worksheet.rowCount;
//     const stt = rowCount; // không cộng thêm vì header là dòng 1

//     const formattedPhone = phone.replace(/[\s\-]/g, '');
//     const formattedZalo = zalo ? zalo.replace(/[\s\-]/g, '') : formattedPhone;

//     const newRow = worksheet.addRow([
//       stt,
//       new Date().toLocaleString('vi-VN', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//       }),
//       fullName.trim(),
//       formattedPhone,
//       formattedZalo,
//       email.trim().toLowerCase(),
//       school.trim(),
//       field || 'Khác',
//     ]);

//     newRow.eachCell((cell, colNumber) => {
//       cell.alignment = {
//         vertical: 'middle',
//         horizontal: colNumber === 1 ? 'center' : 'left',
//       };
//       cell.border = {
//         top: { style: 'thin' },
//         left: { style: 'thin' },
//         bottom: { style: 'thin' },
//         right: { style: 'thin' },
//       };
//       if (newRow.number % 2 === 0) {
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FFF8F9FA' },
//         };
//       }
//     });

//     await workbook.xlsx.writeFile(filePath);

//     return res.status(200).json({
//       message: 'Lưu thông tin thành công!',
//       fileName,
//       downloadUrl: `/output/${fileName}`,
//       rowNumber: stt,
//       data: {
//         fullName: fullName.trim(),
//         phone: formattedPhone,
//         zalo: formattedZalo,
//         email: email.trim().toLowerCase(),
//         school: school.trim(),
//         field: field || 'Khác',
//       },
//     });
//   } catch (error: any) {
//     console.error('Lỗi khi ghi Excel:', error);
//     return res.status(500).json({
//       error: 'Lỗi hệ thống khi lưu dữ liệu',
//       detail: error.message,
//     });
//   }
// }

// // Cấu hình cho API Next.js
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '1mb',
//     },
//   },
// };
