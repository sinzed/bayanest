# JWT Authentication Setup - Best Practices Guide

## 🎯 Architecture Overview

This NestJS application implements JWT-based authentication following industry best practices:

1. **Password Security**: Passwords are hashed using bcrypt (salt rounds: 10) before storage
2. **JWT Tokens**: Stateless authentication using JWT with configurable expiration
3. **Protected Routes**: Use `@UseGuards(JwtAuthGuard)` decorator to protect endpoints
4. **Validation**: Automatic request validation using class-validator DTOs
5. **Error Handling**: Proper HTTP exceptions (UnauthorizedException, ConflictException, etc.)

---

## 📋 Environment Variables

Create a `.env.local` or `.env` file in the backend root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="1d"  # 1 day, can use: 60s, 15m, 1h, 7d, etc.

# Server Configuration
PORT=3000
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!

---

## 🔐 Authentication Flow

### 1. User Registration

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "yourPassword123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. User Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "yourPassword123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 3. Accessing Protected Routes

**Endpoint**: `GET /auth/profile` (example protected route)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "message": "This is a protected route",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## 🛡️ How to Protect Your Routes

### Method 1: Using Guard on Individual Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard)  // ✅ Protects this route
  getCurrentUser(@CurrentUser() user: any) {
    return user;
  }
}
```

### Method 2: Protecting All Routes in a Controller

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard)  // ✅ Protects all routes in this controller
export class AdminController {
  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return { message: 'Admin dashboard', user };
  }
}
```

---

## 📦 Key Components

### 1. **DTOs (Data Transfer Objects)**

Located in `src/dtos/`:
- `LoginDto` - Email + Password validation
- `RegisterDto` - Email, Name (optional), Password with min length 6
- `CreateUserDto` - For user creation

All DTOs use `class-validator` decorators for automatic validation.

### 2. **Services**

**AuthService** (`src/auth/auth.service.ts`):
- `login()` - Validates credentials and returns JWT
- `register()` - Creates user and returns JWT
- `validateToken()` - Validates JWT token

**UserService** (`src/user/user.service.ts`):
- `createUser()` - Creates user with hashed password
- `validateUser()` - Validates email/password for login
- `findById()` - Finds user by ID

⚠️ **Security**: All methods exclude password from returned user objects!

### 3. **JWT Strategy**

Located in `src/auth/strategies/jwt.strategy.ts`:
- Validates JWT tokens from `Authorization: Bearer <token>` header
- Extracts user from token and attaches to request
- Uses JWT_SECRET from environment variables

### 4. **Guards**

**JwtAuthGuard** (`src/auth/guards/jwt-auth.guard.ts`):
- Extends Passport's AuthGuard('jwt')
- Automatically validates JWT token
- Injects user object into request

### 5. **Decorators**

**@CurrentUser()** (`src/auth/decorators/current-user.decorator.ts`):
- Extracts user from request object
- Use in protected route handlers to access authenticated user

---

## 🔧 Password Security Best Practices

### ✅ What We Implemented

1. **Hash on Backend**: Plaintext passwords are sent over HTTPS and hashed server-side
2. **Bcrypt Algorithm**: Industry-standard hashing with salt rounds = 10
3. **Password Validation**: Minimum 6 characters (configurable in DTOs)
4. **Password Exclusion**: Never return password in API responses
5. **Timing Attack Protection**: Generic "Invalid credentials" message

### ❌ Why NOT Hash on Frontend

- Hashed password becomes the credential (no security benefit)
- Backend can't enforce password policies
- Can't upgrade hashing algorithm without client updates
- HTTPS already encrypts password in transit

---

## 🚀 Testing the API

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Access Protected Route**:
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman/Thunder Client

1. Send POST request to `/auth/register` or `/auth/login`
2. Copy the `access_token` from response
3. For protected routes, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

---

## 📚 Available Endpoints

### Public Routes (No Authentication Required)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login existing user
- `POST /user/create` - Create user (alternative to register)

### Protected Routes (Require JWT Token)

- `GET /auth/profile` - Get current user profile (example)
- `GET /user/me` - Get current user info

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with configurable expiration
- ✅ Password never returned in responses
- ✅ Input validation on all endpoints
- ✅ Proper HTTP exceptions (401, 409, 404)
- ✅ CORS enabled
- ✅ Environment variables for secrets
- ⚠️ **TODO**: Add refresh token mechanism
- ⚠️ **TODO**: Add rate limiting on auth endpoints
- ⚠️ **TODO**: Add email verification
- ⚠️ **TODO**: Add password reset functionality

---

## 🛠️ Next Steps

1. **Add Refresh Tokens**: Implement refresh token rotation
2. **Role-Based Access Control (RBAC)**: Add user roles and permissions
3. **Email Verification**: Send verification emails on registration
4. **Password Reset**: Implement forgot password flow
5. **Rate Limiting**: Prevent brute force attacks
6. **Logging**: Add audit logs for authentication events
7. **2FA**: Add two-factor authentication option

---

## 📖 Documentation References

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [class-validator](https://github.com/typestack/class-validator)
- [bcrypt](https://www.npmjs.com/package/bcrypt)

---

## 💡 Tips

1. **Keep JWT_SECRET secure**: Never commit to version control
2. **Use HTTPS in production**: Always use HTTPS to encrypt data in transit
3. **Short token expiration**: Use short-lived access tokens (15min - 1 day)
4. **Implement refresh tokens**: For better user experience with security
5. **Monitor failed login attempts**: Add rate limiting and logging

---

Created with ❤️ following NestJS and JWT best practices



