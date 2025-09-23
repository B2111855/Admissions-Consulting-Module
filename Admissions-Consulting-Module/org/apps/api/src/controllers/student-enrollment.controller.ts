import { Get, Post, Put, Delete, JsonController, QueryParam, Param, Body, Res } from 'routing-controllers';
import jsend from '../jsend';
import studentEnrollmentService from '../services/student-enrollment.service';
import 'reflect-metadata';

@JsonController('/student-enrollments')
export class StudentEnrollmentController {
  @Get('')
  async getAllStudentEnrollments(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await studentEnrollmentService.getAllStudentEnrollments(page, limit);
      if (!result) {
        return res.status(500).json(jsend.error('Failed to fetch student enrollments'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/student/:studentId')
  async getEnrollmentsByStudentId(
    @Param('studentId') studentId: number,
    @Res() res: any
  ) {
    try {
      const enrollments = await studentEnrollmentService.getEnrollmentsByStudentId(studentId);
      if (!enrollments) {
        return res.status(500).json(jsend.error('Failed to fetch student enrollments'));
      }
      return res.json(jsend.success(enrollments));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/:id')
  async getStudentEnrollmentById(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      const studentEnrollment = await studentEnrollmentService.getStudentEnrollmentById(id);
      if (!studentEnrollment) {
        return res.status(404).json(jsend.fail('Student enrollment not found'));
      }
      return res.json(jsend.success(studentEnrollment));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('')
  async createStudentEnrollment(
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const studentEnrollment = await studentEnrollmentService.createStudentEnrollment(data);
      if (!studentEnrollment) {
        return res.status(400).json(jsend.fail('Failed to create student enrollment'));
      }
      return res.status(201).json(jsend.success(studentEnrollment));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Put('/:id')
  async updateStudentEnrollment(
    @Param('id') id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const studentEnrollment = await studentEnrollmentService.updateStudentEnrollment(id, data);
      if (!studentEnrollment) {
        return res.status(404).json(jsend.fail('Student enrollment not found or update failed'));
      }
      return res.json(jsend.success(studentEnrollment));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Delete('/:id')
  async deleteStudentEnrollment(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      await studentEnrollmentService.deleteStudentEnrollment(id);
      return res.json(jsend.success(null, 'Student enrollment deleted successfully'));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }
}