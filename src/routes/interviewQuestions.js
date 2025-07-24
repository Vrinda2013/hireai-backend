import express from 'express';
import multer from 'multer';
import path from 'path';
import { interviewQuestionService } from '../services/interviewQuestionService.js';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';

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
      let { role, skills, questionComplexity, numberOfQuestions, customInstructions, includeAnswers } = req.body;
      skills=JSON.parse(skills);
      includeAnswers = includeAnswers === 'true' || includeAnswers === true;
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
    let result = await interviewQuestionService.generateQuestions({
      role,
      skills,
      questionComplexity: parseInt(questionComplexity),
      numberOfQuestions: parseInt(numberOfQuestions),
      pdfPath: pdfFile.path,
      customInstructions: customInstructions || null
    });

    // Optionally remove answers
    if (!includeAnswers) {
      result = result.map(({ expectedAnswer, ...rest }) => rest);
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

// Export questions as CSV
router.post('/export/csv', async (req, res) => {
  try {
    let { questions, includeAnswers } = req.body;
    includeAnswers = includeAnswers === 'true' || includeAnswers === true;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required' });
    }
    // Filter out answers if needed
    const exportQuestions = includeAnswers
      ? questions
      : questions.map(({ expectedAnswer, ...rest }) => rest);

    // Prepare CSV headers
    const headers = [
      { id: 'question', title: 'Question' },
      { id: 'type', title: 'Type' },
      { id: 'complexity', title: 'Complexity' },
      { id: 'skills', title: 'Skills' }
    ];
    if (includeAnswers) headers.push({ id: 'expectedAnswer', title: 'Expected Answer' });

    // Prepare CSV file
    const filePath = `export-questions-${Date.now()}.csv`;
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers
    });
    // Flatten skills array for CSV
    const records = exportQuestions.map(q => ({ ...q, skills: Array.isArray(q.skills) ? q.skills.join(', ') : '' }));
    await csvWriter.writeRecords(records);

    res.download(filePath, 'interview-questions.csv', err => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to export CSV' });
  }
});

// Export questions as JSON
router.post('/export/json', async (req, res) => {
  try {
    let { questions, includeAnswers } = req.body;
    includeAnswers = includeAnswers === 'true' || includeAnswers === true;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required' });
    }
    const exportQuestions = includeAnswers
      ? questions
      : questions.map(({ expectedAnswer, ...rest }) => rest);
    const filePath = `export-questions-${Date.now()}.json`;
    fs.writeFileSync(filePath, JSON.stringify(exportQuestions, null, 2));
    res.download(filePath, 'interview-questions.json', err => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to export JSON' });
  }
});

// Export questions as PDF
router.post('/export/pdf', async (req, res) => {
  try {
    let { questions, includeAnswers } = req.body;
    includeAnswers = includeAnswers === 'true' || includeAnswers === true;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required' });
    }
    const exportQuestions = includeAnswers
      ? questions
      : questions.map(({ expectedAnswer, ...rest }) => rest);
    const filePath = `export-questions-${Date.now()}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('Interview Questions', { align: 'center' });
    doc.moveDown();
    exportQuestions.forEach((q, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${q.question}`);
      doc.fontSize(10).text(`Type: ${q.type} | Complexity: ${q.complexity} | Skills: ${(q.skills || []).join(', ')}`);
      if (includeAnswers && q.expectedAnswer) {
        doc.fontSize(10).text(`Answer: ${q.expectedAnswer}`);
      }
      doc.moveDown();
    });
    doc.end();
    doc.on('finish', () => {
      res.download(filePath, 'interview-questions.pdf', err => {
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to export PDF' });
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