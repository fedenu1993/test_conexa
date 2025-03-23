import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '../users/entities/role.enum';


describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: { // Mock de los métodos del repositorio
            save: jest.fn().mockResolvedValue({
              id: 1,
              username: 'testuser',
              password: 'password123',
              email: 'testuser@example.com',
              createdAt: new Date(),
            }),
            create: jest.fn().mockReturnValue({
              username: 'testuser',
              password: 'password123',
              email: 'testuser@example.com',
            }),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('fake_token') },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('debería registrar un usuario correctamente', async () => {
      const userDto = { username: 'testuser', password: 'password123', email: 'testuser@example.com' };
    
      const saveSpy = jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        id: 1,
        username: 'testuser',
        password: 'password123',
        email: 'testuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: Role.USER
      } as User); // Usamos el tipo `User` en lugar de `DeepPartial<User>`
    
      const result = await authService.register(userDto);
    
      expect(saveSpy).toHaveBeenCalledWith(userDto);
      expect(result).toEqual({ message: 'Usuario registrado correctamente' });
    });

    it('debería lanzar una excepción de conflicto si el usuario ya existe', async () => {
      const userDto = { username: 'testuser', password: 'password123', email: 'testuser@example.com' };

      jest.spyOn(userRepository, 'save').mockRejectedValueOnce({ code: '23505' }); // Simulamos un error de duplicado

      await expect(authService.register(userDto)).rejects.toThrow(ConflictException);
    });

    it('debería lanzar un error genérico si ocurre un error no relacionado con duplicados', async () => {
      const userDto = { username: 'testuser', password: 'password123', email: 'testuser@example.com' };

      jest.spyOn(userRepository, 'save').mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(authService.register(userDto)).rejects.toThrowError('Error al registrar el usuario');
    });
  });

  describe('login', () => {
    it('debería retornar un token de acceso si las credenciales son correctas', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const user = { 
        id: 1, 
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        role: Role.USER,
        email: 'testuser@example.com',        
        createdAt: new Date(),                
        updatedAt: new Date(),                
        hashPassword: jest.fn(),  
      };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ accessToken: 'fake_token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role,
      });
    });

    it('debería lanzar UnauthorizedException si las credenciales son incorrectas', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpassword' };
      
      const password = await bcrypt.hash('password123', 10);

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        username: 'testuser',
        password: password, 
        role: Role.USER,
        email: 'testuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(), 
      });
    

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si no se encuentra el usuario', async () => {
      const loginDto = { username: 'nonexistentuser', password: 'password123' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
