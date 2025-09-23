import { Get, JsonController, QueryParam, Res } from 'routing-controllers';
import jsend from '../jsend';
import studentStatusHistoryService from '../services/student-status-history.service';
import 'reflect-metadata';

@JsonController('/student-status-history')
export class StudentStatusHistoryController {
  
  @Get('')
  async getAllStudentStatus(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const student = await studentStatusHistoryService.getAllStudentStatus(page, limit);
      return res.json(jsend.success(student));
    } catch (e: any) {
      return res.json(jsend.error(e));
    }
  }
}