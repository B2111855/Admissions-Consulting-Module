// coursesStore.ts
let courses: string[] = [];

export const setCourses = (newCourses: string[]) => {
  courses = newCourses;
};

export const getCourses = (): string[] => {
  return courses;
};

// Gọi API và lưu dữ liệu vào biến toàn cục ngay khi file được import
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/data/DataCourse');
    const json = await res.json();
    const courseNames: string[] = json?.data?.courseNames || [];

    setCourses(courseNames);
  } catch (error) {
    console.error('❌ Lỗi fetch courses:', error);
  }
})();
