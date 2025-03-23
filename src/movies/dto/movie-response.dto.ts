import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty({ description: 'ID de la pelicula' })
  id: number;

  @ApiProperty({ description: 'Titulo de la pelicula' })
  title: string;

  @ApiProperty({ description: 'Director de la pelicula' })
  director: string;

  @ApiProperty({ description: 'Productor de la pelicula' })
  producer: string;

  @ApiProperty({ description: 'Lanzamiento de la pelicula' })
  release_date: string;

  @ApiProperty({ description: 'Descripcion de la pelicula' })
  description: string;
}
