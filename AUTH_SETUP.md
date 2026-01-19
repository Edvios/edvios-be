# Supabase Authentication Setup Guide

This guide explains how to set up and use the Supabase authentication system in your NestJS backend.

## Features

- **Server-side authentication** using Supabase
- **Role-based access control** (ADMIN, AGENT, STUDENT)
- **JWT token authentication** via Passport
- **User registration and login** endpoints
- **Token refresh** functionality
- **Protected routes** with role-based guards

## Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your credentials:
   - Project URL
   - Anon Key (public key)
   - JWT Secret (from Project Settings > API)

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

## Database Migration

After updating the Prisma schema with User model:

```bash
npm run prisma migrate dev --name init
npm run prisma generate
```

This will:
- Create the User table with role support
- Generate updated Prisma client

## API Endpoints

### 1. Register User

**POST** `/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT"  // Optional: ADMIN, AGENT, STUDENT (default: STUDENT)
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

### 2. Login User

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_value",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

### 3. Get Current User

**GET** `/auth/me`

Headers:
```
Authorization: Bearer {access_token}
```

Response: User object

### 4. Refresh Token

**POST** `/auth/refresh`

```json
{
  "refresh_token": "refresh_token_value"
}
```

Response:
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

## Using Guards and Decorators

### JwtAuthGuard

Protects routes to require JWT authentication:

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@CurrentUser() user: any) {
  return { user };
}
```

### RoleGuard + Roles Decorator

Protects routes based on user roles:

```typescript
@Get('admin-panel')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
async adminPanel(@CurrentUser() user: any) {
  return { message: 'Welcome Admin', user };
}
```

Multiple roles:

```typescript
@Get('staff-only')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN, UserRole.AGENT)
async staffRoute(@CurrentUser() user: any) {
  return { message: 'For admins and agents', user };
}
```

### CurrentUser Decorator

Get the current authenticated user:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: any) {
  console.log(user); // { userId, email, role }
  return user;
}
```

## Complete Example: Creating Protected Routes

```typescript
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard, RoleGuard } from './auth/guards';
import { Roles, CurrentUser } from './auth/decorators';
import { UserRole } from '@prisma/client';

@Controller('courses')
export class CoursesController {
  // Public route
  @Get()
  getAllCourses() {
    return { courses: [] };
  }

  // Protected - all authenticated users
  @Post()
  @UseGuards(JwtAuthGuard)
  createCourse(@Body() data: any, @CurrentUser() user: any) {
    return { message: 'Course created by ' + user.email };
  }

  // Protected - only admins can delete
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  deleteCourse(@Param('id') id: string) {
    return { message: 'Course deleted' };
  }

  // Protected - admins and agents can edit
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  updateCourse(@Param('id') id: string, @Body() data: any) {
    return { message: 'Course updated' };
  }

  // Protected - students and above (all)
  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  getMyEnrolledCourses(@CurrentUser() user: any) {
    return { courses: [], userId: user.userId };
  }
}
```

## User Roles

- **STUDENT**: Basic users, can view content
- **AGENT**: Can manage content, between student and admin
- **ADMIN**: Full access, can manage users and system

## Troubleshooting

### JWT Secret Not Found
- Ensure `SUPABASE_JWT_SECRET` is in your `.env` file
- Get it from Supabase Project Settings > API

### User Not Found After Login
- Make sure database migration has run
- Check that user was created in both Supabase Auth and your database

### Token Expired
- Use the refresh token endpoint to get a new access token
- Store refresh token securely on client side

### Role Guard Throwing 403
- Verify user has the required role
- Check that role is properly set in Supabase user metadata

## Security Best Practices

1. **Store tokens securely**: Use httpOnly cookies on the client
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate tokens**: Implement token rotation for sensitive operations
4. **Validate inputs**: Always validate user input before processing
5. **Limit token expiry**: Keep token expiration times reasonable
6. **Use strong passwords**: Enforce strong password requirements

## Next Steps

1. Install dependencies: `npm install`
2. Configure `.env` with your Supabase credentials
3. Run migrations: `npm run prisma migrate dev`
4. Start the server: `npm run start:dev`
5. Test endpoints using Postman or similar tools
