import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ description: 'Titulo de la pelicula' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Director de la pelicula' })
  @IsString()
  @IsNotEmpty()
  director: string;

  @ApiProperty({ description: 'Productor de la pelicula' })
  @IsString()
  @IsNotEmpty()
  producer: string;

  @ApiProperty({ description: 'Lanzamiento de la pelicula', example: '2023-12-25' })
  @IsDateString()
  release_date: string;

  @ApiProperty({ description: 'Descripcion de la pelicula', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
