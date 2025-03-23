import { SeederService } from '../../migrations/seeder/seeder.service';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from '../../users/entities/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SeederService', () => {
  let seederService: SeederService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn()
          },
        },
      ],
    }).compile();

    seederService = module.get<SeederService>(SeederService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('debería crear un usuario admin si no existe ninguno', async () => {
    // Simulando el comportamiento de 'findOne' para que no encuentre un usuario admin
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    // Simulando el comportamiento de 'save' para que retorne un usuario admin creado
    const saveSpy = jest.spyOn(userRepository, 'save').mockResolvedValue({
      id: 1,
      username: 'admin',
      email: 'admin@demo.com',
      password: 'Prueba123',
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);

    // Llamando al método 'seed'
    await seederService.seed();

    // Verificando que 'findOne' haya sido llamado
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { role: Role.ADMIN },
    });

    // Verificando que 'save' haya sido llamado para guardar el admin
    expect(saveSpy).toHaveBeenCalled();
  });
});
