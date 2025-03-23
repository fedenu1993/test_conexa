import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { StarWarsService } from './star-wars.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: MoviesService;
  let starWarsService: StarWarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'fakeToken'),
            verify: jest.fn(() => ({ userId: 1 })),
          },
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: MoviesService,
          useValue: {
            create: jest.fn(),
            findAllWithPagination: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: StarWarsService,
          useValue: {
            syncMovies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
    starWarsService = module.get<StarWarsService>(StarWarsService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Crear pelicula con create del service', async () => {
      const dto: CreateMovieDto = {
        title: 'Test Movie',
        director: 'Director Name',
        producer: 'Producer Name',
        release_date: '4444-22-11',
      };
      const result: Movie = { id: 1, ...dto } as Movie;
      jest.spyOn(moviesService, 'create').mockResolvedValue(result);
      expect(await controller.create(dto)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('Devuelve lista de peliculas paginadas', async () => {
      const movies: Movie[] = [
        {
          id: 1,
          title: 'Test',
          director: 'Director Name',
          producer: 'Producer Name',
          release_date: '4444-22-11',
        } as Movie,
      ];
      jest
        .spyOn(moviesService, 'findAllWithPagination')
        .mockResolvedValue({ data: movies, total: 1 });
      expect(await controller.findAll(1, 10)).toEqual({
        data: movies,
        total: 1,
      });
    });
  });

  describe('getById', () => {
    it('Devuelve detalles de pelicula', async () => {
      const movie: Movie = {
        id: 1,
        title: 'Test',
        director: 'Director Name',
        producer: 'Producer Name',
        release_date: '4444-22-11',
      } as Movie;
      jest.spyOn(moviesService, 'findOne').mockResolvedValue(movie);
      expect(await controller.getById(1)).toBe(movie);
    });
  });

  describe('update', () => {
    it('Edita pelicula y devuelve la misma', async () => {
      const dto: UpdateMovieDto = { title: 'Updated Movie' };
      const updatedMovie: Movie = {
        id: 1,
        title: 'Test Movie',
        director: 'Director Name',
        producer: 'Producer Name',
        release_date: '4444-22-11',
      } as Movie;
      jest.spyOn(moviesService, 'update').mockResolvedValue(updatedMovie);
      expect(await controller.update(1, dto)).toBe(updatedMovie);
    });
  });

  describe('remove', () => {
    it('Elimina una pelicula con remove del service', async () => {
      jest.spyOn(moviesService, 'remove').mockResolvedValue(undefined);
      expect(await controller.remove(1)).toBeUndefined();
    });
  });

  describe('syncStarWarsMovies', () => {
    it('Consume la api de star wars para actualizar la lista de movies', async () => {
      jest.spyOn(starWarsService, 'syncMovies').mockResolvedValue(undefined);
      await controller.syncStarWarsMovies();
      expect(starWarsService.syncMovies).toHaveBeenCalled();
    });
  });
});
