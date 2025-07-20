import mongoose from 'mongoose';

const candidateRoleSkillSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const CandidateRoleSkill = mongoose.model('CandidateRoleSkill', candidateRoleSkillSchema);

export default CandidateRoleSkill; 