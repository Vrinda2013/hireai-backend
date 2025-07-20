import dotenv from 'dotenv';
import { langChainService } from './src/services/langchainService.js';
import { logger } from './src/utils/logger.js';

// Load environment variables
dotenv.config();

async function testLangChain() {
  try {
    console.log('🧪 Testing LangChain with Gemini...\n');

    // Test 1: Basic chat
    console.log('1. Testing basic chat...');
    const chatResponse = await langChainService.chat('Hello! How are you today?');
    console.log('✅ Chat response:', chatResponse.substring(0, 100) + '...\n');

    // Test 2: Chat with system prompt
    console.log('2. Testing chat with system prompt...');
    const systemPrompt = 'You are a helpful coding assistant. Keep responses concise.';
    const systemResponse = await langChainService.chat(
      'What is JavaScript?', 
      systemPrompt
    );
    console.log('✅ System prompt response:', systemResponse.substring(0, 100) + '...\n');

    // Test 3: Content generation
    console.log('3. Testing content generation...');
    const generatedContent = await langChainService.generateContent(
      'Write a simple function to calculate the factorial of a number in JavaScript'
    );
    console.log('✅ Generated content:', generatedContent.substring(0, 150) + '...\n');

    console.log('🎉 All tests passed! LangChain with Gemini is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n💡 Make sure to:');
      console.log('1. Copy env.example to .env');
      console.log('2. Add your Gemini API key to .env file as GOOGLE_API_KEY or GEMINI_API_KEY');
      console.log('3. Get your API key from: https://makersuite.google.com/app/apikey');
    }
  }
}

// Run the test
testLangChain(); 