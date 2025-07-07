#!/bin/bash

echo "🚀 Setting up Bostocracy Express Server..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL="file:./db.sqlite3"
MBTA_API_KEY=your_mbta_api_key_here
PORT=8000
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please update MBTA_API_KEY in .env with your actual API key"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate
echo ""

# Push schema to database
echo "🗄️  Pushing schema to database..."
npm run db:push
echo ""

# Test the setup
echo "🧪 Testing setup..."
npm test
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update MBTA_API_KEY in .env file"
echo "2. Run 'npm start' to start the server"
echo "3. Visit http://localhost:8000"
echo ""
echo "Test user: username='a', password='a'" 