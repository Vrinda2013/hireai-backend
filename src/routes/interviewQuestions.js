import express from 'express';
import multer from 'multer';
import path from 'path';
import { interviewQuestionService } from '../services/interviewQuestionService.js';

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
      let { role, skills, questionComplexity, numberOfQuestions } = req.body;
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
      pdfPath: pdfFile.path
    });

    res.json({
      success: true,
      data: {
        role,
        requestedSkills: skills,
        questionComplexity: parseInt(questionComplexity),
        numberOfQuestions: parseInt(numberOfQuestions),
        questions: result,
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