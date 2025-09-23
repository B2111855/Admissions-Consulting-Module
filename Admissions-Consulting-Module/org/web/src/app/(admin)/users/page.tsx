'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DataTable as UsersTable } from '@/components/users-table'; // Đảm bảo import đúng component
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2Icon } from 'lucide-react';

// --- SCHEMA ---
const userSchema = z.object({
  id: z.number(), // <- thêm dòng này
  email: z.string().email(),
  full_name: z.string(),
  user_type: z.enum(['admin', 'counselor', 'manager']),
  employment_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  program_type: z.enum(['Aptech', 'Arena', 'Short_term___Steam']).optional(),
});

const metadataSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

const usersApiResponseSchema = z.object({
  data: z.array(userSchema),
  metadata: metadataSchema,
});

// --- CUSTOM HOOK ---
function useUsersList(page: number, limit: number, refreshKey = 0) {
  const [data, setData] = React.useState<{ data: any[]; metadata: any } | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    fetch(
      `http://localhost:3000/api/data/UsersPage?page=${page}&limit=${limit}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Không thể lấy dữ liệu');
        }
        return res.json();
      })
      .then((json) => {
        setData(json.data); // chú ý: nếu API trả theo format `{ status: 'success', data: { data: [...], metadata: {...} } }`
      })
      .catch((err) => {
        setIsError(true);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, limit, refreshKey]);

  return { data, isLoading, isError, error };
}

export function translateUserType(userType: string): string {
  switch (userType) {
    case 'admin':
      return 'Quản trị viên';
    case 'counselor':
      return 'Tư vấn viên';
    case 'manager':
      return 'Quản lý';
    default:
      return 'Không xác định';
  }
}

// --- COMPONENT ---
export default function Page() {
  const [usersPage, setUsersPage] = React.useState(1);
  const [usersItemsPerPage, setUsersItemsPerPage] = React.useState(10);
  const [openSheet, setOpenSheet] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    email: '',
    password: '',
    full_name: '',
    user_type: '',
    program_type: '',
  });

  const {
    data: usersDataResponse,
    isLoading,
    isError,
    error,
  } = useUsersList(usersPage, usersItemsPerPage);

  const { users, metadata } = React.useMemo(() => {
    if (!usersDataResponse) {
      return {
        users: [],
        metadata: { page: 1, limit: 10, total: 0 },
      };
    }

    try {
      const parsed = usersApiResponseSchema.parse(usersDataResponse);
      return { users: parsed.data, metadata: parsed.metadata };
    } catch (e) {
      console.error('Validation failed:', e);
      return {
        users: usersDataResponse.data || [],
        metadata: usersDataResponse.metadata || {
          page: 1,
          limit: 10,
          total: 0,
        },
      };
    }
  }, [usersDataResponse]);

  const onUsersPageChange = (page: number) => setUsersPage(page);
  const onUsersItemsPerPageChange = (limit: number) => {
    setUsersItemsPerPage(limit);
    setUsersPage(1);
  };
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isErrorAlert, setisErrorAlert] = React.useState(false);

  const handleCreateUser = async () => {
    try {
      const { email, password, full_name, user_type, program_type } = newUser;

      if (
        [email, password, full_name, user_type, program_type].some(
          (val) => val.trim() === ''
        )
      ) {
        setisErrorAlert(true);
      }
      {
        const userData = {
          email: email,
          password: password,
          full_name: full_name,
          user_type: user_type,
          is_main_consultant: true, // hoặc gán theo điều kiện
          kpi_group_id: 101, // hoặc lấy từ state
          employment_date: new Date().toISOString().slice(0, 10), // ví dụ: "2025-07-17"
          status: 'active',
          program_type: program_type,
        };

        const response = await fetch(
          'http://localhost:3000/api/auth/register',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Đã xảy ra lỗi');
        }

        // const result = await response.json();
      }

      setOpenSheet(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      setTimeout(() => setisErrorAlert(false), 2000);

      window.location.reload();
    } catch (error: any) {
      console.error('Create user failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-gray-700">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        Có lỗi xảy ra khi tải danh sách người dùng:{' '}
        {error instanceof Error ? error.message : 'Không thể tải dữ liệu.'}
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col relative">
          <div className="flex flex-1 flex-col gap-2 @container/main">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex justify-between items-center mt-8 px-4 lg:px-6">
                <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
                <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                  <SheetTrigger asChild>
                    <Button variant="default">+ Thêm tài khoản</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px]">
                    <SheetHeader>
                      <SheetTitle className="text-2xl font-bold">
                        Thêm tài khoản mới
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-5 px-5">
                      {' '}
                      {/* Padding trái phải */}
                      {/* Email */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          className="w-full"
                        />
                      </div>
                      {/* Mật khẩu */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Mật khẩu</Label>
                        <Input
                          type="password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          className="w-full"
                        />
                      </div>
                      {/* Họ và tên */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Họ và tên</Label>
                        <Input
                          value={newUser.full_name}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              full_name: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      {/* Loại người dùng */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Loại tài khoản
                        </Label>
                        <select
                          className="w-full border px-3 py-2 rounded-md"
                          value={newUser.user_type}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              user_type: e.target.value,
                            })
                          }
                        >
                          <option value="">Chọn loại tài khoản</option>

                          <option value="counselor">
                            {translateUserType('counselor')}
                          </option>
                          <option value="manager">
                            {translateUserType('manager')}
                          </option>
                          {/* <option value="admin">
                            {translateUserType('admin')}
                          </option> */}
                        </select>
                      </div>
                      {/* Chương trình */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Chương trình
                        </Label>
                        <select
                          className="w-full border px-3 py-2 rounded-md"
                          value={newUser.program_type}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              program_type: e.target.value,
                            })
                          }
                        >
                          <option value="">Chọn chương trình</option>
                          <option value="Aptech">Aptech</option>
                          <option value="Arena">Arena</option>
                          <option value="Short_term___Steam">
                            {' '}
                            Short term + Steam
                          </option>
                        </select>
                      </div>
                      {/* Nút lưu */}
                      <Button
                        className="w-full mt-4"
                        onClick={handleCreateUser}
                      >
                        Lưu tài khoản
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <UsersTable
                data={users}
                metadata={metadata}
                onPageChange={onUsersPageChange}
                onItemsPerPageChange={onUsersItemsPerPageChange}
              />
              {isErrorAlert && (
                <Alert
                  variant="destructive"
                  className="fixed top-4 right-4 w-[350px] z-50"
                >
                  <AlertTitle className="text-red-600">
                    Thay đổi chưa được lưu
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    Có lỗi xảy ra trong quá trình lưu. Vui lòng kiểm tra lại dữ
                    liệu và thử lại.
                  </AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert className="fixed top-4 right-4 w-[350px] z-50">
                  <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                  <AlertTitle>Thành công!</AlertTitle>
                  <AlertDescription>
                    Thay đổi của bạn đã được lưu thành công.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
