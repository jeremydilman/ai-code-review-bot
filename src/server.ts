import express, { Request, Response } from 'express';
import { createHmac } from 'crypto';
import dotenv from 'dotenv';
import { fetchPRDiff, postReviewToGitHub } from './github';
import { generateReview } from './claude';

dotenv.config({ override: true });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '';
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

if (!WEBHOOK_SECRET || !GITHUB_APP_ID || !GITHUB_PRIVATE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Missing required environment variables. Check your .env file.');
  console.error('Required: GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET, ANTHROPIC_API_KEY');
  process.exit(1);
}

function validateWebhookSignature(payload: string, signature: string): boolean {
  if (!signature) return false;
  const hash = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  const expectedSignature = `sha256=${hash}`;
  return signature === expectedSignature;
}

app.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const payload = JSON.stringify(req.body);

  if (!validateWebhookSignature(payload, signature)) {
    console.warn('Invalid webhook signature');
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;
  const eventType = req.headers['x-github-event'];

  console.log(`Received event: ${eventType}, action: ${event.action}`);

  if (eventType !== 'pull_request') {
    return res.status(200).send('Event type not supported');
  }

  if (event.action !== 'opened' && event.action !== 'synchronize' && event.action !== 'reopened') {
    return res.status(200).send('Skipping non-relevant action');
  }

  if (event.pull_request?.draft) {
    console.log('Skipping draft PR');
    return res.status(200).send('Skipping draft PR');
  }

  // Respond immediately to GitHub to avoid timeout
  res.status(200).send('Processing review...');

  try {
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const prNumber = event.pull_request.number;
    const installationId = event.installation.id;

    console.log(`Processing PR: ${owner}/${repo}#${prNumber} (installation ${installationId})`);

    const diff = await fetchPRDiff(owner, repo, prNumber, installationId);
    if (!diff || diff.trim().length === 0) {
      console.log('No code changes to review');
      return;
    }

    console.log(`Fetched diff (${diff.length} bytes)`);

    const review = await generateReview(diff);
    console.log('Generated review from Claude');

    await postReviewToGitHub(owner, repo, prNumber, review, installationId);
    console.log('Posted review to GitHub');
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send({ status: 'ok' });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('AI Code Review Bot is running. POST to /webhook for GitHub events.');
});

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});
