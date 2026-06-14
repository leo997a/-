import { GoogleGenAI } from '@google/genai';

async function testKey(apiKey: string, model: string) {
  const ai = new GoogleGenAI({ apiKey });
  try {
    console.log(`Testing ${model} with ${apiKey.slice(0, 10)}...`);
    const response = await ai.models.generateContent({
      model: model,
      contents: 'A picture of a cat',
      config: {
          imageConfig: { aspectRatio: "3:4" }
      }
    });
    console.log(`Success! Images: ${response.candidates?.[0]?.content?.parts?.length}`);
  } catch (e: any) {
    console.log(`Error:`, e.message);
  }
}

async function run() {
  await testKey('AIzaSyABqDGXeGOJE3XraDxq8EmjGk2tanfnlbA', 'gemini-2.5-flash-image');
  await testKey('AIzaSyABqDGXeGOJE3XraDxq8EmjGk2tanfnlbA', 'gemini-3.1-flash-image-preview');
  await testKey('AIzaSyABqDGXeGOJE3XraDxq8EmjGk2tanfnlbA', 'imagen-3.0-generate-002');
  console.log("---");
  await testKey('AIzaSyCGX5xIg_y8BYntXq1SBzaXkXRg1qnOU8U', 'gemini-2.5-flash-image');
  await testKey('AIzaSyCGX5xIg_y8BYntXq1SBzaXkXRg1qnOU8U', 'imagen-3.0-generate-002');
}
run();
