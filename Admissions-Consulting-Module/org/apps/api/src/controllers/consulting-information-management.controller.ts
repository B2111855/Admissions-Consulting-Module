import {
  Body,
  Get,
  JsonController,
  Param,
  Put,
  QueryParam, // Đảm bảo QueryParam được import
  Req,
  Res,
  UseBefore,
} from 'routing-controllers'; // Import từ routing-controllers
import jsend from '../jsend';
import groupService from '../services/group_service/consulting-information-management.service';
import 'reflect-metadata';
import { StudentUpdateApiDto } from '../dtos/student/student-update.dto';
import type { Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';

@JsonController('/consulting-information-management')
export class ConsultingInformationManagementController {
  @Get('')
  @UseBefore(authenticateToken())
  async getAllUsers(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Req() req: Request, // Thêm decorator @Req để truy cập request object
    @Res() res: any
  ) {
    try {
      const counselorId = req.user?.id;

      if (typeof counselorId !== 'number' || isNaN(counselorId)) {
        return res
          .status(400)
          .json(jsend.fail('Invalid or missing counselor ID in user token.'));
      }

      const users = await groupService.getAllConsultingInformation(
        page,
        limit,
        counselorId
      );
      if (users === null) {
        return res.json(
          jsend.error(
            'Failed to retrieve consulting information due to a service error.'
          )
        );
      }
      return res.json(jsend.success(users));
    } catch (e: any) {
      console.error(
        'Error in ConsultingInformationManagementController.getAllUsers:',
        e
      );
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && typeof e === 'object' && e.message) {
        errorMessage = e.message;
      }
      return res.json(jsend.error(errorMessage));
    }
  }
  @Get('/search')
  @UseBefore(authenticateToken())
  async searchConsultingInformation(
    @QueryParam('name') name: string,
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Req() req: Request, // Thêm decorator @Req để truy cập request object
    @Res() res: Response
  ) {
    try {
      // Lấy counselorId từ token (đã được authenticateToken gán vào req.user)
      const counselorId = req.user?.id;

      if (!counselorId) {
        return res
          .status(403)
          .json(jsend.error('Invalid user information in token'));
      }

      const searchName = name?.trim();

      const searchResults =
        await groupService.searchConsultingInformationByName(
          searchName,
          page,
          limit,
          counselorId // Truyền counselorId thực từ token
        );

      console.log('Controller: searchResults from service:', searchResults);
      return res.json(searchResults);
    } catch (e: any) {
      console.error(
        'Error in ConsultingInformationManagementController.searchConsultingInformation:',
        e
      );
      let errorMessage = 'An unexpected error occurred during the search.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      return res.status(500).json(jsend.error(errorMessage));
    }
  }

  @Get('/counselorId') // Cẩn thận với đường dẫn này, nó có thể xung đột với @Get('/:id') ở dưới
  @UseBefore(authenticateToken())
  async getAllUsersByConselor(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any,
    @Req() req: Request
  ) {
    const counselorId = req.user?.id;

    if (typeof counselorId !== 'number' || isNaN(counselorId)) {
      return res
        .status(400)
        .json(jsend.fail('Invalid or missing counselor ID in user token.'));
    }

    try {
      const users = await groupService.getAllConsultingInformationByCounselor(
        counselorId,
        page,
        limit
      );
      if (users === null) {
        return res.json(
          jsend.error(
            'Failed to retrieve consulting information by conselor due to a service error.'
          )
        );
      }
      return res.json(jsend.success(users));
    } catch (e: any) {
      console.error(
        'Error in ConsultingInformationManagementController.getAllUsers:',
        e
      );
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && typeof e === 'object' && e.message) {
        errorMessage = e.message;
      }
      return res.json(jsend.error(errorMessage));
    }
  }

  @Get('/history') // Cẩn thận với đường dẫn này, nó có thể xung đột với @Get('/:id') ở dưới
  @UseBefore(authenticateToken())
  async getAllConsultingByConselor(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any,
    @Req() req: Request
  ) {
    const counselorId = req.user?.id;

    if (typeof counselorId !== 'number' || isNaN(counselorId)) {
      return res
        .status(400)
        .json(jsend.fail('Invalid or missing counselor ID in user token.'));
    }

    try {
      const users =
        await groupService.getConsultationHistoryForCounselorAssignedStudents(
          counselorId,
          page,
          limit
        );
      if (users === null) {
        return res.json(
          jsend.error(
            'Failed to retrieve consulting information by conselor due to a service error.'
          )
        );
      }
      return res.json(jsend.success(users));
    } catch (e: any) {
      console.error(
        'Error in ConsultingInformationManagementController.getAllUsers:',
        e
      );
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && typeof e === 'object' && e.message) {
        errorMessage = e.message;
      }
      return res.json(jsend.error(errorMessage));
    }
  }

  @Get('/student/:id') // Cẩn thận với đường dẫn này, nó có thể xung đột với @Get('/:counselorId') ở trên
  @UseBefore(authenticateToken())
  async getConsultingInformationById(
    @Param('id') studentId: number,
    @Res() res: any
  ) {
    try {
      const studentInfo = await groupService.getConsultingInformationById(
        studentId
      );

      if (studentInfo === null) {
        return res.json(jsend.fail(`Student with ID ${studentId} not found.`));
      }

      return res.json(jsend.success(studentInfo));
    } catch (e: any) {
      console.error(
        'Error in ConsultingInformationManagementController.getConsultingInformationById:',
        e
      );
      let errorMessage =
        'An unexpected error occurred while fetching student information.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && typeof e === 'object' && e.message) {
        errorMessage = e.message;
      }
      return res.json(jsend.error(errorMessage));
    }
  }

  @Put('/:id')
  @UseBefore(authenticateToken())
  async updateStudentWithCounselorParam(
    @Param('id') studentId: number,
    @Body() updateData: StudentUpdateApiDto,
    @Req() req: any,
    @Res() res: any
  ) {
    const counselorId = req.user?.id;

    if (!counselorId) {
      return res
        .status(403)
        .json(jsend.error('Invalid user information in token'));
    }
    try {
      const parsedStudentId = parseInt(String(studentId), 10);
      console.log('Parsed studentId:', parsedStudentId);

      if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
        console.log('❌ Invalid studentId validation failed');
        return res.json(
          jsend.fail(
            'Invalid student ID provided. ID must be a positive number.'
          )
        );
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        console.log('❌ Empty update data validation failed');
        return res.json(
          jsend.fail('Update data is required and cannot be empty.')
        );
      }

      console.log('Updated by user ID:', counselorId);

      if (counselorId !== undefined) {
        console.log('Processing counselorId from query param...');
        const parsedCounselorId = parseInt(String(counselorId), 10);
        console.log('Parsed counselorId from query:', parsedCounselorId);

        if (isNaN(parsedCounselorId) || parsedCounselorId <= 0) {
          console.log('❌ Invalid counselorId from query validation failed');
          return res.json(
            jsend.fail(
              'Invalid counselor ID provided. ID must be a positive number.'
            )
          );
        }
        updateData.assigned_counselor_id = parsedCounselorId;
        console.log(
          '✅ Set counselorId from query to updateData:',
          parsedCounselorId
        );
      }

      if (updateData.assigned_counselor_id !== undefined) {
        console.log('Processing counselorId from body...');
        const counselorIdFromBody = parseInt(
          String(updateData.assigned_counselor_id),
          10
        );
        console.log('Parsed counselorId from body:', counselorIdFromBody);

        if (isNaN(counselorIdFromBody) || counselorIdFromBody <= 0) {
          console.log('❌ Invalid counselorId from body validation failed');
          return res.json(
            jsend.fail(
              'Invalid counselor ID provided in body. ID must be a positive number.'
            )
          );
        }
        updateData.assigned_counselor_id = counselorIdFromBody;
        console.log('✅ Final counselorId in updateData:', counselorIdFromBody);
      }

      const updatedStudent = await groupService.updateConsultingInformation(
        parsedStudentId,
        updateData,
        counselorId
      );

      if (updatedStudent === null) {
        console.log(
          '❌ Service returned null - student not found or update failed'
        );
        return res.json(
          jsend.fail(
            `Student with ID ${parsedStudentId} not found or update failed.`
          )
        );
      }

      console.log(
        '✅ Update successful:',
        JSON.stringify(updatedStudent, null, 2)
      );
      return res.json(
        jsend.success(
          updatedStudent,
          'Student information updated successfully.'
        )
      );
    } catch (e: any) {
      console.error(
        '❌ Error in ConsultingInformationManagementController.updateStudentWithCounselorParam:',
        e
      );

      let errorMessage =
        'An unexpected error occurred while updating student information.';

      if (e instanceof Error) {
        if (
          e.message.includes('Foreign key constraint') ||
          e.message.includes('P2003')
        ) {
          errorMessage =
            'Invalid counselor ID provided. The counselor does not exist in the system.';
        } else if (e.message.includes('Unique constraint')) {
          errorMessage =
            'Duplicate data detected. Email or phone number may already exist.';
        } else {
          errorMessage = e.message;
        }
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && typeof e === 'object' && e.message) {
        errorMessage = e.message;
      }

      return res.json(jsend.error(errorMessage));
    }
  }
}
