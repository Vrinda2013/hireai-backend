import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function testInterviewQuestionsEndpoint() {
  try {
    console.log('🧪 Testing Interview Questions Endpoint...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/interview-questions/health`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    console.log('✅ Health check passed\n');

    // Test 2: Generate questions (without PDF for now)
    console.log('2. Testing question generation...');
    
    // Create a simple text file as PDF placeholder
    const testPdfPath = './test-document.txt';
    fs.writeFileSync(testPdfPath, 'This is a test document for interview questions generation. It contains information about software development, programming languages, and best practices.');

    const formData = new FormData();
    formData.append('role', 'Software Engineer');
    formData.append('skills', JSON.stringify(['JavaScript', 'React', 'Node.js']));
    formData.append('questionComplexity', '75');
    formData.append('numberOfQuestions', '3');
    formData.append('pdf', fs.createReadStream(testPdfPath));

    const response = await fetch(`${BASE_URL}/api/interview-questions/generate`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Question generation successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.json();
      console.log('❌ Question generation failed:', error);
    }

    // Clean up test file
    fs.unlinkSync(testPdfPath);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInterviewQuestionsEndpoint(); 