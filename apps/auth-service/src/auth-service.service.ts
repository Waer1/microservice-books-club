import { Book, User } from '@app/shared';
import {
  BadRequestException,
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
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@app/shared/dtos/Create-User.dto';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';
import { LoginDto } from '@app/shared/dtos/login.dto';
import { RelocateMeDto } from '@app/shared/dtos/relocateme.dto';
import NodeGeocoder from 'node-geocoder';

@Injectable()
export class AuthServiceService {
  options: NodeGeocoder.Options = {
    provider: 'geocodio',
    apiKey: this.configService.get('GEOCODIO_API_KEY'),
  };

  geocoder = NodeGeocoder(this.options);

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

    if (existingUser) {
      throw new RpcException(
        new ConflictException('An account with that email already exists!'),
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const city = await this.getLocation(latitude, longitude);

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
      latitude,
      longitude,
      city: city.city,
      password: hashedPassword,
    });

    delete savedUser.password;
    return savedUser;
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
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
      throw new RpcException(
        new UnauthorizedException('Invalid Email or Password'),
      );
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
      const user = this.jwtService.decode(jwt) as UserJwt;
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

  /**
   * Gets the location of a point based on latitude and longitude.
   *
   * @param {number} latitude The latitude of the point.
   * @param {number} longitude The longitude of the point.
   *
   * @return {Promise<{city: string, country: string}>} The city and country of the point.
   */
  async getLocation(
    latitude: number,
    longitude: number,
  ): Promise<{ city: string; country: string }> {
    // Call the geocoder service with the given latitude and longitude

    const res = await this.geocoder.reverse({
      lat: latitude,
      lon: longitude,
    });

    // If no results, return "Unknown" for city and country
    if (res.length === 0) {
      return {
        city: 'Unknown',
        country: 'Unknown',
      };
    }

    // Return an object with the city and country from the first result
    return {
      city: res[0].city,
      country: res[0].country,
    };
  }

  async relocateMe(relocateDto: RelocateMeDto) {
    const { userId, latitude, longitude } = relocateDto;
    let city = null;
    try {
      city = await this.getLocation(latitude, longitude);
    } catch (error) {
      throw new RpcException(new RequestTimeoutException());
    }
    // Preload the user with the new values
    const updatedUser = await this.usersRepository.preload({
      id: userId,
      latitude,
      longitude,
      city: city.city,
    });

    // Check if the user was found and preloaded
    if (!updatedUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Save the updated user
    await this.usersRepository.save(updatedUser);

    return updatedUser;
  }

  async addToMyReadList(userId: number, book: Book) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['readingBooks'],
    });

    if (user.readingBooks.some((readingBook) => readingBook.id === book.id)) {
      throw new RpcException(
        new BadRequestException('You have already read this book'),
      );
    }
    user.readingBooks.push(book);
    await this.usersRepository.save(user);
    return user;
  }

  async getMyReadList(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['readingBooks'],
    });
    return user.readingBooks;
  }

  async myInfo(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        readingBooks: true,
        writtenBooks: true,
      },
    });
    return user;
  }
}
