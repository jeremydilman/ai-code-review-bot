#!/bin/bash

echo "🤖 AI Code Review Bot - Setup Script"
echo "======================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✓ .env file already exists"
else
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✓ Created .env - please edit it with your credentials"
    echo ""
fi

# Check Node version
NODE_VERSION=$(node -v)
echo "✓ Node version: $NODE_VERSION"

# Check npm
npm_version=$(npm -v)
echo "✓ npm version: $npm_version"

echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your credentials:"
echo "   - GITHUB_APP_ID"
echo "   - GITHUB_PRIVATE_KEY"
echo "   - GITHUB_WEBHOOK_SECRET"
echo "   - ANTHROPIC_API_KEY"
echo ""
echo "2. Run the app:"
echo "   npm run dev"
echo ""
echo "3. In another terminal, expose to internet:"
echo "   ngrok http 3000"
echo ""
echo "4. Update GitHub App webhook URL to the ngrok URL"
echo ""
echo "5. Create a test PR to verify it works!"
echo ""
echo "📚 For more details, see QUICKSTART.md"
