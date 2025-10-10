import CoachingProgram from '../models/CoachingProgram.js';
import ProgramEnrollment from '../models/ProgramEnrollment.js';

// @desc    Get all coaching programs
// @route   GET /api/programs
// @access  Public
const getCoachingPrograms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      coach,
      isActive = true,
      difficulty,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive };
    
    if (category) filter.category = category;
    if (coach) filter.coach = coach;
    if (difficulty) filter.difficulty = difficulty;

    // Build sort object
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { 
          path: 'coach',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          },
          select: 'specializations experience profileImage'
        }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const programs = await CoachingProgram.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'coach',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        },
        select: 'specializations experience profileImage'
      });

    // Transform programs to match frontend expectations
    const transformedPrograms = programs.map(program => ({
      ...program.toObject(),
      // Ensure all required fields are present with defaults
      title: program.title || 'Untitled Program',
      description: program.description || 'No description available',
      fee: program.fee || 0,
      duration: program.duration || 0,
      category: program.category || 'General',
      difficulty: program.difficulty || 'beginner',
      totalSessions: program.totalSessions || 10,
      maxParticipants: program.maxParticipants || 20,
      currentEnrollments: program.currentEnrollments || 0,
      isActive: program.isActive !== undefined ? program.isActive : true,
      // Ensure coach data is properly structured
      coach: program.coach ? {
        _id: program.coach._id,
        userId: program.coach.userId,
        specializations: program.coach.specializations || [],
        experience: program.coach.experience || 'Not specified',
        profileImage: program.coach.profileImage || null
      } : null
    }));

    const totalDocs = await CoachingProgram.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / parseInt(limit));

    const result = {
      docs: transformedPrograms,
      totalDocs,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    };

    // Add cache-busting headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coaching programs',
      error: error.message
    });
  }
};

// @desc    Get single coaching program
// @route   GET /api/programs/:id
// @access  Public
const getCoachingProgram = async (req, res) => {
  try {
    const program = await CoachingProgram.findById(req.params.id)
      .populate({
        path: 'coach',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageURL'
        },
        select: 'specializations experience profileImage'
      });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Coaching program not found'
      });
    }

    // Transform program to match frontend expectations
    const transformedProgram = {
      ...program.toObject(),
      title: program.title || 'Untitled Program',
      description: program.description || 'No description available',
      fee: program.fee || 0,
      duration: program.duration || 0,
      category: program.category || 'General',
      difficulty: program.difficulty || 'beginner',
      totalSessions: program.totalSessions || 10,
      maxParticipants: program.maxParticipants || 20,
      currentEnrollments: program.currentEnrollments || 0,
      isActive: program.isActive !== undefined ? program.isActive : true,
      coach: program.coach ? {
        _id: program.coach._id,
        userId: program.coach.userId,
        specializations: program.coach.specializations || [],
        experience: program.coach.experience || 'Not specified',
        profileImage: program.coach.profileImage || null
      } : null
    };

    // Add cache-busting headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: transformedProgram,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coaching program',
      error: error.message
    });
  }
};

