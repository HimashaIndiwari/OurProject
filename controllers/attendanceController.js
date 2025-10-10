import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';
import ProgramEnrollment from '../models/ProgramEnrollment.js';
import mongoose from 'mongoose';

// @desc    Mark attendance for session participants
// @route   POST /api/attendance/mark
// @access  Private (Coach only)
const markAttendance = async (req, res) => {
  try {
    console.log('=== ATTENDANCE MARKING REQUEST ===');
    console.log('Request body:', req.body);
    
    const { sessionId, attendanceData, coachId, markedBy } = req.body;

    // Validate required fields
    if (!sessionId || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and attendance data are required'
      });
    }

    // Check if session exists and validate date
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Validate that the session date has passed (prevent marking attendance for future sessions)
    const sessionDate = new Date(session.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    // Allow attendance marking for future sessions in development
    const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === undefined;
    
    if (sessionDate > today && !isDevelopment) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark attendance for future sessions. Please wait until the session date has passed.'
      });
    }
    
    if (sessionDate > today) {
      console.log('Allowing attendance marking for future session (development mode)');
    }

    // Validate attendance data
    for (const attendance of attendanceData) {
      if (!attendance.participantId || typeof attendance.attended !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance data format'
        });
      }
    }

    console.log('Marking attendance for session:', sessionId);
    console.log('Attendance data:', attendanceData);

    // Mark attendance using the model method
    const results = await Attendance.markSessionAttendance(
      sessionId,
      attendanceData,
      coachId,
      markedBy
    );

    console.log('Attendance marked successfully:', results.length, 'records');

    // Update session participants attendance status
    await Attendance.updateSessionParticipants(sessionId, attendanceData);

    // Update enrollment progress for attended participants
    for (const attendance of attendanceData) {
      if (attendance.attended) {
        try {
          // Find the enrollment for this participant
          const enrollment = await ProgramEnrollment.findOne({
            user: attendance.participantId,
            program: { $in: await Session.findById(sessionId).then(s => s.program) }
          });
          
          if (enrollment) {
            enrollment.progress.completedSessions += 1;
            enrollment.progress.progressPercentage = Math.round(
              (enrollment.progress.completedSessions / enrollment.progress.totalSessions) * 100
            );
            await enrollment.save();
          }
        } catch (enrollmentError) {
          console.warn('Could not update enrollment progress:', enrollmentError);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: results
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// @desc    Get session attendance
// @route   GET /api/attendance/session/:sessionId
// @access  Private
const getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const attendance = await Attendance.getSessionAttendance(sessionId);
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching session attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session attendance',
      error: error.message
    });
  }
};

// @desc    Get coach attendance summary
// @route   GET /api/attendance/coach/:coachId
// @access  Private
const getCoachAttendanceSummary = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { coach: coachId };
    
    if (startDate && endDate) {
      query.attendanceMarkedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('session', 'title scheduledDate startTime endTime')
      .populate('participant', 'firstName lastName email')
      .sort({ attendanceMarkedAt: -1 });
    
    // Calculate summary statistics
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.attended).length;
    const absentCount = totalRecords - presentCount;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        attendance,
        summary: {
          totalRecords,
          presentCount,
          absentCount,
          attendanceRate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching coach attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coach attendance summary',
      error: error.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Coach only)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating attendance',
      error: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Coach only)
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attendance',
      error: error.message
    });
  }
};

// @desc    Simple attendance marking for coach sessions
// @route   PUT /api/attendance/session/:sessionId/mark
// @access  Private (Coach only)
const markSessionAttendance = async (req, res) => {
  try {
    console.log('=== SIMPLE SESSION ATTENDANCE MARKING ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { sessionId } = req.params;
    const { attendanceData, coachId, markedBy } = req.body;
    
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Attendance data is required and must be an array'
      });
    }

    // Check if session exists and validate date
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Validate that the session date has passed (prevent marking attendance for future sessions)
    const sessionDate = new Date(session.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    // Allow attendance marking for future sessions in development
    const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === undefined;
    
    if (sessionDate > today && !isDevelopment) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark attendance for future sessions. Please wait until the session date has passed.'
      });
    }
    
    if (sessionDate > today) {
      console.log('Allowing attendance marking for future session (development mode)');
    }
    
    // Validate attendance data
    for (const attendance of attendanceData) {
      if (!attendance.participantId || typeof attendance.attended !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance data format'
        });
      }
    }
    
    // Mark attendance using the model method
    const results = await Attendance.markSessionAttendance(
      sessionId,
      attendanceData,
      coachId,
      markedBy
    );
    
    console.log('Attendance marked successfully:', results.length, 'records');
    
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: results
    });
    
  } catch (error) {
    console.error('Error marking session attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking session attendance',
      error: error.message
    });
  }
};

export {
  markAttendance,
  getSessionAttendance,
  getCoachAttendanceSummary,
  updateAttendance,
  deleteAttendance,
  markSessionAttendance
};