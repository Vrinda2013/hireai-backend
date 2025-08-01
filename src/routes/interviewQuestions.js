import express from 'express';
import multer from 'multer';
import path from 'path';
import { interviewQuestionService } from '../services/interviewQuestionService.js';
import PDFDocument from 'pdfkit';
import { langChainService } from '../services/langchainService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Generate interview questions endpoint
router.post('/generate', upload.single('pdf'), async (req, res) => {
  try {
      let { role, skills, questionComplexity, numberOfQuestions, customInstructions } = req.body;
      skills=JSON.parse(skills);
      console.log("🚀 ~ router.post ~ req.body:", req.body)
      
    const pdfFile = req.file;

    // Validate required fields
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills array is required and must not be empty' });
    }

    if (!questionComplexity || isNaN(questionComplexity) || questionComplexity < 1 || questionComplexity > 100) {
      return res.status(400).json({ error: 'Question complexity must be a number between 1 and 100' });
    }

    if (!numberOfQuestions || isNaN(numberOfQuestions) || numberOfQuestions < 1) {
      return res.status(400).json({ error: 'Number of questions must be a positive number' });
    }

    if (!pdfFile) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    // Generate questions using the service
    const result = await interviewQuestionService.generateQuestions({
      role,
      skills,
      questionComplexity: parseInt(questionComplexity),
      numberOfQuestions: parseInt(numberOfQuestions),
      pdfPath: pdfFile.path,
      customInstructions: customInstructions || null
    });
    console.log("🚀 ~ router.post ~ result:", result)

    // Handle error response from service
    if (result && result.error) {
      return res.status(400).json({
        success: false,
        error: result.error,
        reason: result.reason || null,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        role,
        requestedSkills: skills,
        questionComplexity: parseInt(questionComplexity),
        numberOfQuestions: parseInt(numberOfQuestions),
        customInstructions: customInstructions || null,
        questions: result
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Interview question generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate interview questions',
      timestamp: new Date().toISOString()
    });
  }
});

// Download interview questions (and answers) as PDF
router.post('/download-pdf', async (req, res) => {
  try {
    const { role, requestedSkills, questionComplexity, numberOfQuestions, customInstructions, questions } = req.body;
    const withAnswers = req.query.withAnswers === 'true';

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=interview-${role || 'questions'}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(`Interview Questions for ${role || ''}`, { align: 'center' });
    doc.moveDown();

    // Meta info
    if (requestedSkills) doc.fontSize(12).text(`Skills: ${requestedSkills.join(', ')}`);
    if (questionComplexity) doc.text(`Complexity: ${questionComplexity}`);
    if (numberOfQuestions) doc.text(`Number of Questions: ${numberOfQuestions}`);
    if (customInstructions) doc.text(`Custom Instructions: ${customInstructions}`);
    doc.moveDown();

    // Questions
    (questions || []).forEach((q, idx) => {
      doc.fontSize(14).fillColor('black').text(`Q${idx + 1}: ${q.question}`, { underline: true });
      doc.fontSize(11).fillColor('gray').text(`Type: ${q.type} | Complexity: ${q.complexity} | Skills: ${(q.skills || []).join(', ')}`);
      doc.moveDown(0.5);
      if (withAnswers) {
        doc.fontSize(12).fillColor('green').text(`Expected Answer:`, { continued: true }).fillColor('black').text(` ${q.expectedAnswer}`);
        doc.moveDown();
      } else {
        doc.moveDown(1.5);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Candidate compatibility analysis endpoint
router.post('/candidate-compatibility', upload.single('pdf'), async (req, res) => {
  try {
    const { role, skills } = req.body;
    if (!role || !skills) {
      return res.status(400).json({ error: 'Role and skills are required' });
    }
    const parsedSkills = Array.isArray(skills) ? skills : JSON.parse(skills);
    const pdfFile = req.file;
    if (!pdfFile) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    // Extract resume text
    const pdfContent = await interviewQuestionService.extractPdfContent(pdfFile.path);

    // Build LLM prompt
    const prompt = `You are an expert technical recruiter. Analyze the following candidate resume for the role of '${role}' with required skills: [${parsedSkills.join(', ')}].

Resume Content:
${pdfContent.substring(0, 3000)}${pdfContent.length > 3000 ? '...' : ''}

Return a JSON object with the following fields:
- compatibilityScore: number (0-100, overall fit for the role)
- compatibilitySummary: string (1-2 lines summarizing fit)
- keyStrengths: array of 3-5 bullet points (candidate's strengths)
- skillsToExplore: array of 2-3 skills from the required list that are missing or weak
- skillAssessment: array of objects, each with { skill: string, status: 'Not found' | 'Intermediate' | 'Advanced' | 'Expert' }, for each required skill and any other relevant skills found in the resume
- interviewRecommendations: array of 3-5 actionable recommendations for the interviewer (focus areas, questions to ask, etc.)

Format your response as valid JSON only, no extra text.`;

    // Call LLM
    const llmResponse = await langChainService.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 2000
    });

    // Parse and return JSON
    let result;
    try {
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(llmResponse);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse LLM response', raw: llmResponse });
    }
    res.json(result);
  } catch (error) {
    console.error('Candidate compatibility analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze candidate compatibility' });
  }
});

// Health check for interview questions service
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'OK',
      message: 'Interview Questions service is working',
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

export { router as interviewQuestionRoutes }; 