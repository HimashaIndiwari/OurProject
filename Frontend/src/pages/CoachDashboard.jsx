import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  MapPin, 
  BookOpen, 
  MessageSquare, 
  Plus, 
  LogOut,
  Home,
  User,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Upload,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { getCurrentUserRole } from '../utils/getCurrentUser';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('programs');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [difficultyFilter, setDifficultyFilter] = useState('All Levels');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [coachSessions, setCoachSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false);
  const [enrolledCustomers, setEnrolledCustomers] = useState([]);

  useEffect(() => {
    fetchCoachData();
    
    // Set up auto-refresh every 5 minutes
    const autoRefreshInterval = setInterval(() => {
      console.log('Auto-refreshing sessions data...');
      refreshSessionsData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, []);

  const refreshSessionsData = async () => {
    try {
      if (!coach?._id) return;
      
      const coachSessionsResponse = await axios.get(`http://localhost:5000/api/coaches/${coach._id}/sessions?t=${Date.now()}`);
      const coachSessionsData = coachSessionsResponse.data.data.docs || [];
      setSessions(coachSessionsData);
      setCoachSessions(coachSessionsData);
      console.log('Sessions data refreshed automatically');
      
      // Debug: Log session dates for troubleshooting
      console.log('=== SESSION DATE DEBUG ===');
      coachSessionsData.forEach((session, index) => {
        const sessionDate = new Date(session.scheduledDate);
        const now = new Date();
        
        // Create proper datetime with start time
        let sessionDateTime = sessionDate;
        if (session.startTime) {
          const [hours, minutes] = session.startTime.split(':').map(Number);
          sessionDateTime = new Date(sessionDate);
          sessionDateTime.setHours(hours, minutes, 0, 0);
        }
        
        console.log(`Session ${index + 1}:`, {
          title: session.title,
          scheduledDate: session.scheduledDate,
          startTime: session.startTime,
          parsedDate: sessionDate.toISOString(),
          sessionDateTime: sessionDateTime.toISOString(),
          currentTime: now.toISOString(),
          isPast: sessionDateTime < now,
          isUpcoming: sessionDateTime >= now
        });
      });
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Error auto-refreshing sessions:', error);
    }
  };

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      
      if (!userInfo || !userInfo._id) {
        setError('Please log in to access the coach dashboard');
        setLoading(false);
        navigate('/login');
        return;
      }

      // Get coach profile by user ID
      const coachResponse = await axios.get(`http://localhost:5000/api/coaches/user/${userInfo._id}`);
      const coachData = coachResponse.data.data;
      
      
      if (!coachData) {
        setError('Coach profile not found. Please contact support.');
        setLoading(false);
        return;
      }
      
      setCoach(coachData);
      
      // Get coach's assigned programs
      if (coachData.assignedPrograms && coachData.assignedPrograms.length > 0) {
        setAssignedPrograms(coachData.assignedPrograms);
      } else {
        setAssignedPrograms([]);
      }
      
      // Get coach's enrolled programs (students enrolled in coach's programs)
      let enrolledProgramsData = [];
      try {
        const enrolledProgramsResponse = await axios.get(`http://localhost:5000/api/coaches/${coachData._id}/enrolled-programs`);
        enrolledProgramsData = enrolledProgramsResponse.data.data.docs || [];
        setEnrolledPrograms(enrolledProgramsData);
      } catch (enrolledError) {
        console.warn('Could not fetch enrolled programs:', enrolledError);
        setEnrolledPrograms([]);
      }
      
      // FETCH CUSTOMERS DATA WITH ATTENDANCE STATISTICS
      
      try {
        // Fetch customers data with attendance statistics from the API
        // Fetch customers data with attendance statistics from the API
        const enrolledCustomersResponse = await axios.get(`http://localhost:5000/api/coaches/customers/${coachData._id}?t=${Date.now()}`);
        const enrolledCustomersData = enrolledCustomersResponse.data.data.customersByProgram || [];
        
        // Flatten the customers data
        const customersData = [];
        enrolledCustomersData.forEach(programGroup => {
          programGroup.customers.forEach(customer => {
            customersData.push({
              _id: customer.user._id,
              user: customer.user,
              enrolledPrograms: [programGroup.program._id],
              totalSessions: customer.totalSessions || 0,
              completedSessions: customer.completedSessions || 0,
              presentSessions: customer.presentSessions || 0,
              absentSessions: customer.absentSessions || 0,
              progressPercentage: customer.progressPercentage || 0,
              enrollmentDate: customer.enrollmentDate,
              status: customer.status
            });
          });
        });
        
        setCustomers(customersData);
        
      } catch (error) {
        console.error('Error fetching customers with attendance data:', error);
        // Fallback to simple data from enrolled programs
        const simpleCustomersData = enrolledProgramsData.map(enrollment => ({
          _id: enrollment.user._id,
          user: enrollment.user,
          enrolledPrograms: [enrollment.program._id],
          totalSessions: enrollment.program.duration || 0,
          completedSessions: 0,
          presentSessions: 0,
          absentSessions: 0,
          progressPercentage: 0,
          enrollmentDate: enrollment.enrollmentDate || enrollment.createdAt,
          status: enrollment.status || 'active'
        }));
        setCustomers(simpleCustomersData);
      }
      
      // Fetch coach's sessions with attendance data
      try {
        const coachSessionsResponse = await axios.get(`http://localhost:5000/api/coaches/${coachData._id}/sessions`);
        const coachSessionsData = coachSessionsResponse.data.data.docs || [];
        setSessions(coachSessionsData);
        setCoachSessions(coachSessionsData);
      } catch (sessionsError) {
        console.warn('Could not fetch coach sessions:', sessionsError);
        setSessions([]);
        setCoachSessions([]);
      }

      // Fetch enrolled customers
      await fetchEnrolledCustomers();
      
    } catch (error) {
      console.error('Error fetching coach data:', error);
      setError('Failed to load coach data. Please try again.');
      // Set empty data on error
      setCoach(null);
      setAssignedPrograms([]);
      setCustomers([]);
      setSessions([]);
      setEnrolledPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/player-feedback', feedbackData);
      setShowFeedbackModal(false);
      setSelectedParticipant(null);
      // Refresh data after feedback submission
      fetchCoachData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // BACKEND ATTENDANCE MARKING WITH FALLBACK TO FRONTEND
  const handleMarkAttendance = async (attendanceData) => {
    try {
      // Validate required data
      if (!selectedSession) {
        alert('No session selected');
        return;
      }
      
      if (!selectedSession.participants || selectedSession.participants.length === 0) {
        alert('No participants found in this session');
        return;
      }
      
      if (!attendanceData || attendanceData.length === 0) {
        alert('No attendance data provided');
        return;
      }
      
      // Handle attendance data for multiple participants
      const validAttendanceData = attendanceData.filter(item => 
        item.participantId && (item.attended === true || item.attended === false)
      );
      
      if (validAttendanceData.length === 0) {
        alert('No valid attendance data to submit. Please select Present or Absent for at least one participant.');
        return;
      }
      
      // Try backend first, then fallback to frontend
      let backendSuccess = false;
      
      try {
        console.log('Trying backend attendance marking...');
        
        // Extract the original session ID (remove participant suffix if present)
        let originalSessionId = selectedSession._id;
        if (selectedSession._id.includes('-') && selectedSession.isIndividual) {
          // If this is an individual session, extract the original session ID
          originalSessionId = selectedSession._id.split('-')[0];
        }
        
        console.log('Original session ID:', originalSessionId);
        console.log('Selected session ID:', selectedSession._id);
        console.log('Attendance data being sent:', validAttendanceData);
        
        const response = await axios.put(
          `http://localhost:5000/api/coaches/attendance-only`,
          { 
            sessionId: originalSessionId,
            attendanceData: validAttendanceData
          }
        );
        
        console.log('Backend response:', response.data);
        
        if (response.data.success) {
          console.log('Backend attendance marking successful!');
          backendSuccess = true;
          alert('Attendance marked successfully! (Saved to database)');
          
          // Refresh both sessions and customers data to show updated attendance
          try {
            // Refresh sessions data using the new function
            await refreshSessionsData();
            console.log('Sessions data refreshed with updated attendance');
            
            // Refresh customers data
            const enrolledCustomersResponse = await axios.get(`http://localhost:5000/api/coaches/customers/${coach._id}?t=${Date.now()}`);
            const enrolledCustomersData = enrolledCustomersResponse.data.data.customersByProgram || [];
            
            // Flatten the customers data
            const updatedCustomers = [];
            enrolledCustomersData.forEach(programGroup => {
              programGroup.customers.forEach(customer => {
                updatedCustomers.push({
                  _id: customer.user._id,
                  user: customer.user,
                  enrolledPrograms: [programGroup.program._id],
                  totalSessions: customer.totalSessions || 0,
                  completedSessions: customer.completedSessions || 0,
                  presentSessions: customer.presentSessions || 0,
                  absentSessions: customer.absentSessions || 0,
                  progressPercentage: customer.progressPercentage || 0,
                  enrollmentDate: customer.enrollmentDate,
                  status: customer.status
                });
              });
            });
            
            setCustomers(updatedCustomers);
            console.log('Customers data refreshed with updated attendance statistics');
          } catch (refreshError) {
            console.error('Error refreshing data:', refreshError);
            // Fallback to full data refresh
            await fetchCoachData();
          }
        }
      } catch (backendError) {
        console.error('Backend attendance marking failed:', backendError);
        console.error('Error details:', {
          message: backendError.message,
          response: backendError.response?.data,
          status: backendError.response?.status,
          statusText: backendError.response?.statusText
        });
        
        // Show specific error message from backend if available
        const backendMessage = backendError.response?.data?.message;
        if (backendMessage) {
          console.error('Backend error message:', backendMessage);
          // You could show this to the user if needed
        }
        
        console.log('Falling back to frontend-only solution...');
      }
      
      // If backend failed, use frontend-only solution
      if (!backendSuccess) {
        console.log('Using frontend-only attendance marking (no backend calls)');
        console.log('Backend API call failed - this could be due to:');
        console.log('1. Backend server not running');
        console.log('2. Invalid session ID or participant data');
        console.log('3. Database connection issues');
        console.log('4. API endpoint not responding correctly');
        
        // Update the session participants in local state
        const updatedSessions = sessions.map(session => {
          if (session._id === selectedSession._id) {
            const updatedParticipants = session.participants.map(participant => {
              const attendanceItem = validAttendanceData.find(item => item.participantId === participant._id);
              if (attendanceItem) {
                return {
                  ...participant,
                  attended: attendanceItem.attended,
                  attendanceMarkedAt: new Date()
                };
              }
              return participant;
            });
            
            return {
              ...session,
              participants: updatedParticipants
            };
          }
          return session;
        });
        
        // Update sessions state
        setSessions(updatedSessions);
        
        // Update customer sessions if we're in customer view
      if (selectedCustomer) {
          const updatedCustomerSessions = customerSessions.map(session => {
            if (session._id === selectedSession._id) {
              const updatedParticipants = session.participants.map(participant => {
                const attendanceItem = validAttendanceData.find(item => item.participantId === participant._id);
                if (attendanceItem) {
                  return {
                    ...participant,
                    attended: attendanceItem.attended,
                    attendanceMarkedAt: new Date()
                  };
                }
                return participant;
              });
              
              return {
                ...session,
                participants: updatedParticipants
              };
            }
            return session;
          });
          
          setCustomerSessions(updatedCustomerSessions);
        }
        
        // Refresh customers data from API to get updated attendance statistics
        try {
          const enrolledCustomersResponse = await axios.get(`http://localhost:5000/api/coaches/customers/${coach._id}?t=${Date.now()}`);
          const enrolledCustomersData = enrolledCustomersResponse.data.data.customersByProgram || [];
          
          // Flatten the customers data
          const updatedCustomers = [];
          enrolledCustomersData.forEach(programGroup => {
            programGroup.customers.forEach(customer => {
              updatedCustomers.push({
                _id: customer.user._id,
                user: customer.user,
                enrolledPrograms: [programGroup.program._id],
                totalSessions: customer.totalSessions || 0,
                completedSessions: customer.completedSessions || 0,
                presentSessions: customer.presentSessions || 0,
                absentSessions: customer.absentSessions || 0,
                progressPercentage: customer.progressPercentage || 0,
            enrollmentDate: customer.enrollmentDate,
            status: customer.status
              });
            });
          });
          
          setCustomers(updatedCustomers);
        } catch (error) {
          console.error('Error refreshing customers data:', error);
          // Keep existing customers data if refresh fails
        }
        
        // Show a more informative message
        const errorMessage = 'Attendance marked successfully! (Note: This was saved locally only. If you see this message, the backend API call failed. Please check the browser console for error details and contact your administrator if the issue persists.)';
        alert(errorMessage);
      }
      
      // Close modal
      setShowAttendanceModal(false);
      setSelectedSession(null);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance: ' + error.message);
    }
  };

  const fetchEnrolledCustomers = async () => {
    try {
      if (!coach || !coach._id) return;
      
      const response = await axios.get(`http://localhost:5000/api/coaches/customers/${coach._id}`);
      setEnrolledCustomers(response.data.data.customersByProgram || []);
    } catch (error) {
      console.warn('Could not fetch enrolled customers (this is optional):', error.message);
      // Don't set error state for this optional call
      setEnrolledCustomers([]);
    }
  };



  const handleCustomerClick = async (customer, enrollment) => {
    setSelectedCustomer(customer);
    setSelectedEnrollment(enrollment);
    setShowCustomerDetailsModal(true);
  };


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchCoachData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getFilteredPrograms = () => {
    return assignedPrograms.filter(program => {
      const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || program.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'All Levels' || program.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'All Status' || 
                           (statusFilter === 'Active' && program.isActive) ||
                           (statusFilter === 'Inactive' && !program.isActive);
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  };

  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      const fullName = `${customer.user.firstName} ${customer.user.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) ||
             customer.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  // Group customers by their coaching programs
  const getCustomersByProgram = () => {
    // Use the customers data that's already grouped by program from the API
    if (!customers || customers.length === 0) {
      return [];
    }
    
    // Create a simple grouping by program
    const programGroups = {};
    
    customers.forEach(customer => {
      // Each customer has enrolledPrograms array
      customer.enrolledPrograms.forEach(programId => {
        if (!programGroups[programId]) {
          // Find the program details from enrolledPrograms
          const enrollment = enrolledPrograms.find(ep => ep.program && ep.program._id === programId);
          if (enrollment) {
            programGroups[programId] = {
              program: enrollment.program,
              customers: []
            };
          }
        }
        
        if (programGroups[programId]) {
          programGroups[programId].customers.push(customer);
        }
      });
    });
    
    // Convert to array and filter by search term
    return Object.values(programGroups).map(group => ({
      ...group,
      customers: group.customers.filter(customer => {
        const fullName = `${customer.user.firstName} ${customer.user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
               customer.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      })
    })).filter(group => group.customers.length > 0);
  };

  const getUniqueSessionsCount = () => {
    // Remove duplicates based on session title and date
    const seenSessions = new Set();
    
    sessions.forEach(session => {
      const sessionKey = `${session.title}-${session.scheduledDate}`;
      seenSessions.add(sessionKey);
    });
    
    return seenSessions.size;
  };

  const getFilteredSessions = () => {
    // First filter sessions
    const filteredSessions = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.program.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle attendance-based filtering
      let matchesStatus = true;
      if (statusFilter !== 'All Status') {
        const now = new Date();
        const sessionDate = new Date(session.scheduledDate);
        const isPastSession = sessionDate < now;
        
        if (statusFilter === 'attendance marked') {
          // Check if any participant has attendance marked
          matchesStatus = session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined);
        } else if (statusFilter === 'attendance not marked') {
          // Check if no participants have attendance marked
          matchesStatus = !session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined) && isPastSession;
        } else if (statusFilter === 'present') {
          // Check if any participant is marked as present
          matchesStatus = session.participants.some(p => p.attended === true);
        } else if (statusFilter === 'absent') {
          // Check if any participant is marked as absent
          matchesStatus = session.participants.some(p => p.attended === false);
        } else {
          // Fallback to original status filtering
          matchesStatus = session.status === statusFilter;
        }
      }
      
      return matchesSearch && matchesStatus;
    });

    // Group sessions by date
    const dateGroups = new Map();
    
    filteredSessions.forEach(session => {
      const sessionDate = new Date(session.scheduledDate).toDateString();
      
      if (!dateGroups.has(sessionDate)) {
        dateGroups.set(sessionDate, []);
      }
      
      dateGroups.get(sessionDate).push(session);
    });
    
    // Sort dates and get sessions from first 4 dates
    const sortedDates = Array.from(dateGroups.keys()).sort();
    const sessionsByDate = [];
    
    sortedDates.slice(0, 4).forEach(date => {
      const sessionsForDate = dateGroups.get(date);
      sessionsByDate.push(...sessionsForDate);
    });
    
    return sessionsByDate.slice(0, 4); // Limit to 4 total sessions
  };

  const getPastSessions = () => {
    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.program.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle attendance-based filtering
      let matchesStatus = true;
      if (statusFilter !== 'All Status') {
        const sessionDate = new Date(session.scheduledDate);
        const isPastSession = sessionDate < now;
        
        if (statusFilter === 'attendance marked') {
          // Check if any participant has attendance marked
          matchesStatus = session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined);
        } else if (statusFilter === 'attendance not marked') {
          // Check if no participants have attendance marked
          matchesStatus = !session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined) && isPastSession;
        } else if (statusFilter === 'present') {
          // Check if any participant is marked as present
          matchesStatus = session.participants.some(p => p.attended === true);
        } else if (statusFilter === 'absent') {
          // Check if any participant is marked as absent
          matchesStatus = session.participants.some(p => p.attended === false);
        } else {
          // Fallback to original status filtering
          matchesStatus = session.status === statusFilter;
        }
      }
      
      // Create proper datetime comparison including session time
      const sessionDate = new Date(session.scheduledDate);
      
      // If session has startTime, combine date with start time for accurate comparison
      let sessionDateTime = sessionDate;
      if (session.startTime) {
        const [hours, minutes] = session.startTime.split(':').map(Number);
        sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(hours, minutes, 0, 0);
      }
      
      const isPast = sessionDateTime < now;
      
      console.log(`Session: ${session.title}, Date: ${sessionDate.toISOString()}, StartTime: ${session.startTime}, SessionDateTime: ${sessionDateTime.toISOString()}, Now: ${now.toISOString()}, IsPast: ${isPast}`);
      
      return matchesSearch && matchesStatus && isPast;
    });

    // Create individual sessions for each customer
    const individualSessions = [];
    
    filteredSessions.forEach(session => {
      if (session.participants && session.participants.length > 0) {
        session.participants.forEach((participant, index) => {
          if (participant.user) {
            const customerName = `${participant.user.firstName} ${participant.user.lastName}`;
            const individualSession = {
              ...session,
              _id: `${session._id}-${participant.user._id}`,
              title: `${session.title} - ${customerName}`,
              participant: participant,
              customerName: customerName,
              isIndividual: true
            };
            individualSessions.push(individualSession);
          }
        });
      }
    });

    // Sort by date (most recent first) - show all sessions
    return individualSessions
      .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.program.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle attendance-based filtering
      let matchesStatus = true;
      if (statusFilter !== 'All Status') {
        const sessionDate = new Date(session.scheduledDate);
        const isPastSession = sessionDate < now;
        
        if (statusFilter === 'attendance marked') {
          // Check if any participant has attendance marked
          matchesStatus = session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined);
        } else if (statusFilter === 'attendance not marked') {
          // Check if no participants have attendance marked
          matchesStatus = !session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined) && isPastSession;
        } else if (statusFilter === 'present') {
          // Check if any participant is marked as present
          matchesStatus = session.participants.some(p => p.attended === true);
        } else if (statusFilter === 'absent') {
          // Check if any participant is marked as absent
          matchesStatus = session.participants.some(p => p.attended === false);
        } else {
          // Fallback to original status filtering
          matchesStatus = session.status === statusFilter;
        }
      }
      
      // Create proper datetime comparison including session time
      const sessionDate = new Date(session.scheduledDate);
      
      // If session has startTime, combine date with start time for accurate comparison
      let sessionDateTime = sessionDate;
      if (session.startTime) {
        const [hours, minutes] = session.startTime.split(':').map(Number);
        sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(hours, minutes, 0, 0);
      }
      
      const isUpcoming = sessionDateTime >= now;
      
      console.log(`Session: ${session.title}, Date: ${sessionDate.toISOString()}, StartTime: ${session.startTime}, SessionDateTime: ${sessionDateTime.toISOString()}, Now: ${now.toISOString()}, IsUpcoming: ${isUpcoming}`);
      
      return matchesSearch && matchesStatus && isUpcoming;
    });

    // Create individual sessions for each customer
    const individualSessions = [];
    
    filteredSessions.forEach(session => {
      if (session.participants && session.participants.length > 0) {
        session.participants.forEach((participant, index) => {
          if (participant.user) {
            const customerName = `${participant.user.firstName} ${participant.user.lastName}`;
            const individualSession = {
              ...session,
              _id: `${session._id}-${participant.user._id}`,
              title: `${session.title} - ${customerName}`,
              participant: participant,
              customerName: customerName,
              isIndividual: true
            };
            individualSessions.push(individualSession);
          }
        });
      }
    });

    // Sort by date (soonest first) - show all sessions
    return individualSessions
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  const getFilteredEnrolledPrograms = () => {
    return enrolledPrograms.filter(enrollment => {
      const studentName = `${enrollment.user.firstName} ${enrollment.user.lastName}`.toLowerCase();
      const programTitle = enrollment.program.title.toLowerCase();
      const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                           programTitle.includes(searchTerm.toLowerCase()) ||
                           enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || enrollment.status === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' || enrollment.program.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const getFilteredCoachSessions = () => {
    return coachSessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.program?.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle attendance-based filtering
      let matchesStatus = true;
      if (statusFilter !== 'All Status') {
        const now = new Date();
        const sessionDate = new Date(session.scheduledDate);
        const isPastSession = sessionDate < now;
        
        if (statusFilter === 'attendance marked') {
          // Check if any participant has attendance marked
          matchesStatus = session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined);
        } else if (statusFilter === 'attendance not marked') {
          // Check if no participants have attendance marked
          matchesStatus = !session.participants.some(p => p.attendanceMarkedAt || p.attended !== undefined) && isPastSession;
        } else if (statusFilter === 'present') {
          // Check if any participant is marked as present
          matchesStatus = session.participants.some(p => p.attended === true);
        } else if (statusFilter === 'absent') {
          // Check if any participant is marked as absent
          matchesStatus = session.participants.some(p => p.attended === false);
        } else {
          // Fallback to original status filtering
          matchesStatus = session.status === statusFilter;
        }
      }
      
      return matchesSearch && matchesStatus;
    });
  };

  // Add error boundary for the main component
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">Coach Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

          <nav className="mt-6">
            <div className="px-6 space-y-2">

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === 'programs' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Programs
            </button>
            
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === 'customers' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Customers
            </button>
            
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === 'sessions' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Sessions
            </button>
            
            
            
            
            
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Coach Dashboard</h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {activeTab === 'programs' && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Coaching Programs</h2>
                </div>
                
                {/* Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search by title, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All Categories">All Categories</option>
                      <option value="Training">Training</option>
                      <option value="Specialized">Specialized</option>
                    </select>
                    
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All Status">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">Showing {getFilteredPrograms().length} of {assignedPrograms.length} programs</p>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Program Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredPrograms().map((program) => (
                  <ProgramCard
                    key={program._id}
                    program={program}
                    coach={coach}
                    onViewSessions={() => setSelectedProgram(program)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Customers</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        const enrolledCustomersResponse = await axios.get(`http://localhost:5000/api/coaches/customers/${coach._id}?t=${Date.now()}`);
                        const enrolledCustomersData = enrolledCustomersResponse.data.data.customersByProgram || [];
                        
                        const updatedCustomers = [];
                        enrolledCustomersData.forEach(programGroup => {
                          programGroup.customers.forEach(customer => {
                            updatedCustomers.push({
                              _id: customer.user._id,
                              user: customer.user,
                              enrolledPrograms: [programGroup.program._id],
                              totalSessions: customer.totalSessions || 0,
                              completedSessions: customer.completedSessions || 0,
                              presentSessions: customer.presentSessions || 0,
                              absentSessions: customer.absentSessions || 0,
                              progressPercentage: customer.progressPercentage || 0,
                              enrollmentDate: customer.enrollmentDate,
                              status: customer.status
                            });
                          });
                        });
                        
                        setCustomers(updatedCustomers);
                        alert('Customers data refreshed successfully!');
                      } catch (error) {
                        console.error('Error refreshing customers:', error);
                        alert('Error refreshing customers data');
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  
                </div>
              </div>
              
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Programs</p>
                      <p className="text-2xl font-bold text-blue-600">{enrolledPrograms.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Students</p>
                      <p className="text-2xl font-bold text-green-600">{customers.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Avg Progress</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {customers.length > 0 ? Math.round(
                          customers.reduce((sum, customer) => {
                            const totalSessions = customer.totalSessions || 0;
                            const presentSessions = customer.presentSessions || 0;
                            // Progress based ONLY on attendance (present sessions)
                            return sum + (totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0);
                          }, 0) / customers.length
                        ) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Active Programs</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {enrolledPrograms.filter(program => program.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Customers Categorized by Program */}
              {getCustomersByProgram().length > 0 ? (
                <div className="space-y-8">
                  {getCustomersByProgram().map((programGroup) => (
                    <div key={programGroup.program._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      {/* Program Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{programGroup.program.title}</h3>
                            <p className="text-gray-600">{programGroup.program.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Duration: {programGroup.program.duration} weeks</span>
                              <span>•</span>
                              <span>Fee: LKR {programGroup.program.fee}</span>
                              <span>•</span>
                              <span>{programGroup.customers.length} students</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            programGroup.program.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {programGroup.program.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Customers in this Program */}
                      {programGroup.customers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {programGroup.customers.map((customer) => {
                    const enrollment = enrolledPrograms.find(ep => ep.user && ep.user._id === customer._id);
                    return (
                      <CustomerCard 
                        key={customer._id} 
                        customer={customer} 
                        enrollment={enrollment}
                                onCustomerClick={handleCustomerClick}
                      />
                    );
                  })}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <div className="text-gray-400 text-4xl mb-2">👥</div>
                          <p className="text-gray-600">No students enrolled in this program yet</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-500">
                    {customers.length === 0 
                      ? "No students are currently enrolled in your programs."
                      : "No customers match your search criteria."
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        await refreshSessionsData();
                        alert('All sessions data refreshed successfully!');
                      } catch (error) {
                        console.error('Error refreshing sessions:', error);
                        alert('Error refreshing sessions data');
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Sessions
                  </button>
                  
                </div>
              </div>
              
              {/* Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All Status">All Status</option>
                    <option value="attendance marked">Attendance Marked</option>
                    <option value="attendance not marked">Attendance Not Marked</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              {/* Past Sessions */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-red-600" />
                    Past Sessions
                  </h3>
                  <button
                    onClick={async () => {
                      try {
                        await refreshSessionsData();
                        alert('Sessions data refreshed successfully!');
                      } catch (error) {
                        console.error('Error refreshing sessions:', error);
                        alert('Error refreshing sessions data');
                      }
                    }}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                </div>
                <div className="space-y-4">
                  {getPastSessions().map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onGiveFeedback={(participant) => {
                        setSelectedParticipant(participant);
                        setShowFeedbackModal(true);
                      }}
                      onMarkAttendance={(session) => {
                        setSelectedSession(session);
                        setSelectedCustomer(null); // No specific customer - mark all participants
                        setShowAttendanceModal(true);
                      }}
                    />
                  ))}
                  {getPastSessions().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No past sessions found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    Upcoming Sessions
                  </h3>
                  <button
                    onClick={async () => {
                      try {
                        await refreshSessionsData();
                        alert('Sessions data refreshed successfully!');
                      } catch (error) {
                        console.error('Error refreshing sessions:', error);
                        alert('Error refreshing sessions data');
                      }
                    }}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                </div>
                <div className="space-y-4">
                  {getUpcomingSessions().map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onGiveFeedback={(participant) => {
                        setSelectedParticipant(participant);
                        setShowFeedbackModal(true);
                      }}
                      onMarkAttendance={null} // Disable attendance marking for upcoming sessions
                    />
                  ))}
                  {getUpcomingSessions().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming sessions found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enrolled' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enrolled Programs</h2>
              
              {/* Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by student name, program..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All Status">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Training">Training</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
              </div>

              {/* Enrolled Programs Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredEnrolledPrograms().map((enrollment) => (
                  <EnrolledProgramCard key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            </div>
          )}


          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
              
              {coach ? (
                <div>
                  
                <CoachProfileCard 
                  coach={coach} 
                  enrolledPrograms={enrolledPrograms}
                  sessions={sessions}
                />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Program Sessions Modal */}
      {selectedProgram && (
        <ProgramSessionsModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onGiveFeedback={(participant) => {
            setSelectedParticipant(participant);
            setShowFeedbackModal(true);
          }}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedParticipant && (
        <FeedbackModal
          participant={selectedParticipant}
          onSubmit={handleSubmitFeedback}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedParticipant(null);
          }}
        />
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedSession && selectedSession.participants && selectedSession.participants.length > 0 && coach && (
        <AttendanceModal
          session={selectedSession}
          coach={coach}
          selectedCustomer={selectedCustomer}
          onSubmit={handleMarkAttendance}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedSession(null);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Customer Details Modal */}
      {showCustomerDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          enrollment={selectedEnrollment}
          onClose={() => {
            setShowCustomerDetailsModal(false);
            setSelectedCustomer(null);
            setSelectedEnrollment(null);
          }}
        />
      )}
    </div>
  );
};

// Program Card Component
const ProgramCard = ({ program, coach, onViewSessions }) => {
  const enrollmentPercentage = Math.round((program.currentEnrollments / program.maxParticipants) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {program.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{program.category}</p>
          <p className="text-gray-600 text-sm mb-4">{program.description}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Coach: {coach?.userId?.firstName} {coach?.userId?.lastName}</span>
          <span className="text-gray-500">Fee: LKR {program.fee}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Duration: {program.duration} weeks</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            program.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            program.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {program.difficulty}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Enrollments: {program.currentEnrollments}/{program.maxParticipants}</span>
          <span className="text-gray-500">Sessions: {program.totalSessions}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Enrollment Progress</span>
            <span className="text-gray-500">{enrollmentPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${enrollmentPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Edit className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Upload className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// Session Card Component
const SessionCard = ({ session, onGiveFeedback, onMarkAttendance }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceStats = () => {
    if (!session.participants || session.participants.length === 0) {
      return { attendedCount: 0, totalParticipants: 0, attendancePercentage: 0 };
    }
    
    // Check if this is a future session - if so, show 0% attendance
    const now = new Date();
    const sessionDate = new Date(session.scheduledDate);
    // Set time to start of day for comparison to allow attendance marking for today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);
    const isFutureSession = sessionDate > today;
    
    if (isFutureSession) {
      console.log('Future session detected, showing 0% attendance:', {
        sessionId: session._id,
        sessionDate: sessionDate.toISOString(),
        now: now.toISOString(),
        isFuture: isFutureSession
      });
      return { attendedCount: 0, totalParticipants: session.participants.length, attendancePercentage: 0 };
    }
    
    // Check both attendanceStatus (new) and attended (old) fields for backward compatibility
    const attendedCount = session.participants.filter(p => {
      return p.attendanceStatus === 'present' || 
             (p.attended === true && p.attendanceStatus !== 'absent');
    }).length;
    
    const totalParticipants = session.participants.length;
    const attendancePercentage = totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0;
    
    console.log('Attendance stats calculation:', {
      sessionId: session._id,
      participants: session.participants.map(p => ({
        id: p._id,
        name: `${p.user?.firstName} ${p.user?.lastName}`,
        attended: p.attended,
        attendance: p.attendance,
        attendanceMarkedAt: p.attendanceMarkedAt,
        isAttended: p.attended === true || p.attendance?.attended === true
      })),
      attendedCount,
      totalParticipants,
      attendancePercentage,
      calculation: `${attendedCount}/${totalParticipants} = ${attendancePercentage}%`
    });
    
    return { attendedCount, totalParticipants, attendancePercentage };
  };

  const attendanceStats = getAttendanceStats();

  // Check if a session can be completed (only past sessions)
  const canBeCompleted = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.scheduledDate);
    return sessionDate < now; // Only past sessions can be completed
  };

  // Get the appropriate status for display
  const getDisplayStatus = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.scheduledDate);
    
    if (sessionDate < now) {
      // Past session - can be completed
      return session.status;
    } else {
      // Upcoming session - cannot be completed, force to 'scheduled'
      return 'scheduled';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{session.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getDisplayStatus(session))}`}>
              {getDisplayStatus(session)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{session.program?.title}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
            <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(session.scheduledDate)}
            </span>
            <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </span>
          </div>
          {session.ground && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              {session.ground.name}
            </div>
          )}
        </div>
        {/* Attendance Stats */}
        <div className="ml-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3 mb-2">
            <p className="text-sm text-gray-500">Attendance</p>
            {(() => {
              const now = new Date();
              const sessionDate = new Date(session.scheduledDate);
              // Set time to start of day for comparison to allow attendance marking for today's sessions
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              sessionDate.setHours(0, 0, 0, 0);
              const isFutureSession = sessionDate > today;
              
              if (isFutureSession) {
                return (
                  <>
                    <p className="text-2xl font-bold text-gray-500">
                      Not Marked
                    </p>
                    <p className="text-xs text-gray-500">
                      Session not started
                    </p>
                  </>
                );
              }
              
              return (
                <>
                  <p className={`text-2xl font-bold ${getAttendanceColor(attendanceStats.attendancePercentage)}`}>
                    {attendanceStats.attendancePercentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {attendanceStats.attendedCount}/{attendanceStats.totalParticipants}
                  </p>
                </>
              );
            })()}
          </div>
          
          {onMarkAttendance ? (
            <button
              onClick={() => onMarkAttendance(session)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Mark Attendance
            </button>
          ) : (
            <div className="flex items-center px-3 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm cursor-not-allowed">
              <Clock className="h-4 w-4 mr-1" />
              Session Not Started
            </div>
          )}
        </div>
      </div>
      
      {session.participants && session.participants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {session.participants.map((participant) => (
              <div
                key={participant._id}
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  participant.attended === true
                    ? 'bg-green-100 text-green-800' 
                    : participant.attended === false
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {participant.attended === true ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : participant.attended === false ? (
                  <XCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Clock className="h-4 w-4 mr-1" />
                )}
                {participant.user?.firstName} {participant.user?.lastName}
              </div>
            ))}
          </div>
          
          {onGiveFeedback && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            Give Feedback:
          </p>
          <div className="flex flex-wrap gap-2">
            {session.participants.map((participant) => (
              <button
                key={participant._id}
                onClick={() => onGiveFeedback(participant)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm transition-colors font-medium"
              >
                {participant.user?.firstName} {participant.user?.lastName}
              </button>
            ))}
          </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Program Sessions Modal Component
const ProgramSessionsModal = ({ program, onClose, onGiveFeedback }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [program._id]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sessions/program/${program._id}`);
      setSessions(response.data.data.docs || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Sessions for {program.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sessions found for this program</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onGiveFeedback={onGiveFeedback}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feedback Modal Component
const FeedbackModal = ({ participant, onSubmit, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        participantId: participant._id,
        userId: participant.user._id,
        rating,
        comment: comment.trim()
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Give Feedback</h2>
          <p className="text-sm text-gray-600 mt-1">
            Feedback for {participant.user?.firstName} {participant.user?.lastName}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5 stars)
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your feedback about this player's performance..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Coach Profile Card Component
const CoachProfileCard = ({ coach, enrolledPrograms, sessions }) => {
  
  // Add defensive checks
  if (!coach) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-red-600">Error: Coach data not available</p>
      </div>
    );
  }
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    specializations: coach?.specializations || [],
    experience: coach?.experience || 0,
    bio: coach?.bio || '',
    hourlyRate: coach?.hourlyRate || 0,
    achievements: coach?.achievements || []
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      specializations: coach.specializations || [],
      experience: coach.experience || 0,
      bio: coach.bio || '',
      hourlyRate: coach.hourlyRate || 0,
      achievements: coach.achievements || []
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setProfileImage(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.filePath) {
        return response.data.filePath;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.response?.data?.message || error.message));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      let profileImagePath = coach.profileImage; // Keep existing image if no new upload
      
      // Upload new image if one was selected
      if (profileImage) {
        const uploadedPath = await uploadProfileImage();
        if (uploadedPath) {
          profileImagePath = uploadedPath;
        } else {
          return; // Stop if upload failed
        }
      }

      // Prepare update data
      const updateData = {
        ...editData,
        profileImage: profileImagePath
      };
      
      // Make API call to update the coach profile
      const response = await axios.put(`http://localhost:5000/api/coaches/${coach._id}`, updateData);
      
      if (response.data.success) {
        setIsEditing(false);
        setProfileImage(null);
        setProfileImagePreview(null);
        
        // Refresh the coach data to show updated information
        alert('Profile updated successfully!');
        
        // Optionally refresh the page or update local state
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      specializations: coach.specializations || [],
      experience: coach.experience || 0,
      bio: coach.bio || '',
      hourlyRate: coach.hourlyRate || 0,
      achievements: coach.achievements || []
    });
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const addSpecialization = () => {
    setEditData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const updateSpecialization = (index, value) => {
    setEditData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => i === index ? value : spec)
    }));
  };

  const removeSpecialization = (index) => {
    setEditData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    setEditData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const updateAchievement = (index, value) => {
    setEditData(prev => ({
      ...prev,
      achievements: prev.achievements.map((ach, i) => i === index ? value : ach)
    }));
  };

  const removeAchievement = (index) => {
    setEditData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {profileImagePreview ? (
                <img 
                  src={profileImagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : coach.profileImage ? (
                <img 
                  src={`http://localhost:5000${coach.profileImage}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
            {isEditing && (
              <div className="absolute -bottom-1 -right-1">
                <label className="cursor-pointer">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    uploadingImage 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {coach.userId?.firstName && coach.userId?.lastName 
                ? `${coach.userId.firstName} ${coach.userId.lastName}`
                : 'Coach Profile'
              }
            </h3>
            <p className="text-gray-600">
              {coach.userId?.email || 'Email not available'}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                coach.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {coach.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-gray-500">
                {coach.assignedPrograms?.length || 0} Programs
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Personal Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="text-gray-900">{coach.userId?.firstName || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="text-gray-900">{coach.userId?.lastName || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{coach.userId?.email || 'Not available'}</p>
            </div>
            {coach.userId?.contactNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="text-gray-900">{coach.userId.contactNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Professional Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.experience}
                  onChange={(e) => setEditData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              ) : (
                <p className="text-gray-900">{coach.experience || 0} years</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
              {(() => {
                const userRole = getCurrentUserRole();
                const canEditHourlyRate = ['coaching_manager', 'admin'].includes(userRole);
                
                if (isEditing && !canEditHourlyRate) {
                  // Coach cannot edit hourly rate - show read-only with note
                  return (
                    <div>
                      <p className="text-gray-900">
                        {coach.hourlyRate && coach.hourlyRate > 0 ? `LKR ${coach.hourlyRate}` : 'Not set'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        * Hourly rate can only be updated by coaching manager
                      </p>
                    </div>
                  );
                } else if (isEditing && canEditHourlyRate) {
                  // Coaching manager can edit hourly rate
                  return (
                    <input
                      type="number"
                      value={editData.hourlyRate}
                      onChange={(e) => setEditData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  );
                } else {
                  // Read-only view
                  return (
                    <p className="text-gray-900">
                      {coach.hourlyRate && coach.hourlyRate > 0 ? `LKR ${coach.hourlyRate}` : 'Not set'}
                    </p>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Specializations
        </h4>
        
        {isEditing ? (
          <div className="space-y-3">
            {editData.specializations.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => updateSpecialization(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter specialization"
                />
                <button
                  onClick={() => removeSpecialization(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addSpecialization}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specialization
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {coach.specializations && coach.specializations.length > 0 ? (
              coach.specializations.filter(spec => spec && spec.trim()).map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {spec}
                </span>
              ))
            ) : (
              <p className="text-gray-500 italic">No specializations added</p>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Bio
        </h4>
        
        {isEditing ? (
          <textarea
            value={editData.bio}
            onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about your coaching experience and philosophy..."
          />
        ) : (
          <p className="text-gray-900 whitespace-pre-wrap">
            {coach.bio && coach.bio.trim() ? coach.bio : 'No bio available'}
          </p>
        )}
      </div>

      {/* Achievements */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Achievements
        </h4>
        
        {isEditing ? (
          <div className="space-y-3">
            {editData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => updateAchievement(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter achievement"
                />
                <button
                  onClick={() => removeAchievement(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addAchievement}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {coach.achievements && coach.achievements.length > 0 ? (
              coach.achievements.filter(achievement => achievement && achievement.trim()).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-900">{achievement}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No achievements added</p>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Assigned Programs</p>
              <p className="text-2xl font-bold text-blue-600">{coach.assignedPrograms?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-green-600">{enrolledPrograms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-purple-600">{Math.min(sessions?.length || 0, 4)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enrolled Program Card Component
const EnrolledProgramCard = ({ enrollment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {enrollment.user.firstName} {enrollment.user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{enrollment.user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
              {enrollment.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
              {enrollment.paymentStatus}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">{enrollment.program.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{enrollment.program.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{enrollment.program.category}</span>
            <span>•</span>
            <span>LKR {enrollment.program.fee}</span>
            <span>•</span>
            <span>{enrollment.program.duration} weeks</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-900 font-medium">
              {enrollment.progress.completedSessions}/{enrollment.progress.totalSessions} sessions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${enrollment.progress.progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Enrolled</span>
            <span className="text-gray-500">{formatDate(enrollment.enrollmentDate)}</span>
          </div>
        </div>
        
        {enrollment.sessions && enrollment.sessions.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Recent Sessions:</p>
            <div className="space-y-1">
              {enrollment.sessions.slice(0, 2).map((session) => (
                <div key={session._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{session.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getDisplayStatus(session)}
                  </span>
                </div>
              ))}
              {enrollment.sessions.length > 2 && (
                <p className="text-xs text-gray-500">+{enrollment.sessions.length - 2} more sessions</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <User className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Session Attendance Card Component
const SessionAttendanceCard = ({ session, onMarkAttendance }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{session.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getDisplayStatus(session))}`}>
              {getDisplayStatus(session)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{session.program?.title}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
            <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(session.scheduledDate)}
            </span>
            <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </span>
          </div>
          {session.ground && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              {session.ground.name}
            </div>
          )}
        </div>
        
        {/* Attendance Stats */}
        <div className="ml-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3 mb-2">
            <p className="text-sm text-gray-500">Attendance</p>
            {(() => {
              const now = new Date();
              const sessionDate = new Date(session.scheduledDate);
              // Set time to start of day for comparison to allow attendance marking for today's sessions
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              sessionDate.setHours(0, 0, 0, 0);
              const isFutureSession = sessionDate > today;
              
              if (isFutureSession) {
                return (
                  <>
                    <p className="text-2xl font-bold text-gray-500">
                      Not Marked
                    </p>
                    <p className="text-xs text-gray-500">
                      Session not started
                    </p>
                  </>
                );
              }
              
              return (
                <>
                  <p className={`text-2xl font-bold ${getAttendanceColor(session.attendanceStats?.attendancePercentage || 0)}`}>
                    {session.attendanceStats?.attendancePercentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.attendanceStats?.attendedCount || 0}/{session.attendanceStats?.totalParticipants || 0}
                  </p>
                </>
              );
            })()}
          </div>
          
          <button
            onClick={() => onMarkAttendance(session)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Mark Attendance
          </button>
        </div>
      </div>
      
      {/* Participants List */}
      {session.participants && session.participants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
          <div className="flex flex-wrap gap-2">
            {session.participants.map((participant) => {
              // Check if this is a future session
              const now = new Date();
              const sessionDate = new Date(session.scheduledDate);
              // Set time to start of day for comparison to allow attendance marking for today's sessions
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              sessionDate.setHours(0, 0, 0, 0);
              const isFutureSession = sessionDate > today;
              
              // For future sessions, always show as not marked
              if (isFutureSession) {
                return (
                  <div
                    key={participant._id}
                    className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {participant.user?.firstName} {participant.user?.lastName}
                  </div>
                );
              }
              
              // Check both attendanceStatus (new) and attended (old) fields for backward compatibility
              const isAttended = participant.attendanceStatus === 'present' || 
                                (participant.attended === true && participant.attendanceStatus !== 'absent');
              const isAbsent = participant.attendanceStatus === 'absent' || 
                              (participant.attended === false && participant.attendanceStatus !== 'present');
              const isMarked = participant.attendanceStatus === 'present' || participant.attendanceStatus === 'absent' ||
                              participant.attended !== undefined;
              
              console.log('Participant attendance status:', {
                name: `${participant.user?.firstName} ${participant.user?.lastName}`,
                attendanceStatus: participant.attendanceStatus,
                attended: participant.attended,
                attendance: participant.attendance,
                isAttended,
                isAbsent,
                isMarked
              });
              
              return (
                <div
                  key={participant._id}
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    isAttended 
                      ? 'bg-green-100 text-green-800' 
                      : isAbsent
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isAttended ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : isAbsent ? (
                    <XCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <Clock className="h-4 w-4 mr-1" />
                  )}
                  {participant.user?.firstName} {participant.user?.lastName}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Modal Component
const AttendanceModal = ({ session, coach, selectedCustomer, onSubmit, onClose }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Safety check - don't render if required props are missing
  if (!session || !coach) {
    console.error('AttendanceModal: Missing required props', { session: !!session, coach: !!coach });
    return null;
  }

  useEffect(() => {
    // Initialize attendance data - handle both single customer and multi-participant scenarios
    let initialData = [];
    
    if (session && session.participants && session.participants.length > 0) {
      if (selectedCustomer) {
        // Single customer scenario (from customer sessions)
        const participant = session.participants.find(p => p.user && p.user._id === selectedCustomer._id);
      
      if (participant) {
        initialData = [{
          participantId: participant._id,
          attended: participant.attended || false,
          performance: {
            rating: participant.performance?.rating || 5,
            notes: participant.performance?.notes || ''
          }
        }];
      } else {
        console.error('Participant not found for customer:', {
            customerId: selectedCustomer._id,
          availableParticipants: session.participants.map(p => ({
            _id: p._id,
            user: p.user,
            attended: p.attended
          }))
        });
        
        // Fallback - create a default entry with user ID
        initialData = [{
            participantId: selectedCustomer._id,
          attended: false,
          performance: {
            rating: 5,
            notes: ''
          }
        }];
      }
    } else {
        // Multi-participant scenario (from sessions tab)
        initialData = session.participants.map(participant => ({
          participantId: participant._id,
          attended: participant.attended || false,
        performance: {
            rating: participant.performance?.rating || 5,
            notes: participant.performance?.notes || ''
          }
        }));
      }
    } else {
      console.error('No participants found in session:', session);
      initialData = [];
    }
    
    setAttendanceData(initialData);
  }, [session, selectedCustomer]);

  const handleAttendanceChange = (participantId, attended) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.participantId === participantId 
          ? { ...item, attended }
          : item
      )
    );
  };

  const handlePerformanceChange = (participantId, field, value) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.participantId === participantId 
          ? { 
              ...item, 
              performance: { 
                ...item.performance, 
                [field]: value 
              } 
            }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate attendance data
      if (!attendanceData || attendanceData.length === 0) {
        alert('No attendance data available. Please try again.');
        return;
      }
      
      // Ensure we have valid data - be more lenient with validation
      const validAttendanceData = attendanceData.filter(item => 
        item.participantId && (item.attended === true || item.attended === false)
      );
      
      if (validAttendanceData.length === 0) {
        alert('No valid attendance data to submit. Please select Present or Absent for at least one participant.');
        return;
      }
      
      await onSubmit(validAttendanceData);
    } catch (error) {
      console.error('Error in attendance modal submit:', error);
      alert('Error submitting attendance: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
            <p className="text-sm text-gray-600">
              {session.title} - {formatDate(session.scheduledDate)} at {formatTime(session.startTime)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {attendanceData && attendanceData.length > 0 ? attendanceData.map((item, index) => {
              const participant = session.participants?.find(p => p._id === item.participantId);
              return (
                <div key={item.participantId || `participant-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {participant?.user?.firstName || 'Unknown'} {participant?.user?.lastName || 'User'}
                        </h4>
                        <p className="text-sm text-gray-600">{participant?.user?.email || 'No email'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(item.participantId, false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          !item.attended 
                            ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(item.participantId, true)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          item.attended 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Present
                      </button>
                    </div>
                  </div>
                  
                  {item.attended && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Performance Rating (1-5)
                          </label>
                          <select
                            value={item.performance.rating}
                            onChange={(e) => handlePerformanceChange(item.participantId, 'rating', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={1}>1 - Poor</option>
                            <option value={2}>2 - Below Average</option>
                            <option value={3}>3 - Average</option>
                            <option value={4}>4 - Good</option>
                            <option value={5}>5 - Excellent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={item.performance.notes}
                            onChange={(e) => handlePerformanceChange(item.participantId, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Performance notes..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No participants found in this session.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Customer Card Component
const CustomerCard = ({ customer, onCustomerClick, enrollment }) => {
  // Add defensive checks for customer object
  if (!customer) {
    console.error('CustomerCard: customer is null or undefined');
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-red-600">Error: Customer data not available</p>
      </div>
    );
  }

  if (!customer.user) {
    console.error('CustomerCard: customer.user is null or undefined', customer);
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-red-600">Error: Customer user data not available</p>
      </div>
    );
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (percentage) => {
    if (percentage >= 100) return { status: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 80) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 60) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 40) return { status: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 20) return { status: 'Needs Improvement', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'Getting Started', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const calculateProgress = () => {
    // Use the progress percentage from API if available, otherwise calculate
    if (customer.progressPercentage !== undefined) {
      return customer.progressPercentage;
    }
    
    const totalSessions = customer.totalSessions || 0;
    const presentSessions = customer.presentSessions || 0;
    
    if (totalSessions === 0) return 0;
    
    // Progress is based ONLY on attendance (present sessions)
    // If student attends, progress increases
    // If student is absent, progress does not increase
    return Math.round((presentSessions / totalSessions) * 100);
  };

  const progress = calculateProgress();
  const progressStatus = getProgressStatus(progress);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={() => onCustomerClick(customer, enrollment)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {customer.user.firstName} {customer.user.lastName}
            </h4>
            <p className="text-sm text-gray-600">{customer.user.email}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
          {customer.status}
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Enhanced Progress Section */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
            <span className={`text-lg font-bold ${getProgressColor(progress)}`}>
              {progress}%
          </span>
        </div>
        
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(progress)}`}
              style={{ width: `${progress}%` }}
            ></div>
        </div>
        
          {/* Progress Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${progressStatus.bgColor} ${progressStatus.color}`}>
              {progressStatus.status}
            </span>
            <span className="text-xs text-gray-500">
              {customer.presentSessions || 0} attended / {customer.totalSessions || 0} sessions
          </span>
        </div>
      </div>
        
        {/* Session Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Present:</span>
            <span className="font-medium text-green-600">
              {customer.presentSessions || 0}
            </span>
            </div>
            
          <div className="flex justify-between">
            <span className="text-gray-600">Absent:</span>
            <span className="font-medium text-red-600">
              {customer.absentSessions || 0}
            </span>
            </div>
            
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium text-blue-600">
              {customer.completedSessions || 0}
            </span>
        </div>
        
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium text-gray-900">
              {customer.totalSessions || 0}
          </span>
        </div>
      </div>
      
        {/* Enrollment Date */}
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-600">Enrolled:</span>
          <span className="font-medium">
            {customer.enrollmentDate ? new Date(customer.enrollmentDate).toLocaleDateString() : 'Not available'}
          </span>
          </div>
          
        {/* Program Information */}
        {enrollment && enrollment.program && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Program:</span>
              <span className="text-sm text-blue-600">{enrollment.program.title}</span>
            </div>
            </div>
          )}
      </div>
    </div>
  );
};

// Customer Details Modal Component
const CustomerDetailsModal = ({ customer, enrollment, onClose }) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Customer Information */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{customer.user?.firstName} {customer.user?.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{customer.user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{customer.user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.status || 'active'}
                </span>
              </div>
            </div>
          </div>

          {/* Enrollment Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Enrollment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Enrollment Date</label>
                <p className="text-gray-900">
                  {customer.enrollmentDate ? new Date(customer.enrollmentDate).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Program Duration</label>
                <p className="text-gray-900">{customer.totalSessions || 0} weeks</p>
              </div>
              {enrollment && enrollment.program && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Program Name</label>
                    <p className="text-gray-900">{enrollment.program.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Program Category</label>
                    <p className="text-gray-900">{enrollment.program.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Program Fee</label>
                    <p className="text-gray-900">LKR {enrollment.program.fee || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Enrollment Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : enrollment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enrollment.status || 'active'}
                    </span>
                  </div>
                </>
              )}
            </div>
            {enrollment && enrollment.program && enrollment.program.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Program Description</label>
                <p className="text-gray-900 mt-1">{enrollment.program.description}</p>
              </div>
            )}
          </div>

          {/* Attendance Statistics */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Attendance Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{customer.presentSessions || 0}</div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{customer.absentSessions || 0}</div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{customer.completedSessions || 0}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{customer.totalSessions || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          {/* Progress Information */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Progress Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Attendance Progress</span>
                  <span className="font-medium">
                    {customer.totalSessions > 0 
                      ? Math.round((customer.presentSessions / customer.totalSessions) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${customer.totalSessions > 0 
                        ? Math.round((customer.presentSessions / customer.totalSessions) * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Completion Rate</label>
                  <p className="text-gray-900">
                    {customer.totalSessions > 0 
                      ? Math.round((customer.completedSessions / customer.totalSessions) * 100) 
                      : 0}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Attendance Rate</label>
                  <p className="text-gray-900">
                    {customer.completedSessions > 0 
                      ? Math.round((customer.presentSessions / customer.completedSessions) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Program Details */}
          {enrollment && enrollment.program && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Program Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Program ID</label>
                  <p className="text-gray-900 text-xs font-mono">{enrollment.program._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="text-gray-900">
                    {enrollment.program.createdAt ? new Date(enrollment.program.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Max Participants</label>
                  <p className="text-gray-900">{enrollment.program.maxParticipants || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Enrollments</label>
                  <p className="text-gray-900">{enrollment.program.currentEnrollments || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;

