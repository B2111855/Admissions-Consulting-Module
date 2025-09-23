import { JsonController, Post, Body } from 'routing-controllers';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import jsend from '../jsend';

@JsonController('/studentsave')
export class StudentSaveController {
  @Post('/excel')
  async saveStudent(@Body() body: any) {
    try {
      const { fullName, phone, zalo, email, school, field } = body;

      // ✅ Validate dữ liệu
      const errors: string[] = [];
      if (!fullName || fullName.trim().length < 2)
        errors.push('Họ tên không hợp lệ');
      if (!phone || !/^[0-9]{10,11}$/.test(phone.replace(/[\s\-]/g, '')))
        errors.push('Số điện thoại không hợp lệ');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.push('Email không hợp lệ');
      if (!school || school.trim().length < 2)
        errors.push('Tên trường không hợp lệ');

      if (errors.length > 0) {
        return jsend.error('Dữ liệu không hợp lệ . Vui lòng thử lại.');
      }

      // ✅ Tạo thư mục lưu Excel nếu chưa có
      // const path = require('path');

      const outputDir = path.join(
        process.cwd(),
        '../..',
        'ExcelStudent/public/output'
      );
      // console.log(outputDir);
      // const outputDir = path.join(process.cwd(), 'public', 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // ✅ Tạo tên file theo ngày
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `student_info_${timestamp}.xlsx`;
      const filePath = path.join(outputDir, fileName);

      const workbook = new ExcelJS.Workbook();
      let worksheet: ExcelJS.Worksheet;

      if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
        worksheet =
          workbook.getWorksheet('Thông tin sinh viên') ??
          workbook.addWorksheet('Thông tin sinh viên');
      } else {
        worksheet = workbook.addWorksheet('Thông tin sinh viên');
      }

      // ✅ Nếu file mới thì thêm header
      if (worksheet.rowCount === 0) {
        worksheet.addRow([
          'STT',
          'Thời gian',
          'Họ và tên',
          'Số điện thoại',
          'Số Zalo',
          'Email',
          'Trường',
          'Ngành yêu thích',
        ]);
      }

      const stt = worksheet.rowCount;
      const formattedPhone = phone.replace(/[\s\-]/g, '');
      const formattedZalo = zalo ? zalo.replace(/[\s\-]/g, '') : formattedPhone;

      worksheet.addRow([
        stt,
        new Date().toLocaleString('vi-VN'),
        fullName.trim(),
        formattedPhone,
        formattedZalo,
        email.trim().toLowerCase(),
        school.trim(),
        field || 'Khác',
      ]);

      await workbook.xlsx.writeFile(filePath);

      return jsend.success({
        message: 'Lưu thông tin thành công!',
        fileName,
        downloadUrl: `/output/${fileName}`,
        rowNumber: stt,
        data: { fullName, phone, zalo, email, school, field },
      });
    } catch (error: any) {
      console.error('❌ Lỗi khi ghi Excel:', error);
      return jsend.error('Lỗi hệ thống khi lưu dữ liệu', {
        detail: error.message,
      });
    }
  }
}
