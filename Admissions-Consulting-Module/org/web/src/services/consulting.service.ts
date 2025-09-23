import apiClient from '@/lib/axios.lib';
import { ConsultingApiResponseHistory } from '@/lib/schema/consulting-data-history';
import { ConsultingApiResponse } from '@/lib/schema/consulting-data-schema';

export const consultingService = {
  getConsultingInformation: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponse> => {
    try {
      console.log(
        `consulting.service.ts: Fetching all consulting info (page: ${page}, limit: ${limit})`
      );
      const response = await apiClient.get(
        '/consulting-information-management',
        {
          params: {
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for all consulting info:',
        response.data
      );
      return response.data; // Axios tự động parse JSON và ném lỗi cho status codes 4xx/5xx
    } catch (error: any) {
      console.error('Error fetching consulting information:', error);
      // Axios errors thường có response.data, response.status, v.v.
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error; // Ném lại lỗi để React Query có thể bắt
    }
  },

  async getConsultingInformationByConselorId(
    counselorId: number = 6,
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponse> {
    try {
      if (counselorId === undefined || counselorId === null) {
        throw new Error('Counselor ID is required for this specific endpoint.');
      }

      console.log(
        `consulting.service.ts: Fetching by counselorId (path param) "${counselorId}" (page: ${page}, limit: ${limit})`
      );
      const response = await apiClient.get(
        `/consulting-information-management/counselorId`,
        {
          params: {
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for consulting by counselorId:',
        response.data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error fetching consulting information by counselor ID:',
        error
      );
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  async searchConsultingInformation(
    name: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponse> {
    try {
      console.log(
        `consulting.service.ts: Searching consulting info for term "${name}" (page: ${page}, limit: ${limit})`
      );
      const response = await apiClient.get(
        '/consulting-information-management/search',
        {
          params: {
            name: name,
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for search consulting info:',
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error('Error searching consulting information:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  updateConsultingInformation: async (
    studentId: number,
    updateData: any
  ): Promise<any> => {
    try {
      console.log(
        `consulting.service.ts: Updating consulting info for studentId: ${studentId}`,
        updateData
      );

      let url = `/consulting-information-management/${studentId}`;

      const config: any = {};

      const response = await apiClient.put(url, updateData, config);

      console.log(
        'consulting.service.ts: Response for update consulting info:',
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating consulting information:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        if (error.response.status === 404) {
          throw new Error('Student not found or update failed.');
        } else if (error.response.status === 400) {
          throw new Error(
            error.response.data?.message || 'Invalid data provided.'
          );
        } else if (error.response.status === 422) {
          throw new Error('Validation failed. Please check your input data.');
        }
      }

      throw error;
    }
  },

  async getConsultingInformationHistoryByConselorId(
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponseHistory> {
    try {
      const response = await apiClient.get(
        `/consulting-information-management/history`,
        {
          params: {
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for consulting by counselorId:',
        response.data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error fetching consulting information by counselor ID:',
        error
      );
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
};
