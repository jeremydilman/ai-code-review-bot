# AI Code Review Bot

Automatically reviews GitHub pull requests using Claude AI. The bot analyzes code diffs and posts constructive, actionable feedback directly to PRs.

## Features

- 🤖 Uses Claude AI for intelligent code reviews
- 💬 Posts reviews as GitHub PR comments
- 🔍 Detects bugs, performance issues, and best practice violations
- 🛡️ Validates webhook signatures for security
- ⚡ Lightweight and fast
- 🔧 Easy to deploy and customize

## Setup

### 1. Prerequisites
- Node.js 18+
- GitHub account
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### 2. Create a GitHub App

1. Go to **Settings → Developer settings → GitHub Apps**
2. Click "New GitHub App"
3. Fill in:
   - **App name**: `AI Code Review Bot` (or your choice)
   - **Homepage URL**: `https://github.com` (for now)
   - **Webhook URL**: You'll set this after deployment (use `http://localhost:3000/webhook` for local testing)
   - **Webhook secret**: Generate a random secret and save it
4. Under **Permissions**:
   - `pull_requests`: Read & write
   - `contents`: Read-only
5. Under **Subscribe to events**:
   - Check `pull_request`
6. Click "Create GitHub App"

### 3. Generate a Private Key
1. On your GitHub App page, scroll down to "Private keys"
2. Click "Generate a private key" and save the `.pem` file

### 4. Install the App on a Test Repo
1. Go to your app's "Install App" tab
2. Install it on one of your repositories

### 5. Local Setup

```bash
# Clone/navigate to the project
cd ai-code-review-bot

# Copy the example env file
cp .env.example .env

# Edit .env with your values
# - GITHUB_APP_ID: from your GitHub App settings
# - GITHUB_PRIVATE_KEY: contents of the .pem file (with literal \n for newlines)
# - GITHUB_WEBHOOK_SECRET: the secret you generated
# - ANTHROPIC_API_KEY: your Anthropic API key
```

### 6. Run Locally with ngrok

```bash
# Install ngrok if you don't have it
# https://ngrok.com/download

# Start the bot
npm run dev

# In another terminal, expose localhost to the internet
ngrok http 3000

# Copy the ngrok URL and update your GitHub App's webhook URL
# (e.g., https://abc123.ngrok.io/webhook)
```

### 7. Test It

1. Create a test PR on your repo
2. Watch the webhook logs in the bot's terminal
3. The bot should post a review as a comment on the PR

## Deployment

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

### Option 2: Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Add environment variables
5. Set webhook URL to your Railway app's URL

## Configuration

Edit the system prompt in `src/claude.ts` to customize review style and focus areas.

## Architecture

```
GitHub PR opened/updated
         ↓
    Webhook to /webhook
         ↓
   Validate signature
         ↓
   Fetch PR diff from GitHub API
         ↓
   Send diff to Claude API
         ↓
   Generate code review
         ↓
   Post comment to PR
```

## API Keys & Secrets

Keep your `.env` file safe and never commit it:
- `GITHUB_APP_ID`: Your GitHub App's ID
- `GITHUB_PRIVATE_KEY`: The private key from your GitHub App
- `GITHUB_WEBHOOK_SECRET`: The webhook secret you set
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## Troubleshooting

**"Invalid webhook signature"**
- Check that `GITHUB_WEBHOOK_SECRET` matches the value in GitHub App settings

**"Claude API error"**
- Verify your `ANTHROPIC_API_KEY` is correct
- Check your Anthropic account has available credits

**No review posted**
- Check server logs for errors
- Verify the PR isn't a draft
- Check that the bot has necessary GitHub permissions

## Customization

### Modify the Review Style

Edit the `SYSTEM_PROMPT` in `src/claude.ts`:
```typescript
const SYSTEM_PROMPT = `...your custom instructions...`;
```

### Ignore Certain Files

Update the `IGNORED_PATTERNS` array in `src/github.ts`:
```typescript
const IGNORED_PATTERNS = ['node_modules', 'build', ...];
```

### Change Review Model

Update the model in `src/claude.ts`:
```typescript
const message = await client.messages.create({
  model: 'claude-opus-4-1', // Change this
  ...
});
```

## Limitations

- Reviews are posted as general comments (not inline code review comments)
- Large PRs are truncated at 15KB of diff
- Respects GitHub's rate limiting
- Limited to one review per PR per event

## License

MIT

## Future Improvements

- Store review history in a database
- Allow custom review templates per repo
- Add inline code comments for specific issues
- Support for other code hosting platforms (GitLab, Bitbucket)
- Dashboard to view review history and stats
