import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Nombre de usuario', example: 'nu_fede', required: false })
  username?: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'fede@example.com', required: false })
  email?: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: '123Prueba', required: false })
  password?: string;
}