// @desc    Create new coaching program
// @route   POST /api/programs
// @access  Private (Coach only)
const createCoachingProgram = async (req, res) => {
  try {
    // Validation: Check required fields
    const { title, category, fee, duration, coach, difficulty, maxParticipants } = req.body;
    
    const validationErrors = [];
    
    // Required field validations
    if (!title || title.trim() === '') {
      validationErrors.push('Title is required');
    }
    
    if (!category || category.trim() === '') {
      validationErrors.push('Category is required');
    }
    
    if (!fee || fee === '' || fee === null || fee === undefined) {
      validationErrors.push('Fee is required');
    }
    
    if (!duration || duration === '' || duration === null || duration === undefined) {
      validationErrors.push('Duration is required');
    }
    
    if (!coach || coach === '' || coach === null || coach === undefined) {
      validationErrors.push('Coach is required');
    }
    
    if (!difficulty || difficulty.trim() === '') {
      validationErrors.push('Difficulty is required');
    }
    
    // Business rule validations
    if (duration && duration <= 0) {
      validationErrors.push('Duration must be greater than 0');
    }
    
    if (fee && fee < 0) {
      validationErrors.push('Fee cannot be negative');
    }
    
    // Valid difficulty values
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      validationErrors.push('Difficulty must be one of: beginner, intermediate, advanced');
    }
    
    // Max participants validation
    if (maxParticipants !== undefined && maxParticipants > 20) {
      validationErrors.push('Maximum participants cannot be more than 20');
    }
    
    if (maxParticipants !== undefined && maxParticipants <= 0) {
      validationErrors.push('Maximum participants must be greater than 0');
    }
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Use coach ID from request body (bypass auth for now)
    const programData = {
      ...req.body,
      coach: req.body.coach // Use coach ID from request body
    };

    // Ensure totalSessions equals duration (1 session per week)
    if (programData.duration) {
      programData.totalSessions = programData.duration;
    }

    const program = await CoachingProgram.create(programData);
    
    // IMPORTANT: Add the program to the coach's assignedPrograms array
    const Coach = (await import('../models/Coach.js')).default;
    const coachRecord = await Coach.findById(req.body.coach);
    if (coachRecord && !coachRecord.assignedPrograms.includes(program._id)) {
      coachRecord.assignedPrograms.push(program._id);
      await coachRecord.save();
    }
    
    const populatedProgram = await CoachingProgram.findById(program._id)
      .populate({
        path: 'coach',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedProgram,
      message: 'Coaching program created successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating coaching program',
      error: error.message
    });
  }
};

// @desc    Update coaching program
// @route   PUT /api/programs/:id
// @access  Private (Coach only)
const updateCoachingProgram = async (req, res) => {
  try {
    const program = await CoachingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Coaching program not found'
      });
    }

    // Validation: Check required fields if they are being updated
    const { title, category, fee, duration, coach, difficulty, maxParticipants } = req.body;
    
    const validationErrors = [];
    
    // Required field validations (only validate if field is provided)
    if (title !== undefined && (!title || title.trim() === '')) {
      validationErrors.push('Title is required');
    }
    
    if (category !== undefined && (!category || category.trim() === '')) {
      validationErrors.push('Category is required');
    }
    
    if (fee !== undefined && (fee === '' || fee === null)) {
      validationErrors.push('Fee is required');
    }
    
    if (duration !== undefined && (duration === '' || duration === null)) {
      validationErrors.push('Duration is required');
    }
    
    if (coach !== undefined && (coach === '' || coach === null)) {
      validationErrors.push('Coach is required');
    }
    
    if (difficulty !== undefined && (!difficulty || difficulty.trim() === '')) {
      validationErrors.push('Difficulty is required');
    }
    
    // Business rule validations
    if (duration !== undefined && duration <= 0) {
      validationErrors.push('Duration must be greater than 0');
    }
    
    if (fee !== undefined && fee < 0) {
      validationErrors.push('Fee cannot be negative');
    }
    
    // Valid difficulty values
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (difficulty !== undefined && !validDifficulties.includes(difficulty)) {
      validationErrors.push('Difficulty must be one of: beginner, intermediate, advanced');
    }
    
    // Max participants validation
    if (maxParticipants !== undefined && maxParticipants > 20) {
      validationErrors.push('Maximum participants cannot be more than 20');
    }
    
    if (maxParticipants !== undefined && maxParticipants <= 0) {
      validationErrors.push('Maximum participants must be greater than 0');
    }
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Temporarily bypass authorization for development
    // if (program.coach.toString() !== req.user.coachId && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to update this program'
    //   });
    // }

    const oldCoachId = program.coach.toString();
    const newCoachId = req.body.coach;

    // Ensure totalSessions equals duration (1 session per week)
    if (req.body.duration) {
      req.body.totalSessions = req.body.duration;
    }

    const updatedProgram = await CoachingProgram.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'coach',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      },
      select: 'specializations experience'
    });

    // Handle coach change - update assignedPrograms arrays
    if (newCoachId && oldCoachId !== newCoachId) {
      const Coach = (await import('../models/Coach.js')).default;
      
      // Remove program from old coach's assignedPrograms
      await Coach.findByIdAndUpdate(oldCoachId, {
        $pull: { assignedPrograms: req.params.id }
      });
      
      // Add program to new coach's assignedPrograms
      await Coach.findByIdAndUpdate(newCoachId, {
        $addToSet: { assignedPrograms: req.params.id }
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProgram,
      message: 'Coaching program updated successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating coaching program',
      error: error.message
    });
  }
};

