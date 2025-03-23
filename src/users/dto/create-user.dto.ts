import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'fede_nu' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'fedenu@insta.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'Prueba123' })
  @IsString()
  @MinLength(6)
  password: string;
}
