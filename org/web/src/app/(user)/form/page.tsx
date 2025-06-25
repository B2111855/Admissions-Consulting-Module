'use client';
import React, { useState, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertButton } from '@/components/alertButton';

interface FormData {
  fullName: string;
  dob: string;
  gender: string;
  phoneNumber: string;
  zaloPhoneNumber: string;
  email: string;
  facebookLink: string;
  userType: string;
  otherUserType: string;
  schoolOrWorkPlace: string;
  city: string;
  highSchoolName: string;
  programsSelected: string[];
  infoSources: string;
  otherInfoSource: string;
  consent: boolean;
  notificationConsent: string;
  otherNotificationConsent: string;
}

const initialFormData: FormData = {
  fullName: '',
  dob: '',
  gender: '',
  phoneNumber: '',
  zaloPhoneNumber: '',
  email: '',
  facebookLink: '',
  userType: '',
  otherUserType: '',
  schoolOrWorkPlace: '',
  city: '',
  highSchoolName: '',
  programsSelected: [],
  infoSources: '',
  otherInfoSource: '',
  consent: false,
  notificationConsent: '',
  otherNotificationConsent: '',
};

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const effectRan = useRef(false); // flag nhớ trạng thái

  useLayoutEffect(() => {
    if (effectRan.current) return; // nếu đã chạy rồi thì không chạy nữa
    effectRan.current = true;
    const fromHome = sessionStorage.getItem('fromHome');
    if (fromHome === 'true') {
      sessionStorage.removeItem('fromHome');
    } else {
      router.replace('/home');
    }
  }, []);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [show, setShow] = useState({
    visible: false,
    message: '',
    errors: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  // Các nguồn thông tin
  const infoSourcesOptions = [
    'Mail',
    'Fanpage',
    'Zalo',
    'Website',
    'Friend',
    'SMS',
    'Banderole',
    'Poster',
    'Brochure',
    'Google',
    'Brand',
    'Event',
    'Khác',
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Xử lý nhập fullname
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Vui lòng nhập họ và tên hợp lệ';
    } else if (!formData.fullName.trim().includes(' ')) {
      newErrors.fullName = 'Vui lòng  nhập đủ họ và tên';
    } else if (!/^[A-Za-zÀ-ỹ\s]+$/u.test(formData.fullName)) {
      newErrors.fullName = 'Họ tên không được có số và ký tự đặc biệt';
    }

    //Xử lý nhập ngày sinh
    if (!formData.dob.trim())
      newErrors.dob = 'Vui lòng nhập ngày tháng năm sinh';

    //Xử lý nhập Sdt
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại thường dùng';
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại thường dùng không hợp lệ';
    }

    //Xử lý nhập sdt Zalo
    if (
      formData.zaloPhoneNumber.trim() &&
      !/^\d{10,11}$/.test(formData.zaloPhoneNumber)
    ) {
      newErrors.zaloPhoneNumber = 'Số điện thoại Zalo không hợp lệ';
    }

    //Xử lý nhập email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email thường dùng';
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = 'Email không hợp lệ, vui lòng nhập lại';
    }

    //Xử lý nhập chấp nhận
    if (!formData.notificationConsent)
      newErrors.notificationConsent = 'Vui lòng lựa chọn 1 mục';
    if (
      formData.notificationConsent === 'Khác' &&
      !formData.otherNotificationConsent.trim()
    ) {
      newErrors.otherNotificationConsent = 'Vui lòng ghi rõ mục khác';
    }

    //Xử lý nhập nguồn
    if (!formData.infoSources.trim()) {
      newErrors.infoSources = 'Vui lòng chọn ít nhất một nguồn thông tin';
    }
    if (formData.infoSources === 'Khác' && !formData.otherInfoSource.trim()) {
      newErrors.otherInfoSource = 'Vui lòng ghi rõ mục khác';
    }

    //Xử lý chọn hiện tại bạn là ai
    if (!formData.userType) newErrors.userType = 'Vui lòng chọn bạn là ai';
    if (formData.userType === 'Mục khác' && !formData.otherUserType.trim()) {
      newErrors.otherUserType = 'Vui lòng ghi rõ mục khác';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, type, value, checked } = target as HTMLInputElement;

    if (type === 'checkbox') {
      if (name === 'programsSelected') {
        let newPrograms = [...formData.programsSelected];
        if (checked) {
          if (!newPrograms.includes(value)) newPrograms.push(value);
        } else {
          newPrograms = newPrograms.filter((p) => p !== value);
        }
        setFormData((prev) => ({ ...prev, programsSelected: newPrograms }));
      }
      if (name === 'infoSources') {
        if (checked) {
          setFormData((prev) => ({ ...prev, infoSources: value }));
        }
      } else if (name === 'consent') {
        setFormData((prev) => ({ ...prev, consent: checked }));
      }
    } else {
      // input text, radio, select, textarea
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShow({
      visible: false,
      message: '',
      errors: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!validateForm()) {
      setShow({
        visible: true,
        message: '❌ Dữ liệu không hợp lệ, vui lòng kiểm tra kỹ lại',
        errors: false,
      });
      return; // Dừng gửi form nếu validation thất bại
    }
    //---------------------------------------------------------------
    //Code Lấy Khóa học đăng ký tư vấn
    let courseName = '';
    let className = '';
    if (typeof window !== 'undefined') {
      const savedDataString = localStorage.getItem('formData');

      if (savedDataString) {
        const savedData = JSON.parse(savedDataString); // parse JSON thành object
        courseName = savedData.courseName;
        className = savedData.className;
      }
    }

    //-------------------------------------------------------
    // Code API gửi mail tự động
    try {
      const emailResponse = await fetch(
        'http://localhost:3000/api/uploadform/sendemail',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            subject: 'Cảm ơn bạn đã liên hệ với CUSC',
            text: `Chào ${formData.fullName}, ...`,
            html: `<html>...</html>`,
          }),
        }
      );

      const emailCheck = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailCheck.error || 'Lỗi gửi email');
      }

      console.log('Email sent:', emailCheck.message);
    } catch (err) {
      console.error('Gửi email thất bại:', err);
    }

    //-------------------------------------------------
    // API gửi trả API giới tính từ tên (tự xây dựng bẳng máy học)
    // let gender;
    // try {
    //   const response = await fetch(
    //     'http://localhost:3000/api/uploadform/predict-gender',
    //     {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         name: formData.fullName,
    //       }),
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error('Lỗi khi gửi dữ liệu');
    //   }
    //   const result = await response.json();
    //   gender = result.data.gender;
    // } catch (error) {
    //   console.error(error);
    // }

    //API gửi trả API giới tính từ tên (có sẵn)
    const response = await fetch(
      `https://api.genderize.io?name=${encodeURIComponent(formData.fullName)}`
    );
    const data = await response.json();
    let gender = data.gender;
    if (gender === 'male' && data.probability > 0.7) {
      gender = 'Nam';
    } else if (gender == 'female' && data.probability > 0.7) {
      gender = 'Nữ';
    } else {
      gender = 'Chưa rõ';
    }

    //----------------------------------------
    // API gửi data đên BE
    const now = new Date();
    try {
      const submitResponse = await fetch(
        'http://localhost:3000/api/uploadform/submitform',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_name: formData.fullName,
            date_of_birth: formData.dob,
            gender: formData.gender || gender,
            email: formData.email,
            phone_number: formData.phoneNumber,
            zalo_phone: formData.zaloPhoneNumber,
            link_facebook: formData.facebookLink,
            current_education_level: formData.userType,
            other_education_level_description: formData.otherUserType,
            high_school_name: formData.highSchoolName,
            city: formData.city,
            source: formData.infoSources,
            other_source_description: formData.otherInfoSource,
            registration_date: now.toLocaleString(),
            interested_courses_details: `${courseName}___${className}`,
            notification_consent: formData.notificationConsent,
            other_notification_consent_description:
              formData.otherNotificationConsent,
          }),
        }
      );

      const result = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(result?.error || 'Lỗi khi gửi dữ liệu');
      }

      console.log('Phản hồi từ server:', result);
      setShow({
        visible: true,
        message: '✅ Đã đăng ký thành công',
        errors: true,
      });
    } catch (err) {
      console.error('Đăng ký thất bại:', err);
      setShow({
        visible: true,
        message: '❌ Gửi đăng ký thất bại. Vui lòng thử lại sau!',
        errors: false,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 "
    >
      <AlertButton
        visible={show.visible}
        message={show.message}
        isError={show.errors}
      />
      <h2 className="text-3xl font-bold mb-4">
        📝 Đăng ký tư vấn chương trình đào tạo
      </h2>
      {/* I. Thông tin cá nhân */}
      <fieldset className="border p-4 rounded">
        <legend className="font-semibold mb-2">I. Thông tin cá nhân</legend>
        {/* Email đăng ký */}
        <div>
          <label htmlFor="email" className="block font-semibold">
            Email đăng ký: <span className="text-red-600">(Bắt buộc)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        {/* Họ và tên */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block font-medium">
            Họ và tên: <span className="text-red-600">(Bắt buộc)</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Ngày tháng năm sinh */}
        <div className="mb-4">
          <label htmlFor="dob" className="block font-medium">
            Ngày tháng năm sinh:{' '}
            <span className="text-red-600">(Bắt buộc)</span>
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.dob ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dob && (
            <p className="text-red-600 text-sm mt-1">{errors.dob}</p>
          )}
        </div>

        {/* Giới tính */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Giới tính:</label>
          <div className="flex space-x-6">
            {['Nam', 'Nữ', 'Khác'].map((genderOption) => (
              <label
                key={genderOption}
                className="inline-flex items-center space-x-2"
              >
                <input
                  type="radio"
                  name="gender"
                  value={genderOption}
                  checked={formData.gender === genderOption}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span>{genderOption}</span>
              </label>
            ))}
          </div>
          {/* {errors.gender && (
            <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
          )} */}
        </div>

        {/* Số điện thoại thường dùng */}
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block font-medium">
            Số điện thoại thường dùng:{' '}
            <span className="text-red-600">(Bắt buộc)</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phoneNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Số điện thoại Zalo */}
        <div className="mb-4">
          <label htmlFor="zaloPhoneNumber" className="block font-medium">
            Số điện thoại sử dụng Zalo (nếu khác):
          </label>
          <input
            type="tel"
            id="zaloPhoneNumber"
            name="zaloPhoneNumber"
            value={formData.zaloPhoneNumber}
            onChange={handleChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.zaloPhoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.zaloPhoneNumber && (
            <p className="text-red-600 text-sm mt-1">
              {errors.zaloPhoneNumber}
            </p>
          )}
        </div>

        {/* Facebook link */}
        <div className="mb-4">
          <label htmlFor="facebookLink" className="block font-medium">
            Link Facebook đang sử dụng:
          </label>
          <input
            type="url"
            id="facebookLink"
            name="facebookLink"
            value={formData.facebookLink}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded border-gray-300"
          />
        </div>

        {/* Bạn là */}
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Bạn là: <span className="text-red-600">(Bắt buộc)</span>
          </label>

          <div
            className={`space-y-2 space-x-3 border rounded max-w-120 p-2 pl-3 pb-1 ${
              errors.userType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {['Học sinh THPT', 'Sinh viên', 'Người đi làm', 'Mục khác'].map(
              (option) => (
                <label
                  key={option}
                  className="inline-flex items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="userType"
                    value={option}
                    checked={formData.userType === option}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              )
            )}
          </div>
          {formData.userType === 'Mục khác' && (
            <input
              type="text"
              name="otherUserType"
              value={formData.otherUserType}
              onChange={handleChange}
              placeholder="Ghi rõ"
              className={`mt-2 w-full p-2 border rounded ${
                errors.otherUserType ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
          {errors.userType && (
            <p className="text-red-600 text-sm mt-1">{errors.userType}</p>
          )}
          {errors.otherUserType && (
            <p className="text-red-600 text-sm mt-1">{errors.otherUserType}</p>
          )}
        </div>
      </fieldset>
      {/* II. Thông tin học tập */}
      <fieldset className="border p-4 rounded">
        <legend className="font-semibold mb-2">II. Thông tin học tập</legend>

        {/* Trường đang học */}
        <div className="mb-4">
          <label htmlFor="highSchoolName" className="block font-medium">
            Tên trường đang học (nếu là học sinh/sinh viên):
          </label>
          <input
            type="text"
            id="highSchoolName"
            name="highSchoolName"
            value={formData.highSchoolName}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded border-gray-300"
          />
        </div>

        {/* Tỉnh/thành phố */}
        <div className="mb-4">
          <label htmlFor="city" className="block font-medium">
            Tỉnh / Thành phố bạn đang sinh sống:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded border-gray-300"
          />
        </div>
      </fieldset>
      {/* IV. Bạn biết thông tin qua kênh nào */}
      <fieldset className="border p-4 rounded">
        <legend className="font-semibold mb-2">
          III. Bạn biết thông tin qua kênh nào?{' '}
          <span className="text-red-600">(Bắt buộc)</span>
        </legend>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded ${
            errors.infoSources ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {infoSourcesOptions.map((source) => (
            <label key={source} className="inline-flex items-center space-x-2">
              <input
                type="radio"
                name="infoSources"
                value={source}
                checked={formData.infoSources === source}
                onChange={handleChange}
                className="form-radio"
              />
              <span>{source}</span>
            </label>
          ))}
        </div>
        {errors.infoSources && (
          <p className="text-red-600 text-sm mt-1">{errors.infoSources}</p>
        )}
        {/* Nếu chọn 'Khác' thì hiển thị input nhập thêm */}
        {formData.infoSources === 'Khác' && (
          <input
            type="text"
            name="otherInfoSource"
            value={formData.otherInfoSource}
            onChange={handleChange}
            placeholder="Vui lòng ghi rõ nguồn khác"
            className={`mt-2 w-full p-2 border rounded ${
              errors.otherInfoSource ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}
        {errors.otherInfoSource && (
          <p className="text-red-600 text-sm mt-1">{errors.otherInfoSource}</p>
        )}
      </fieldset>
      {/* V. Đồng ý nhận thông báo */}
      <fieldset
        className={`border p-4 rounded ${
          errors.notificationConsent ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <legend className="font-semibold mb-2">
          IV. Đồng ý nhận thông báo từ CUSC qua email hoặc số điện thoại{' '}
          <span className="text-red-600">(Bắt buộc)</span>
        </legend>
        <div className="space-y-2 space-x-10">
          {['Đồng ý', 'Khác'].map((option) => (
            <label key={option} className="inline-flex items-center space-x-2">
              <input
                type="radio"
                name="notificationConsent"
                value={option}
                checked={formData.notificationConsent === option}
                onChange={handleChange}
                className="form-radio"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>

        {formData.notificationConsent === 'Khác' && (
          <input
            type="text"
            name="otherNotificationConsent"
            value={formData.otherNotificationConsent}
            onChange={handleChange}
            placeholder="Vui lòng ghi rõ"
            className={`mt-2 w-full p-2 border rounded ${
              errors.otherNotificationConsent
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
        )}
        {errors.otherNotificationConsent && (
          <p className="text-red-600 text-sm mt-1">
            {errors.otherNotificationConsent}
          </p>
        )}
        {errors.notificationConsent && (
          <p className="text-red-600 text-sm mt-1">
            {errors.notificationConsent}
          </p>
        )}
      </fieldset>

      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Đăng ký
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
