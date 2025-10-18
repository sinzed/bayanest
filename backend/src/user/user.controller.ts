import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user-dto';
import { UserService } from './user.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles, UserRole } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.gaurd';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('create')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(
            createUserDto.email,
            createUserDto.name || '',
            createUserDto.role,
            createUserDto.password,
        );
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@CurrentUser() user: any) {
        // This route is protected - requires valid JWT token
        return user;
    }

    @Get('manager')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Manager)
    getManagerDashboard(@CurrentUser() user: any) {
        // This route is protected - requires valid JWT token
        return user;
    }

}
