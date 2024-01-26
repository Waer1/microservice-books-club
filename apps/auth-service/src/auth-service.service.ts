import { User } from '@app/shared';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcrypt';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@app/shared/dtos/Create-User.dto';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';
import { LoginDto } from '@app/shared/dtos/login.dto';

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find({});
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new RpcException(
        new NotFoundException(`User with id ${id} not found`),
      );
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT', 10);
    return await bcrypt.hash(password, +saltRounds);
  }

  async register(newUser: CreateUserDto): Promise<User> {
    const { firstName, lastName, email, password, latitude, longitude } =
      newUser;

    const existingUser = await this.findByEmail(email);

    console.log('existingUser', existingUser);
    if (existingUser) {
      throw new RpcException(
        new ConflictException('An account with that email already exists!'),
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
      latitude,
      longitude,
      password: hashedPassword,
    });
    console.log('savedUser', savedUser);

    delete savedUser.password;
    return savedUser;
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    console.log('password', password);
    console.log('hashedPassword', hashedPassword);
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null;

    return user;
  }

  async login(existingUser: LoginDto) {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new RpcException(new UnauthorizedException());
    }

    delete user.password;

    const jwt = await this.jwtService.signAsync({ user });

    return { token: jwt, user };
  }

  async verifyJwt(jwt: string): Promise<{ user: User; exp: number }> {
    if (!jwt) {
      throw new RpcException(new UnauthorizedException());
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      const user = this.jwtService.decode(jwt) as UserJwt
      return user;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getUserFromJwt(jwt: string): Promise<User> {
    if (!jwt) return;

    try {
      const { user } = await this.jwtService.verifyAsync(jwt);
      return user;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
