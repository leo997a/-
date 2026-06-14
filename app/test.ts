import { GoogleGenAI } from '@google/genai';

async function testKey(apiKey: string, model: string) {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: 'A picture of a cat',
    });
    console.log(`Success with ${model}!`);
  } catch (e: any) {
    console.log(`Error with ${model}:`, e.message);
  }
}

async function run() {
  const customKey = 'AIzaSyABqDGXeGOJE3XraDxq8EmjGk2tanfnlbA';
  const systemKey = process.env.GEMINI_API_KEY || customKey;
  
  await testKey(systemKey, 'gemini-2.5-flash-image');
  await testKey(systemKey, 'gemini-3.1-flash-image-preview');
  await testKey(systemKey, 'imagen-3.0-generate-002');
}
run();
