import 'dotenv/config';

async function listModels() {
  try {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch (err) {
    console.error(err);
  }
}
listModels();
