import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as bcrypt from 'bcrypt';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUserService = {
    findAllWithPagination: jest.fn(),
    updateRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('Debe devolver users en paginado', async () => {
      const result = {
        data: [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }],
        total: 2,
      };
      mockUserService.findAllWithPagination.mockResolvedValue(result);

      const response = await controller.findAll(1, 10);

      expect(response).toEqual(result);
      expect(mockUserService.findAllWithPagination).toHaveBeenCalledWith(1, 10);
    });

    it('Debe devolver nada sin usuarios', async () => {
      const result = { data: [], total: 0 };
      mockUserService.findAllWithPagination.mockResolvedValue(result);

      const response = await controller.findAll(1, 10);

      expect(response).toEqual(result);
    });
  });

  describe('updateRole', () => {
    it('Editar rol de un usuario', async () => {
      const updateRoleDto: UpdateRoleDto = { role: Role.USER };
      
      const password = await bcrypt.hash('password123', 10);
      const mockUser: User = { 
        id: 1,
        username: 'testuser',
        password: password, 
        role: Role.ADMIN,
        email: 'testuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn()
      };

      mockUserService.updateRole.mockResolvedValue(mockUser);

      const response = await controller.updateRole(1, updateRoleDto);

      expect(response).toEqual(mockUser);
      expect(mockUserService.updateRole).toHaveBeenCalledWith(1, updateRoleDto);
    });

    it('Error al editar rol de un usuario', async () => {
      const updateRoleDto: UpdateRoleDto = { role: Role.ADMIN };
      mockUserService.updateRole.mockRejectedValue(new Error('Failed to update role'));

      try {
        await controller.updateRole(1, updateRoleDto);
      } catch (e) {
        expect(e.message).toBe('Failed to update role');
      }
    });
  });
});
