let users: { id: number; full_name: string }[] = [];

/**
 * Lưu danh sách người dùng vào biến toàn cục.
 */
export const setUsers = (newUsers: { id: number; full_name: string }[]) => {
  users = newUsers;
};

/**
 * Lấy danh sách người dùng đã lưu.
 */
export const getUsers = (): { id: number; full_name: string }[] => {
  return users;
};

/**
 * Gọi API và lưu dữ liệu vào biến toàn cục ngay khi file được import.
 */
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/data/DataUser');
    const json = await res.json();
    const userList: { id: number; full_name: string }[] =
      json?.data?.alluser || [];

    setUsers(userList);
  } catch (error) {
    console.error('❌ Lỗi fetch users:', error);
  }
})();
