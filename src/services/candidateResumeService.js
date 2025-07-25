import CandidateResume from '../models/CandidateResume.js';

class CandidateResumeService {
  // Check if candidate exists and was created within a month with same role and requestedSkills
  async checkDuplicateCandidate(email, role, requestedSkills) {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const existingCandidate = await CandidateResume.findOne({
        'personalInfo.email': email.toLowerCase(),
        'roleApplied.role': role,
        'roleApplied.requestedSkills': { $size: requestedSkills.length, $all: requestedSkills },
        createdAt: { $gte: oneMonthAgo }
      });
      return {
        exists: !!existingCandidate,
        candidate: existingCandidate,
        isWithinMonth: !!existingCandidate
      };
    } catch (error) {
      console.error('Error checking duplicate candidate:', error);
      throw error;
    }
  }

  // Create a new candidate resume entry
  async createCandidateResume(candidateData) {
    try {
      const candidateResume = new CandidateResume(candidateData);
      const savedCandidate = await candidateResume.save();
      
      return {
        success: true,
        data: savedCandidate,
        message: 'Candidate resume data stored successfully'
      };
    } catch (error) {
      console.error('Error creating candidate resume:', error);
      throw error;
    }
  }

  // Get candidate by ID
  async getCandidateById(id) {
    try {
      const candidate = await CandidateResume.findById(id);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      return {
        success: true,
        data: candidate,
        message: 'Candidate retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get candidate by email
  async getCandidateByEmail(email) {
    try {
      const candidate = await CandidateResume.findByEmail(email);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      return {
        success: true,
        data: candidate,
        message: 'Candidate retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all candidates with pagination
  async getAllCandidates(page = 1, limit = 10, status) {
    try {
      const skip = (page - 1) * limit;
      const query = {};
      if (status) {
        query.status = status;
      }

      const candidates = await CandidateResume.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await CandidateResume.countDocuments(query);

      return {
        success: true,
        data: candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        message: 'Candidates retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Update candidate by ID
  async updateCandidateById(id, updateData) {
    try {
      const candidate = await CandidateResume.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      return {
        success: true,
        data: candidate,
        message: 'Candidate updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete candidate by ID
  async deleteCandidateById(id) {
    try {
      const candidate = await CandidateResume.findByIdAndDelete(id);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      return {
        success: true,
        data: candidate,
        message: 'Candidate deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Search candidates by various criteria
  async searchCandidates(searchCriteria) {
    try {
      const { 
        email, 
        fullName, 
        role, 
        skills, 
        page = 1, 
        limit = 10 
      } = searchCriteria;

      const query = {};
      const skip = (page - 1) * limit;

      // Build search query
      if (email) {
        query['personalInfo.email'] = { $regex: email, $options: 'i' };
      }
      if (fullName) {
        query['personalInfo.fullName'] = { $regex: fullName, $options: 'i' };
      }
      if (role) {
        query['roleApplied.role'] = { $regex: role, $options: 'i' };
      }
      if (skills && skills.length > 0) {
        query['$or'] = [
          { 'technicalSkills': { $in: skills } },
          { 'roleApplied.requestedSkills': { $in: skills } }
        ];
      }

      const candidates = await CandidateResume.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await CandidateResume.countDocuments(query);

      return {
        success: true,
        data: candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        message: 'Candidates search completed successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get candidates by role
  async getCandidatesByRole(role, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const candidates = await CandidateResume.find({
        'roleApplied.role': role
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await CandidateResume.countDocuments({
        'roleApplied.role': role
      });

      return {
        success: true,
        data: candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        message: `Candidates for role '${role}' retrieved successfully`
      };
    } catch (error) {
      throw error;
    }
  }
}

export const candidateResumeService = new CandidateResumeService(); 