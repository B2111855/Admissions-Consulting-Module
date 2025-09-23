import 'reflect-metadata';
import {
  Body,
  HttpCode,
  JsonController,
  Post,
  Res,
  Req,
} from 'routing-controllers';
import { AuthResponse } from '../services/auth.service';
import authService from '../services/auth.service';
import { LoginDto } from '../dtos/auth/auth.dto';
import jsend from '../jsend';
import { CreateUserDto } from '../dtos/user/user.dto';
import userService from '../services/user.service';

// import { authenticateToken } from '../middlewares/auth.middleware';

@JsonController('/auth')
export class AuthController {
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginData: LoginDto, @Res() res: any) {
    const authResponse: AuthResponse = await authService.login(loginData);
    return res.json(jsend.success(authResponse));
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() userData: CreateUserDto, @Res() res: any) {
    const newUser = await userService.createUser(userData);
    return res.json(jsend.success(newUser));
  }

  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Body() body: { refresh_token: string },
    @Res() response: any
  ) {
    if (!body.refresh_token) {
      throw new Error('Refresh token is required');
    }
    const authResponse: AuthResponse = await authService.refreshToken({
      refreshToken: body.refresh_token,
    });
    return response.success(authResponse, 'Access token đã được làm mới');
  }

  @Post('/logout')
  @HttpCode(200)
  async logout(@Req() req: any, @Res() res: any) {
    const user = req.user as { id: number }; // req.user được set bởi AuthMiddleware

    // Xoá refreshToken khỏi DB
    await authService.logout(user.id);

    // Xoá cookie nếu dùng cookie để lưu refreshToken
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.json(jsend.success(null, 'Đăng xuất thành công'));
  }
}
