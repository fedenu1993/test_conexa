import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/entities/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles) {
      // Si no hay roles especificados, permite el acceso
      return true;  
    }

    const request = context.switchToHttp().getRequest();
    // El usuario debería estar disponible desde el payload del JWT
    const user = request.user;  

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acceso denegado');
    }

    return true;
  }

}
