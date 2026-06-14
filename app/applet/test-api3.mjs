import { GoogleGenAI } from '@google/genai';

async function testKey(apiKey, model) {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
          parts:[{text: 'A picture of a cat'}]
      }
    });
    console.log(`Success with ${model}!`);
  } catch (e) {
    console.log(`Error with ${model}:`, e.message);
  }
}

async function run() {
  const customKey = process.env.GEMINI_API_KEY || '';
  
  await testKey(customKey, 'gemini-2.5-flash-image');
  await testKey(customKey, 'imagen-3.0-generate-002');
}
run();
