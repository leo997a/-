import { GoogleGenAI } from '@google/genai';

async function testKey(apiKey, model) {
  const ai = new GoogleGenAI({ apiKey });
  try {
    console.log(`Testing ${model} with ${apiKey.slice(0, 10)}...`);
    const response = await ai.models.generateContent({
      model: model,
      contents: 'A picture of a cat'
    });
    console.log(`Success!`);
  } catch (e) {
    console.log(`Error:`, e.message);
  }
}

async function run() {
  await testKey('AIzaSyABqDGXeGOJE3XraDxq8EmjGk2tanfnlbA', 'gemini-2.5-flash-image');
  await testKey('AIzaSyABqDGXeGOJE3XraDxq8EmjGk2tanfnlbA', 'imagen-3.0-generate-002');
  await testKey('AIzaSyCGX5xIg_y8BYntXq1SBzaXkXRg1qnOU8U', 'gemini-2.5-flash');
}
run();
