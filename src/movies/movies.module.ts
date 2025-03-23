import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { UsersModule } from 'src/users/users.module';
import { Movie } from './entities/movie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { StarWarsService } from './star-wars.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Movie]),
    UsersModule
  ],
  controllers: [MoviesController],
  providers: [MoviesService, StarWarsService, JwtService],
})
export class MoviesModule {}
