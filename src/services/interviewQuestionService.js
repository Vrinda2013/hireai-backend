import { langChainService } from './langchainService.js';
import fs from 'fs';
import path from 'path';

class InterviewQuestionService {
  async generateQuestions({ role, skills, questionComplexity, numberOfQuestions, pdfPath }) {
    try {
      // Read and process the PDF file
      const pdfContent = await this.extractPdfContent(pdfPath);
      console.log("🚀 ~ InterviewQuestionService ~ generateQuestions ~ pdfContent:", pdfContent)
      
      // Process the PDF content to extract user data and skills
      const userData = await this.processResumeData(pdfContent, skills);
      console.log("🚀 ~ InterviewQuestionService ~ generateQuestions ~ userData:", userData)
      
      // Create a comprehensive prompt for question generation
      const prompt = this.createQuestionGenerationPrompt({
        role,
        skills: userData.combinedSkills, // Use combined skills from resume + body
        questionComplexity,
        numberOfQuestions,
        pdfContent
      });
      console.log("🚀 ~ InterviewQuestionService ~ generateQuestions ~ prompt:", prompt)

      // Generate questions using LangChain
      const response = await langChainService.generateContent(prompt, {
        temperature: 0.7,
        maxTokens: 15000
      });
      console.log("🚀 ~ InterviewQuestionService ~ generateQuestions ~ response:", response)

      // Parse and structure the response
      const questions = this.parseQuestionsResponse(response);

      return questions;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error(`Failed to generate interview questions: ${error.message}`);
    }
  }