// @desc    Delete coaching program
// @route   DELETE /api/programs/:id
// @access  Private (Coach/Admin only)
const deleteCoachingProgram = async (req, res) => {
  try {
    const program = await CoachingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Coaching program not found'
      });
    }

    // Temporarily bypass authorization for development
    // if (program.coach.toString() !== req.user.coachId && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to delete this program'
    //   });
    // }

    // Get all enrollments for this program
    const enrollments = await ProgramEnrollment.find({
      program: req.params.id
    }).populate('user', 'firstName lastName email');

    // Check if there are any enrollments
    if (enrollments.length === 0) {
      // No enrollments - safe to delete
      await CoachingProgram.findByIdAndDelete(req.params.id);
      
      // Remove from coach's assignedPrograms
      const Coach = (await import('../models/Coach.js')).default;
      await Coach.findByIdAndUpdate(program.coach, {
        $pull: { assignedPrograms: req.params.id }
      });

      return res.status(200).json({
        success: true,
        message: 'Coaching program deleted successfully'
      });
    }

    // Check enrollment progress conditions
    const invalidEnrollments = [];
    
    for (const enrollment of enrollments) {
      const progressPercentage = enrollment.progress.progressPercentage || 0;
      
      // Check if enrollment progress is NOT 0% or 100%
      if (progressPercentage !== 0 && progressPercentage !== 100) {
        invalidEnrollments.push({
          user: enrollment.user,
          progressPercentage: progressPercentage,
          reason: 'Enrollment progress must be 0% or 100%'
        });
      }
    }

    if (invalidEnrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete program: Some enrollments do not meet progress requirements',
        details: {
          requirement: 'Enrollment progress must be 0% or 100%',
          invalidEnrollments: invalidEnrollments
        }
      });
    }

    // Check if all sessions for all enrolled users are past sessions
    const Session = (await import('../models/Session.js')).default;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const enrollment of enrollments) {
      // Get all sessions for this enrollment
      const sessions = await Session.find({
        'participants.enrollment': enrollment._id
      });

      // Check if any session is not in the past
      const futureSessions = sessions.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= today;
      });

      if (futureSessions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete program: Some enrolled users have future sessions',
          details: {
            requirement: 'All sessions for all enrolled users must be in the past',
            user: enrollment.user,
            futureSessionsCount: futureSessions.length,
            futureSessions: futureSessions.map(session => ({
              sessionId: session._id,
              scheduledDate: session.scheduledDate,
              title: session.title
            }))
          }
        });
      }
    }

    // All conditions met - proceed with deletion
    // First, delete all related sessions
    await Session.deleteMany({
      program: req.params.id
    });

    // Delete all enrollments
    await ProgramEnrollment.deleteMany({
      program: req.params.id
    });

    // Delete the program
    await CoachingProgram.findByIdAndDelete(req.params.id);

    // Remove from coach's assignedPrograms
    const Coach = (await import('../models/Coach.js')).default;
    await Coach.findByIdAndUpdate(program.coach, {
      $pull: { assignedPrograms: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Coaching program and all related data deleted successfully',
      deletedData: {
        program: req.params.id,
        enrollments: enrollments.length,
        sessions: 'All related sessions deleted'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting coaching program',
      error: error.message
    });
  }
};

// @desc    Get programs by coach
// @route   GET /api/programs/coach/:coachId
// @access  Public
const getProgramsByCoach = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { 
          path: 'coach',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          },
          select: 'specializations experience profileImage'
        }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const programs = await CoachingProgram.find({ coach: req.params.coachId, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'coach',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        },
        select: 'specializations experience profileImage'
      });

    const totalDocs = await CoachingProgram.countDocuments({ coach: req.params.coachId, isActive: true });
    const totalPages = Math.ceil(totalDocs / parseInt(limit));

    const result = {
      docs: programs,
      totalDocs,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coach programs',
      error: error.message
    });
  }
};

