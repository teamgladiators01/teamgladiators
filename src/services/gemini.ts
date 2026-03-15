import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are a helpful, concise, and friendly AI assistant. You provide accurate information and maintain a professional yet approachable tone.",
    },
    // Note: sendMessage doesn't take history directly in the create call in the same way as some other SDKs, 
    // but the chat object maintains it. For this implementation, we'll use generateContent for simplicity 
    // or properly manage the chat session.
  });

  // Reconstruct chat history if needed, but for a single turn or simple state management:
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "You are a helpful, concise, and friendly AI assistant.",
    }
  });

  return response.text;
};

export const streamGeminiResponse = async function* (message: string, history: any[]) {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "You are a helpful, concise, and friendly AI assistant.",
    }
  });

  for await (const chunk of responseStream) {
    yield chunk.text;
  }
};
