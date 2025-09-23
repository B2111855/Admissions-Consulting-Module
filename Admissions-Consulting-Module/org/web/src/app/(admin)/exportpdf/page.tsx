'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DataTable as UsersTable } from '@/components/data-pdf'; // Đảm bảo import đúng component
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
import { create } from 'lodash';

// --- SCHEMA ---
const userSchema = z.object({
  id: z.number(),
  id_student: z.number(),
  full_name: z.string(),
  email: z.string().email(),
  name_course: z.string(),
  enrollment_date: z.string().optional(),
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
function useUsersList(
  page: number,
  limit: number,
  filter: { fromDate?: string; toDate?: string },
  refreshKey = 0
) {
  const [data, setData] = React.useState<{ data: any[]; metadata: any } | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('⚠️ Chưa có access token trong localStorage');
      return;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter.fromDate ? { fromDate: filter.fromDate } : {}),
      ...(filter.toDate ? { toDate: filter.toDate } : {}),
    });

    fetch(`http://localhost:3000/api/data/ExportData?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`, // 👈 cần dòng này
        'Content-Type': 'application/json',
      },
    })
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
  }, [page, limit, filter, refreshKey]);

  return { data, isLoading, isError, error };
}

// --- COMPONENT ---
export default function Page() {
  const [usersPage, setUsersPage] = React.useState(1);
  const [usersItemsPerPage, setUsersItemsPerPage] = React.useState(10);
  const [openSheet, setOpenSheet] = React.useState(false);
  const [filter, setFilter] = React.useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  const {
    data: usersDataResponse,
    isLoading,
    isError,
    error,
  } = useUsersList(usersPage, usersItemsPerPage, filter);

  const [dateFilter, setDateFilter] = React.useState<{
    from?: string;
    to?: string;
  }>({});

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

  //   const handleCreateUser = async () => {
  //     try {
  //       const { email, password, full_name, user_type, program_type } = newUser;

  //       if (
  //         [email, password, full_name, user_type, program_type].some(
  //           (val) => val.trim() === ''
  //         )
  //       ) {
  //         setisErrorAlert(true);
  //       }
  //       {
  //         const userData = {
  //           email: email,
  //           password: password,
  //           full_name: full_name,
  //           user_type: user_type,
  //           is_main_consultant: true, // hoặc gán theo điều kiện
  //           kpi_group_id: 101, // hoặc lấy từ state
  //           employment_date: new Date().toISOString().slice(0, 10), // ví dụ: "2025-07-17"
  //           status: 'active',
  //           program_type: program_type,
  //         };

  //         const response = await fetch(
  //           'http://localhost:3000/api/auth/register',
  //           {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(userData),
  //           }
  //         );
  //         if (!response.ok) {
  //           const error = await response.json();
  //           throw new Error(error.message || 'Đã xảy ra lỗi');
  //         }

  //         // const result = await response.json();
  //       }

  //       setOpenSheet(false);
  //       setIsSuccess(true);
  //       setTimeout(() => setIsSuccess(false), 2000);
  //       setTimeout(() => setisErrorAlert(false), 2000);
  //     } catch (error: any) {
  //       console.error('Create user failed:', error);
  //     }
  //   };
  const [fromDate, setFromDate] = React.useState<string>();
  const [toDate, setToDate] = React.useState<string>();
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
              <div className="flex flex-col gap-2 px-4 lg:px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
                </div>
                <div className="flex justify-end">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="from">Từ ngày</Label>
                    <Input
                      id="from"
                      type="date"
                      value={filter.fromDate || ''}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          fromDate: e.target.value,
                        }))
                      }
                      className="w-[160px]"
                    />
                    <Label htmlFor="to">Đến ngày</Label>
                    <Input
                      id="to"
                      type="date"
                      value={filter.toDate || ''}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          toDate: e.target.value,
                        }))
                      }
                      className="w-[160px]"
                    />
                  </div>
                </div>
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
