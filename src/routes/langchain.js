import express from 'express';
import { langChainService } from '../services/langchainService.js';

const router = express.Router();

// Basic chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await langChainService.chat(message, systemPrompt);
    res.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Chat failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Stream chat endpoint
router.post('/chat/stream', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await langChainService.streamChat(message, systemPrompt);
    
    for await (const chunk of stream) {
      res.write(chunk.content);
    }
    
    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Stream chat failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Content generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await langChainService.generateContent(prompt, options);
    res.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Content generation failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for LangChain service
router.get('/health', async (req, res) => {
  try {
    // Test the service with a simple prompt
    const testResponse = await langChainService.chat('Hello');
    res.json({ 
      status: 'OK', 
      message: 'LangChain service is working',
      testResponse: testResponse.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as langchainRoutes }; 