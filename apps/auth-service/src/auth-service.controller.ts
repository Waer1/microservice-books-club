import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { LoginDto } from '@app/shared/dtos/login.dto';
import { CreateUserDto } from '@app/shared/dtos/Create-User.dto';
import { JwtGuard } from './jwt.guard';
import { SharedService } from '@app/shared';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService,
    private readonly sharedService: SharedService
    ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.getUsers();
  }

  @MessagePattern({ cmd: 'get-user' })
  async getUserById(
    @Ctx() context: RmqContext,
    @Payload() user: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return await this.authServiceService.findUserById(user.id);
  }

  @MessagePattern({ cmd: 'register' })
  async register(
    @Ctx() context: RmqContext,
    @Payload() newUser: CreateUserDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.register(newUser);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Ctx() context: RmqContext, @Payload() existingUser: LoginDto) {
    console.log('login from auth service controller');
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.login(existingUser);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return await this.authServiceService.getUserFromHeader(payload.jwt);
  }



}
