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
import * as NodeGeocoder from 'node-geocoder';

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

  /**
   * This method retrieves all users.
   *
   * The getUsers method does the following:
   * - Calls the find method of the usersRepository with an empty object as the condition.
   *
   * @returns A Promise that resolves to an array of all users.
   */
  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find({});
  }

  /**
   * This method retrieves a user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   *
   * The findUserById method does the following:
   * - Calls the findOneBy method of the usersRepository with the user's ID.
   * - If the user is not found, it throws a NotFoundException wrapped in an RpcException.
   *
   * @returns A Promise that resolves to the user with the specified ID.
   */
  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new RpcException(
        new NotFoundException(`User with id ${id} not found`),
      );
    }
    return user;
  }

  /**
   * This method retrieves a user by their email.
   *
   * @param email - The email of the user to retrieve.
   *
   * The findByEmail method does the following:
   * - Calls the createQueryBuilder method of the usersRepository to create a query.
   * - Adds a where clause to the query to filter by the user's email.
   * - Adds the user's password to the select clause of the query.
   *
   * @returns A Promise that resolves to the user with the specified email.
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
    return user;
  }

  /**
   * This method hashes a password.
   *
   * @param password - The password to hash.
   *
   * The hashPassword method does the following:
   * - Retrieves the number of salt rounds from the configuration service.
   * - Calls the hash method of bcrypt with the password and the number of salt rounds.
   *
   * @returns A Promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT', 10);
    return await bcrypt.hash(password, +saltRounds);
  }

  /**
   * This method registers a new user.
   *
   * @param newUser - An object that holds the data for the new user. It is an instance of the CreateUserDto class.
   *
   * The register method does the following:
   * - Destructures the CreateUserDto to get the user's first name, last name, email, password, latitude, and longitude.
   * - findByEmail method with the user's email to check if the user already exists.
   * - If the user already exists, it throws a ConflictException wrapped in an RpcException.
   * - hashPassword method with the user's password to get the hashed password.
   * - getLocation method with the user's latitude and longitude to get the city.
   * - save method of the usersRepository with the user's data to save the new user.
   *
   * @returns A Promise that resolves to the newly registered user.
   */
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

  /**
   * This method checks if a password matches a hashed password.
   *
   * @param password - The password to check.
   * @param hashedPassword - The hashed password to check against.
   *
   * The doesPasswordMatch method does the following:
   * - Calls the compare method of bcrypt with the password and the hashed password.
   *
   * @returns A Promise that resolves to a boolean indicating whether the password matches the hashed password.
   */
  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * This method validates a user.
   *
   * @param email - The email of the user to validate.
   * @param password - The password of the user to validate.
   *
   * The validateUser method does the following:
   * - Calls the findByEmail method with the user's email to get the user.
   * - Checks if the user exists. If not, it returns null.
   * - Calls the doesPasswordMatch method with the user's password and the hashed password. If the passwords do not match, it returns null.
   *
   * @returns A Promise that resolves to the user if the user exists and the password matches, or null otherwise.
   */
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

  /**
   * This method logs in a user.
   *
   * @param existingUser - An object that holds the data for the user to log in. It is an instance of the LoginDto class.
   *
   * The login method does the following:
   * - Destructures the LoginDto to get the user's email and password.
   * - Calls the validateUser method with the user's email and password to validate the user. If the user is not valid, it throws an UnauthorizedException wrapped in an RpcException.
   * - Deletes the user's password from the user object.
   * - Calls the signAsync method of the jwtService with the user to generate a JWT.
   *
   * @returns A Promise that resolves to an object containing the JWT and the user.
   */
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

  /**
   * This method verifies a JWT.
   *
   * @param jwt - The JWT to verify.
   *
   * The verifyJwt method does the following:
   * - Checks if the JWT is provided. If not, it throws an UnauthorizedException wrapped in an RpcException.
   * - Calls the verifyAsync method of the jwtService with the JWT.
   * - If an error occurs during verification, it throws the error wrapped in an RpcException.
   *
   * @returns A Promise that resolves to an object containing the user and the expiration time of the JWT.
   */
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

  /**
   * This method retrieves a user from a JWT in the header.
   *
   * @param jwt - The JWT in the header.
   *
   * The getUserFromHeader method does the following:
   * - Checks if the JWT is provided. If not, it returns undefined.
   * - Calls the decode method of the jwtService with the JWT.
   * - If an error occurs during decoding, it throws the error wrapped in an RpcException.
   *
   * @returns A Promise that resolves to the user from the JWT.
   */
  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      const user = this.jwtService.decode(jwt) as UserJwt;
      return user;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  /**
   * This method retrieves a user from a JWT.
   *
   * @param jwt - The JWT.
   *
   * The getUserFromJwt method does the following:
   * - Checks if the JWT is provided. If not, it returns undefined.
   * - Calls the verifyAsync method of the jwtService with the JWT.
   * - If an error occurs during verification, it throws the error wrapped in an RpcException.
   *
   * @returns A Promise that resolves to the user from the JWT.
   */
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
   * This method retrieves the city of a location.
   *
   * @param latitude - The latitude of the location.
   * @param longitude - The longitude of the location.
   *
   * The getLocation method does the following:
   * - Calls the reverse method of the geocoder with the latitude and longitude.
   * - Retrieves the city from the first result.
   *
   * @returns A Promise that resolves to the city of the location.
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

  /**
   * This method relocates a user.
   *
   * @param relocateDto - An object that holds the data for the user to relocate. It is an instance of the RelocateMeDto class.
   *
   * The relocateMe method does the following:
   * - Destructures the RelocateMeDto to get the user's ID, latitude, and longitude.
   * - Calls the getLocation method with the user's latitude and longitude to get the city. If an error occurs, it throws a RequestTimeoutException wrapped in an RpcException.
   * - Calls the preload method of the usersRepository with the user's ID, latitude, longitude, and city to preload the user with the new values.
   * - Checks if the user was found and preloaded. If not, it throws a NotFoundException.
   * - Saves the updated user using the usersRepository.
   *
   * @returns A Promise that resolves to the updated user.
   */
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

  /**
   * This method adds a book to a user's reading list.
   *
   * @param userId - The ID of the user.
   * @param book - The book to add to the reading list.
   *
   * The addToMyReadList method does the following:
   * - Retrieves the user from the usersRepository using the user's ID.
   * - Checks if the book is already in the user's reading list. If it is, it throws a BadRequestException wrapped in an RpcException.
   * - Adds the book to the user's reading list.
   * - Saves the user using the usersRepository.
   *
   * @returns A Promise that resolves to the user after the book has been added to their reading list.
   */
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

  /**
   * This method retrieves the reading list of a user.
   *
   * @param userId - The ID of the user whose reading list to retrieve.
   *
   * The getMyReadList method does the following:
   * - Retrieves the user from the usersRepository using the user's ID.
   * - Includes the readingBooks relation in the query.
   *
   * @returns A Promise that resolves to the reading list of the specified user.
   */
  async getMyReadList(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['readingBooks'],
    });
    return user.readingBooks;
  }

  /**
   * This method retrieves the information of a user.
   *
   * @param userId - The ID of the user whose information to retrieve.
   *
   * The myInfo method does the following:
   * - Retrieves the user from the usersRepository using the user's ID.
   * - Includes the readingBooks and writtenBooks relations in the query.
   *
   * @returns A Promise that resolves to the information of the specified user.
   */
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
