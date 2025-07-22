import express from 'express';
import { candidateResumeService } from '../services/candidateResumeService.js';

const router = express.Router();

// Get all candidates with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await candidateResumeService.getAllCandidates(
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    console.error('Error getting candidates:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get candidates',
      timestamp: new Date().toISOString()
    });
  }
});

// Get candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await candidateResumeService.getCandidateById(id);
    res.json(result);
  } catch (error) {
    console.error('Error getting candidate:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Candidate not found',
      timestamp: new Date().toISOString()
    });
  }
});

// Get candidate by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await candidateResumeService.getCandidateByEmail(email);
    res.json(result);
  } catch (error) {
    console.error('Error getting candidate by email:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Candidate not found',
      timestamp: new Date().toISOString()
    });
  }
});

// Search candidates
router.post('/search', async (req, res) => {
  try {
    const searchCriteria = req.body;
    // Remove status if present in searchCriteria
    if ('status' in searchCriteria) delete searchCriteria.status;
    
    const result = await candidateResumeService.searchCandidates(searchCriteria);
    res.json(result);
  } catch (error) {
    console.error('Error searching candidates:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search candidates',
      timestamp: new Date().toISOString()
    });
  }
});

// Get candidates by role
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await candidateResumeService.getCandidatesByRole(
      role,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    console.error('Error getting candidates by role:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get candidates by role',
      timestamp: new Date().toISOString()
    });
  }
});

// Update candidate by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await candidateResumeService.updateCandidateById(id, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Failed to update candidate',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete candidate by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await candidateResumeService.deleteCandidateById(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Failed to delete candidate',
      timestamp: new Date().toISOString()
    });
  }
});

// Check duplicate candidate
router.post('/check-duplicate', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await candidateResumeService.checkDuplicateCandidate(email);
    res.json({
      success: true,
      data: result,
      message: 'Duplicate check completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking duplicate candidate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check duplicate candidate',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for candidate resumes service
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'OK',
      message: 'Candidate Resumes service is working',
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

export { router as candidateResumeRoutes }; 