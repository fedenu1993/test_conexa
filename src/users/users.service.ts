import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllWithPagination(page: number, limit: number): Promise<{ data: User[], total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.role = updateRoleDto.role; // Asigna el nuevo rol
    await this.userRepository.save(user);
    return user;
  }

}
