import { JsonController, Body, Res, Post } from 'routing-controllers';
import { PDFDocument, rgb } from 'pdf-lib';
import type { PDFFont } from 'pdf-lib';
import type { PDFPage } from 'pdf-lib'; // 👉 Thêm dòng này để khai báo kiểu
import { getDataPDF } from '../services/data.service';
import fs from 'fs';
import path from 'path';
import {
  writeFileSync,
  mkdirSync,
  existsSync,
  createWriteStream,
  unlinkSync,
  readdirSync,
} from 'fs';
import archiver from 'archiver';

// import path from 'path';

@JsonController('/exportword')
export class ExportWordController {
  @Post('/word')
  // async export(@Res() res: any): Promise<void> {
  async export(
    @Body() body: { ids: number[] },
    @Res() res: any
  ): Promise<void> {
    const { ids } = body;
    try {
      // if (Array.isArray(ids) || ids.length >  0) {

      // }

      const Dir = path.resolve('./output-pdfs');
      const zipPath = path.resolve('./HaHa.zip');

      if (!existsSync(Dir)) {
        mkdirSync(Dir, { recursive: true });
      }
      if (existsSync(Dir)) {
        for (const file of readdirSync(Dir)) {
          unlinkSync(path.join(Dir, file));
        }
      } else {
        mkdirSync(Dir, { recursive: true });
      }

      const dataList = await getDataPDF(ids);

      if (dataList) {
        for (const data of dataList) {
          const pdf = await createPdf(data);
          const pdfBytes = await pdf.save();

          const filename = `${(data?.fullName || 'Unknown')
            .replace(/[\/\\:*?"<>|]/g, '')
            .replace(/\s+/g, '_')
            .trim()}-${(data?.coursename || 'NoCourse')
            .replace(/[\/\\:*?"<>|]/g, '')
            .replace(/\s+/g, '_')
            .trim()}.pdf`;

          writeFileSync(path.join(Dir, filename), pdfBytes);
        }
      }

      // Tạo PDF files
      // dataList.forEach((data) => {
      //   // const data = await getDataPDF(ids[index]);
      //   const pdf = await createPdf(data);
      //   const pdfBytes = await pdf.save();
      //   const filename = `${(data?.fullName || 'Unknown')
      //     .replace(/[\/\\:*?"<>|]/g, '')
      //     .replace(/\s+/g, '_')
      //     .trim()}-${(data?.coursename || 'NoCourse')
      //     .replace(/[\/\\:*?"<>|]/g, '')
      //     .replace(/\s+/g, '_')
      //     .trim()}.pdf`;

      //   writeFileSync(path.join(Dir, filename), pdfBytes);
      // });

      // Nén ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = createWriteStream(zipPath);

      archive.directory(Dir, false);
      archive.pipe(output);

      await new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.finalize();
      });

