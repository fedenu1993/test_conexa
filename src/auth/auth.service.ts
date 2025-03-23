import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto): Promise<any> {
    try {
      const user = this.userRepository.create(userDto);
      await this.userRepository.save(user);
      return { message: 'Usuario registrado correctamente' };
    } catch (error) {
      // Si el error es por duplicado, lanzar un error 409 Conflict
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException(
          'El email o el username ya están registrados',
        );
      }
      throw new Error('Error al registrar el usuario');
    }
  }

  async login(loginDto: LoginUserDto): Promise<{ accessToken: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { username: loginDto.username },
      });

      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const payload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Error en el inicio de sesión');
    }
  }
}
