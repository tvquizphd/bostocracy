# Prisma Migration Guide

This document outlines the migration from Django to Express + Prisma for the Bostocracy project.

## Prisma Schema

The Prisma schema (`prisma/schema.prisma`) has been created to match the existing Django models:

### Core Models
- **User**: Extends Django's AbstractUser with all standard fields
- **Post**: Events with datetime, stop_key, title, and org fields
- **Session**: Django session management
- **AdminLog**: Django admin logging

### Django Auth Models (for compatibility)
- **Group**: User groups
- **Permission**: User permissions  
- **ContentType**: Django content types
- **UserGroup**: Many-to-many user-group relationships
- **UserPermission**: Many-to-many user-permission relationships
- **GroupPermission**: Many-to-many group-permission relationships

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```
   DATABASE_URL="file:./db.sqlite3"
   MBTA_API_KEY=your_mbta_api_key_here
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Push schema to database:**
   ```bash
   npm run db:push
   ```

5. **Migrate existing data (optional):**
   ```bash
   node migrate-db.js
   ```

6. **Seed database with test user:**
   ```bash
   node prisma/seed.js
   ```

## Database Schema Notes

- The schema maintains compatibility with the existing SQLite database
- All Django table names are preserved using `@@map()` directives
- Field names are converted to camelCase for JavaScript conventions
- SQLite doesn't support `@db.VarChar()` or `@db.Text()` annotations, so they're removed

## Key Differences from Django

1. **No Foreign Key Relationship**: The current Django schema doesn't link Posts to Users, so this relationship isn't modeled in Prisma
2. **Password Hashing**: Django uses its own password hashing; we'll use bcryptjs for new users
3. **Session Management**: Will be handled by Express sessions instead of Django sessions

## Next Steps

1. Create Express server with equivalent API endpoints
2. Implement authentication middleware
3. Convert Django views to Express routes
4. Test API compatibility with existing frontend 