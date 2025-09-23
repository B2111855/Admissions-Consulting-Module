// src/app/page.tsx

'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { DataTable } from '@/components/register';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAllConsultingList } from '@/hooks/useConsulting'; // Correct path to your hook
import { useState } from 'react';

export default function Page() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Call the hook.
  // The 'data' object here is the result from useQuery,
  // which contains status, data (nested), isLoading, etc.
  const { data, isLoading, isError, error, isFetching } = useAllConsultingList(
    page,
    limit
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        <p>Lỗi khi tải dữ liệu: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  // Safely access the nested 'consultingInformation' and 'metadata' properties
  // from the 'data' object returned by useQuery.
  // Use optional chaining (`?.`) and nullish coalescing (`||`) for safety.
  const tableData = data?.data?.consultingInformation || [];

  // CORRECTED: Use the correct metadata schema from your API for the fallback object.
  const meta = data?.data?.metadata || {
    totalRecords: 0,
    firstPage: 1,
    lastPage: 1,
    page: 1,
    limit: 10,
  };

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTable
                data={tableData} // Pass the correctly accessed data
                isFetching={isFetching}
                pagination={{
                  pageIndex: page - 1,
                  pageSize: limit,
                }}
                meta={meta}
                onPaginationChange={(newPageIndex: any, newPageSize: any) => {
                  setPage(newPageIndex + 1);
                  setLimit(newPageSize);
                }}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
