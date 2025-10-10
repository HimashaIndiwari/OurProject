import mongoose from 'mongoose';

const coachPayrollSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  coachName: {
    type: String,
    required: true
  },
  coachEmail: {
    type: String,
    required: true
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  payroll: {
    hourlyRate: {
      type: Number,
      required: true,
      min: 0
    },
    totalHours: {
      type: Number,
      required: true,
      min: 0
    },
    totalSessions: {
      type: Number,
      required: true,
      min: 0
    },
    completedSessions: {
      type: Number,
      required: true,
      min: 0
    },
    completionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    totalPayroll: {
      type: Number,
      required: true,
      min: 0
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check'],
    default: 'bank_transfer'
  },
  paymentNotes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
coachPayrollSchema.index({ coachId: 1, 'period.startDate': 1, 'period.endDate': 1 }, { unique: true });
coachPayrollSchema.index({ paymentStatus: 1 });
coachPayrollSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

export default mongoose.model('CoachPayroll', coachPayrollSchema);
