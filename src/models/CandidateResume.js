import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  years: { type: String, trim: true },
  description: { type: String, trim: true }
}, { _id: false });

const candidateResumeSchema = new mongoose.Schema({
  personalInfo: {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  professionalInfo: {
    currentTitle: { type: String, trim: true },
    yearsOfExperience: { type: String, trim: true },
    education: { type: String, trim: true },
    certifications: [{ type: String, trim: true }]
  },
  professionalSummary: { type: String, trim: true },
  workExperience: [workExperienceSchema],
  technicalSkills: [{ type: String, trim: true }],
  softSkills: [{ type: String, trim: true }],
  roleApplied: {
    role: { type: String, required: true, trim: true },
    requestedSkills: [{ type: String, trim: true }]
  },
  status: {
    type: String,
    enum: ['In Progress', 'On Hold', 'Accepted', 'Rejected'],
    default: 'In Progress'
  },
  review: { type: String, trim: true }
}, {
  timestamps: true
});

candidateResumeSchema.index({ 'personalInfo.email': 1, createdAt: -1 });
candidateResumeSchema.index({ 'roleApplied.role': 1 });

const CandidateResume = mongoose.model('CandidateResume', candidateResumeSchema);

export default CandidateResume; 