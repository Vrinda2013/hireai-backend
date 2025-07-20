import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI - LangChain expects GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);

// Get the model
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Configuration for different use cases
export const geminiConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 15000,
};

// Helper function to get configured model
export const getGeminiModel = (config = geminiConfig) => {
  return genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: config
  });
};

// Validate API key
export const validateGeminiConfig = () => {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is required in environment variables');
  }
  return true;
}; 