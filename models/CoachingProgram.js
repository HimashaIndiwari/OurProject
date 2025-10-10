import mongoose from 'mongoose';

const coachingProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fee: { type: Number },
  duration: { type: Number },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
  certificateTemplate: { type: String },
  materials: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true }, // e.g., 'video', 'document'
      url: { type: String, required: true }
    }
  ],
  category: { type: String },
  specialization: { type: String },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  totalSessions: { type: Number, default: function() { return this.duration || 10; } },
  isActive: { type: Boolean, default: true },
  maxParticipants: { type: Number, default: 20 },
  currentEnrollments: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save middleware to set totalSessions equal to duration
coachingProgramSchema.pre('save', function(next) {
  if (this.duration && !this.totalSessions) {
    this.totalSessions = this.duration;
  } else if (this.duration && this.totalSessions !== this.duration) {
    // If duration is updated, update totalSessions to match
    this.totalSessions = this.duration;
  }
  next();
});

export default mongoose.model('CoachingProgram', coachingProgramSchema);
