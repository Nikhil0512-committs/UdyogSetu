import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import 'dotenv/config';

async function test() {
  try {
    const result = await generateText({
      model: google('gemini-3.6-flash'),
      messages: [{ role: 'user', content: 'hello' }],
    });
    console.log(result.text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
