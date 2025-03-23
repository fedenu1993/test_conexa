/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import * as request from 'supertest';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let app; // Aquí almacenaremos nuestra app NestJS

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            // Mock de la función register
            register: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }), 
            // Mock de la función login
            login: jest.fn().mockResolvedValue({ access_token: 'fake_token' }), 
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    await app.init();
  });

  it('Esta definido', () => {
    expect(authController).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('Debe retornar un user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        email: 'testuser@gmail.com'
      };

      // Realizamos una solicitud POST a la ruta register
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(Number),
        username: createUserDto.username,
      });

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('Debe retornar un error de validación si los datos son inválidos', async () => {
      const invalidCreateUserDto: CreateUserDto = {
        username: '', // Un campo vacío que debería fallar la validación
        password: 'password123',
        email: 'invalidemail', // Un email no válido
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidCreateUserDto)
        .expect(400); // Esperamos un error de validación

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('username should not be empty'),
          expect.stringContaining('email must be an email'),
        ])
      );
    });
  });

  describe('POST /auth/login', () => {
    it('Debe retornar el token', async () => {
      const loginUserDto: LoginUserDto = {
        username: 'testuser',
        password: 'password123',
      };
  
      // Modificamos el mock para simular que el login es exitoso
      authService.login = jest.fn().mockResolvedValue({ access_token: 'fake_token' });
  
      // Realizamos una solicitud POST a la ruta login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUserDto)
        .expect(200);
  
      // Verificamos que la respuesta es la esperada
      expect(response.body).toEqual({
        access_token: 'fake_token',
      });
  
      // Verificamos que el método login haya sido llamado con los parámetros correctos
      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
    });
  
    it('Debe retornar un error si las credenciales son incorrectas', async () => {
      const invalidLoginUserDto: LoginUserDto = {
        username: 'nonexistentuser',
        password: 'wrongpassword'
      };
  
      // Modificamos el mock para simular que el login falla lanzando una excepción
      authService.login = jest.fn().mockRejectedValue(new UnauthorizedException('Error en el inicio de sesión'));
  
      // Realizamos una solicitud POST a la ruta login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginUserDto)
        .expect(401); // Esperamos un error de autorización 401
  
      // Verificamos que el mensaje de error sea el esperado
      expect(response.body.message).toEqual('Error en el inicio de sesión');
      expect(response.body.statusCode).toEqual(401);
  
      // Verificamos que el método login haya sido llamado con los parámetros correctos
      expect(authService.login).toHaveBeenCalledWith(invalidLoginUserDto);
    });
  });
  
  afterAll(async () => {
    await app.close();
  });
});
