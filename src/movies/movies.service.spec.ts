import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockMovie: Movie = {
  id: 1,
  title: 'Inception',
  director: 'Christopher Nolan',
  producer: 'Antonio Margarette',
  release_date: '4444-22-11'
} as Movie;

const mockCreateMovieDto: CreateMovieDto = {
  title: 'Interstellar',
  director: 'Christopher Nolan',
  producer: 'Antonio Margarette',
  release_date: '4444-22-11'
};

const mockUpdateMovieDto: UpdateMovieDto = {
  title: 'Inception 2',
};

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  describe('create', () => {
    it('debería crear una película correctamente', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockMovie);
      jest.spyOn(repository, 'save').mockResolvedValue(mockMovie);

      const result = await service.create(mockCreateMovieDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreateMovieDto);
      expect(repository.save).toHaveBeenCalledWith(mockMovie);
      expect(result).toEqual(mockMovie);
    });

    it('debería lanzar un error si hay un fallo en la base de datos', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockMovie);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(mockCreateMovieDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllWithPagination', () => {
    it('debería devolver películas paginadas', async () => {
      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([[mockMovie], 1]);

      const result = await service.findAllWithPagination(1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ data: [mockMovie], total: 1 });
    });
  });

  describe('findOne', () => {
    it('debería devolver una película por ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockMovie);
    });

    it('debería lanzar un error si no encuentra la película', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una película existente', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMovie);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...mockMovie, ...mockUpdateMovieDto });

      const result = await service.update(1, mockUpdateMovieDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockMovie,
        ...mockUpdateMovieDto,
      });
      expect(result.title).toBe('Inception 2');
    });

    it('debería lanzar un error si hay un fallo al actualizar', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMovie);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.update(1, mockUpdateMovieDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una película correctamente', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMovie);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockMovie);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(mockMovie);
    });

    it('debería lanzar un error si hay un fallo al eliminar', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMovie);
      jest.spyOn(repository, 'remove').mockRejectedValue(new Error());

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
