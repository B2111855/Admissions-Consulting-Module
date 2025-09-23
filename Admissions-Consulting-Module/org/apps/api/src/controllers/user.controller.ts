import 'reflect-metadata';
import { Get, JsonController, QueryParam, Res } from 'routing-controllers';
import jsend from '../jsend';
import userServices from "../services/user.service";
import 'reflect-metadata';




@JsonController('/users')
export class UserController {


  @Get('')
  async getAllUsers(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const users = await userServices.getAllUsers(page, limit);
      return res.json(jsend.success(users));
    } catch (e: any) {
      return res.json(jsend.error(e));
    }
  }
}