  async processResumeData(pdfContent, requestedSkills) {
    try {
      // Create a prompt to extract user information and skills from resume
      const extractionPrompt = `Extract the following information from this resume text:

1. Personal Information:
   - Full Name
   - Email
   - Phone Number
   - Location/City
   - LinkedIn URL (if available)

2. Professional Information:
   - Current/Last Job Title
   - Years of Experience
   - Education (Degree, Institution, Year)
   - Certifications (if any)

3. Technical Skills:
   - Programming Languages
   - Frameworks & Libraries
   - Tools & Technologies
   - Databases
   - Cloud Platforms
   - Other Technical Skills

4. Soft Skills:
   - Leadership
   - Communication
   - Problem Solving
   - Team Work
   - Other Soft Skills

Resume Text:
${pdfContent.substring(0, 3000)}${pdfContent.length > 3000 ? '...' : ''}

Please format your response as a JSON object with the following structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string"
  },
  "professionalInfo": {
    "currentTitle": "string",
    "yearsOfExperience": "string",
    "education": "string",
    "certifications": ["string"]
  },
  "technicalSkills": ["string"],
  "softSkills": ["string"]
}`;

      // Use LangChain to extract information
      const response = await langChainService.generateContent(extractionPrompt, {
        temperature: 0.3,
        maxTokens: 15000
      });

      // Parse the response
      const userData = this.parseUserDataResponse(response);
      
      // Combine extracted skills with requested skills
      const combinedSkills = [...new Set([...userData.technicalSkills, ...requestedSkills])];
      
      return {
        ...userData,
        requestedSkills,
        combinedSkills,
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error processing resume data:', error);
      
      // Return fallback data if processing fails
      return {
        personalInfo: {
          fullName: 'Unknown',
          email: 'unknown@email.com',
          phone: 'Unknown',
          location: 'Unknown',
          linkedin: ''
        },
        professionalInfo: {
          currentTitle: 'Unknown',
          yearsOfExperience: 'Unknown',
          education: 'Unknown',
          certifications: []
        },
        technicalSkills: [],
        softSkills: [],
        extractedSkills: [],
        requestedSkills,
        combinedSkills: requestedSkills,
        extractedAt: new Date().toISOString()
      };
    }
  }

  parseUserDataResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, return fallback structure
      return {
        personalInfo: {
          fullName: 'Unknown',
          email: 'unknown@email.com',
          phone: 'Unknown',
          location: 'Unknown',
          linkedin: ''
        },
        professionalInfo: {
          currentTitle: 'Unknown',
          yearsOfExperience: 'Unknown',
          education: 'Unknown',
          certifications: []
        },
        technicalSkills: [],
        softSkills: [],
        extractedSkills: []
      };
    } catch (error) {
      console.error('Error parsing user data response:', error);
      return {
        personalInfo: {
          fullName: 'Unknown',
          email: 'unknown@email.com',
          phone: 'Unknown',
          location: 'Unknown',
          linkedin: ''
        },
        professionalInfo: {
          currentTitle: 'Unknown',
          yearsOfExperience: 'Unknown',
          education: 'Unknown',
          certifications: []
        },
        technicalSkills: [],
        softSkills: [],
        extractedSkills: []
      };
    }
  }

  async extractPdfContent(pdfPath) {
    try {
      const fileExists = fs.existsSync(pdfPath);
      if (!fileExists) {
        throw new Error('PDF file not found');
      }

      // Read the PDF file
      const dataBuffer = fs.readFileSync(pdfPath);
      
      // Create a mock test file to satisfy pdf-parse's requirement
      const testDir = path.join(process.cwd(), 'test', 'data');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      const testPdfPath = path.join(testDir, '05-versions-space.pdf');
      if (!fs.existsSync(testPdfPath)) {
        // Create a minimal PDF file for testing
        fs.writeFileSync(testPdfPath, dataBuffer);
      }
      
      // Now import and use pdf-parse
      const pdf = await import('pdf-parse');
      const data = await pdf.default(dataBuffer);
      
      // Extract text content
      const textContent = data.text;
      
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      console.log("🚀 ~ InterviewQuestionService ~ extractPdfContent ~ extracted text length:", textContent.length);
      return textContent.trim();
      
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      
      // If PDF parsing fails, return a placeholder and continue
      // This allows the service to work even if PDF parsing has issues
      console.warn('PDF parsing failed, using placeholder content');
      return `PDF content from ${path.basename(pdfPath)} - [PDF processing encountered an issue, but continuing with question generation]`;
    }
  }

  createQuestionGenerationPrompt({ role, skills, questionComplexity, numberOfQuestions, pdfContent }) {
    const complexityLevel = this.getComplexityLevel(questionComplexity);
    
    return `You are an expert technical interviewer. Generate ${numberOfQuestions} interview questions for a ${role} position.

Requirements:
- Role: ${role}
- Required Skills: ${skills.join(', ')}
- Question Complexity: ${complexityLevel} (${questionComplexity}/100)
- Number of Questions: ${numberOfQuestions}

Context from PDF: ${pdfContent.substring(0, 2000)}${pdfContent.length > 2000 ? '...' : ''}

Please generate questions that:
1. Are appropriate for the specified role and skills
2. Match the complexity level (${complexityLevel})
3. Include a mix of technical, behavioral, and problem-solving questions
4. Are clear, specific, and actionable
5. Include expected answers or key points to evaluate

Format your response as a JSON array with the following structure:
[
  {
    "question": "The actual question text",
    "type": "technical|behavioral|problem-solving",
    "complexity": "beginner|intermediate|advanced",
    "expectedAnswer": "Key points or expected answer",
    "skills": ["skill1", "skill2"]
  }
]

Generate exactly ${numberOfQuestions} questions.`;
  }

  getComplexityLevel(complexity) {
    if (complexity <= 30) return 'beginner';
    if (complexity <= 70) return 'intermediate';
    return 'advanced';
  }

  parseQuestionsResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, create a structured response
      const questions = response.split('\n').filter(line => line.trim().length > 0);
      return questions.map((question, index) => ({
        question: question.trim(),
        type: 'technical',
        complexity: 'intermediate',
        expectedAnswer: 'To be evaluated by interviewer',
        skills: ['general']
      }));
    } catch (error) {
      console.error('Error parsing questions response:', error);
      // Return a fallback structure
      return [{
        question: response,
        type: 'technical',
        complexity: 'intermediate',
        expectedAnswer: 'To be evaluated by interviewer',
        skills: ['general']
      }];
    }
  }

  // Helper method to clean up uploaded files
  async cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

export const interviewQuestionService = new InterviewQuestionService(); 