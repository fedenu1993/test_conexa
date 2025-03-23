import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { MoviesModule } from './movies/movies.module';
import { SeederService } from './migrations/seeder/seeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule, 
    UsersModule, 
    MoviesModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    SeederService
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}
  async onModuleInit() {
    // Ejecutar el seeder para tener un admin al arrancar la app
    await this.seederService.seed(); 
  }
}