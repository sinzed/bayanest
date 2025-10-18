# API Authentication Flow

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REGISTRATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

   Client                    Backend                     Database
     │                         │                            │
     │  POST /auth/register    │                            │
     │  { email, name, pass }  │                            │
     ├────────────────────────>│                            │
     │                         │                            │
     │                         │  Check if user exists      │
     │                         ├───────────────────────────>│
     │                         │<───────────────────────────┤
     │                         │                            │
     │                         │  Hash password (bcrypt)    │
     │                         │                            │
     │                         │  Create user               │
     │                         ├───────────────────────────>│
     │                         │<───────────────────────────┤
     │                         │                            │
     │                         │  Generate JWT token        │
     │                         │  (sign with JWT_SECRET)    │
     │                         │                            │
     │  { access_token, user } │                            │
     │<────────────────────────┤                            │
     │                         │                            │
     │  Store token in         │                            │
     │  localStorage/cookie    │                            │
     │                         │                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

   Client                    Backend                     Database
     │                         │                            │
     │  POST /auth/login       │                            │
     │  { email, password }    │                            │
     ├────────────────────────>│                            │
     │                         │                            │
     │                         │  Find user by email        │
     │                         ├───────────────────────────>│
     │                         │<───────────────────────────┤
     │                         │                            │
     │                         │  Compare password          │
     │                         │  bcrypt.compare(pass, hash)│
     │                         │                            │
     │                         │  ✓ Valid                   │
     │                         │                            │
     │                         │  Generate JWT token        │
     │                         │                            │
     │  { access_token, user } │                            │
     │<────────────────────────┤                            │
     │                         │                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                    PROTECTED ROUTE ACCESS                                │
└─────────────────────────────────────────────────────────────────────────┘

   Client                    Backend                     Database
     │                         │                            │
     │  GET /auth/profile      │                            │
     │  Authorization: Bearer  │                            │
     │  eyJhbGciOiJIUz...      │                            │
     ├────────────────────────>│                            │
     │                         │                            │
     │                         │  JwtAuthGuard triggered    │
     │                         │                            │
     │                         │  Extract token from header │
     │                         │                            │
     │                         │  JwtStrategy.validate()    │
     │                         │  - Verify signature        │
     │                         │  - Check expiration        │
     │                         │  - Decode payload          │
     │                         │                            │
     │                         │  Find user by ID           │
     │                         │  (from token payload)      │
     │                         ├───────────────────────────>│
     │                         │<───────────────────────────┤
     │                         │                            │
     │                         │  Attach user to request    │
     │                         │  request.user = userObj    │
     │                         │                            │
     │                         │  Execute route handler     │
     │                         │  @CurrentUser() = request.user
     │                         │                            │
     │  { user data }          │                            │
     │<────────────────────────┤                            │
     │                         │                            │
```

---

## 🔑 JWT Token Structure

```
Header (Algorithm & Token Type)
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Claims)
{
  "sub": 1,              // User ID
  "email": "user@example.com",
  "iat": 1697558400,     // Issued at
  "exp": 1697644800      // Expires at
}

Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

**Full Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTY5NzU1ODQwMCwiZXhwIjoxNjk3NjQ0ODAwfQ.signature`

---

## 🛡️ Security Layers

```
┌───────────────────────────────────────────┐
│         1. HTTPS (Transport Layer)         │  ← Password encrypted in transit
├───────────────────────────────────────────┤
│         2. Validation Pipe                 │  ← Input validation
├───────────────────────────────────────────┤
│         3. DTO Validators                  │  ← Email format, password length
├───────────────────────────────────────────┤
│         4. Bcrypt Hashing                  │  ← Password hashing
├───────────────────────────────────────────┤
│         5. JWT Signing                     │  ← Token generation
├───────────────────────────────────────────┤
│         6. JwtAuthGuard                    │  ← Route protection
├───────────────────────────────────────────┤
│         7. JWT Verification                │  ← Token validation
├───────────────────────────────────────────┤
│         8. User Lookup                     │  ← User verification
└───────────────────────────────────────────┘
```

---

## 📋 Error Handling

```
┌────────────────────────────────────────────────────────────┐
│  Error Type             │  HTTP Status  │  When             │
├────────────────────────────────────────────────────────────┤
│ UnauthorizedException   │     401       │ Invalid login     │
│ ConflictException       │     409       │ Email exists      │
│ NotFoundException       │     404       │ User not found    │
│ BadRequestException     │     400       │ Invalid DTO       │
│ ForbiddenException      │     403       │ No permission     │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Token Lifecycle

```
Registration/Login
       ↓
Generate Token (expiresIn: 1d)
       ↓
Send to Client
       ↓
Client Stores Token
       ↓
Client Sends Token in Header
       ↓
Backend Validates Token
       ↓
   [Valid?]
    ↙    ↘
  Yes     No (401 Unauthorized)
   ↓
Grant Access
   ↓
After 1 day: Token Expires
       ↓
User Must Re-login
```

---

## 🎯 Best Practice Checklist

✅ **Password Security**
  - Plaintext received over HTTPS
  - Hashed with bcrypt (10 rounds)
  - Never stored or returned in plaintext
  - Minimum length enforced (6 chars)

✅ **Token Security**
  - Signed with secret key
  - Contains minimal data (ID, email)
  - Has expiration time (1 day)
  - Validated on every protected request

✅ **API Security**
  - CORS enabled
  - Validation on all inputs
  - Proper HTTP status codes
  - Generic error messages
  - Type-safe with TypeScript

✅ **Code Quality**
  - Modular architecture
  - Separation of concerns
  - Dependency injection
  - Reusable guards and decorators
  - Comprehensive error handling

---

## 🚦 Request/Response Examples

### ✅ Successful Registration

**Request:**
```http
POST /auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "secure123"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTY5NzU1ODQwMCwiZXhwIjoxNjk3NjQ0ODAwfQ.Qr5Z9FEk...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### ❌ Failed Login (Invalid Credentials)

**Request:**
```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "wrongpassword"
}
```

**Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### ❌ Duplicate Registration

**Response:**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

### ❌ Protected Route Without Token

**Request:**
```http
GET /auth/profile HTTP/1.1
Host: localhost:3000
```

**Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 📱 Frontend Integration Example

### React/Next.js

```typescript
// Login function
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token
    localStorage.setItem('access_token', data.access_token);
    return data.user;
  } else {
    throw new Error(data.message);
  }
}

// Protected API call
async function getProfile() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3000/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login';
    return;
  }
  
  return await response.json();
}
```

---

**Created**: 2025-10-17  
**Status**: ✅ Ready for Production



