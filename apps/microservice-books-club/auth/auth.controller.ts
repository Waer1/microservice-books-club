import { CreateUserDto } from '@app/shared/dtos/Create-User.dto';
import { LoginDto } from '@app/shared/dtos/login.dto';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { catchError, of } from 'rxjs';

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
    return this.authService
      .send(
        {
          cmd: 'register',
        },
        createUserdto,
      )
      .pipe(catchError((val) => of({ error: val.message })));
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
      .pipe(
        catchError((val) => {
          return of({ error: val });
        }),
      );
  }

  @Post('RelocateMe')
  async RelocateMe(@Body() logindto: LoginDto) {

  }
}
