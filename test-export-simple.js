import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testSimpleExport() {
  try {
    console.log('🧪 Testing Simple Export...\n');

    const testData = {
      questions: [
        {
          question: "What is React?",
          type: "technical",
          complexity: "beginner",
          expectedAnswer: "React is a JavaScript library for building user interfaces.",
          skills: ["React", "JavaScript"]
        }
      ],
      role: "Frontend Developer",
      candidateName: "Test User",
      exportType: "questions-only"
    };

    console.log('📤 Sending CSV export request...');
    const csvResponse = await fetch(`${BASE_URL}/api/interview-questions/export/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (csvResponse.ok) {
      console.log('✅ CSV Export successful!');
      const csvBlob = await csvResponse.blob();
      console.log('📊 CSV file size:', csvBlob.size, 'bytes');
    } else {
      const csvError = await csvResponse.text();
      console.log('❌ CSV Export failed:', csvError);
    }

    console.log('\n📤 Sending PDF export request...');
    const pdfResponse = await fetch(`${BASE_URL}/api/interview-questions/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (pdfResponse.ok) {
      console.log('✅ PDF Export successful!');
      const pdfBlob = await pdfResponse.blob();
      console.log('📄 PDF file size:', pdfBlob.size, 'bytes');
    } else {
      const pdfError = await pdfResponse.text();
      console.log('❌ PDF Export failed:', pdfError);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleExport(); 