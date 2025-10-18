import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async login(email: string, password: string) {
        // Validate user credentials
        const user = await this.userService.validateUser(email, password);

        // Generate JWT token
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
            user,
        };
    }

    async register(email: string, name: string, password: string) {
        // Create new user
        const user = await this.userService.createUser(email, name, password);

        // Generate JWT token for newly registered user
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
            user,
        };
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        } catch (error) {
            return null;
        }
    }
}
