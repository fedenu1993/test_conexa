import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../entities/role.enum';

export class UpdateRoleDto {
  @ApiProperty({ description: 'Rol del usuario', enum: Role, example: Role.ADMIN })
  @IsEnum(Role)
  role: Role;
}
