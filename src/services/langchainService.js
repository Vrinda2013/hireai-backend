import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { geminiConfig, validateGeminiConfig } from '../config/gemini.js';

// Initialize LangChain with Gemini
export class LangChainService {
  constructor() {
    validateGeminiConfig();
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey: apiKey,
      temperature: geminiConfig.temperature,
      topK: geminiConfig.topK,
      topP: geminiConfig.topP,
      maxOutputTokens: geminiConfig.maxOutputTokens,
    });
  }

  // Basic chat functionality
  async chat(message, systemPrompt = null) {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }
      
      messages.push(new HumanMessage(message));

      const response = await this.model.invoke(messages);
      return response.content;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  // Create a chain with custom system prompt
  async createChain(systemPrompt) {
    const chain = RunnableSequence.from([
      {
        system: () => systemPrompt,
        human: (input) => input.message,
      },
      {
        system: (input) => new SystemMessage(input.system),
        human: (input) => new HumanMessage(input.human),
      },
      this.model,
      new StringOutputParser(),
    ]);

    return chain;
  }

  // Stream chat responses
  async streamChat(message, systemPrompt = null) {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }
      
      messages.push(new HumanMessage(message));

      const stream = await this.model.stream(messages);
      return stream;
    } catch (error) {
      console.error('Error in stream chat:', error);
      throw new Error(`Stream chat failed: ${error.message}`);
    }
  }

  // Generate content with specific parameters
  async generateContent(prompt, options = {}) {
    try {
      const config = {
        ...geminiConfig,
        ...options,
      };

      const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      const customModel = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: apiKey,
        ...config,
      });

      const response = await customModel.invoke([new HumanMessage(prompt)]);
      return response.content;
    } catch (error) {
      console.error('Error in content generation:', error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const langChainService = new LangChainService(); 