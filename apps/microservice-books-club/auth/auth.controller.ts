import { CreateUserDto } from '@app/shared/dtos/Create-User.dto';
import { LoginDto } from '@app/shared/dtos/login.dto';
import { RelocateMeDto } from '@app/shared/dtos/relocateme.dto';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { UserRequest } from '@app/shared/interfaces/user-request.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';
import { catchError, of } from 'rxjs';
import { AuthGuard } from '@app/shared/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {}

  @Get('users')
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  @Post('register')
  async register(@Body() createUserdto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: 'register',
      },
      createUserdto,
    );
  }

  @Post('login')
  async login(@Body() logindto: LoginDto) {
    return this.authService
      .send(
        {
          cmd: 'login',
        },
        logindto,
      )
      ;
  }

  @Post('RelocateMe')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async RelocateMe(
    @Body() relocateDto: RelocateMeDto,
    @Req() req: UserRequest,
  ) {
    if (!req?.user) {
      throw new UnauthorizedException('please login first');
    }
    relocateDto.userId = req.user.id;

    return this.authService.send(
      {
        cmd: 'RelocateMe',
      },
      relocateDto,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async me(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new UnauthorizedException('please login first');
    }
    return this.authService.send(
      {
        cmd: 'myInfo',
      },
      req.user.id,
    );
  }
}
