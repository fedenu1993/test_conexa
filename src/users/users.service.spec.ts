import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './entities/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findAllWithPagination', () => {
    it('debería devolver los usuarios paginados', async () => {
      const result = {
        data: [
          {
            id: 1,
            username: 'testuser',
            password: await bcrypt.hash('password123', 10), 
            role: Role.ADMIN,
            email: 'testuser@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            hashPassword: jest.fn() 
          }
        ],
        total: 1,
      };
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([result.data, result.total]);

      const response = await service.findAllWithPagination(1, 10);
      expect(response).toEqual(result);
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('debería manejar cuando no hay usuarios', async () => {
      const result = {
        data: [],
        total: 0,
      };
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([result.data, result.total]);

      const response = await service.findAllWithPagination(1, 10);
      expect(response).toEqual(result);
    });
  });

  describe('updateRole', () => {
    it('debería actualizar el rol de un usuario', async () => {
      const updateRoleDto: UpdateRoleDto = { role: Role.ADMIN };
      const user = { id: 1, username: 'usuario1', role: 'user' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...user, role: updateRoleDto.role } as any);

      const updatedUser = await service.updateRole(1, updateRoleDto);
      expect(updatedUser.role).toBe('admin');
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, role: updateRoleDto.role });
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      const updateRoleDto: UpdateRoleDto = { role: Role.ADMIN };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateRole(1, updateRoleDto)).rejects.toThrowError('Usuario no encontrado');
    });
  });
});
