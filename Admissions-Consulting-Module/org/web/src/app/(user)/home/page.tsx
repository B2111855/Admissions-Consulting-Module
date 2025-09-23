'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { fetchCourseCategories, CourseCategory } from './data';
import ChatWidget from '@/components/chatbox';

export default function AboutPage() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [data, setData] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchCourseCategories();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleCourse = (id: string) => {
    setOpenCourseId(openCourseId === id ? null : id);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto border-gray-400">
        <div className="container mx-auto p-2 space-y-1">
          <button
            className="sm:hidden fixed top-4 border left-4 z-50 bg-gray-100 text-black p-2 rounded"
            onClick={toggleMenu}
          >
            ☰ Menu
          </button>

          <nav
            className={`${
              isOpen ? 'block' : 'hidden'
            } flex flex-col fixed top-0 gap-5 sm:px-4 sm:gap-3 pt-20 h-full w-64 bg-white p-6 z-40 shadow-lg text-lg sm:inline-flex sm:fixed sm:h-8 sm:flex-row sm:static sm:top-0 sm:w-auto sm:border-2 sm:border-gray-400 sm:rounded-bl-xl sm:rounded-br-xl sm:bg-gray-100 sm:text-gray-800 sm:z-50 sm:shadow-lg sm:p-0`}
          >
            <a
              href="https://aptechcantho.cusc.vn/"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Trang chủ
            </a>
            <a
              href="https://aptechcantho.cusc.vn/Default.aspx?tabid=121"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Giới thiệu
            </a>
            <a
              href="https://aptechcantho.cusc.vn/Default.aspx?tabid=191"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Liên hệ
            </a>
            <a
              href="https://aptechcantho.cusc.vn/cusctour/"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Tham quan CUSC
            </a>
            <a
              href="https://aptechcantho.cusc.vn/Default.aspx?tabid=191&ctl=Login&returnurl=%2fDefault.aspx%3ftabid%3d191"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Đăng nhập
            </a>
          </nav>

          <section className="flex items-center gap-10 bg-aqua mb-3 p-7 border border-gray-400 rounded-md max-w-4xl mx-auto justify-between">
            <img src="logo-ctu.png" alt="Logo" className="h-32" />
            <div className="text-center flex-1 hidden sm:block">
              <p className="text-blue-700 font-semibold text-2xl pb-3">
                TRUNG TÂM CÔNG NGHỆ PHẦN MỀM ĐẠI HỌC CẦN THƠ
              </p>
              <p className="text-brown-600 text-lg">TƯ VẤN TUYỂN SINH</p>
            </div>
            <img src="logoCUSC.png" alt="Logo" className="h-32" />
          </section>

          <section className="bg-gradient-to-r from-blue-200 via-blue-200 to-blue-200 pt-6 pr-6 pl-6 rounded-t-lg shadow-lg text-black font-semibold border border-gray-400 text-lg">
            <div>
              Trung tâm CUSC – Đào tạo CNTT chất lượng cao & tư vấn tuyển sinh
              <div>
                Trung tâm hoạt động từ <strong>thứ Hai</strong> đến{' '}
                <strong>thứ Sáu</strong>:
              </div>
              <ul className="list-disc list-inside mt-2 mb-2 pl-8">
                <li>
                  Buổi sáng: từ <strong>7h00</strong> đến <strong>11h00</strong>
                </li>
                <li>
                  Buổi chiều: từ <strong>13h00</strong> đến{' '}
                  <strong>17h00</strong>
                </li>
              </ul>
              <p className="mt-3 text-lg text-blue-900 font-bold pb-5">
                Chọn ngay khóa học mình muốn để được tư vấn tốt nhất!
              </p>
            </div>
          </section>

          <section className="max-w-4xl mx-auto divide-y border rounded-md bg-gray-200 shadow-sm ">
            {data.map((category) => (
              <div key={category.id}>
                <details className="group">
                  <summary className="cursor-pointer bg-gray-200 hover:bg-blue-200 px-6 py-3 font-semibold text-base sm:text-lg text-black transition rounded-t ">
                    {category.name}
                  </summary>

                  <div className="bg-blue-50 px-4 py-4 space-y-4">
                    {category.courses && category.courses.length > 0 ? (
                      category.courses.map((course) => {
                        const courseIdStr = String(course.id);
                        const isOpen = openCourseId === courseIdStr;

                        return (
                          <div
                            key={course.id}
                            className={`rounded-md shadow-sm transition-all border-l-4 ${
                              isOpen
                                ? 'border-blue-700 bg-blue-100'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <button
                              onClick={() => toggleCourse(courseIdStr)}
                              className={`w-full text-left font-medium px-4 py-3 flex items-center justify-between transition ${
                                isOpen ? 'text-black' : 'text-gray-800'
                              } hover:text-blue-600`}
                            >
                              <span>{course.name}</span>
                              <span
                                className={`transform transition-transform ${
                                  isOpen ? 'rotate-90' : ''
                                }`}
                              ></span>
                            </button>

                            {isOpen && (
                              <div className="px-6 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                  {/* Nội dung bên trái */}
                                  <div className="space-y-2 text-sm text-gray-700">
                                    <p>
                                      <strong>Hệ:</strong> {course.program_type}
                                    </p>
                                    {course.duration && (
                                      <p>
                                        <strong>Thời lượng:</strong>{' '}
                                        {course.duration}
                                      </p>
                                    )}
                                    <p>
                                      <strong>Mô tả:</strong>{' '}
                                      {course.description}
                                    </p>
                                  </div>

                                  {/* Nút bên phải */}
                                  <div className="mt-3 sm:mt-0 shrink-0">
                                    <button
                                      className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition"
                                      onClick={() => {
                                        sessionStorage.setItem(
                                          'fromHome',
                                          'true'
                                        );
                                        localStorage.setItem(
                                          'formData',
                                          JSON.stringify({
                                            courseName: course.name,
                                          })
                                        );
                                        router.replace('/form');
                                      }}
                                    >
                                      Đăng ký tư vấn
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="italic text-gray-500">
                        Chưa có khóa học nào.
                      </p>
                    )}
                  </div>
                </details>
                <div className="text-center">
                  <div className="w-200 h-1 border-b border-gray-500 mx-auto mt-1"></div>
                </div>
              </div>
            ))}
          </section>

          <section className="max-w-4xl border mx-auto rounded-b-md border-gray-400 bg-gradient-to-r from-blue-200 via-blue-200 to-blue-200">
            <footer className="mb-3 w-full p-6 flex flex-col sm:flex-row gap-6 sm:space-x-16 text-gray-600 text-sm">
              <div className="bg-gray-200 p-4 rounded-md shadow-sm max-w-full sm:max-w-xs flex-shrink-0">
                <p className="font-semibold text-gray-800 mb-2">
                  Trung tâm Công nghệ phần mềm <br /> Đại học Cần Thơ
                </p>
                <p>Địa chỉ: 01 Lý Tự Trọng, Quận Ninh Kiều, TP. Cần Thơ</p>
                <p className="mt-2">Fax: +84 292 373 1071</p>
                <p>
                  Email:{' '}
                  <a href="mailto:cusc@ctu.edu.vn" className="underline">
                    cusc@ctu.edu.vn
                  </a>
                </p>
                <p>Điện thoại: +84 292 383 5581</p>
                <p>Hotline: 0901990665 0911204994</p>
              </div>

              <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm text-gray-600 flex-1 hidden sm:block pl-10">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Tuyển sinh
                  </h3>
                  <ul className="space-y-1">
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Lịch tuyển sinh
                    </li>
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Ghi danh trực tuyến
                    </li>
                    <li className="before:content-['└──'] before:mr-2 before:text-gray-400">
                      Câu hỏi thường gặp
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 ">
                    Chương trình đào tạo
                  </h3>
                  <ul className="space-y-1 max-w-xs">
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Lập trình viên quốc tế
                    </li>
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Quản trị mạng cao cấp
                    </li>
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Quản trị mạng i10
                    </li>
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Phát triển ứng dụng Web với JAVA EE
                    </li>
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Phát triển ứng dụng Web với ASP.Net MVC
                    </li>
                    <li className="before:content-['├──'] before:mr-2 before:text-gray-400">
                      Thiết kế Web chuyên nghiệp
                    </li>
                    <li className="before:content-['└──'] before:mr-2 before:text-gray-400">
                      Hacker mũ trắng
                    </li>
                  </ul>
                </div>
              </div>
            </footer>
          </section>
        </div>
      </div>
      <div>
        <ChatWidget />
      </div>
    </div>
  );
}
