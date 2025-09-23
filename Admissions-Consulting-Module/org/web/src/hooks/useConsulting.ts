import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { consultingService } from '../services/consulting.service';
import {
  ConsultingApiResponse,
  consultingApiResponseSchema,
} from '@/lib/schema/consulting-data-schema';
import { consultingApiResponseSchemaHistory } from '@/lib/schema/consulting-data-history';

export const useConsultingList = (
  page: number = 1,
  limit: number = 10,
  counselorId?: number
) => {
  return useQuery({
    queryKey: ['consultingList', counselorId, page, limit],
    queryFn: async () => {
      const response =
        await consultingService.getConsultingInformationByConselorId(
          counselorId,
          page,
          limit
        );
      const parsedResponse = consultingApiResponseSchema.parse(response);
      return parsedResponse;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useAllConsultingList = (page: number = 1, limit: number = 10) => {
  return useQuery<ConsultingApiResponse, Error>({
    queryKey: ['allConsultingList', page, limit],
    queryFn: async () => {
      console.log(
        `useAllConsultingList: Fetching data for page ${page}, limit ${limit}`
      );

      const response = await consultingService.getConsultingInformation(
        page,
        limit
      );
      const parsedResponse = consultingApiResponseSchema.parse(response);

      return parsedResponse;
    },

    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchConsultingList = (
  name: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['consultingSearch', name, page, limit],
    queryFn: async () => {
      const response = await consultingService.searchConsultingInformation(
        name,
        page,
        limit
      );
      const parsedResponse = consultingApiResponseSchema.parse(response);
      return parsedResponse;
    },

    enabled: !!name && name.trim().length > 0,

    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useConsultingHistoryList = (
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['consultingHistoryList', page, limit],
    queryFn: async () => {
      const response =
        await consultingService.getConsultingInformationHistoryByConselorId(
          page,
          limit
        );
      console.log('Raw API response:', response);

      try {
        const parsed = consultingApiResponseSchemaHistory.parse(response);
        return parsed;
      } catch (error) {
        console.warn('Validation error:', error);
        return {
          data: {
            metadata: {
              totalRecords: 0,
              firstPage: 1,
              lastPage: 1,
              page,
              limit,
            },
            consultationHistory: [],
          },
          status: 'error',
        };
      }
    },
    placeholderData: (previousData) => previousData,
  });
};
