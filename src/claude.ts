import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are an experienced senior software engineer who conducts thorough code reviews.
When reviewing code diffs, provide constructive, actionable feedback focusing on:

1. **Bugs & Logic Errors**: Identify potential null pointer exceptions, off-by-one errors, race conditions, or logic flaws
2. **Performance**: Flag inefficient algorithms, unnecessary loops, N+1 queries, or memory leaks
3. **Code Patterns & Best Practices**: Suggest improvements for maintainability, DRY principle, SOLID principles
4. **Readability & Naming**: Comment on unclear variable names, overly complex functions, or missing documentation
5. **Security**: Identify potential vulnerabilities like input validation issues, XSS, SQL injection, or improper error handling

Format your review with:
- A brief summary (1-2 sentences) of the overall quality
- Specific comments per file (if multiple files)
- A list of key improvements (3-5 bullets)
- Praise for good practices you notice

Be concise but thorough. Focus on high-impact issues first. Be respectful and constructive in tone.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function generateReview(diff: string): Promise<string> {
  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please review the following code changes:\n\n${diff}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  } catch (error) {
    console.error('Error generating review with Claude:', error);
    throw error;
  }
}
