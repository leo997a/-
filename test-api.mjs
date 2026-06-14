import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'AIzaSyCGX5xIg_y8BYntXq1SBzaXkXRg1qnOU8U' });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-002',
      contents: 'A picture of a cat'
    });
    console.log("Success with imagen-3.0-generate-002");
  } catch (e) {
    console.log("Error with imagen-3.0-generate-002", e.message);
  }
}
test();
