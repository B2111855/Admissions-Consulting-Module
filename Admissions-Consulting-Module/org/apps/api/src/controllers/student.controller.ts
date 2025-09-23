import 'reflect-metadata';
import { Get, Post, Delete, JsonController, QueryParam, Param, Body, Res } from 'routing-controllers';
import jsend from '../jsend';
import  studentServices  from '../services/student.service';


@JsonController('/students')
export class StudentController {

  
  @Get('')
  async getAllStudent(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const student = await studentServices.getAllStudents(page, limit);
      return res.json(jsend.success(student));
    } catch (e: any) {
      return res.json(jsend.error(e));
    }
  }

  @Get('/:id')
  async getStudentById(
    @Param('id') id: string,
    @Res() res: any
  ) {
    const studentId = parseInt(id, 10);
    try {
      const student = await studentServices.getStudentById(studentId);
      return res.json(jsend.success(student));
    } catch (e: any) {
      return res.json(jsend.error(e));
    }
  }

  @Delete('/:id')
  async deleteStudent(
    @Param('id') id: string,
    @Res() res: any
  ) {
    const studentId = parseInt(id, 10);
    try {
      await studentServices.deleteStudent(studentId);
      return res.json(jsend.success({
        message: "Delete student by id: " + studentId + " successfully."
      }));
    } catch (e: any) {
      return res.json(jsend.error(e));
    }
  }

  @Post('')
  async createStudent(
    @Body() body: any,
    @Res() res: any
  ) {
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json(jsend.error("No data provided"));
    }

    try {
      const student = await studentServices.createStudent({ ...body });
      return res.json(jsend.success(student));
    } catch (e: any) {
      return res.json(jsend.error(e));
    }
  }

  // @Put('/:id')
  // async updateStudent(
  //   @Param('id') id: string,
  //   @Body() body: any,
  //   @Res() res: any
  // ) {
  //   const studentId = parseInt(id, 10);

  //   try {
  //     const student = await studentServices.updateStudent(studentId, { ...body });
  //     return res.json(jsend.success(student));
  //   } catch (e: any) {
  //     return res.json(jsend.error(e));
  //   }
  // }
}