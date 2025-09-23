'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DataTable as HistoryDataTable } from '@/components/data-table-history';
import {
  ConsultationHistory,
  consultingApiResponseSchemaHistory,
  Metadata,
} from '@/lib/schema/consulting-data-history';
import { useConsultingHistoryList } from '@/hooks/useConsulting';

export default function Page() {
  const [historyPage, setHistoryPage] = React.useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = React.useState(10);

  const {
    data: historyDataResponse,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useConsultingHistoryList(historyPage, historyItemsPerPage);

  React.useEffect(() => {
    console.log(
      `page.tsx: HISTORY HOOK STATUS - isHistoryLoading: ${isHistoryLoading}, isHistoryError: ${isHistoryError}`
    );
    if (historyError) {
      console.error('page.tsx: HOOK ERROR (History):', historyError);
    }
  }, [isHistoryLoading, isHistoryError, historyError]);

  // Process history data
  const { historyInformation, metadata } = React.useMemo(() => {
    if (!historyDataResponse) {
      return {
        historyInformation: [],
        metadata: {
          totalRecords: 0,
          firstPage: 1,
          lastPage: 1,
          page: 1,
          limit: 10,
        },
      };
    }

    try {
      const parsed =
        consultingApiResponseSchemaHistory.parse(historyDataResponse);
      return {
        historyInformation: parsed.data.consultationHistory, // Make sure this matches
        metadata: parsed.data.metadata,
      };
    } catch (error) {
      console.error('Validation failed:', error);

      // Fallback: Try to extract data directly
      if (historyDataResponse.data?.consultationHistory) {
        console.warn('Using fallback data extraction');
        return {
          historyInformation: historyDataResponse.data.consultationHistory,
          metadata: historyDataResponse.data.metadata || {
            totalRecords: historyDataResponse.data.consultationHistory.length,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 10,
          },
        };
      }

      return {
        historyInformation: [],
        metadata: {
          totalRecords: 0,
          firstPage: 1,
          lastPage: 1,
          page: 1,
          limit: 10,
        },
      };
    }
  }, [historyDataResponse]);

  React.useEffect(() => {
    console.log(
      'page.tsx: DATA FOR HISTORY DATATABLE - historyInformation length:',
      historyInformation.length
    );
    console.log('page.tsx: DATA FOR HISTORY DATATABLE - metadata:', metadata);
  }, [historyInformation, metadata]);

  const onHistoryPageChange = (page: number) => {
    console.log(`page.tsx: History page change requested to page: ${page}`);
    setHistoryPage(page);
  };

  const onHistoryItemsPerPageChange = (limit: number) => {
    console.log(
      `page.tsx: History items per page change requested to limit: ${limit}`
    );
    setHistoryItemsPerPage(limit);
    setHistoryPage(1);
  };

  if (isHistoryLoading) {
    console.log('page.tsx: Displaying initial loading state...');
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

  if (isHistoryError) {
    console.error('page.tsx: Displaying initial error state.');
    return (
      <div>
        Có lỗi xảy ra khi tải lịch sử tư vấn:{' '}
        {historyError instanceof Error
          ? historyError.message
          : 'Không thể tải dữ liệu.'}
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
              <h2 className="text-2xl font-bold mt-8 px-4 lg:px-6">
                Lịch sử tư vấn
              </h2>
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="ml-3 text-gray-600">
                    Đang tải lịch sử tư vấn...
                  </p>
                </div>
              ) : (
                <HistoryDataTable
                  data={historyInformation.map((item: any) => ({
                    student_name: item.student_name,
                    consultation_session_id: item.consultation_session_id,
                    session_date: item.session_date,
                    duration_minutes: item.duration_minutes ?? null,
                    session_type: item.session_type,
                    session_status: item.session_status,
                    session_notes: item.session_notes ?? null,
                    counselor_name: item.counselor_name,
                    counseler_email: item.counseler_email,
                    student_email: item.student_email ?? null,
                    student_phone_number: item.student_phone_number,
                  }))}
                  metadata={metadata}
                  onPageChange={onHistoryPageChange}
                  onItemsPerPageChange={onHistoryItemsPerPageChange}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
