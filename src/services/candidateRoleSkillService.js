import CandidateRoleSkill from '../models/CandidateRoleSkill.js';

class CandidateRoleSkillService {
  // Create a new role-skill mapping
  async createRoleSkill(roleSkillData) {
    try {
      const roleSkill = new CandidateRoleSkill(roleSkillData);
      const savedRoleSkill = await roleSkill.save();
      return {
        success: true,
        data: savedRoleSkill,
        message: 'Role-skill mapping created successfully'
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Role already exists');
      }
      throw error;
    }
  }

  // Get all role-skill mappings
  async getAllRoleSkills() {
    try {
      const roleSkills = await CandidateRoleSkill.find().sort({ createdAt: -1 });
      return {
        success: true,
        data: roleSkills,
        count: roleSkills.length,
        message: 'Role-skill mappings retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get role-skill by ID
  async getRoleSkillById(id) {
    try {
      const roleSkill = await CandidateRoleSkill.findById(id);
      if (!roleSkill) {
        throw new Error('Role-skill mapping not found');
      }
      return {
        success: true,
        data: roleSkill,
        message: 'Role-skill mapping retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Update role-skill by ID
  async updateRoleSkillById(id, updateData) {
    try {
      const roleSkill = await CandidateRoleSkill.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!roleSkill) {
        throw new Error('Role-skill mapping not found');
      }
      return {
        success: true,
        data: roleSkill,
        message: 'Role-skill mapping updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete role-skill by ID
  async deleteRoleSkillById(id) {
    try {
      const roleSkill = await CandidateRoleSkill.findByIdAndDelete(id);
      if (!roleSkill) {
        throw new Error('Role-skill mapping not found');
      }
      return {
        success: true,
        data: roleSkill,
        message: 'Role-skill mapping deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

export const candidateRoleSkillService = new CandidateRoleSkillService(); 