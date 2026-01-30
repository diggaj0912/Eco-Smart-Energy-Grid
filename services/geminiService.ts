import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, MODEL_NAME } from '../constants';

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

/**
 * Initializes the Gemini AI client using the API key from environment variables.
 * Creates a persistent chat session with the defined system instructions.
 * Enables Google Search Grounding for advanced real-time data context.
 * 
 * @throws Error if API_KEY is missing.
 * @returns {Chat} The active chat session instance.
 */
export const initializeGemini = (): Chat => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Reset chat on initialization
  // Integration Upgrade: Added googleSearch tool for Grounding
  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      tools: [{ googleSearch: {} }], 
    },
  });

  return chatSession;
};

/**
 * Sends a user message to the Gemini AI instance and returns the response text.
 * Handles initialization if session is not active.
 * 
 * @param message - The text message to send to the AI.
 * @returns {Promise<string>} The response text from the AI model.
 */
export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeGemini();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "No response received.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ERROR: Connection to Grid AI lost. Please check API Key or Network.";
  }
};