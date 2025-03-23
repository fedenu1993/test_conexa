import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateMovieDto {
  @ApiProperty({ description: 'Titulo de la pelicula', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Director de la pelicula', required: false })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiProperty({ description: 'Productor de la pelicula', required: false })
  @IsOptional()
  @IsString()
  producer?: string;

  @ApiProperty({
    description: 'Lanzamiento de la pelicula',
    example: '2023-12-25',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiProperty({ description: 'Descripcion de la pelicula', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