      // Gửi file ZIP về client
      await new Promise<void>((resolve, reject) => {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=HaHa.zip');

        res.sendFile(zipPath, (err: Error) => {
          if (err) {
            console.error('SendFile error:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (err) {
      console.error('Export error:', err);
      if (!res.headersSent) {
        res.status(500).send('Export failed');
      }
    }
  }
}

export const createPdf = async (data: any) => {
  const pdfDoc = await PDFDocument.create();

  const fontkit = require('fontkit');
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();

  const fontPathI = path.resolve(
    __dirname,
    '../../../../../src/font/font-times-new-roman/font-times-new-roman/SVN-Times New Roman Italic.ttf'
  );
  const fontPathB = path.resolve(
    __dirname,
    '../../../../../src/font/font-times-new-roman/font-times-new-roman/SVN-Times New Roman Bold.ttf'
  );
  const fontPathBI = path.resolve(
    __dirname,
    '../../../../../src/font/font-times-new-roman/font-times-new-roman/SVN-Times New Roman Bold Italic.ttf'
  );
  const fontPath = path.resolve(
    __dirname,
    '../../../../../src/font/font-times-new-roman/font-times-new-roman/SVN-Times New Roman.ttf'
  );
  const fontBytes = fs.readFileSync(fontPath);
  const fontBytesI = fs.readFileSync(fontPathI);
  const fontBytesB = fs.readFileSync(fontPathB);
  const fontBytesBI = fs.readFileSync(fontPathBI);

  const font = await pdfDoc.embedFont(fontBytes);
  const fetch = (await import('node-fetch')).default;
  const fontI = await pdfDoc.embedFont(fontBytesI);
  const fontBI = await pdfDoc.embedFont(fontBytesBI);
  const fontB = await pdfDoc.embedFont(fontBytesB);

  const write = (text: string, x: number, y: number, size = 13) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  };

  const writeMulFon = (
    text: string,
    x: number,
    y: number,
    width: number,
    font: PDFFont,
    size = 13
  ) => {
    const fullwidth = font.widthOfTextAtSize(text, size);
    const xdraw = (width - fullwidth) / 2;
    const xnew = xdraw + x;
    page.drawText(text, { x: xnew, y, size, font, color: rgb(0, 0, 0) });
  };

  function createTextWrapper(page: PDFPage, defaultSize = 12) {
    return function wrapText(
      textSpans: { text: string; font: PDFFont }[],
      options: { x: number; y: number; maxWidth: number; size: number }
    ) {
      const { x, y, maxWidth, size } = options;
      let cursorY = y;
      let line: { text: string; font: PDFFont }[] = [];

      const flushLine = () => {
        let drawX = x;
        for (const span of line) {
          page.drawText(span.text, {
            x: drawX,
            y: cursorY,
            size,
            font: span.font,
          });
          drawX += span.font.widthOfTextAtSize(span.text, size);
        }
        line = [];
        cursorY -= size * 1.2;
      };

      for (const span of textSpans) {
        const words = span.text.split(' ');
        for (const word of words) {
          const wordWithSpace = word + ' ';
          const wordWidth = span.font.widthOfTextAtSize(wordWithSpace, size);
          const currentLineWidth = line.reduce(
            (sum, w) => sum + w.font.widthOfTextAtSize(w.text, size),
            0
          );

          if (currentLineWidth + wordWidth > maxWidth) {
            flushLine();
          }

          line.push({ text: wordWithSpace, font: span.font });
        }
      }

      if (line.length > 0) {
        flushLine();
      }
    };
  }

  function createSingleLineTextRenderer(page: PDFPage, defaultSize = 12) {
    return function drawSingleLineText(
      textSpans: { text: string; font: PDFFont }[],
      options: { x: number; y: number; size?: number }
    ) {
      const { x, y, size = defaultSize } = options;
      let drawX = x;

      for (const span of textSpans) {
        page.drawText(span.text, {
          x: drawX,
          y,
          size,
          font: span.font,
        });

        // Move X cursor forward by the width of this span
        drawX += span.font.widthOfTextAtSize(span.text, size);
      }
    };
  }

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
  };

  const drawBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    backgroundColor?: { r: number; g: number; b: number }
  ) => {
    if (backgroundColor) {
      page.drawRectangle({
        x,
        y: y - height,
        width,
        height,
        color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
      });
    }
    drawLine(x, y, x + width, y); // top
    drawLine(x, y, x, y - height); // left
    drawLine(x + width, y, x + width, y - height); // right
    drawLine(x, y - height, x + width, y - height); // bottom
  };

  const drawText = createSingleLineTextRenderer(page, 13);

  let y = height - 40;

  const imageUrl = 'http://localhost:4200/cusc_remove.png'; // Ảnh PNG
  const imageRes = await fetch(imageUrl);
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

  const image = await pdfDoc.embedPng(imageBuffer); // 👈 dùng đúng hàm cho PNG

  page.drawImage(image, {
    x: 20,
    y: y - 35,
    width: 80,
    height: 60,
  });

  write('TRUNG TÂM CÔNG NGHỆ PHẦN MỀM ĐẠI HỌC CẦN THƠ', 120, y, 15);
  y -= 25;

  const titleWords = ['CANTHO', 'UNIVERSITY', 'SOFTWARE', 'CENTER'];
  const bigSize = 22;
  const normalSize = 17;
  let currentX = 130; // bắt đầu từ đây
  const startY = y;

  for (const word of titleWords) {
    const firstChar = word.charAt(0);
    const rest = word.slice(1);

    const firstCharWidth = font.widthOfTextAtSize(firstChar, bigSize);
    const restWidth = font.widthOfTextAtSize(rest, normalSize);

    // Vẽ ký tự đầu to
    write(firstChar, currentX, startY, bigSize);

    // Vẽ phần còn lại nhỏ
    write(rest, currentX + firstCharWidth + 1, startY, normalSize);

    // Cập nhật vị trí x cho từ tiếp theo (thêm khoảng cách giữa các từ, ví dụ 10)
    currentX += firstCharWidth + restWidth + 10;
  }
  const wrapText = createTextWrapper(page, 12);

  // write('CANTHO UNIVERSSITY SOFTWARE CENTER', 140, y, 17);
  y -= 25;

  write(
    'Khu III, Đại học Cần Thơ – 01 Lý Tự Trọng, TP.Cần Thơ – tel: 0293.373.1072 – Email: cusc@ctu.edu.vn',
    70,
    y,
    10
  );
  y -= 10;

  drawBox(40, y, 520, 1);
  y -= 30;

  // Title
  // write('Giay Dang Ky Nhap Hoc', 200, y, 16);
  // writeMulFon(, 50, y, 400, fontB);
  page.drawText('GIẤY ĐĂNG KÝ NHẬP HỌC', {
    x: 230,
    y: y,
    size: 16,
    font: fontB,
    color: rgb(0, 0, 0),
  });

  y -= 30;

  // --- SECTION 1: COURSE ---
  drawBox(50, y, 80, 60, { r: 0.8, g: 0.8, b: 0.8 });
  writeMulFon('KHÓA', 50, y - 25, 80, fontB);
  writeMulFon('HỌC', 50, y - 40, 80, fontB);

  // write('KHOA \n HOC', 55, y - 20);

  drawBox(130, y, 440, 60, { r: 0.8, g: 0.8, b: 0.8 });
  // drawText(
  //   [
  //     { text: 'Khóa Học: ', font: fontB },
  //     { text: `${data.coursenme}`, font: fontI },
  //   ],
  //   { x: 140, y: y - 35 }
  // );
  wrapText(
    [
      {
        text: 'Khóa Học:',
        font: fontB,
      },
      {
        text: `${data.coursename}`,
        font: fontI,
      },
    ],
    { x: 140, y: y - 35, maxWidth: 255, size: 13 }
  );
  drawText(
    [
      { text: 'Ngày khai giảng: ', font: fontB },
      { text: '20/10/2003', font: fontI },
    ],
    { x: 400, y: y - 35 }
  );

  y -= 60;

  // --- SECTION 2: PERSONAL INFO ---
  drawBox(50, y, 80, 160, { r: 0.8, g: 0.8, b: 0.8 });
  // write('Thong \n Tin \n Ca \n  Nhan', 55, y - 20);
  writeMulFon('THÔNG', 50, y - 60, 80, fontB);
  writeMulFon('TIN', 50, y - 75, 80, fontB);
  writeMulFon('CÁ', 50, y - 90, 80, fontB);
  writeMulFon('NHÂN', 50, y - 105, 80, fontB);

  drawBox(130, y, 440, 160);

  drawText(
    [
      { text: 'Họ và Tên: ', font: fontB },
      { text: `${data.fullName}`, font: fontI },
    ],
    { x: 135, y: y - 20 }
  );
  drawText(
    [
      { text: 'Nam/Nữ: ', font: fontB },
      { text: `${data.gender}`, font: fontI },
    ],
    { x: 370, y: y - 20 }
  );

  drawText(
    [
      { text: 'Ngày Sinh: ', font: fontB },
      { text: `${data.dob}`, font: fontI },
    ],
    { x: 135, y: y - 45 }
  );
  drawText(
    [
      { text: 'Nơi Sinh: ', font: fontB },
      { text: `${data.bir_place}`, font: fontI },
    ],
    { x: 280, y: y - 45 }
  );

  drawText(
    [
      { text: 'Điện Thoại: ', font: fontB },
      { text: `${data.phone}`, font: fontI },
    ],
    { x: 135, y: y - 70 }
  );
  drawText(
    [
      { text: 'Email: ', font: fontB },
      { text: `${data.email}`, font: fontI },
    ],
    { x: 280, y: y - 70 }
  );

  drawText(
    [
      { text: 'Zalo: ', font: fontB },
      { text: `${data.zalo}`, font: fontI },
    ],
    { x: 135, y: y - 95 }
  );
  drawText(
    [
      { text: 'Facebook: ', font: fontB },
      { text: `${data.fb}`, font: fontI },
    ],
    { x: 280, y: y - 95 }
  );

  drawText(
    [
      { text: 'Trình độ học vấn: ', font: fontB },
      { text: `${data.educationLevel}`, font: fontI },
    ],
    { x: 135, y: y - 120 }
  );
  // drawTextWithDots(page, '', {
  //   x: 135,
  //   y: y - 120,
  //   maxWidth: 320,
  //   font: font,
  //   size: 13,
  // });

  drawText(
    [
      { text: 'Địa chỉ liên hệ: ', font: fontB },
      { text: `${data.address}`, font: fontI },
    ],
    { x: 135, y: y - 145 }
  );
  // drawTextWithDots(page, '', {
  //   x: 135,
  //   y: y - 145,
  //   maxWidth: 420,
  //   font: font,
  //   size: 13,
  // });

  drawBox(465, y - 5, 100, 130);
  // write('Photo\n(4x6)', 465, y - 40);
  writeMulFon('Photo', 465, y - 55, 100, font);
  writeMulFon('(4x6)', 465, y - 70, 100, font);

  y -= 160;

  // --- SECTION 3: FAMILY ---
  drawBox(50, y, 80, 80, { r: 0.8, g: 0.8, b: 0.8 });
  // write('Gia \n Dinh', 55, y - 20);
  writeMulFon('GIA', 50, y - 35, 80, fontB);
  writeMulFon('ĐÌNH', 50, y - 50, 80, fontB);

  drawBox(130, y, 85, 20, { r: 0.8, g: 0.8, b: 0.8 });
  drawBox(215, y, 145, 20, { r: 0.8, g: 0.8, b: 0.8 });
  drawBox(360, y, 110, 20, { r: 0.8, g: 0.8, b: 0.8 });
  drawBox(470, y, 100, 20, { r: 0.8, g: 0.8, b: 0.8 });

  writeMulFon('Họ Tên ', 210, y - 15, 150, fontB);
  writeMulFon('Điện Thoại', 360, y - 15, 110, fontB);
  writeMulFon('Địa Chỉ', 470, y - 15, 100, fontB);

  drawBox(470, y - 20, 100, 60);

  drawBox(130, y - 20, 85, 20);
  drawBox(215, y - 20, 145, 20);
  drawBox(360, y - 20, 110, 20);
  write('Cha', 135, y - 35);

  drawBox(130, y - 40, 85, 20);
  drawBox(215, y - 40, 145, 20);
  drawBox(360, y - 40, 110, 20);
  write('Mẹ', 135, y - 55);

  drawBox(130, y - 60, 85, 20);
  drawBox(215, y - 60, 145, 20);
  drawBox(360, y - 60, 110, 20);
  write('Người đỡ đầu', 135, y - 75);

  y -= 80;

  // --- SECTION 4: COMMITMENT ---
  drawBox(50, y, 80, 120, { r: 0.8, g: 0.8, b: 0.8 });
  // write('Cam Ket', 55, y - 20);
  writeMulFon('CAM', 50, y - 45, 80, fontB);
  writeMulFon('KẾT', 50, y - 60, 80, fontB);

  drawBox(130, y, 440, 120);

  wrapText(
    [
      {
        text: 'Học phí đã đóng không được hoàn lại, không được chuyển nhượng cho người khác. Tôi xin cam kết rằng tôi đã nhận được nội dung chương trình và sổ tay sinh viên. Tôi đã đọc và hiểu rõ nội quy của ',
        font: fontI,
      },
      {
        text: 'Trung tâm Công nghệ phần mềm Trường Đại học Cần Thơ',
        font: fontBI,
      },
      {
        text: ', và đồng ý tuân thủ theo những nội dung đó.',
        font: fontI,
      },
    ],
    { x: 145, y: y - 20, maxWidth: 420, size: 12 }
  );

  y -= 105;
  drawText(
    [
      { text: 'Ngày đăng ký: ', font: fontB },
      { text: `${data.day}`, font: fontI },
    ],
    { x: 135, y: y }
  );
  drawText(
    [
      { text: 'Chữ ký học sinh: ', font: fontB },
      { text: '', font: fontI },
    ],
    { x: 355, y: y }
  );

  y -= 35;

  // --- FOR CONSULTANT USE ---
  // write(, 220, y);

  writeMulFon('Phần Dành cho Tư vấn', 60, y, 460, fontBI);
  const fullwidth = font.widthOfTextAtSize('Phần Dành cho Tư vấn', 13);

  drawLine(
    60 + (460 - fullwidth) / 2 - 1,
    y - 2,
    60 + (460 - fullwidth) / 2 + fullwidth + 1,
    y - 2
  );

  y -= 50;

  drawBox(60, y, 230, 30, { r: 0.8, g: 0.8, b: 0.8 });
  writeMulFon('Được chấp nhận bởi Tư vấn', 60, y - 17, 230, fontB);
  // writeMul('Photo', 50, y - 25, 80);

  drawBox(290, y, 230, 30, { r: 0.8, g: 0.8, b: 0.8 });
  // write('Ma So Sinh vien ', 350, y - 10, 10);
  writeMulFon('Mã số Sinh viên ', 290, y - 17, 230, fontB);

  y -= 30;

  drawBox(60, y, 230, 90);
  writeMulFon('(Ký, họ tên)', 60, y - 15, 230, fontI);

  drawBox(290, y, 230, 90);

  return pdfDoc;
};
