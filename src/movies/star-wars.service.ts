import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { ConfigService } from '@nestjs/config';
import { moviesDataAdapter } from './interfaces/movie-data-adapter.interface';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { MoviesService } from './movies.service';

@Injectable()
export class StarWarsService implements moviesDataAdapter {
  
  private readonly API_URL: string | undefined;

  constructor(
    private readonly moviesService: MoviesService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService, 
  ) {
    this.API_URL = this.configService.get<string>('STAR_WARS_API_URL');
  }

  // Método que implementa la interfaz para adaptar data
  getDataCreateMovieDto(apiData: any): CreateMovieDto {
    try {
      const movieDto = new CreateMovieDto();
      movieDto.title = apiData.title;
      movieDto.director = apiData.director;
      movieDto.producer = apiData.producer;
      movieDto.description = apiData.opening_crawl;
      movieDto.release_date = apiData.release_date;
      return movieDto;
    } catch (error) {
      throw new InternalServerErrorException('Error al adaptar los datos de la película');
    }
  }

  // Método para obtener las películas desde la API de Star Wars
  async getStarWarsMovies(): Promise<CreateMovieDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_URL}/films/`),
      );
      return response.data.results.map((movie) => this.getDataCreateMovieDto(movie));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las películas de la API de Star Wars');
    }
  }

  // Método para sincronizar las películas con la base de datos
  async syncMovies(): Promise<void> {
    try {
      // Obtengo las peliculas desde la api
      const starWarsMovies = await this.getStarWarsMovies();
      // Extraigo los titles buscando coincidencias en la bdd
      const arrayTitles = starWarsMovies.map(s => s.title);
      const existingMovies = await this.moviesService.findByTitle(arrayTitles);
    
      // Compara las películas de la API con las existentes en la base de datos
      const newMovies = starWarsMovies.filter(
        (apiMovie) =>
          !existingMovies.some((dbMovie) => dbMovie.title === apiMovie.title),
      );
    
      // Si hay nuevas películas, las agregamos a la base de datos
      if (newMovies.length > 0) {
        await this.saveMovies(newMovies);
      }
    } catch (error) {
      throw new InternalServerErrorException('Error al sincronizar las películas con la base de datos');
    }
  }

  // Método para guardar nuevas películas en la base de datos
  private async saveMovies(movies: CreateMovieDto[]): Promise<void> {
    try {
      for (const movie of movies) {
        await this.moviesService.create(movie);
      }
    } catch (error) {
      throw new InternalServerErrorException('Error al guardar las películas en la base de datos');
    }
  }
}
