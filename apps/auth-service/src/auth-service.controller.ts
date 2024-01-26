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
import { Book, SharedService } from '@app/shared';
import { RelocateMeDto } from '@app/shared/dtos/relocateme.dto';
import { ReadBookDto } from '@app/shared/dtos/readBook.dto';

@Controller()
export class AuthServiceController {
  constructor(
    private readonly authServiceService: AuthServiceService,
    private readonly sharedService: SharedService,
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

  @MessagePattern({ cmd: 'RelocateMe' })
  async relocateMe(
    @Ctx() context: RmqContext,
    @Payload() relocateDto: RelocateMeDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return await this.authServiceService.relocateMe(relocateDto);
  }

  @MessagePattern({ cmd: 'add-to-my-readlist' })
  async addToMyReadList(
    @Ctx() context: RmqContext,
    @Payload() data: { userId: number; book: Book },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const { userId, book } = data;
    return await this.authServiceService.addToMyReadList(userId, book);
  }

  @MessagePattern({ cmd: 'get-my-readlist' })
  async getMyReadList(@Ctx() context: RmqContext, @Payload() userId: number) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authServiceService.getMyReadList(userId);
  }

  @MessagePattern({ cmd: 'myInfo'})
  async myInfo(@Ctx() context: RmqContext, @Payload() userId: number) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authServiceService.myInfo(userId);
  }
}
