# Quick Start Guide

Get the AI Code Review Bot running in 10 minutes.

## Step 1: Create GitHub App (2 min)

1. Go to [github.com/settings/apps](https://github.com/settings/apps)
2. Click "New GitHub App"
3. Fill in:
   - App name: `AI Code Review Bot`
   - Webhook URL: `http://localhost:3000/webhook` (we'll update this later)
   - Webhook secret: Generate random secret → save it
4. Permissions: `pull_requests` (Read & write), `contents` (Read-only)
5. Events: Check `pull_request`
6. Click "Create GitHub App"

## Step 2: Get Your Credentials (2 min)

From your app page:
- Copy **App ID** → goes in `GITHUB_APP_ID`
- Generate & download **private key** (.pem) → contents go in `GITHUB_PRIVATE_KEY`
- Copy **webhook secret** → goes in `GITHUB_WEBHOOK_SECRET`

## Step 3: Set Up Environment (1 min)

```bash
cd ai-code-review-bot
cp .env.example .env
```

Edit `.env`:
```
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
GITHUB_WEBHOOK_SECRET=your_secret_here
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
PORT=3000
```

**Note for GITHUB_PRIVATE_KEY**: Copy the entire .pem file content, replacing line breaks with `\n`:
```
-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n...END RSA PRIVATE KEY-----
```

## Step 4: Install on a Test Repo (1 min)

1. Go to your GitHub App → "Install App" tab
2. Install on a repository you own

## Step 5: Run Locally (2 min)

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`).

## Step 6: Update Webhook URL (1 min)

1. Go back to your GitHub App settings
2. Update **Webhook URL** to `https://abc123.ngrok.io/webhook`
3. Save changes

## Step 7: Test It (1 min)

1. Open a test PR on your repo
2. Watch your terminal for the webhook
3. Check the PR for the review comment!

## Troubleshooting

**"Invalid webhook signature"**
```
→ Make sure GITHUB_WEBHOOK_SECRET matches GitHub settings
```

**"No webhook received"**
```
→ Check ngrok is running
→ Verify webhook URL in GitHub is correct
→ Check GitHub App is installed on the test repo
```

**"Claude API error"**
```
→ Verify ANTHROPIC_API_KEY is correct
→ Check you have credits on Anthropic account
```

## Next: Deploy to Production

Once testing works, deploy to Vercel or Railway:

```bash
vercel
# or
railway up
```

Update GitHub App's webhook URL to your production URL.

## What It Does

- Listens for PR events
- Fetches the code diff
- Sends it to Claude API
- Posts the review as a comment

That's it! You now have an AI code reviewer. 🤖
