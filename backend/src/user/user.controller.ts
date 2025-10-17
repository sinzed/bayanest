import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user-dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Post("create")
    createUser(@Body() body: CreateUserDto) {
        return this.userService.createUser(body.email, body.name);
    }
}
