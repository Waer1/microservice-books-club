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

  /**
   * This method retrieves all users.
   *
   * @param context - The RabbitMQ context.
   *
   * The getUsers method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the getUsers method of the authServiceService.
   *
   * @returns An array of all users.
   */
  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.getUsers();
  }

  /**
   * This method retrieves a user by their ID.
   *
   * @param context - The RabbitMQ context.
   * @param user - An object that holds the ID of the user to retrieve.
   *
   * The getUserById method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the findUserById method of the authServiceService with the user's ID.
   *
   * @returns The user with the specified ID.
   */
  @MessagePattern({ cmd: 'get-user' })
  async getUserById(
    @Ctx() context: RmqContext,
    @Payload() user: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return await this.authServiceService.findUserById(user.id);
  }

  /**
   * This method registers a new user.
   *
   * @param context - The RabbitMQ context.
   * @param newUser - An object that holds the data for the new user. It is an instance of the CreateUserDto class.
   *
   * The register method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the register method of the authServiceService with the CreateUserDto.
   *
   * @returns The newly registered user.
   */
  @MessagePattern({ cmd: 'register' })
  async register(
    @Ctx() context: RmqContext,
    @Payload() newUser: CreateUserDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.register(newUser);
  }

  /**
   * This method logs in a user.
   *
   * @param context - The RabbitMQ context.
   * @param existingUser - An object that holds the data for the user to log in. It is an instance of the LoginDto class.
   *
   * The login method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the login method of the authServiceService with the LoginDto.
   *
   * @returns The logged-in user.
   */
  @MessagePattern({ cmd: 'login' })
  async login(@Ctx() context: RmqContext, @Payload() existingUser: LoginDto) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.login(existingUser);
  }

  /**
   * This method verifies a JWT.
   *
   * @param context - The RabbitMQ context.
   * @param payload - An object that holds the JWT to verify.
   *
   * The verifyJwt method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the verifyJwt method of the authServiceService with the JWT.
   *
   * @returns The decoded JWT.
   */
  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authServiceService.verifyJwt(payload.jwt);
  }

  /**
   * This method decodes a JWT.
   *
   * @param context - The RabbitMQ context.
   * @param payload - An object that holds the JWT to decode.
   *
   * The decodeJwt method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the getUserFromHeader method of the authServiceService with the JWT.
   *
   * @returns The decoded JWT.
   */
  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return await this.authServiceService.getUserFromHeader(payload.jwt);
  }

  /**
   * This method relocates a user.
   *
   * @param context - The RabbitMQ context.
   * @param relocateDto - An object that holds the data for the user to relocate. It is an instance of the RelocateMeDto class.
   *
   * The relocateMe method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the relocateMe method of the authServiceService with the RelocateMeDto.
   *
   * @returns The relocated user.
   */
  @MessagePattern({ cmd: 'RelocateMe' })
  async relocateMe(
    @Ctx() context: RmqContext,
    @Payload() relocateDto: RelocateMeDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return await this.authServiceService.relocateMe(relocateDto);
  }

  /**
   * This method adds a book to a user's reading list.
   *
   * @param context - The RabbitMQ context.
   * @param data - An object that holds the data for the user and the book to add to the reading list.
   *
   * The addToMyReadList method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the addToMyReadList method of the authServiceService with the user's ID and the book.
   *
   * @returns The reading list of the user after the book has been added.
   */
  @MessagePattern({ cmd: 'add-to-my-readlist' })
  async addToMyReadList(
    @Ctx() context: RmqContext,
    @Payload() data: { userId: number; book: Book },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const { userId, book } = data;
    return await this.authServiceService.addToMyReadList(userId, book);
  }

  /**
   * This method retrieves the reading list of a user.
   *
   * @param context - The RabbitMQ context.
   * @param userId - The ID of the user whose reading list to retrieve.
   *
   * The getMyReadList method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the getMyReadList method of the authServiceService with the user's ID.
   *
   * @returns The reading list of the specified user.
   */
  @MessagePattern({ cmd: 'get-my-readlist' })
  async getMyReadList(@Ctx() context: RmqContext, @Payload() userId: number) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authServiceService.getMyReadList(userId);
  }

  /**
   * This method retrieves the information of a user.
   *
   * @param context - The RabbitMQ context.
   * @param userId - The ID of the user whose information to retrieve.
   *
   * The myInfo method does the following:
   * - Acknowledges the message using the sharedService.
   * - Calls the myInfo method of the authServiceService with the user's ID.
   *
   * @returns The information of the specified user.
   */
  @MessagePattern({ cmd: 'myInfo' })
  async myInfo(@Ctx() context: RmqContext, @Payload() userId: number) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authServiceService.myInfo(userId);
  }
}
