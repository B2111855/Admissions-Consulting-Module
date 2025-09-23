import { useMutation } from '@tanstack/react-query';
import { consultingService } from '@/services/consulting.service';
import { toast } from 'sonner';
import { z } from 'zod';
import { consultingUpdateSchema } from '@/lib/schema/consulting-data-update';
import _ from 'lodash';

export const useUpdateConsulting = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: async ({
      studentId,
      updateData,
    }: {
      studentId: number;
      updateData: Partial<z.infer<typeof consultingUpdateSchema>>;
    }) => {
      const validatedData = consultingUpdateSchema.parse({
        student_id: studentId,
        ...updateData,
      });

      return consultingService.updateConsultingInformation(
        studentId,
        _.omit(validatedData, ['student_id'])
      );
    },
    onSuccess: (data) => {
      toast.success('Cập nhật thông tin tư vấn thành công');
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Lỗi khi cập nhật thông tin tư vấn:', error);
      toast.error(
        error.message || 'Đã xảy ra lỗi khi cập nhật thông tin tư vấn'
      );
      options?.onError?.(error);
    },
  });
};
