import { SetMetadata } from '@nestjs/common';
export enum UserRole {
    Admin = 'admin',
    Manager = 'manager',
  }
  
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);




