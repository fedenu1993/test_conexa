import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { Roles } from '../auth/roles/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { ApiBody,ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página de resultados' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de resultados por página' })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: User[]; total: number }> {
    return await this.usersService.findAllWithPagination(page, limit);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Actualizar el rol de un usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<User> {
    return await this.usersService.updateRole(id, updateRoleDto);
  }
}