// @desc    Add material to program
// @route   POST /api/programs/:id/materials
// @access  Private (Coach only)
const addMaterial = async (req, res) => {
  try {
    const program = await CoachingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Coaching program not found'
      });
    }

    // Temporarily bypass authorization for development
    // if (program.coach.toString() !== req.user.coachId && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to add materials to this program'
    //   });
    // }

    program.materials.push(req.body);
    await program.save();

    res.status(200).json({
      success: true,
      data: program,
      message: 'Material added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding material',
      error: error.message
    });
  }
};

// @desc    Check if program can be deleted
// @route   GET /api/programs/:id/can-delete
// @access  Private (Coach/Admin only)
const canDeleteProgram = async (req, res) => {
  try {
    const program = await CoachingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Coaching program not found'
      });
    }

    // Get all enrollments for this program
    const enrollments = await ProgramEnrollment.find({
      program: req.params.id
    }).populate('user', 'firstName lastName email');

    // If no enrollments, can delete
    if (enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        canDelete: true,
        reason: 'No enrollments found'
      });
    }

    // Check enrollment progress conditions
    const invalidEnrollments = [];
    
    for (const enrollment of enrollments) {
      const progressPercentage = enrollment.progress.progressPercentage || 0;
      
      // Check if enrollment progress is NOT 0% or 100%
      if (progressPercentage !== 0 && progressPercentage !== 100) {
        invalidEnrollments.push({
          user: enrollment.user,
          progressPercentage: progressPercentage,
          reason: 'Enrollment progress must be 0% or 100%'
        });
      }
    }

    if (invalidEnrollments.length > 0) {
      return res.status(200).json({
        success: true,
        canDelete: false,
        reason: 'Some enrollments do not meet progress requirements',
        details: {
          requirement: 'Enrollment progress must be 0% or 100%',
          invalidEnrollments: invalidEnrollments
        }
      });
    }

    // Check if all sessions for all enrolled users are past sessions
    const Session = (await import('../models/Session.js')).default;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const enrollment of enrollments) {
      // Get all sessions for this enrollment
      const sessions = await Session.find({
        'participants.enrollment': enrollment._id
      });

      // Check if any session is not in the past
      const futureSessions = sessions.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= today;
      });

      if (futureSessions.length > 0) {
        return res.status(200).json({
          success: true,
          canDelete: false,
          reason: 'Some enrolled users have future sessions',
          details: {
            requirement: 'All sessions for all enrolled users must be in the past',
            user: enrollment.user,
            futureSessionsCount: futureSessions.length,
            futureSessions: futureSessions.map(session => ({
              sessionId: session._id,
              scheduledDate: session.scheduledDate,
              title: session.title
            }))
          }
        });
      }
    }

    // All conditions met
    return res.status(200).json({
      success: true,
      canDelete: true,
      reason: 'All conditions met for deletion',
      details: {
        enrollments: enrollments.length,
        allProgressValid: true,
        allSessionsPast: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking if program can be deleted',
      error: error.message
    });
  }
};

// @desc    Get program statistics
// @route   GET /api/programs/:id/stats
// @access  Private (Coach only)
const getProgramStats = async (req, res) => {
  try {
    const program = await CoachingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Coaching program not found'
      });
    }

    const enrollmentStats = await ProgramEnrollment.aggregate([
      { $match: { program: program._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = await ProgramEnrollment.aggregate([
      { 
        $match: { 
          program: program._id,
          paymentStatus: 'completed'
        }
      },
      {
        $lookup: {
          from: 'coachingprograms',
          localField: 'program',
          foreignField: '_id',
          as: 'programData'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $arrayElemAt: ['$programData.price', 0] } },
          completedPayments: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalEnrollments: program.currentEnrollments,
      availableSpots: program.maxParticipants - program.currentEnrollments,
      enrollmentsByStatus: enrollmentStats,
      revenue: totalRevenue[0] || { totalRevenue: 0, completedPayments: 0 },
      completionRate: 0 // Calculate based on your business logic
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching program statistics',
      error: error.message
    });
  }
};

export {
  getCoachingPrograms,
  getCoachingProgram,
  createCoachingProgram,
  updateCoachingProgram,
  deleteCoachingProgram,
  canDeleteProgram,
  getProgramsByCoach,
  addMaterial,
  getProgramStats
};
