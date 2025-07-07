# Express Server Migration

This document outlines the Express server that replaces the Django backend for the Bostocracy project.

## 🚀 Quick Start

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

5. **Test the setup:**
   ```bash
   npm test
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
├── server.js              # Main Express server
├── icons.js               # SVG icon generation (JS version of Django icons.py)
├── auth-utils.js          # Authentication utilities
├── test-server.js         # Server setup testing
├── migrate-db.js          # Data migration script
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Database seeding
└── bostocracy/           # Existing Django frontend files
    ├── static/           # Static assets (JS, CSS)
    └── templates/        # HTML templates
```

## 🔌 API Endpoints

### Authentication
- `POST /accounts/login/` - User login
- `POST /accounts/logout/` - User logout  
- `POST /accounts/register/` - User registration

### Events
- `GET /events` - Get all events
- `POST /event` - Create new event (requires auth)

### MBTA Integration
- `GET /keys/mbta` - Get MBTA API key

### SVG Icons
- `GET /line-{color}-{degrees}.svg` - Single line icon
- `GET /line-{color1}-{degrees1}--{color2}-{degrees2}.svg` - Double line icon

### Pages
- `GET /` - Main application page
- `GET /accounts/login/` - Login page
- `GET /accounts/register/` - Registration page

## 🔐 Authentication

The server uses Express sessions for authentication, compatible with Django's session system:

- **Session-based**: Uses `express-session` middleware
- **Django-compatible**: Supports existing Django password hashes
- **Migration-friendly**: New users get bcrypt hashes, old users keep Django hashes

### Password Verification
- **Django format**: `sha1$salt$hash` (for existing users)
- **bcrypt format**: Standard bcrypt hashes (for new users)

## 🗄️ Database

Uses Prisma ORM with the existing SQLite database:

- **Schema**: Matches Django models exactly
- **Relations**: Preserves all Django relationships
- **Data**: Existing data remains intact
- **Migrations**: Supports both Django and Prisma migrations

## 🎨 Frontend Compatibility

The Express server serves the existing Django frontend:

- **Static files**: Served from `/static` endpoint
- **Templates**: HTML files served directly
- **API compatibility**: Same endpoints as Django
- **No changes needed**: Frontend works without modification

## 🧪 Testing

Run the test suite to verify setup:

```bash
npm test
```

Tests include:
- Database connection
- User queries
- Post queries  
- Authentication
- Password verification

## 🔧 Development

### Available Scripts
- `npm start` - Start the server
- `npm run dev` - Start the server (alias)
- `npm test` - Run tests
- `npm run seed` - Seed database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

### Environment Variables
- `DATABASE_URL` - SQLite database path
- `MBTA_API_KEY` - MBTA API key
- `PORT` - Server port (default: 8000)

## 🚨 Important Notes

1. **Password Migration**: Existing Django users can log in with their original passwords
2. **Session Security**: Change the session secret in production
3. **HTTPS**: Enable secure cookies in production
4. **API Key**: Ensure MBTA API key is properly configured

## 🔄 Migration from Django

1. **Data**: Use `migrate-db.js` to transfer data
2. **Users**: Existing users work without changes
3. **Frontend**: No frontend changes required
4. **API**: All endpoints maintain compatibility

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Run `npm run db:generate` and `npm run db:push`
   - Check `.env` file has correct `DATABASE_URL`

2. **Authentication not working**
   - Run `npm run seed` to create test user
   - Check password hashing in `auth-utils.js`

3. **Static files not loading**
   - Ensure `bostocracy/static` directory exists
   - Check file permissions

4. **MBTA API errors**
   - Verify `MBTA_API_KEY` in `.env` file
   - Check API key validity

### Debug Mode
Add `DEBUG=*` to your environment for detailed logging. 