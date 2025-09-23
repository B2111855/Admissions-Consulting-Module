import {
  JsonController,
  Get,
  UseBefore,
  Res,
  Req,
  QueryParam,
} from 'routing-controllers';
import jsend from '../jsend';
import {
  getAllUser,
  getAllCourse,
  getUserInfoById,
  getUsersPage,
  getDataExport,
} from '../services/data.service';
import { authenticateToken } from '../middlewares/auth.middleware';

@JsonController('/data')
export class DataGet {
  @Get('/DataUser')
  async getData() {
    const users = await getAllUser(); // ✅ đổi tên biến kết quả

    const alluser = users.map((user) => ({
      id: user.id,
      full_name: user.full_name,
    }));

    return jsend.success({
      alluser,
    });
  }

  @Get('/DataCourse')
  async getAllCourses() {
    const names = await getAllCourse();
    return jsend.success({ courseNames: names });
  }

  @Get('/UserInfoLogin')
  @UseBefore(authenticateToken())
  async UserInfoLogin(@Req() req: any, @Res() res: any) {
    const counselorId = req.user?.id; // ✅ Lấy từ token đã xác thực

    const users = await getUserInfoById(counselorId); // ✅ đổi tên biến kết quả

    // const alluser = users.map((user) => ({
    //   id: user.id,
    //   full_name: user.full_name,
    // }));

    return jsend.success({
      users,
    });
  }

  @Get('/UsersPage')
  async getUsersPage(
    @QueryParam('page') pageRaw: any,
    @QueryParam('limit') limitRaw: any
  ) {
    const page = parseInt(pageRaw as string, 10) || 1;
    const limit = parseInt(limitRaw as string, 10) || 10;
    const result = await getUsersPage(page, limit);
    return jsend.success(result);
  }

  @Get('/ExportData')
  @UseBefore(authenticateToken())
  async exportData(
    @Req() req: any,
    @Res() res: any,
    @QueryParam('page') pageRaw: any,
    @QueryParam('limit') limitRaw: any,
    @QueryParam('fromDate') fromDate?: string,
    @QueryParam('toDate') toDate?: string
  ) {
    const counselorId = req.user?.id;

    const page = parseInt(pageRaw as string, 10) || 1;
    const limit = parseInt(limitRaw as string, 10) || 10;

    const result = await getDataExport(counselorId, page, limit, {
      fromDate,
      toDate,
    });

    return jsend.success(result);
  }
}
