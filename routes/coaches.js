import express from 'express';
const router = express.Router();
import {
  getAllCoaches,
  getCoach,
  getCoachByUserId,
  createCoach,
  updateCoach,
  deleteCoach,
  getCoachesBySpecialization,
  updateCoachAvailability,
  updateCoachRating,
  assignProgramToCoach,
  removeProgramFromCoach,
  getCoachStats,
  getCoachPayroll,
  getCoachPayrollDetails,
  updateCoachHourlyRate,
  toggleCoachStatus,
  createCoachProfileForUser,
  createMissingCoachProfiles,
  syncCoaches,
  getCoachAvailability,
  getBookingDateRange,
  getWeeklySessionStructure,
  getCoachEnrolledPrograms,
  markSessionAttendance,
  getSessionAttendance,
  getCoachSessions,
  createSessionsForEnrollments,
  testCoachEndpoint,
  getEnrolledCustomers,
  getCustomerSessions,
  simpleAttendanceMarking,
  ultraSimpleAttendanceMarking,
  testAttendanceEndpoint,
  testAttendanceEndpointNew,
  sessionAttendanceOnly,
  ultraSimpleSuccess,
  attendanceOnly,
  updateCoachPayrollPaymentStatus,
  createOrUpdateCoachPayroll
} from '../controllers/coachController.js';

// Middleware (Note: You'll need to implement these middleware functions)
// const { protect, authorize } = require('../middleware/auth');

// Working routes for customers (bypass the problematic /:id route)
router.get('/customers/:coachId', getEnrolledCustomers); // Get enrolled customers for coach's programs

// Specific routes (must come before general /:id route)
router.get('/test', testCoachEndpoint); // Test endpoint to verify API is working
router.get('/', getAllCoaches); // Get all coaches with filtering
router.get('/specialization/:specialization', getCoachesBySpecialization); // Get coaches by specialization
router.get('/user/:userId', getCoachByUserId); // Get coach by user ID
router.get('/sync-coaches', syncCoaches); // Sync coaches - create missing profiles and return all coaches
router.get('/payroll', getCoachPayroll); // Get coach payroll calculation

// Specific routes (must come before general /:id route)
router.get('/:id/availability', getCoachAvailability); // Get coach availability for booking
router.get('/:id/booking-range', getBookingDateRange); // Get valid booking date range
router.get('/:id/weekly-sessions', getWeeklySessionStructure); // Get weekly session structure
router.get('/:id/enrolled-programs', getCoachEnrolledPrograms); // Get enrolled programs for a coach
router.get('/:id/sessions', getCoachSessions); // Get coach's sessions with attendance data
router.get('/:id/sessions/:sessionId/attendance', getSessionAttendance); // Get session attendance details
router.get('/:id/enrolled-customers', getEnrolledCustomers); // Get enrolled customers for coach's programs
router.get('/:id/customers/:customerId/sessions', getCustomerSessions); // Get individual customer sessions
router.get('/:id/payroll-details', getCoachPayrollDetails); // Get detailed payroll for a specific coach

// General routes (must come after specific routes)
router.get('/:id', getCoach); // Get single coach profile

// Protected routes (uncomment when auth middleware is available)
// router.use(protect); // Require authentication for all routes below

// Coach and Admin routes
router.post('/', /* authorize('admin', 'coaching_manager'), */ createCoach); // Create coach profile

// Specific routes must come before parameterized routes
router.put('/simple-attendance', /* authorize('coach'), */ simpleAttendanceMarking); // Simple attendance marking fallback
router.put('/ultra-simple-attendance', /* authorize('coach'), */ ultraSimpleAttendanceMarking); // Ultra simple attendance marking
router.put('/test-attendance', /* authorize('coach'), */ testAttendanceEndpointNew); // Test attendance endpoint
router.put('/session-attendance-only', /* authorize('coach'), */ sessionAttendanceOnly); // Session attendance only (no coach updates)
router.put('/ultra-simple-success', /* authorize('coach'), */ ultraSimpleSuccess); // Ultra simple success (no database operations)
router.put('/attendance-only', /* authorize('coach'), */ attendanceOnly); // Attendance only (no coach data touched)

// Parameterized routes must come after specific routes
router.put('/:id', /* authorize('admin', 'coach'), */ updateCoach); // Update coach profile
router.put('/:id/availability', /* authorize('admin', 'coach'), */ updateCoachAvailability); // Update availability
router.put('/:id/hourly-rate', /* authorize('coaching_manager', 'admin'), */ updateCoachHourlyRate); // Update hourly rate (coaching manager only)
router.put('/:id/sessions/:sessionId/attendance', /* authorize('coach'), */ markSessionAttendance); // Mark session attendance
router.post('/:id/create-sessions', /* authorize('coach'), */ createSessionsForEnrollments); // Create sessions for enrolled programs

// Admin and Coaching Manager routes
router.delete('/:id', /* authorize('admin'), */ deleteCoach); // Delete/deactivate coach
router.put('/:id/status', /* authorize('admin'), */ toggleCoachStatus); // Change coach status
router.get('/stats/overview', /* authorize('admin', 'coaching_manager'), */ getCoachStats); // Get coach statistics
router.put('/:id/assign-program', /* authorize('admin', 'coaching_manager'), */ assignProgramToCoach); // Assign program
router.put('/:id/remove-program', /* authorize('admin', 'coaching_manager'), */ removeProgramFromCoach); // Remove program

// Payroll routes (must come after general routes)
router.put('/:coachId/payroll/:payrollId/payment-status', /* authorize('coaching_manager', 'admin'), */ updateCoachPayrollPaymentStatus); // Update payment status
router.post('/:coachId/payroll', /* authorize('coaching_manager', 'admin'), */ createOrUpdateCoachPayroll); // Create or update payroll record

// System routes (for internal use)
router.put('/:id/rating', /* authorize('admin', 'system'), */ updateCoachRating); // Update rating (called by feedback system)

// Coach profile management routes
router.post('/create-for-user/:userId', /* authorize('admin'), */ createCoachProfileForUser); // Create coach profile for specific user
router.post('/create-missing-profiles', /* authorize('admin'), */ createMissingCoachProfiles); // Create missing coach profiles for all users with coach role

export default router;






