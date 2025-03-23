import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { MovieResponseDto } from './dto/movie-response.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Role } from '../users/entities/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Movie } from './entities/movie.entity';
import { StarWarsService } from './star-wars.service';

@ApiTags('Movies')
@Controller('movies')
@ApiBearerAuth()
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly starWarsService: StarWarsService,
  ) {}

  // Endpoint para crear una película
  @Post()
  @ApiOperation({ summary: 'Crea una nueva película' })
  @ApiResponse({
    status: 201,
    description: 'La película fue creada con éxito',
    type: MovieResponseDto,
  })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createMovieDto: CreateMovieDto): Promise<MovieResponseDto> {
    return this.moviesService.create(createMovieDto);
  }

  // Endpoint para obtener todas las películas con paginación
  @Get()
  @ApiOperation({ summary: 'Obtener todas las películas con paginación' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página de resultados',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de resultados por página',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Lista de películas obtenida exitosamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Movie[]; total: number }> {
    return await this.moviesService.findAllWithPagination(page, limit);
  }

  // Endpoint para obtener los detalles de una película específica
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una película específica' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de película',
    type: MovieResponseDto,
  })
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getById(@Param('id') id: number): Promise<MovieResponseDto> {
    return this.moviesService.findOne(id);
  }

  // Endpoint para editar una película
  @Put(':id')
  @ApiOperation({ summary: 'Editar una película' })
  @ApiResponse({
    status: 200,
    description: 'La película fue editada con éxito',
    type: MovieResponseDto,
  })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id') id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    return this.moviesService.update(id, updateMovieDto);
  }

  // Endpoint para eliminar una película
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una película' })
  @ApiResponse({
    status: 200,
    description: 'La película fue eliminada con éxito',
  })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: number): Promise<void> {
    return this.moviesService.remove(id);
  }

  // Endpoint para sincronizar las películas de Star Wars
  @Post('sync-star-wars')
  @ApiOperation({
    summary: 'Sincroniza las películas de Star Wars desde la API',
  })
  @ApiResponse({
    status: 200,
    description: 'Películas sincronizadas correctamente',
  })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async syncStarWarsMovies() {
    await this.starWarsService.syncMovies();
  }
}
