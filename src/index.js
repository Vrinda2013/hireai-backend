import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { connectDatabase } from './config/database.js';
import { langchainRoutes } from './routes/langchain.js';
import { interviewQuestionRoutes } from './routes/interviewQuestions.js';
import { candidateRoleSkillRoutes } from './routes/candidateRoleSkills.js';
import { candidateResumeRoutes } from './routes/candidateResumes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/langchain', langchainRoutes);
app.use('/api/interview-questions', interviewQuestionRoutes);
app.use('/api/candidate-role-skills', candidateRoleSkillRoutes);
app.use('/api/candidate-resumes', candidateResumeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hire.AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 LangChain API: http://localhost:${PORT}/api/langchain`);
  console.log(`📝 Interview Questions API: http://localhost:${PORT}/api/interview-questions`);
  console.log(`👥 Candidate Role Skills API: http://localhost:${PORT}/api/candidate-role-skills`);
  console.log(`📄 Candidate Resumes API: http://localhost:${PORT}/api/candidate-resumes`);
}); 
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Process interrupted');
  });
});