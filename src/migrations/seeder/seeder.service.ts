import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.enum';


@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    try {
      // Verificar si ya existen admins
      const existingAdmin = await this.userRepository.findOne({
        where: { role: Role.ADMIN },
      });
  
      if (!existingAdmin) {
        const adminUser = this.userRepository.create({
          username: 'admin',
          email: 'admin@demo.com',
          password: 'Prueba123',
          role: Role.ADMIN,
        });
  
        await this.userRepository.save(adminUser);
        console.log('Admin creado');
      }
    } catch (error) {
      console.error('Error en la creación del usuario admin:', error); // Añadido para mostrar más detalles del error
      throw new Error('Error al crear usuario con role de admin');
    }
  }
}
