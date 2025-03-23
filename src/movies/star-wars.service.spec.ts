import { Test, TestingModule } from '@nestjs/testing';
import { StarWarsService } from './star-wars.service';
import { MoviesService } from './movies.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

describe('StarWarsService', () => {
  let service: StarWarsService;
  let moviesService: MoviesService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarWarsService,
        {
          provide: MoviesService,
          useValue: {
            findByTitle: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://swapi.dev/api'), // Mock de la URL de la API
          },
        },
      ],
    }).compile();

    service = module.get<StarWarsService>(StarWarsService);
    moviesService = module.get<MoviesService>(MoviesService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('Estar definido', () => {
    expect(service).toBeDefined();
  });

  it('Transforma la data de la api en CreateMovieDto', () => {
    const apiData = {
      title: 'Star Wars',
      director: 'George Lucas',
      producer: 'Lucasfilm',
      opening_crawl: 'A long time ago...',
      release_date: '1977-05-25',
    };

    const result = service.getDataCreateMovieDto(apiData);
    expect(result).toBeInstanceOf(CreateMovieDto);
    expect(result.title).toBe(apiData.title);
    expect(result.director).toBe(apiData.director);
    expect(result.producer).toBe(apiData.producer);
    expect(result.description).toBe(apiData.opening_crawl);
    expect(result.release_date).toBe(apiData.release_date);
  });

  it('Obtiene peliculas de la api de star wars', async () => {
    const apiResponse: AxiosResponse = {
      data: {
        results: [
          {
            title: 'Star Wars',
            director: 'George Lucas',
            producer: 'Lucasfilm',
            opening_crawl: 'A long time ago...',
            release_date: '1977-05-25',
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' }, // Asegúrate de proporcionar encabezados válidos
      config: {} as any, // También aseguramos que 'config' esté tipado correctamente
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(apiResponse));

    const movies = await service.getStarWarsMovies();
    expect(movies).toHaveLength(1);
    expect(movies[0].title).toBe('Star Wars');
  });

  it('Deberia agregar peliculas de la api a la bdd', async () => {
    jest
      .spyOn(service, 'getStarWarsMovies')
      .mockResolvedValue([
        {
          title: 'Star Wars',
          director: 'George Lucas',
          producer: 'Lucasfilm',
          description: '...',
          release_date: '1977-05-25',
        },
      ]);
    jest.spyOn(moviesService, 'findByTitle').mockResolvedValue([]);
    jest.spyOn(moviesService, 'create').mockResolvedValue({} as any);

    await service.syncMovies();
    expect(moviesService.create).toHaveBeenCalledTimes(1);
  });

  it('No debe agregar peliculas ya existentes', async () => {
    jest
      .spyOn(service, 'getStarWarsMovies')
      .mockResolvedValue([
        {
          title: 'Star Wars',
          director: 'George Lucas',
          producer: 'Lucasfilm',
          description: '...',
          release_date: '1977-05-25',
        },
      ]);
    jest
      .spyOn(moviesService, 'findByTitle')
      .mockResolvedValue([
        {
          title: 'Star Wars',
          director: 'George Lucas',
          producer: 'Lucasfilm',
          description: '...',
          release_date: '1977-05-25',
        } as any,
      ]);
    jest.spyOn(moviesService, 'create');

    await service.syncMovies();
    expect(moviesService.create).not.toHaveBeenCalled();
  });

  it('Debe retornar error de la API', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw new Error('API error');
    });
    await expect(service.getStarWarsMovies()).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
