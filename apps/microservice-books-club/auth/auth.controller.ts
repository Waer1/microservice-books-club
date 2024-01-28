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

  /**
   * This method retrieves all users.
   *
   * The getUsers method does the following:
   * - Uses the authService to send a 'get-users' command with an empty object as payload to the microservice.
   *
   * @returns An Observable of all users.
   */
  @Get('users')
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  /**
   * This method registers a new user.
   *
   * @param createUserDto - An object that holds the data for the new user. It is an instance of the CreateUserDto class.
   *
   * The register method does the following:
   * - Uses the authService to send a 'register' command with the CreateUserDto as payload to the microservice.
   *
   * @returns An Observable of the newly registered user.
   */
  @Post('register')
  async register(@Body() createUserdto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: 'register',
      },
      createUserdto,
    );
  }

  /**
   * This method used for login and return the jwt token for the user.
   *
   * @param loginDto - An object that holds the data for the existing user. It is an instance of the LoginDto class.
   *
   * The login method does the following:
   * - Uses the authService to send a 'login' command with the LoginDto as payload to the microservice.
   *
   * @returns An Observable of the logged in user.
   */
  @Post('login')
  async login(@Body() logindto: LoginDto) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      logindto,
    );
  }

  /**
   * This method relocates a user.
   *
   * @param relocateDto - An object that holds the data for the user to relocate. It is an instance of the RelocateMeDto class.
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   *
   * The RelocateMe method does the following:
   * - Checks if the request's user object is defined. If not, it throws an UnauthorizedException.
   * - Sets the userId of the relocateDto to the ID of the user making the request.
   * - Uses the authService to send a 'RelocateMe' command with the RelocateMeDto as payload to the microservice.
   *
   * @returns An Observable of the relocated user.
   */
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

  /**
   * This method retrieves the logged-in user's information.
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   *
   * The me method does the following:
   * - Checks if the request's user object is defined. If not, it throws an UnauthorizedException.
   * - Uses the authService to send a 'myInfo' command with the user's ID as payload to the microservice.
   *
   * @returns An Observable of the logged-in user's information.
   */
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
