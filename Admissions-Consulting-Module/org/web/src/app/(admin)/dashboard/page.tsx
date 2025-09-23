'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  consultingApiResponseSchema,
  ConsultingTableRow,
  Metadata,
} from '@/lib/schema/consulting-data-schema';

import {
  useConsultingList,
  useSearchConsultingList,
} from '@/hooks/useConsulting';
import { useUpdateConsulting } from '@/hooks/useUpdate';

import { useQueryClient } from '@tanstack/react-query';

export default function Page() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isRefetching, setIsRefetching] = React.useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching, refetch } = searchTerm
    ? (console.log(
        `page.tsx: LOGIC activated: Using useSearchConsultingList for term "${searchTerm}" (page: ${currentPage}, limit: ${itemsPerPage})`
      ),
      useSearchConsultingList(searchTerm, currentPage, itemsPerPage))
    : (console.log(
        `page.tsx: LOGIC activated: Using useConsultingList (page: ${currentPage}, limit: ${itemsPerPage})`
      ),
      useConsultingList(currentPage, itemsPerPage));

  const updateConsultingMutation = useUpdateConsulting({
    onSuccess: async (updatedData) => {
      console.log('page.tsx: Update successful:', updatedData);

      try {
        console.log('page.tsx: Waiting 5 seconds before showing spinner...');
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setIsRefetching(true);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['consulting-list'] }),
          queryClient.invalidateQueries({ queryKey: ['consulting-search'] }),
          queryClient.invalidateQueries({ queryKey: ['kpi'] }), 
        ]);

        await refetch();

        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log('page.tsx: Refetch completed successfully');
      } catch (error) {
        console.error('page.tsx: Refetch error:', error);
      } finally {
        setIsRefetching(false);
      }
    },
    onError: (error) => {
      console.error('page.tsx: Update failed:', error);
      setIsRefetching(false);
    },
  });

  React.useEffect(() => {
    console.log(
      `page.tsx: HOOK STATUS - isLoading: ${isLoading}, isFetching: ${isFetching}, isError: ${isError}, isRefetching: ${isRefetching}`
    );
    if (error) {
      console.error('page.tsx: HOOK ERROR:', error);
    }
  }, [isLoading, isFetching, isError, error, isRefetching]);

  const typedData = React.useMemo(() => {
    if (data) {
      console.log('page.tsx: RAW DATA from API (from hook):', data);

      try {
        const parsedResponse = consultingApiResponseSchema.parse(data);
        console.log(
          'page.tsx: PARSED DATA - consultingInformation:',
          parsedResponse.data.consultingInformation
        );
        console.log(
          'page.tsx: PARSED DATA - metadata:',
          parsedResponse.data.metadata
        );
        return {
          consultingInformation: parsedResponse.data.consultingInformation,
          metadata: parsedResponse.data.metadata,
        };
      } catch (e) {
        console.error(
          'page.tsx: ERROR parsing API response with Zod schema:',
          e
        );
        return {
          consultingInformation: [],
          metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 10,
          },
        };
      }
    }
    console.log('page.tsx: Data is not available yet or is null.');
    return {
      consultingInformation: [],
      metadata: {
        totalRecords: 0,
        firstPage: 1,
        lastPage: 1,
        page: 1,
        limit: 10,
      },
    };
  }, [data]);

  const consultingData: ConsultingTableRow[] = typedData.consultingInformation;
  const metadata: Metadata = typedData.metadata;

  React.useEffect(() => {
    console.log(
      'page.tsx: DATA FOR DATATABLE - consultingData length:',
      consultingData.length
    );
    console.log('page.tsx: DATA FOR DATATABLE - metadata:', metadata);
  }, [consultingData, metadata]);

  const onPageChange = (page: number) => {
    console.log(`page.tsx: Page change requested to page: ${page}`);
    setCurrentPage(page);
  };

  const onItemsPerPageChange = (limit: number) => {
    console.log(`page.tsx: Items per page change requested to limit: ${limit}`);
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleSearch = React.useCallback((searchTermValue: string) => {
    console.log(
      'page.tsx: handleSearch CALLED - updating searchTerm to:',
      searchTermValue
    );
    setSearchTerm(searchTermValue);
    setCurrentPage(1);
  }, []);

  const handleUpdateConsulting = React.useCallback(
    async (studentId: number, updateData: Partial<ConsultingTableRow>) => {
      console.log(
        'page.tsx: handleUpdateConsulting CALLED - studentId:',
        studentId,
        'updateData:',
        updateData
      );

      try {
        const validatedData = {
          student_id: studentId,
          ...updateData,
        };

        await updateConsultingMutation.mutateAsync({
          studentId,
          updateData: validatedData,
        });

        console.log('page.tsx: Update completed successfully');
      } catch (error) {
        console.error('page.tsx: Update error:', error);
      }
    },
    [updateConsultingMutation]
  );

  if (isLoading) {
    console.log('page.tsx: Displaying loading state...');
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
    console.error('page.tsx: Displaying error state:', error);
    return (
      <div>Có lỗi xảy ra: {error?.message || 'Không thể tải dữ liệu.'}</div>
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
          {isRefetching && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm font-medium text-gray-700">
                  Đang cập nhật danh sách...
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-2 @container/main">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                refetch={() => {
                  queryClient.invalidateQueries({ queryKey: ['kpi'] });
                }}
              />
              <DataTable
                data={consultingData}
                metadata={metadata}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
                onSearch={handleSearch}
                onUpdate={handleUpdateConsulting}
                currentSearchTerm={searchTerm}
                isSearching={isFetching}
                isUpdating={updateConsultingMutation.isPending}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
