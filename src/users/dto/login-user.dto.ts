import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'fede_nu' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'Prueba123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
