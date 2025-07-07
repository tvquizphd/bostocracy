# Bostocracy

A Boston transit event management application built with Express.js, Prisma, and SQLite.

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
   PORT=8000
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

7. **Visit the application:**
   Open http://localhost:8000 in your browser

## 👤 Test User

- **Username:** `a`
- **Password:** `a`

## 🔧 Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server (alias)
- `npm test` - Run tests
- `npm run seed` - Seed database with test user
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 📁 Project Structure

```
├── server.js              # Main Express server
├── icons.js               # SVG icon generation
├── auth-utils.js          # Authentication utilities
├── test-server.js         # Server setup testing
├── migrate-db.js          # Data migration script
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Database seeding
├── public/               # Static HTML pages
│   ├── index.html        # Main application page
│   ├── login.html        # Login page
│   └── register.html     # Registration page
└── static/               # Frontend assets (JS, CSS)
    └── bostocracy/       # Original frontend files
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

## 🗄️ Database

Uses Prisma ORM with SQLite:
- **Schema**: Matches original Django models
- **Data**: Preserves existing data
- **Migrations**: Supports Prisma migrations

## 🎨 Frontend

Modern web application with:
- **Web Components**: Custom elements for UI
- **Leaflet.js**: Interactive maps
- **MBTA Integration**: Real-time transit data
- **Responsive Design**: Works on all devices

## 🔐 Authentication

- **Session-based**: Express sessions
- **Django-compatible**: Supports existing password hashes
- **Secure**: bcrypt for new users

## 🚨 Important Notes

1. **MBTA API Key**: Get your key from [MBTA API](https://api-v3.mbta.com/register)
2. **Database**: Uses existing SQLite database
3. **Port**: Defaults to 8000 (same as Django)
4. **Security**: Change session secret in production

## 🐛 Troubleshooting

See `EXPRESS_README.md` for detailed troubleshooting guide.
