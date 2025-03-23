import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  // Crear una nueva película
  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    try {
      const movie = this.movieRepository.create(createMovieDto);
      return await this.movieRepository.save(movie);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la película');
    }
  }

  // Obtener todas las películas con paginación
  async findAllWithPagination(page: number, limit: number): Promise<{ data: Movie[], total: number }> {
    try {
      const [data, total] = await this.movieRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });
      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las películas');
    }
  }

  // Buscar películas por título
  async findByTitle(titles: string[]): Promise<Movie[]> {
    try {
      return await this.movieRepository.find({
        where: {
          title: In(titles),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar las películas por título');
    }
  }

  // Obtener los detalles de una película por su ID
  async findOne(id: number): Promise<Movie> {
    try {
      const movie = await this.movieRepository.findOne({ where: { id } });
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      return movie;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Si es un error de no encontrado, lo lanzamos tal cual.
      }
      throw new InternalServerErrorException('Error al obtener los detalles de la película');
    }
  }

  // Actualizar una película existente
  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    try {
      const movie = await this.findOne(id); // Verifica si la película existe
      Object.assign(movie, updateMovieDto);  // Asigna los valores del DTO al objeto movie
      return await this.movieRepository.save(movie);  // Guarda los cambios en la base de datos
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la película');
    }
  }

  // Eliminar una película
  async remove(id: number): Promise<void> {
    try {
      const movie = await this.findOne(id); // Verifica si la película existe
      await this.movieRepository.remove(movie); // Elimina la película de la base de datos
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar la película');
    }
  }
}
