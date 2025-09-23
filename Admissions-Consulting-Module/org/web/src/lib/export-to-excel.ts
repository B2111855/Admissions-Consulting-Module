// src/lib/export-to-excel.ts

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ConsultingData {
    student_id: number;
    student_name: string;
    email: string | null;
    phone_number: string | null;
    gender: string | null;
    zalo_phone: string | null;
    link_facebook: string | null;
    date_of_birth: string | null;
    current_education_level: string | null;
    high_school_name: string | null;
    city: string | null;
    source: string | null;
    current_status: string;
    registration_date: string | null;
    email_cusc?: string | null;
    other_education_level_description: string | null;
    student_created_at: string;
    student_updated_at: string;
    assigned_counselor_name: string;
    interested_courses_details: string | null;
    enrolled_courses_details: string | null;
}

/**
 * Ánh xạ dữ liệu từ nguồn API sang định dạng cột của Excel.
 * * @param data Mảng dữ liệu từ API (`consultingInformation`).
 * @returns Mảng các đối tượng đã được ánh xạ, sẵn sàng để xuất.
 */
const mapDataForExport = (data: ConsultingData[]): any[] => {
    const billingRegex = /Phí đã trả: ([\d,\.]+)/; 

    return data.map((item, index) => {
        let billingAmount = '';
        if (item.enrolled_courses_details) {
            const match = item.enrolled_courses_details.match(billingRegex);
            if (match && match[1]) {
                const rawAmount = match[1].replace(/,/g, ''); 
                const numberValue = parseFloat(rawAmount);
                if (!isNaN(numberValue)) {
                    billingAmount = numberValue.toLocaleString('en-US');
                }
            }
        }
        
        return {
            'TT': index + 1,
            'Name': item.student_name || '',
            'Roll No.': item.student_id || '',
            'Old Roll No.': '',
            'In debt': '',
            'Birthday': item.date_of_birth || '',
            'Fem.': item.gender === 'Nữ' ? 'x' : '',
            'ID No.': '',
            'Date of issue': '',
            'Place of Issue': '',
            'Phone No.': item.phone_number || '',
            'Place of Birth': item.city || '',
            'Home address': '',
            'Zalo': item.zalo_phone || '',
            'Receipt': '',
            'Invoice': '',
            'Billing': '',
            'Coll.': '',
            'Billing (VNĐ)': billingAmount, 
            'Coll.(VNĐ': '', 
            'Discount': '',
            'Reason': '',
            'Date Reg.': item.registration_date || '',
            'Pho.': '',
            'Deg.': item.current_education_level || '',
            'Doc.': '',
            'Relatives person': '',
            'Relation': '',
            'Relatives person Phone': '',
            'Relatives person Email': '',
            'Relatives person Zalo': '',
            'Email': item.email || '',
            'Email CUSC': item.email_cusc || '',
            'Size.': ''
        };
    });
};

/**
 * Xuất dữ liệu đã được ánh xạ ra file Excel.
 *
 * @param data Mảng dữ liệu gốc từ API (`consultingInformation`).
 * @param fileName Tên file Excel (không bao gồm đuôi .xlsx).
 */
export const exportDataToExcel = (data: ConsultingData[], fileName: string = 'exported_data') => {
    if (!data || data.length === 0) {
        console.warn('Không có dữ liệu để xuất.');
        return;
    }

    const mappedData = mapDataForExport(data);
    const ws = XLSX.utils.json_to_sheet(mappedData);
    const header = Object.keys(mappedData[0]);
    const billingColIndex = header.indexOf('Billing (VNĐ)');

    if (billingColIndex !== -1) {

        for (let R = 0; R < mappedData.length; ++R) {
            const cellValue = mappedData[R]['Billing (VNĐ)'];
            if (cellValue) {
                const cellAddress = XLSX.utils.encode_cell({ r: R + 1, c: billingColIndex }); 
                XLSX.utils.sheet_add_aoa(ws, [[cellValue]], { origin: cellAddress, cellDates: false });
                const cell = ws[cellAddress];
                if (cell) {
                    cell.t = 's'; 
                    cell.z = '@'; 
                    cell.v = cellValue; 
                }
            }
        }
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, `${fileName}.xlsx`);
};