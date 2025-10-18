import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async createUser(email: string, name: string, role: string, password: string) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user and exclude password from response
        const user = await this.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
            },
        });

        // Exclude password from returned object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Exclude password from returned object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async findById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Exclude password from returned object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
