import { CreateMovieDto } from "../dto/create-movie.dto";

export interface moviesDataAdapter {
  // Método para adaptar los datos de la API
  getDataCreateMovieDto(apiData: any): CreateMovieDto; 
}
