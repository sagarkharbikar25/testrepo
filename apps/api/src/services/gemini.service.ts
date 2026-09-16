import { z } from 'zod';

// We mock the actual fetch to the Gemini endpoint for simplicity in the hackathon,
// but structure it realistically so it can be swapped with real google-genai client.

const geminiResponseSchema = z.object({
  category: z.enum(['food', 'medicine', 'shelter', 'clothes', 'tutoring', 'transport', 'other']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const categorizeRequestText = async (description: string) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.warn('No Gemini API Key found. Returning default categorization.');
    return { category: 'other', urgency: 'MEDIUM' };
  }

  try {
    const prompt = `
      You are an AI assistant classifying community help requests.
      Given the following request description, classify it into exactly one of these categories:
      ['food', 'medicine', 'shelter', 'clothes', 'tutoring', 'transport', 'other'].
      Also determine the urgency: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].
      Respond ONLY with a valid JSON object containing "category" and "urgency" keys.
      
      Request description: "${description}"
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from markdown if necessary
    const jsonMatch = rawText.match(/```json\n([\s\S]*)\n```/) || rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : rawText;

    const parsed = geminiResponseSchema.safeParse(JSON.parse(jsonStr));
    if (parsed.success) {
      return parsed.data;
    }
    
    return { category: 'other', urgency: 'MEDIUM' };
  } catch (error) {
    console.error('Gemini classification error:', error);
    return { category: 'other', urgency: 'MEDIUM' };
  }
};
