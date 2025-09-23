'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import ExcelJS from 'exceljs';

type ExtractedData = {
  fullName: string;
  phone: string;
  zalo: string;
  email: string;
  school: string;
  field: string;
};

export default function ImprovedOCRPage() {
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const preprocessImageForHandwriting = (
    file: File,
    callback: (dataUrl: string) => void
  ): void => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 3;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        let enhanced = (gray - 128) * 2 + 128;
        enhanced = Math.max(0, Math.min(255, enhanced));
        const binary = enhanced > 140 ? 255 : 0;

        data[i] = binary;
        data[i + 1] = binary;
        data[i + 2] = binary;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL();
      setProcessedImageUrl(dataUrl);
      callback(dataUrl);
    };

    reader.readAsDataURL(file);
  };

  const cleanText = (raw: string): string => {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && line.length > 0)
      .join('\n')
      .replace(/[^\wÀ-Ỵà-ỹ\s:/().,\-@0-9]/g, '')
      .replace(/ {2,}/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim();
  };

  function extractFields(text: string): ExtractedData {
    const lines = text.split('\n');
    const data: ExtractedData = {
      fullName: '',
      phone: '',
      zalo: '',
      email: '',
      school: '',
      field: 'Khác',
    };

    const fullText = text.toLowerCase();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      if (/^1[\.\)]?\s*/.test(lowerLine) || /họ.*tên/i.test(lowerLine)) {
        let nameValue = line.replace(/^.*h[ọo].*t[êe]n[:\.\s-]*/i, '').trim();
        if (!nameValue && i + 1 < lines.length) {
          nameValue = lines[i + 1].trim();
        }
        if (nameValue.length > 1) {
          data.fullName = nameValue;
        }
      }

      if (/^2[\.\)]?\s*/.test(lowerLine)) {
        const match = line.match(/[:\.]\s*([\d\s\-\.]+)/);
        if (match && match[1]) {
          data.phone = match[1].replace(/[\s\-\.]/g, '').trim();
        }
      }

      if (/^3[\.\)]?\s*/.test(lowerLine)) {
        const match = line.match(/[:\.]\s*([\d\s\-\.]+)/);
        if (match && match[1]) {
          data.zalo = match[1].replace(/[\s\-\.]/g, '').trim();
        }
      }

      if (/^4[\.\)]?\s*/.test(lowerLine)) {
        const match = line.match(
          /[:\.]\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
        );
        if (match && match[1]) {
          data.email = match[1].trim();
        }
      }

      if (/tru[oờ]ng|school/i.test(lowerLine)) {
        let schoolValue = line.replace(/.*[:\.]\s*/i, '').trim();
        if (!schoolValue && i + 1 < lines.length)
          schoolValue = lines[i + 1].trim();
        if (schoolValue && schoolValue.length > 1) data.school = schoolValue;
      }
    }

    if (!data.phone) {
      const phoneMatch = fullText.match(/0[0-9]{8,10}/);
      if (phoneMatch) data.phone = phoneMatch[0];
    }

    if (!data.email) {
      const emailMatch = fullText.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
      );
      if (emailMatch) data.email = emailMatch[0];
    }

    if (!data.zalo && data.phone) data.zalo = data.phone;

    if (/l[aâậ]p.*tr[iì]nh|aptech|it|software|programming/i.test(fullText)) {
      data.field = 'Lập trình viên quốc tế - APTECH';
    } else if (/m[yỹ].*thu[aậ]t|arena|design|graphic/i.test(fullText)) {
      data.field = 'Mỹ thuật đa phương tiện quốc tế - ARENA';
    } else if (/k[yỹ].*thu[aậ]t.*ph[aầ]n.*m[eề]m/i.test(fullText)) {
      data.field = 'Kỹ thuật phần mềm';
    } else if (/c[oô]ng.*ngh[eệ].*th[oô]ng.*tin/i.test(fullText)) {
      data.field = 'Công nghệ thông tin';
    } else if (/logistic|chuỗi cung ứng|supply/i.test(fullText)) {
      data.field = 'Logistic và Quản lý chuỗi cung ứng';
    }

    return data;
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedImageUrl('');
    }
  };

  const handleOCR = async () => {
    if (!image) return alert('Vui lòng chọn một ảnh.');
    setLoading(true);
    setText('');
    setExtractedData(null);

    try {
      preprocessImageForHandwriting(image, async (processedImage: string) => {
        const response = await fetch('http://localhost:5001/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: processedImage }),
        });

        const result = await response.json();
        if (result.error) {
          alert('Lỗi OCR: ' + result.error);
        } else {
          if (Array.isArray(result.text)) {
            result.text = result.text.join('\n');
          }

          const cleaned = cleanText(result.text || '');
          setText(cleaned);
          const extracted = extractFields(cleaned);
          setExtractedData(extracted);
        }
      });
    } catch (error) {
      console.error('Lỗi khi gửi ảnh:', error);
      alert('Lỗi gửi ảnh. Kiểm tra server đang chạy chưa.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return alert('Chưa có dữ liệu để lưu.');
    if (
      !extractedData.fullName ||
      !extractedData.phone ||
      !extractedData.email
    ) {
      return alert(
        'Thiếu thông tin bắt buộc: Họ tên, số điện thoại hoặc email.'
      );
    }

    try {
      const response = await fetch(
        'http://localhost:3000/api/studentsave/excel',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(extractedData),
        }
      );

      // const now = new Date();

      // const response = await fetch(
      //   'http://localhost:3000/api/uploadform/submitform',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       student_name: extractedData.fullName,
      //       date_of_birth: '',
      //       gender: '',
      //       email: extractedData.email,
      //       phone_number: extractedData.phone,
      //       zalo_phone: extractedData.zalo,
      //       link_facebook: '',
      //       current_education_level: '',
      //       other_education_level_description: '',
      //       high_school_name: extractedData.school,
      //       city: '',
      //       source: '',
      //       other_source_description: '',
      //       registration_date: now.toLocaleString(),
      //       interested_courses_details: extractedData.field,
      //       notification_consent: '',
      //       other_notification_consent_description: '',
      //     }),
      //   }
      // );

      const result = await response.json();

      if (response.ok) {
        alert('✅ Đã lưu thành công!');
      } else {
        console.error('Lỗi lưu:', result);
        alert(`❌ Lỗi: ${result.error || 'Không rõ'}`);
      }
    } catch (error) {
      console.error('Lỗi gửi dữ liệu:', error);
      alert('❌ Gửi dữ liệu thất bại. Kiểm tra kết nối hoặc server.');
    }
  };

  // const handleSave = async () => {
  //   if (!extractedData) return alert('Chưa có dữ liệu để lưu.');
  //   if (
  //     !extractedData.fullName ||
  //     !extractedData.phone ||
  //     !extractedData.email
  //   ) {
  //     return alert(
  //       'Thiếu thông tin bắt buộc: Họ tên, số điện thoại hoặc email.'
  //     );
  //   }

  //   try {
  //     // Tạo workbook Excel
  //     const workbook = new ExcelJS.Workbook();
  //     const sheet = workbook.addWorksheet('Thông tin học viên');

  //     sheet.columns = [
  //       { header: 'Họ và tên', key: 'fullName', width: 25 },
  //       { header: 'Số điện thoại', key: 'phone', width: 15 },
  //       { header: 'Zalo', key: 'zalo', width: 15 },
  //       { header: 'Email', key: 'email', width: 25 },
  //       { header: 'Trường', key: 'school', width: 25 },
  //       { header: 'Ngành', key: 'field', width: 30 },
  //     ];

  //     sheet.addRow(extractedData);

  //     // Xuất buffer rồi tải file
  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     });

  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `student_info_${new Date().toISOString().slice(0, 10)}.xlsx`;
  //     a.click();
  //     window.URL.revokeObjectURL(url);

  //     alert('✅ Đã tải file Excel thành công!');
  //   } catch (error) {
  //     console.error('Lỗi xuất Excel:', error);
  //     alert('❌ Xuất Excel thất bại.');
  //   }
  // };

  const updateExtractedData = (field: keyof ExtractedData, value: string) => {
    setExtractedData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleManualInput = () => {
    setExtractedData({
      fullName: '',
      phone: '',
      zalo: '',
      email: '',
      school: '',
      field: 'Khác',
    });
  };

  // ⬇ UI component remains unchanged (from original `.js` file) ⬇
  return (
    <div
      style={{
        padding: '1rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '2rem',
            fontSize: '1.8rem',
          }}
        >
          🔍 OCR Phiếu Thông Tin - Hỗ trợ Chữ viết tay
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Phần upload và xử lý ảnh */}
          <div>
            <h3 style={{ color: '#e74c3c' }}>📁 Chọn ảnh phiếu thông tin:</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                padding: '10px',
                border: '2px dashed #3498db',
                borderRadius: '5px',
                width: '100%',
                marginBottom: '1rem',
              }}
            />

            {previewUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Ảnh gốc:</h4>
                <img
                  src={previewUrl}
                  alt="Original"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
            )}

            {processedImageUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Ảnh đã xử lý:</h4>
                <img
                  src={processedImageUrl}
                  alt="Processed"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleOCR}
                disabled={loading || !image}
                style={{
                  backgroundColor: loading ? '#95a5a6' : '#e74c3c',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  flex: 1,
                }}
              >
                {loading ? '🔄 Đang xử lý...' : '🚀 Quét OCR'}
              </button>

              <button
                onClick={handleManualInput}
                style={{
                  backgroundColor: '#f39c12',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                ✏️ Nhập thủ công
              </button>
            </div>

            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fff3cd',
                borderRadius: '5px',
                fontSize: '12px',
              }}
            >
              <strong>💡 Lưu ý:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>Chụp ảnh rõ nét, ánh sáng đủ</li>
                <li>Chữ viết rõ ràng, không bị mờ</li>
                <li>Nếu OCR không chính xác, hãy sửa thủ công</li>
                <li>Có thể nhập thủ công nếu OCR không hoạt động</li>
              </ul>
            </div>
          </div>

          {/* Phần kết quả OCR */}
          <div>
            <h3 style={{ color: '#27ae60' }}>📄 Kết quả OCR:</h3>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '5px',
                border: '1px solid #dee2e6',
                maxHeight: '300px',
                overflow: 'auto',
                fontSize: '11px',
                minHeight: '100px',
              }}
            >
              {text || 'Chưa có kết quả OCR...'}
            </pre>
          </div>
        </div>

        {/* Phần thông tin đã trích xuất */}
        {extractedData && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#e8f6f3',
              borderRadius: '8px',
              border: '2px solid #27ae60',
            }}
          >
            <h3 style={{ color: '#27ae60', marginBottom: '1rem' }}>
              ✅ Thông tin đã trích xuất (Có thể chỉnh sửa):
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  Họ và tên: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={extractedData.fullName}
                  onChange={(e) =>
                    updateExtractedData('fullName', e.target.value)
                  }
                  placeholder="Nhập họ và tên"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  Số điện thoại: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={extractedData.phone}
                  onChange={(e) => updateExtractedData('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  Số Zalo:
                </label>
                <input
                  type="text"
                  value={extractedData.zalo}
                  onChange={(e) => updateExtractedData('zalo', e.target.value)}
                  placeholder="Nhập số Zalo"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  Email: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  value={extractedData.email}
                  onChange={(e) => updateExtractedData('email', e.target.value)}
                  placeholder="Nhập email"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  Trường:
                </label>
                <input
                  type="text"
                  value={extractedData.school}
                  onChange={(e) =>
                    updateExtractedData('school', e.target.value)
                  }
                  placeholder="Nhập tên trường"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  Ngành yêu thích:
                </label>
                <select
                  value={extractedData.field}
                  onChange={(e) => updateExtractedData('field', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <option value="Lập trình viên quốc tế - APTECH">
                    Lập trình viên quốc tế - APTECH
                  </option>
                  <option value="Mỹ thuật đa phương tiện quốc tế - ARENA">
                    Mỹ thuật đa phương tiện quốc tế - ARENA
                  </option>
                  <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                  <option value="Công nghệ thông tin">
                    Công nghệ thông tin
                  </option>
                  <option value="Truyền thông đa phương tiện">
                    Truyền thông đa phương tiện
                  </option>
                  <option value="Logistic và Quản lý chuỗi cung ứng">
                    Logistic và Quản lý chuỗi cung ứng
                  </option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '12px 30px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '1rem',
                width: '100%',
              }}
            >
              💾 Lưu vào Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
