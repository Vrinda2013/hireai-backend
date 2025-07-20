import express from 'express';
import { candidateRoleSkillService } from '../services/candidateRoleSkillService.js';

const router = express.Router();

// Create a new role-skill mapping
router.post('/', async (req, res) => {
  try {
    const { role } = req.body;

    // Validate required fields
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const result = await candidateRoleSkillService.createRoleSkill({role});
    
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create role-skill error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create role-skill mapping',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all role-skill mappings
router.get('/', async (req, res) => {
  try {
    const result = await candidateRoleSkillService.getAllRoleSkills();
    
    res.json({
      success: true,
      data: result.data,
      count: result.count,
      message: result.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get all role-skills error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve role-skill mappings',
      timestamp: new Date().toISOString()
    });
  }
});

// Get role-skill by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await candidateRoleSkillService.getRoleSkillById(id);
    
    res.json({
      success: true,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get role-skill by ID error:', error);
    if (error.message === 'Role-skill mapping not found') {
      return res.status(404).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({
      error: error.message || 'Failed to retrieve role-skill mapping',
      timestamp: new Date().toISOString()
    });
  }
});

// Update role-skill by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await candidateRoleSkillService.updateRoleSkillById(id, updateData);
    
    res.json({
      success: true,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update role-skill error:', error);
    if (error.message === 'Role-skill mapping not found') {
      return res.status(404).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({
      error: error.message || 'Failed to update role-skill mapping',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete role-skill by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await candidateRoleSkillService.deleteRoleSkillById(id);
    
    res.json({
      success: true,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete role-skill error:', error);
    if (error.message === 'Role-skill mapping not found') {
      return res.status(404).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({
      error: error.message || 'Failed to delete role-skill mapping',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as candidateRoleSkillRoutes }; 