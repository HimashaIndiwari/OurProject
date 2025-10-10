import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Link, 
  FileText, 
  Video, 
  Settings,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  LogOut,
  Home,
  BarChart3,
  Award,
  Menu,
  X,
  UserCheck,
  UserX,
  DollarSign,
  Download
} from 'lucide-react';
import axios from 'axios';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programDeletionStatus, setProgramDeletionStatus] = useState({});
  
  // Modal states
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCoachDetailsModal, setShowCoachDetailsModal] = useState(false);
  const [showEditCoachModal, setShowEditCoachModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Form states
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    fee: '',
    duration: '',
    coach: '',
    category: '',
    difficulty: 'beginner',
    totalSessions: 10,
    maxParticipants: 20,
    isActive: true
  });
  const [materialForm, setMaterialForm] = useState({
    name: '',
    type: 'document',
    url: ''
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    newCoachId: '',
    reason: ''
  });
  const [coachForm, setCoachForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    experience: '',
    specializations: [],
    isActive: true,
    hourlyRate: 0
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    day: '',
    startTime: '',
    endTime: ''
  });
  const [editingAvailability, setEditingAvailability] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo || !userInfo.token) {
        console.warn('No authentication token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Try to fetch from API, but fallback to mock data if API is not available
      try {
        // Fetch programs first (this should work)
        const programsRes = await axios.get('http://localhost:5000/api/programs', config);
        const programsData = programsRes.data.data?.docs || programsRes.data.data || programsRes.data || [];
        setPrograms(programsData);
        console.log('Programs fetched successfully:', programsData.length);
        console.log('Programs data:', programsData);

        // Try to fetch coaches and sessions, but don't fail if they don't work
        try {
          const coachesRes = await axios.get('http://localhost:5000/api/coaches', config);
          const coachesData = coachesRes.data.data?.docs || coachesRes.data.data || coachesRes.data || [];
          setCoaches(coachesData);
          console.log('Coaches fetched successfully:', coachesData.length);
          console.log('Coaches data structure:', coachesData);
        } catch (coachError) {
          console.warn('Coaches API not available, using mock data:', coachError);
          // Use mock coaches for development
          const mockCoaches = [
            {
              _id: 'coach1',
              userId: {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@example.com'
              },
              specializations: ['Batting', 'Bowling'],
              experience: 5,
              isActive: true
            },
            {
              _id: 'coach2',
              userId: {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@example.com'
              },
              specializations: ['Fielding', 'Wicket Keeping'],
              experience: 8,
              isActive: true
            },
            {
              _id: 'coach3',
              userId: {
                firstName: 'Mike',
                lastName: 'Davis',
                email: 'mike.davis@example.com'
              },
              specializations: ['Bowling', 'Fitness'],
              experience: 6,
              isActive: true
            }
          ];
          setCoaches(mockCoaches);
        }

        try {
          // Fetch all sessions by setting a high limit
          const sessionsRes = await axios.get('http://localhost:5000/api/sessions?limit=100', config);
          const sessionsData = sessionsRes.data.data?.docs || sessionsRes.data.data || sessionsRes.data || [];
          setSessions(sessionsData);
          console.log('Sessions fetched successfully:', sessionsData.length);
          console.log('Sessions data:', sessionsData);
        } catch (sessionError) {
          console.warn('Sessions API not available, using empty array:', sessionError);
          setSessions([]);
        }
        
      } catch (apiError) {
        console.warn('Programs API not available, using mock data:', apiError);
        
        // Use mock data for development
        const mockCoaches = [
          {
            _id: 'coach1',
            userId: {
              firstName: 'John',
              lastName: 'Smith',
              email: 'john.smith@example.com'
            },
            specializations: ['Batting', 'Bowling'],
            experience: 5,
            assignedPrograms: ['program1', 'program2'],
            assignedSessions: 0
          },
          {
            _id: 'coach2',
            userId: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@example.com'
            },
            specializations: ['Fielding', 'Wicket Keeping'],
            experience: 8,
            assignedPrograms: ['program2'],
            assignedSessions: 0
          }
        ];

        const mockPrograms = [
          {
            _id: 'program1',
            title: 'Beginner Cricket Training',
            description: 'Learn the basics of cricket including batting, bowling, and fielding techniques.',
            fee: 200,
            duration: 8,
            coach: {
              _id: 'coach1',
              userId: {
                firstName: 'John',
                lastName: 'Smith'
              }
            },
            category: 'Training',
            specialization: 'General',
            difficulty: 'beginner',
            totalSessions: 10,
            maxParticipants: 15,
            currentEnrollments: 8,
            isActive: true,
            materials: []
          },
          {
            _id: 'program2',
            title: 'Advanced Batting Masterclass',
            description: 'Advanced techniques for experienced players looking to improve their batting skills.',
            fee: 350,
            duration: 6,
            coach: {
              _id: 'coach1',
              userId: {
                firstName: 'John',
                lastName: 'Smith'
              }
            },
            category: 'Specialized',
            specialization: 'Batting',
            difficulty: 'advanced',
            totalSessions: 8,
            maxParticipants: 10,
            currentEnrollments: 5,
            isActive: true,
            materials: []
          }
        ];

        const mockSessions = [
          {
            _id: 'session1',
            title: 'Basic Batting Techniques',
            program: { title: 'Beginner Cricket Training' },
            scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '10:00',
            endTime: '12:00',
            status: 'scheduled',
            sessionNumber: 1,
            week: 1,
            maxParticipants: 15,
            participants: [
              { _id: 'p1', user: { firstName: 'Alice', lastName: 'Johnson' } },
              { _id: 'p2', user: { firstName: 'Bob', lastName: 'Wilson' } }
            ]
          },
          {
            _id: 'session2',
            title: 'Bowling Fundamentals',
            program: { title: 'Beginner Cricket Training' },
            scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '14:00',
            endTime: '16:00',
            status: 'scheduled',
            sessionNumber: 2,
            week: 1,
            maxParticipants: 15,
            participants: [
              { _id: 'p3', user: { firstName: 'Charlie', lastName: 'Brown' } }
            ]
          }
        ];

        setCoaches(mockCoaches);
        setPrograms(mockPrograms);
        setSessions(mockSessions);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      // Check deletion status for all programs after loading
      setTimeout(() => {
        checkAllProgramDeletionStatus();
      }, 1000);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/programs', programForm);
      setPrograms([...programs, response.data.data]);
      setShowProgramModal(false);
      resetProgramForm();
      alert('Program created successfully!');
    } catch (error) {
      console.error('Error creating program:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.status === 400 && error.response.data.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        alert('Validation failed:\n' + errorMessages);
        return; // Don't create locally if validation fails
      }
      
      // For other errors, add to local state as fallback
      const selectedCoach = coaches.find(c => c._id === programForm.coach);
      const newProgram = {
        _id: `program_${Date.now()}`,
        ...programForm,
        coach: selectedCoach,
        currentEnrollments: 0,
        materials: []
      };
      
      setPrograms(prevPrograms => [...prevPrograms, newProgram]);
      
      // If a coach is assigned, update the coach's assigned programs
      if (selectedCoach) {
        setCoaches(prevCoaches => 
          prevCoaches.map(c => 
            c._id === selectedCoach._id 
              ? { ...c, assignedPrograms: [...(c.assignedPrograms || []), newProgram._id] }
              : c
          )
        );
      }
      
      setShowProgramModal(false);
      resetProgramForm();
      alert('Program created locally (API not available)');
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/programs/${selectedProgram._id}`, programForm);
      setPrograms(programs.map(p => p._id === selectedProgram._id ? response.data.data : p));
      setShowProgramModal(false);
      setSelectedProgram(null);
      resetProgramForm();
      alert('Program updated successfully!');
    } catch (error) {
      console.error('Error updating program:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.status === 400 && error.response.data.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        alert('Validation failed:\n' + errorMessages);
        return; // Don't update locally if validation fails
      }
      
      // For other errors, update local state as fallback
      const newCoach = coaches.find(c => c._id === programForm.coach);
      const oldCoach = selectedProgram.coach;
      
      const updatedProgram = {
        ...selectedProgram,
        ...programForm,
        coach: newCoach
      };
      
      setPrograms(prevPrograms => 
        prevPrograms.map(p => p._id === selectedProgram._id ? updatedProgram : p)
      );
      
      // Update coach assignments if coach changed
      if (newCoach && oldCoach && newCoach._id !== oldCoach._id) {
        // Remove from old coach
        if (oldCoach) {
          setCoaches(prevCoaches => 
            prevCoaches.map(c => 
              c._id === oldCoach._id 
                ? { ...c, assignedPrograms: c.assignedPrograms?.filter(id => id !== selectedProgram._id) || [] }
                : c
            )
          );
        }
        
        // Add to new coach
        setCoaches(prevCoaches => 
          prevCoaches.map(c => 
            c._id === newCoach._id 
              ? { ...c, assignedPrograms: [...(c.assignedPrograms || []), selectedProgram._id] }
              : c
          )
        );
      }
      
      setShowProgramModal(false);
      setSelectedProgram(null);
      resetProgramForm();
      alert('Program updated locally (API not available)');
    }
  };

  // Function to check deletion status for all programs
  const checkAllProgramDeletionStatus = async () => {
    const statusMap = {};
    
    for (const program of programs) {
      try {
        const response = await axios.get(`http://localhost:5000/api/programs/${program._id}/can-delete`);
        statusMap[program._id] = {
          canDelete: response.data.canDelete,
          reason: response.data.reason,
          details: response.data.details
        };
      } catch (error) {
        console.error(`Error checking deletion status for program ${program._id}:`, error);
        statusMap[program._id] = {
          canDelete: false,
          reason: 'Error checking deletion status',
          details: null
        };
      }
    }
    
    setProgramDeletionStatus(statusMap);
  };

  const handleDeleteProgram = async (programId) => {
    try {
      // First check if the program can be deleted
      const canDeleteResponse = await axios.get(`http://localhost:5000/api/programs/${programId}/can-delete`);
      
      if (!canDeleteResponse.data.canDelete) {
        // Show detailed error message
        const reason = canDeleteResponse.data.reason;
        const details = canDeleteResponse.data.details;
        
        let errorMessage = `Cannot delete program: ${reason}`;
        
        if (details && details.invalidEnrollments) {
          errorMessage += '\n\nEnrollments that need attention:';
          details.invalidEnrollments.forEach(enrollment => {
            errorMessage += `\n- ${enrollment.user.firstName} ${enrollment.user.lastName}: ${enrollment.progressPercentage}% progress`;
          });
        }
        
        if (details && details.futureSessions) {
          errorMessage += `\n\nFuture sessions found:`;
          details.futureSessions.forEach(session => {
            errorMessage += `\n- ${session.title} on ${new Date(session.scheduledDate).toLocaleDateString()}`;
          });
        }
        
        alert(errorMessage);
        return;
      }
      
      // If we reach here, the program can be deleted
      if (!window.confirm('Are you sure you want to delete this program? This will also delete all related enrollments and sessions.')) return;
      
      await axios.delete(`http://localhost:5000/api/programs/${programId}`);
      setPrograms(programs.filter(p => p._id !== programId));
      // Update deletion status
      const newStatus = { ...programDeletionStatus };
      delete newStatus[programId];
      setProgramDeletionStatus(newStatus);
      alert('Program deleted successfully!');
    } catch (error) {
      console.error('Error deleting program:', error);
      
      // Handle specific error responses
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        const details = error.response.data.details;
        
        let fullErrorMessage = errorMessage;
        
        if (details && details.invalidEnrollments) {
          fullErrorMessage += '\n\nEnrollments that need attention:';
          details.invalidEnrollments.forEach(enrollment => {
            fullErrorMessage += `\n- ${enrollment.user.firstName} ${enrollment.user.lastName}: ${enrollment.progressPercentage}% progress`;
          });
        }
        
        if (details && details.futureSessions) {
          fullErrorMessage += `\n\nFuture sessions found:`;
          details.futureSessions.forEach(session => {
            fullErrorMessage += `\n- ${session.title} on ${new Date(session.scheduledDate).toLocaleDateString()}`;
          });
        }
        
        alert(fullErrorMessage);
      } else {
        // For development, remove from local state even if API fails
        setPrograms(programs.filter(p => p._id !== programId));
        alert('Program deleted locally (API not available)');
      }
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/programs/${selectedProgram._id}/materials`, materialForm);
      setPrograms(programs.map(p => p._id === selectedProgram._id ? response.data.data : p));
      setShowMaterialModal(false);
      setMaterialForm({ name: '', type: 'document', url: '' });
    } catch (error) {
      console.error('Error adding material:', error);
      // For development, add to local state even if API fails
      const updatedProgram = {
        ...selectedProgram,
        materials: [...(selectedProgram.materials || []), { ...materialForm, _id: `material_${Date.now()}` }]
      };
      setPrograms(programs.map(p => p._id === selectedProgram._id ? updatedProgram : p));
      setShowMaterialModal(false);
      setMaterialForm({ name: '', type: 'document', url: '' });
      alert('Material added locally (API not available)');
    }
  };

  const handleAssignCoach = async (e) => {
    e.preventDefault();
    try {
      // Get the selected coach ID from the form data
      const formData = new FormData(e.target);
      const selectedCoachId = formData.get('selectedCoachId') || e.target.selectedCoachId?.value;
      
      if (!selectedCoachId) {
        alert('Please select a coach');
        return;
      }

      // Try to assign coach via API
      try {
        await axios.put(`http://localhost:5000/api/coaches/${selectedCoachId}/assign-program`, {
        programId: selectedProgram._id
      });
      await fetchDashboardData(); // Refresh data
        alert('Coach assigned successfully!');
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError);
        
      // For development, update local state even if API fails
        const selectedCoach = coaches.find(c => c._id === selectedCoachId);
        if (selectedCoach) {
          // Update coach's assigned programs
      const updatedCoach = {
        ...selectedCoach,
        assignedPrograms: [...(selectedCoach.assignedPrograms || []), selectedProgram._id]
      };
          
          // Update program's coach
          const updatedProgram = {
            ...selectedProgram,
            coach: selectedCoach
          };
          
          // Update both states
          setCoaches(prevCoaches => 
            prevCoaches.map(c => c._id === selectedCoachId ? updatedCoach : c)
          );
          
          setPrograms(prevPrograms => 
            prevPrograms.map(p => p._id === selectedProgram._id ? updatedProgram : p)
          );
          
          console.log('Coach assigned locally:', { coachId: selectedCoachId, programId: selectedProgram._id });
          alert('Coach assigned locally (API not available)');
        }
      }
      
      setShowAssignModal(false);
      setSelectedProgram(null);
    } catch (error) {
      console.error('Error assigning coach:', error);
      alert('Error assigning coach. Please try again.');
    }
  };

  const handleRescheduleSession = async (e) => {
    e.preventDefault();
    
    if (!rescheduleForm.newCoachId) {
      alert('Please select a coach to reassign this session to.');
      return;
    }
    
    try {
      // Get authentication token
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        alert('Authentication required. Please login again.');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Call API to reassign session to new coach
      await axios.put(`http://localhost:5000/api/sessions/${selectedSession._id}/reassign-coach`, {
        newCoachId: rescheduleForm.newCoachId,
        reason: rescheduleForm.reason
      }, config);
      await fetchDashboardData(); // Refresh data
      setShowRescheduleModal(false);
      setSelectedSession(null);
      setRescheduleForm({ newCoachId: '', reason: '' });
      alert('Session coach reassigned successfully!');
    } catch (error) {
      console.error('Error reassigning session coach:', error);
      // For development, update local state even if API fails
      const newCoach = coaches.find(c => c._id === rescheduleForm.newCoachId);
      const updatedSession = {
        ...selectedSession,
        coach: newCoach,
        status: 'rescheduled',
        notes: rescheduleForm.reason ? `Coach reassigned: ${rescheduleForm.reason}` : 'Session coach reassigned by manager'
      };
      setSessions(sessions.map(s => s._id === selectedSession._id ? updatedSession : s));
      setShowRescheduleModal(false);
      setSelectedSession(null);
      setRescheduleForm({ newCoachId: '', reason: '' });
      alert('Session coach reassigned locally (API not available)');
    }
  };

  const resetProgramForm = () => {
    setProgramForm({
      title: '',
      description: '',
      fee: '',
      duration: '',
      coach: '',
      category: '',
      difficulty: 'beginner',
      totalSessions: 10,
      maxParticipants: 20,
      isActive: true
    });
  };

  const handleRefresh = async () => {
    try {
      console.log('Refreshing data...');
      await fetchDashboardData();
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Error refreshing data. Please try again.');
    }
  };

  const handleSessionsRefresh = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        console.warn('No authentication token found');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Fetch all sessions with high limit
      const sessionsRes = await axios.get('http://localhost:5000/api/sessions?limit=100', config);
      const sessionsData = sessionsRes.data.data?.docs || sessionsRes.data.data || sessionsRes.data || [];
      setSessions(sessionsData);
      console.log('Sessions refreshed successfully:', sessionsData.length);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  const openProgramModal = (program = null) => {
    setSelectedProgram(program);
    if (program) {
      setProgramForm({
        title: program.title,
        description: program.description,
        fee: program.fee,
        duration: program.duration,
        coach: program.coach?._id || '',
        category: program.category,
        difficulty: program.difficulty,
        totalSessions: program.totalSessions,
        maxParticipants: program.maxParticipants,
        isActive: program.isActive
      });
    } else {
      resetProgramForm();
    }
    setShowProgramModal(true);
  };

  const openCoachDetailsModal = (coach) => {
    setSelectedCoach(coach);
    setShowCoachDetailsModal(true);
  };

  const openEditCoachModal = (coach) => {
    console.log('Opening edit modal for coach:', coach);
    console.log('Coach specializations:', coach.specializations);
    
    setSelectedCoach(coach);
    setCoachForm({
      firstName: coach.userId?.firstName || '',
      lastName: coach.userId?.lastName || '',
      email: coach.userId?.email || '',
      experience: coach.experience || '',
      specializations: [...(coach.specializations || [])], // Ensure it's a new array
      isActive: coach.isActive !== false,
      hourlyRate: coach.hourlyRate || 0
    });
    setShowEditCoachModal(true);
  };

  const handleUpdateCoach = async (e) => {
    e.preventDefault();
    
    const coachId = selectedCoach._id;
    
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Updating...';
    }
    
    // Create updated coach object
    const updatedCoach = {
      ...selectedCoach,
      experience: parseInt(coachForm.experience) || 0,
      specializations: coachForm.specializations || [],
      isActive: coachForm.isActive,
      hourlyRate: parseFloat(coachForm.hourlyRate) || 0,
      userId: {
        ...selectedCoach.userId,
        firstName: coachForm.firstName,
        lastName: coachForm.lastName,
        email: coachForm.email
      }
    };
    
    try {
      // First, update the database
      const response = await axios.put(`http://localhost:5000/api/coaches/${coachId}`, {
        experience: updatedCoach.experience,
        specializations: updatedCoach.specializations,
        isActive: updatedCoach.isActive,
        hourlyRate: updatedCoach.hourlyRate,
        userId: updatedCoach.userId
      });
      
      // Only update local state if database update succeeds
      if (response.data.success) {
        // Update coaches array
        const newCoaches = coaches.map(coach => 
          coach._id === coachId ? updatedCoach : coach
        );
        
        // Set the new state
        setCoaches(newCoaches);
        setSelectedCoach(updatedCoach);
        
        // Close modal
        setShowEditCoachModal(false);
        
        // Show success
        alert('Coach updated successfully!');
        
        // Force refresh programs to get updated coach data
        await fetchDashboardData();
        
        // Notify other pages that coach data has been updated
        window.dispatchEvent(new CustomEvent('coachUpdated', { 
          detail: { coachId, updatedCoach } 
        }));
      } else {
        alert('Failed to update coach. Please try again.');
      }
    } catch (error) {
      console.error('Coach update error:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.status === 400 && error.response.data.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        alert('Validation failed:\n' + errorMessages);
      } else {
        alert('Failed to update coach. Please try again.');
      }
    } finally {
      // Restore button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  };

  const resetCoachForm = () => {
    setCoachForm({
      firstName: '',
      lastName: '',
      email: '',
      experience: '',
      specializations: [],
      isActive: true,
      hourlyRate: 0
    });
  };

  // Availability Management Functions
  const openAvailabilityModal = (coach) => {
    setSelectedCoach(coach);
    setShowAvailabilityModal(true);
  };

  const resetAvailabilityForm = () => {
    setAvailabilityForm({
      day: '',
      startTime: '',
      endTime: ''
    });
    setEditingAvailability(null);
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    
    if (!availabilityForm.day || !availabilityForm.startTime || !availabilityForm.endTime) {
      alert('Please fill in all fields');
      return;
    }

    // Check for duplicate day
    const currentAvailability = selectedCoach.availability || [];
    const existingSlot = currentAvailability.find(slot => 
      slot.day.toLowerCase() === availabilityForm.day.toLowerCase()
    );
    
    if (existingSlot) {
      alert('This coach already has availability set for this day. Please edit the existing slot instead.');
      return;
    }

    // Validate time range
    if (availabilityForm.startTime >= availabilityForm.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      const newAvailability = {
        day: availabilityForm.day,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime
      };

      const updatedAvailability = [...currentAvailability, newAvailability];

      const response = await axios.put(`http://localhost:5000/api/coaches/${selectedCoach._id}/availability`, {
        availability: updatedAvailability
      });

      if (response.data.success) {
        // Update local state
        const updatedCoach = { ...selectedCoach, availability: updatedAvailability };
        setSelectedCoach(updatedCoach);
        
        // Update coaches array
        const newCoaches = coaches.map(coach => 
          coach._id === selectedCoach._id ? updatedCoach : coach
        );
        setCoaches(newCoaches);

        resetAvailabilityForm();
        alert('Availability added successfully!');
      } else {
        alert('Failed to add availability. Please try again.');
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Failed to add availability. Please try again.');
    }
  };

  const handleEditAvailability = (availability, index) => {
    setEditingAvailability(index);
    setAvailabilityForm({
      day: availability.day,
      startTime: availability.startTime,
      endTime: availability.endTime
    });
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    
    if (!availabilityForm.day || !availabilityForm.startTime || !availabilityForm.endTime) {
      alert('Please fill in all fields');
      return;
    }

    // Validate time range
    if (availabilityForm.startTime >= availabilityForm.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      const currentAvailability = selectedCoach.availability || [];
      const updatedAvailability = [...currentAvailability];
      updatedAvailability[editingAvailability] = {
        day: availabilityForm.day,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime
      };

      const response = await axios.put(`http://localhost:5000/api/coaches/${selectedCoach._id}/availability`, {
        availability: updatedAvailability
      });

      if (response.data.success) {
        // Update local state
        const updatedCoach = { ...selectedCoach, availability: updatedAvailability };
        setSelectedCoach(updatedCoach);
        
        // Update coaches array
        const newCoaches = coaches.map(coach => 
          coach._id === selectedCoach._id ? updatedCoach : coach
        );
        setCoaches(newCoaches);

        resetAvailabilityForm();
        alert('Availability updated successfully!');
      } else {
        alert('Failed to update availability. Please try again.');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleDeleteAvailability = async (index) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      const currentAvailability = selectedCoach.availability || [];
      const updatedAvailability = currentAvailability.filter((_, i) => i !== index);

      const response = await axios.put(`http://localhost:5000/api/coaches/${selectedCoach._id}/availability`, {
        availability: updatedAvailability
      });

      if (response.data.success) {
        // Update local state
        const updatedCoach = { ...selectedCoach, availability: updatedAvailability };
        setSelectedCoach(updatedCoach);
        
        // Update coaches array
        const newCoaches = coaches.map(coach => 
          coach._id === selectedCoach._id ? updatedCoach : coach
        );
        setCoaches(newCoaches);

        alert('Availability deleted successfully!');
      } else {
        alert('Failed to delete availability. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability. Please try again.');
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
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between h-16 px-6 bg-blue-800">
            <h1 className="text-xl font-bold text-white">Manager Dashboard</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: Home },
              { id: 'coaches', label: 'Coaches', icon: Users },
              { id: 'programs', label: 'Programs', icon: BookOpen },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'payroll', label: 'Payroll', icon: DollarSign },
              { id: 'reports', label: 'Reports', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>


          {/* Logout Button */}
          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Tab Content */}
          {activeTab === 'overview' && <OverviewTab coaches={coaches} programs={programs} sessions={sessions} />}
          {activeTab === 'programs' && (
            <ProgramsTab 
              programs={programs} 
              coaches={coaches}
              programDeletionStatus={programDeletionStatus}
              onEdit={openProgramModal}
              onDelete={handleDeleteProgram}
              onAddMaterial={(program) => {
                setSelectedProgram(program);
                setShowMaterialModal(true);
              }}
              onAssignCoach={(program) => {
                setSelectedProgram(program);
                setShowAssignModal(true);
              }}
            />
          )}
          {activeTab === 'coaches' && <CoachesTab coaches={coaches} programs={programs} onRefresh={handleRefresh} onViewDetails={openCoachDetailsModal} />}
          {activeTab === 'payroll' && <PayrollTab coaches={coaches} />}
          {activeTab === 'sessions' && (
            <SessionsTab 
              sessions={sessions} 
              coaches={coaches}
              programs={programs}
              onReschedule={(session) => {
                setSelectedSession(session);
                setShowRescheduleModal(true);
              }}
              onSessionsRefresh={handleSessionsRefresh}
            />
          )}
          {activeTab === 'reports' && <ReportsTab coaches={coaches} programs={programs} sessions={sessions} />}
        </div>
      </div>

      {/* Modals */}
      {showProgramModal && (
        <ProgramModal
          program={selectedProgram}
          form={programForm}
          setForm={setProgramForm}
          coaches={coaches}
          onSubmit={selectedProgram ? handleUpdateProgram : handleCreateProgram}
          onClose={() => {
            setShowProgramModal(false);
            setSelectedProgram(null);
            resetProgramForm();
          }}
        />
      )}

      {showMaterialModal && selectedProgram && (
        <MaterialModal
          program={selectedProgram}
          form={materialForm}
          setForm={setMaterialForm}
          onSubmit={handleAddMaterial}
          onClose={() => {
            setShowMaterialModal(false);
            setSelectedProgram(null);
            setMaterialForm({ name: '', type: 'document', url: '' });
          }}
        />
      )}

      {showAssignModal && selectedProgram && (
        <AssignCoachModal
          program={selectedProgram}
          coaches={coaches}
          onAssign={handleAssignCoach}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedProgram(null);
          }}
        />
      )}

      {showRescheduleModal && selectedSession && (
        <RescheduleModal
          session={selectedSession}
          form={rescheduleForm}
          setForm={setRescheduleForm}
          onSubmit={handleRescheduleSession}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedSession(null);
            setRescheduleForm({ newCoachId: '', reason: '' });
          }}
          coaches={coaches}
        />
      )}

      {showCoachDetailsModal && selectedCoach && (
        <CoachDetailsModal
          key={`coach-${selectedCoach._id}-${refreshKey}`}
          coach={selectedCoach}
          programs={programs}
          onEdit={openEditCoachModal}
          onManageAvailability={openAvailabilityModal}
          onClose={() => {
            setShowCoachDetailsModal(false);
            setSelectedCoach(null);
            resetCoachForm();
          }}
        />
      )}

      {showEditCoachModal && selectedCoach && (
        <EditCoachModal
          key={`edit-coach-${selectedCoach._id}-${refreshKey}`}
          coach={selectedCoach}
          form={coachForm}
          setForm={setCoachForm}
          onSubmit={handleUpdateCoach}
          onClose={() => {
            setShowEditCoachModal(false);
            setSelectedCoach(null);
            resetCoachForm();
          }}
        />
      )}

      {showAvailabilityModal && selectedCoach && (
        <AvailabilityModal
          key={`availability-${selectedCoach._id}-${refreshKey}`}
          coach={selectedCoach}
          form={availabilityForm}
          setForm={setAvailabilityForm}
          editingAvailability={editingAvailability}
          onAdd={handleAddAvailability}
          onUpdate={handleUpdateAvailability}
          onEdit={handleEditAvailability}
          onDelete={handleDeleteAvailability}
          onClose={() => {
            setShowAvailabilityModal(false);
            setSelectedCoach(null);
            resetAvailabilityForm();
          }}
        />
      )}

    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ coaches, programs, sessions }) => {
  const activePrograms = programs.filter(p => p.isActive);
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const totalEnrollments = programs.reduce((sum, p) => sum + (p.currentEnrollments || 0), 0);
  const totalRevenue = programs.reduce((sum, p) => sum + ((p.currentEnrollments || 0) * (p.fee || 0)), 0);
  const averageEnrollmentRate = programs.length > 0 ? 
    Math.round(programs.reduce((sum, p) => sum + ((p.currentEnrollments || 0) / p.maxParticipants) * 100, 0) / programs.length) : 0;

  // Get program categories distribution
  const categoryStats = programs.reduce((acc, program) => {
    const category = program.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Get difficulty distribution
  const difficultyStats = programs.reduce((acc, program) => {
    const difficulty = program.difficulty || 'unknown';
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});

  // Get coach specialization distribution
  const specializationStats = coaches.reduce((acc, coach) => {
    coach.specializations?.forEach(spec => {
      acc[spec] = (acc[spec] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{coaches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900">{activePrograms.length}</p>
              <p className="text-xs text-gray-500">{programs.length - activePrograms.length} inactive</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Enrollment Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averageEnrollmentRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">LKR {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Program Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.length > 0 ? Math.round(programs.reduce((sum, p) => sum + (p.duration || 0), 0) / programs.length) : 0} weeks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Program Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Program Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Categories</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / programs.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Levels */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h3>
          <div className="space-y-3">
            {Object.entries(difficultyStats).map(([difficulty, count]) => (
              <div key={difficulty} className="flex justify-between items-center">
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  difficulty === 'advanced' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        difficulty === 'beginner' ? 'bg-green-600' :
                        difficulty === 'intermediate' ? 'bg-yellow-600' :
                        difficulty === 'advanced' ? 'bg-red-600' :
                        'bg-gray-600'
                      }`}
                      style={{ width: `${(count / programs.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Specializations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coach Specializations</h3>
          <div className="space-y-3">
            {Object.entries(specializationStats).map(([specialization, count]) => (
              <div key={specialization} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{specialization}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(count / coaches.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Programs and Top Coaches */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Programs</h3>
          <div className="space-y-3">
            {programs.slice(0, 5).map((program) => (
              <div key={program._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{program.title}</h4>
                  <p className="text-sm text-gray-600">{program.category} • {program.difficulty}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {program.currentEnrollments || 0}/{program.maxParticipants}
                    </p>
                    <p className="text-xs text-gray-500">enrollments</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    program.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {program.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Coaches</h3>
          <div className="space-y-3">
            {coaches.slice(0, 5).map((coach) => (
              <div key={coach._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {coach.userId?.firstName?.charAt(0)}{coach.userId?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {coach.userId?.firstName} {coach.userId?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {coach.experience || 0} years experience
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {programs.filter(p => p.coach && p.coach._id === coach._id).length}
                    </p>
                    <p className="text-xs text-gray-500">programs</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {coach.specializations?.slice(0, 2).map((spec, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {spec}
                      </span>
                    ))}
                    {coach.specializations?.length > 2 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        +{coach.specializations.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Programs Tab Component
const ProgramsTab = ({ programs, coaches, programDeletionStatus, onEdit, onDelete, onAddMaterial, onAssignCoach }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter programs based on search and filters
  const filteredPrograms = programs.filter(program => {
    // Ensure all fields exist with fallbacks
    const title = program.title || '';
    const description = program.description || '';
    const category = program.category || '';
    const difficulty = program.difficulty || '';
    const isActive = program.isActive !== undefined ? program.isActive : true;
    
    const matchesSearch = !searchTerm || 
                         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || category === filterCategory;
    const matchesDifficulty = !filterDifficulty || difficulty === filterDifficulty;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && isActive) ||
                         (filterStatus === 'inactive' && !isActive);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Get unique categories for filter
  const categories = [...new Set(programs.map(p => p.category))].filter(Boolean);
  
  // Debug logging (only when there are issues)
  if (programs.length !== filteredPrograms.length) {
    console.log('ProgramsTab - Total programs:', programs.length);
    console.log('ProgramsTab - Filtered programs:', filteredPrograms.length);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Coaching Programs</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Program</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Programs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Program Count and Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredPrograms.length} of {programs.length} programs
        </p>
        <div className="flex space-x-2">
          {filteredPrograms.length !== programs.length && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterDifficulty('');
                setFilterStatus('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <div key={program._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {/* Program Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.title}</h3>
                  <p className="text-sm text-gray-600">{program.category}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  program.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {program.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Program Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>

              {/* Program Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Coach:</span>
                  <div className="text-right">
                    {program.coach ? (
                      <>
                  <span className="text-sm font-medium text-gray-900">
                          {program.coach.userId?.firstName} {program.coach.userId?.lastName}
                  </span>
                        {program.coach.specializations?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {program.coach.specializations.slice(0, 2).join(', ')}
                            {program.coach.specializations.length > 2 && ' +more'}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">No coach assigned</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Fee:</span>
                  <span className="text-sm font-medium text-gray-900">LKR {program.fee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">{program.duration} weeks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Difficulty:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    program.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    program.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {program.difficulty?.charAt(0).toUpperCase() + program.difficulty?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Enrollments:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {program.currentEnrollments || 0}/{program.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Sessions:</span>
                  <span className="text-sm font-medium text-gray-900">{program.totalSessions}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Enrollment Progress</span>
                  <span>{Math.round(((program.currentEnrollments || 0) / program.maxParticipants) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((program.currentEnrollments || 0) / program.maxParticipants) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Deletion Status Indicator */}
              {programDeletionStatus[program._id] && (
                <div className={`mb-4 p-2 rounded-md text-sm ${
                  programDeletionStatus[program._id].canDelete
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {programDeletionStatus[program._id].canDelete ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Ready for deletion</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span>Cannot delete: {programDeletionStatus[program._id].reason}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Materials Count */}
              {program.materials && program.materials.length > 0 && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{program.materials.length} materials available</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(program)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Edit Program"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAddMaterial(program)}
                    className="text-green-600 hover:text-green-900 p-1"
                    title="Add Material"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAssignCoach(program)}
                    className="text-purple-600 hover:text-purple-900 p-1"
                    title="Assign Coach"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => onDelete(program._id)}
                  className={`p-1 ${
                    programDeletionStatus[program._id]?.canDelete === false
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:text-red-900'
                  }`}
                  title={
                    programDeletionStatus[program._id]?.canDelete === false
                      ? `Cannot delete: ${programDeletionStatus[program._id]?.reason}`
                      : 'Delete Program'
                  }
                  disabled={programDeletionStatus[program._id]?.canDelete === false}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Programs Message */}
      {filteredPrograms.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {programs.length === 0 ? 'No Programs Found' : 'No Programs Match Your Filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {programs.length === 0 
              ? 'Get started by creating your first coaching program.' 
              : 'Try adjusting your search criteria to find programs.'}
          </p>
          {programs.length === 0 && (
            <button
              onClick={() => onEdit(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Program
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Coaches Tab Component
const CoachesTab = ({ coaches, programs, onRefresh, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter coaches based on search and filters
  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = 
      coach.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specializations?.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesSpecialization = !filterSpecialization || 
      coach.specializations?.includes(filterSpecialization);
    
    const matchesExperience = !filterExperience || 
      (filterExperience === '0-2' && (coach.experience || 0) <= 2) ||
      (filterExperience === '3-5' && (coach.experience || 0) >= 3 && (coach.experience || 0) <= 5) ||
      (filterExperience === '5+' && (coach.experience || 0) > 5);

    return matchesSearch && matchesSpecialization && matchesExperience;
  });

  // Sort coaches
  const sortedCoaches = [...filteredCoaches].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.userId?.firstName} ${a.userId?.lastName}`.localeCompare(`${b.userId?.firstName} ${b.userId?.lastName}`);
      case 'experience':
        return (b.experience || 0) - (a.experience || 0);
      case 'programs':
        return (b.assignedPrograms?.length || 0) - (a.assignedPrograms?.length || 0);
      default:
        return 0;
    }
  });

  // Get unique specializations for filter
  const specializations = [...new Set(coaches.flatMap(c => c.specializations || []))].filter(Boolean);

  // Get coach statistics
  const totalCoaches = coaches.length;
  const activeCoaches = coaches.filter(c => c.isActive !== false).length;
  const avgExperience = coaches.length > 0 ? 
    Math.round(coaches.reduce((sum, c) => sum + (c.experience || 0), 0) / coaches.length * 10) / 10 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
        <h2 className="text-2xl font-bold text-gray-900">Coaches</h2>
          <p className="text-gray-600">Manage and view all coaches in your system</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            {viewMode === 'grid' ? <Menu className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
          </button>
        </div>
      </div>

      {/* Coach Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{totalCoaches}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{activeCoaches}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Experience</p>
              <p className="text-2xl font-bold text-gray-900">{avgExperience} years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Coaches</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Experience Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="experience">Experience</option>
              <option value="programs">Programs Assigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count and Clear Filters */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredCoaches.length} of {coaches.length} coaches
        </p>
        {(searchTerm || filterSpecialization || filterExperience) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterSpecialization('');
              setFilterExperience('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Coaches Display */}
      {viewMode === 'grid' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCoaches.map((coach) => (
            <div key={coach._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                {/* Coach Header */}
                <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {coach.userId?.firstName?.charAt(0)}{coach.userId?.lastName?.charAt(0)}
                      </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                  {coach.userId?.firstName} {coach.userId?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{coach.userId?.email}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {coach.experience || 0} years experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                  {coach.specializations?.slice(0, 3).map((spec, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {spec}
                    </span>
                  ))}
                    {coach.specializations?.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        +{coach.specializations.length - 3} more
                      </span>
                    )}
                </div>
                </div>

                {/* Coach Stats */}
                <div className="flex justify-center mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {programs.filter(p => p.coach && p.coach._id === coach._id).length}
                    </p>
                    <p className="text-xs text-gray-500">Programs</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onViewDetails(coach)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    title="View Details"
                  >
                    View Details
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specializations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCoaches.map((coach) => (
                  <tr key={coach._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">
                            {coach.userId?.firstName?.charAt(0)}{coach.userId?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coach.userId?.firstName} {coach.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{coach.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {coach.specializations?.slice(0, 2).map((spec, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {spec}
                          </span>
                        ))}
                        {coach.specializations?.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            +{coach.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coach.experience || 0} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {programs.filter(p => p.coach && p.coach._id === coach._id).length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onViewDetails(coach)}
                          className="text-blue-600 hover:text-blue-900" 
                          title="View Details"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Coaches Message */}
      {filteredCoaches.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {coaches.length === 0 ? 'No Coaches Found' : 'No Coaches Match Your Filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {coaches.length === 0 
              ? 'No coaches have been registered yet.' 
              : 'Try adjusting your search criteria to find coaches.'}
          </p>
          {coaches.length === 0 && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Add First Coach
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Sessions Tab Component
const SessionsTab = ({ sessions, onReschedule, coaches, programs, onSessionsRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coachFilter, setCoachFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('scheduledDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDateFilter = (session) => {
    const sessionDate = new Date(session.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (dateFilter === 'today') {
      return sessionDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'tomorrow') {
      return sessionDate.toDateString() === tomorrow.toDateString();
    } else if (dateFilter === 'thisWeek') {
      return sessionDate >= today && sessionDate <= nextWeek;
    } else if (dateFilter === 'past') {
      return sessionDate < today;
    } else if (dateFilter === 'future') {
      return sessionDate > today;
    }
    return true;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.program?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.coach?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle attendance-based filtering
    let matchesStatus = true;
    if (statusFilter === 'attendance-marked') {
      // Only consider past sessions for attendance marking
      const sessionDate = new Date(session.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sessionDate <= today) {
        // Check if any participant has attendance marked (only for past sessions)
        const hasAttendanceMarked = session.participants?.some(participant => 
          participant.attendanceStatus === 'present' || participant.attendanceStatus === 'absent' ||
          (participant.attended !== undefined && participant.attendanceMarkedAt)
        );
        matchesStatus = hasAttendanceMarked;
      } else {
        // Future sessions cannot have attendance marked
        matchesStatus = false;
      }
    } else if (statusFilter === 'attendance-not-marked') {
      // Only consider past sessions for attendance not marked
      const sessionDate = new Date(session.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sessionDate <= today) {
        // Check if no participant has attendance marked (only for past sessions)
        const hasAttendanceMarked = session.participants?.some(participant => 
          participant.attendanceStatus === 'present' || participant.attendanceStatus === 'absent' ||
          (participant.attended !== undefined && participant.attendanceMarkedAt)
        );
        matchesStatus = !hasAttendanceMarked;
      } else {
        // Future sessions are not eligible for attendance marking
        matchesStatus = false;
      }
    } else if (statusFilter === 'future-sessions') {
      // Show only future sessions
      const sessionDate = new Date(session.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      matchesStatus = sessionDate > today;
    } else {
      // Regular status filtering
      matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    }
    
    const matchesCoach = coachFilter === 'all' || session.coach?._id === coachFilter;
    const matchesProgram = programFilter === 'all' || session.program?._id === programFilter;
    const matchesDate = getDateFilter(session);

    return matchesSearch && matchesStatus && matchesCoach && matchesProgram && matchesDate;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'program':
        aValue = a.program?.title?.toLowerCase() || '';
        bValue = b.program?.title?.toLowerCase() || '';
        break;
      case 'coach':
        aValue = a.coach?.name?.toLowerCase() || '';
        bValue = b.coach?.name?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'scheduledDate':
      default:
        aValue = new Date(a.scheduledDate);
        bValue = new Date(b.scheduledDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessionStats = {
    total: sessions.length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    rescheduled: sessions.filter(s => s.status === 'rescheduled').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
    attendanceMarked: sessions.filter(s => {
      const sessionDate = new Date(s.scheduledDate);
      return sessionDate <= today && s.participants?.some(participant => 
        participant.attendanceStatus === 'present' || participant.attendanceStatus === 'absent' ||
        (participant.attended !== undefined && participant.attendanceMarkedAt)
      );
    }).length,
    attendanceNotMarked: sessions.filter(s => {
      const sessionDate = new Date(s.scheduledDate);
      return sessionDate <= today && !s.participants?.some(participant => 
        participant.attendanceStatus === 'present' || participant.attendanceStatus === 'absent' ||
        (participant.attended !== undefined && participant.attendanceMarkedAt)
      );
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Sessions</h2>
          <p className="text-gray-600">Manage and monitor all coaching sessions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onSessionsRefresh}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Sessions
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessionStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{sessionStats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rescheduled</p>
              <p className="text-2xl font-bold text-orange-600">{sessionStats.rescheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Attendance Marked</p>
              <p className="text-2xl font-bold text-green-600">{sessionStats.attendanceMarked}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Attendance Not Marked</p>
              <p className="text-2xl font-bold text-orange-600">{sessionStats.attendanceNotMarked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="attendance-marked">Attendance Marked</option>
              <option value="future-sessions">Future Session</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
            <select
              value={coachFilter}
              onChange={(e) => setCoachFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Coaches</option>
              {coaches.map(coach => (
                <option key={coach._id} value={coach._id}>
                  {coach.name || `${coach.userId?.firstName} ${coach.userId?.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program._id} value={program._id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="thisWeek">This Week</option>
              <option value="past">Past Sessions</option>
              <option value="future">Future Sessions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduledDate">Date</option>
                <option value="title">Title</option>
                <option value="program">Program</option>
                <option value="coach">Coach</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program & Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ground
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
                    <p className="text-gray-500">
                      {sessions.length === 0 
                        ? 'No sessions have been created yet.' 
                        : 'No sessions match your current filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.title}</div>
                      <div className="text-sm text-gray-500">
                        Session {session.sessionNumber} • Week {session.week}
                      </div>
                      {session.rescheduled && (
                        <div className="text-xs text-orange-600 font-medium">
                          Rescheduled
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.program?.title}</div>
                      <div className="text-sm text-gray-500">
                        {session.coach?.name || `${session.coach?.userId?.firstName} ${session.coach?.userId?.lastName}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(session.scheduledDate)}</div>
                      <div className="text-sm text-gray-500">
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Duration: {session.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* Customer Names */}
                      {session.participants && session.participants.length > 0 ? (
                        <div className="space-y-1">
                          {session.participants.slice(0, 3).map((participant, index) => (
                            <div key={index} className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                              {participant.user?.firstName} {participant.user?.lastName}
                              {(() => {
                                // Check if session is upcoming or past
                                const sessionDate = new Date(session.scheduledDate);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isUpcomingSession = sessionDate >= today;
                                
                                // Only show attendance status for past sessions with marked attendance
                                if (!isUpcomingSession && 
                                    ((participant.attendanceStatus === 'present' || participant.attendanceStatus === 'absent') || 
                                     (participant.attended !== undefined && participant.attendanceMarkedAt))) {
                                  return (
                                    <span className={`ml-2 text-xs ${
                                      participant.attendanceStatus === 'present' || participant.attended === true 
                                        ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {participant.attendanceStatus === 'present' || participant.attended === true ? '✓' : '✗'}
                                    </span>
                                  );
                                }
                                
                                // For upcoming sessions, show upcoming indicator
                                if (isUpcomingSession) {
                                  return (
                                    <span className="ml-2 text-xs text-blue-500">
                                      📅
                                    </span>
                                  );
                                }
                                
                                return null;
                              })()}
                            </div>
                          ))}
                          {session.participants.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{session.participants.length - 3} more
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {session.participants?.filter(p => p.attended).length || 0} attended
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No participants</div>
                      )}
                      <div className="text-xs mt-1">
                        {(() => {
                          const sessionDate = new Date(session.scheduledDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          if (sessionDate > today) {
                            return <span className="text-gray-500 font-medium">📅 Future Session</span>;
                          } else if (session.participants?.some(p => 
                            p.attendanceStatus === 'present' || p.attendanceStatus === 'absent' ||
                            (p.attended !== undefined && p.attendanceMarkedAt)
                          )) {
                            return <span className="text-green-600 font-medium">✓ Attendance Marked</span>;
                          } else {
                            return <span className="text-orange-600 font-medium">⚠ Not Marked</span>;
                          }
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.ground?.name}</div>
                      <div className="text-sm text-gray-500">Slot {session.groundSlot}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onReschedule(session)}
                        className="flex items-center px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                        title="Reassign Session Coach"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {sortedSessions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Showing {sortedSessions.length} of {sessions.length} sessions
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && (
              statusFilter === 'attendance-marked' ? ' with attendance marked' :
              statusFilter === 'future-sessions' ? ' (future sessions)' :
              ` with status "${statusFilter}"`
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// Program Modal Component
const ProgramModal = ({ program, form, setForm, coaches, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {program ? 'Edit Program' : 'Create New Program'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                <option value="Batting">Batting</option>
                <option value="Bowling">Bowling</option>
                <option value="Fielding">Fielding</option>
                <option value="Wicket Keeping">Wicket Keeping</option>
                <option value="All Rounder">All Rounder</option>
                <option value="Captaincy">Captaincy</option>
                <option value="Fitness & Conditioning">Fitness & Conditioning</option>
                <option value="Mental Training">Mental Training</option>
                <option value="Strategy & Tactics">Strategy & Tactics</option>
                <option value="Youth Development">Youth Development</option>
                <option value="Professional Training">Professional Training</option>
                <option value="Beginner Training">Beginner Training</option>
                <option value="Advanced Training">Advanced Training</option>
                <option value="Team Building">Team Building</option>
                <option value="Match Preparation">Match Preparation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
              <input
                type="number"
                value={form.fee}
                onChange={(e) => setForm({...form, fee: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({...form, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                value={form.maxParticipants}
                onChange={(e) => setForm({...form, maxParticipants: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
              <select
                value={form.coach}
                onChange={(e) => setForm({...form, coach: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a coach</option>
                {coaches.map(coach => (
                  <option key={coach._id} value={coach._id}>
                    {coach.userId?.firstName} {coach.userId?.lastName}
                    {coach.specializations?.length > 0 && ` (${coach.specializations.slice(0, 2).join(', ')})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({...form, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({...form, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {program ? 'Update Program' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Material Modal Component
const MaterialModal = ({ program, form, setForm, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add Material</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="document">Document (PDF)</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({...form, url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/file.pdf"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assign Coach Modal Component
const AssignCoachModal = ({ program, coaches, onAssign, onClose }) => {
  const [selectedCoachId, setSelectedCoachId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCoachId) {
      // Create a synthetic event with the selected coach ID
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          selectedCoachId: { value: selectedCoachId }
        }
      };
      onAssign(syntheticEvent);
    } else {
      alert('Please select a coach');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Assign Coach</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <input
              type="text"
              value={program.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Coach</label>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a coach</option>
              {coaches.map(coach => (
                <option key={coach._id} value={coach._id}>
                  {coach.userId?.firstName} {coach.userId?.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Assign Coach
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reschedule Modal Component
const RescheduleModal = ({ session, form, setForm, onSubmit, onClose, coaches }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Reassign Session Coach</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <input
              type="text"
              value={session.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Coach</label>
            <input
              type="text"
              value={session.coach?.userId ? `${session.coach.userId.firstName} ${session.coach.userId.lastName}` : 'Unknown Coach'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reassign to Coach</label>
            <div className="flex space-x-2">
              <select
                value={form.newCoachId}
                onChange={(e) => setForm({...form, newCoachId: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a coach</option>
                {coaches && coaches.length > 0 ? (
                  coaches.map(coach => (
                    <option key={coach._id} value={coach._id}>
                      {coach.userId?.firstName} {coach.userId?.lastName}
                      {coach.specializations?.length > 0 && ` (${coach.specializations.slice(0, 2).join(', ')})`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No coaches available</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => {
                  console.log('Refreshing coaches...');
                  window.location.reload();
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                title="Refresh coaches data"
              >
                🔄
              </button>
            </div>
            {coaches && coaches.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No coaches found. Click refresh button to reload coaches.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Coach Reassignment</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({...form, reason: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for reassigning this session to a different coach..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Reassign Coach
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reports Tab Component
const ReportsTab = ({ coaches, programs, sessions }) => {
  const totalEnrollments = programs.reduce((sum, p) => sum + (p.currentEnrollments || 0), 0);
  const activePrograms = programs.filter(p => p.isActive);
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">Overview of your coaching programs and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{coaches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900">{activePrograms.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance</h3>
          <div className="space-y-3">
            {programs.slice(0, 5).map((program) => (
              <div key={program._id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{program.title}</p>
                  <p className="text-sm text-gray-500">{program.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {program.currentEnrollments || 0}/{program.maxParticipants}
                  </p>
                  <p className="text-xs text-gray-500">enrollments</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session._id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{session.title}</p>
                  <p className="text-sm text-gray-500">{session.program?.title}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



// Coach Details Modal Component
const CoachDetailsModal = ({ coach, programs, onEdit, onManageAvailability, onClose }) => {
  // Get programs assigned to this coach
  const assignedPrograms = programs.filter(program => 
    program.coach && program.coach._id === coach._id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Coach Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Coach Header */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {coach.userId?.firstName?.charAt(0)}{coach.userId?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {coach.userId?.firstName} {coach.userId?.lastName}
              </h3>
              <p className="text-lg text-gray-600 mb-2">{coach.userId?.email}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {coach.experience || 0} years experience
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {assignedPrograms.length} programs assigned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coach Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Specializations */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {coach.specializations?.map((spec, index) => (
                  <span key={index} className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {spec}
                  </span>
                ))}
                {(!coach.specializations || coach.specializations.length === 0) && (
                  <span className="text-gray-500 italic">No specializations listed</span>
                )}
              </div>
            </div>

            {/* Experience & Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Experience & Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Years of Experience:</span>
                  <span className="font-medium">{coach.experience || 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Programs Assigned:</span>
                  <span className="font-medium">{assignedPrograms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-medium">
                    {coach.hourlyRate && coach.hourlyRate > 0 ? `LKR ${coach.hourlyRate}` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    coach.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {coach.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Programs */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Programs</h4>
            {assignedPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedPrograms.map((program) => (
                  <div key={program._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h5 className="font-medium text-gray-900 mb-2">{program.title}</h5>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <span className="text-gray-600">Fee: <span className="font-medium">LKR {program.fee}</span></span>
                        <span className="text-gray-600">Duration: <span className="font-medium">{program.duration} weeks</span></span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        program.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        program.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {program.difficulty?.charAt(0).toUpperCase() + program.difficulty?.slice(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {program.currentEnrollments || 0}/{program.maxParticipants} participants
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        program.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {program.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-900 mb-2">No Programs Assigned</h5>
                <p className="text-gray-600">This coach is not currently assigned to any programs.</p>
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Availability</h4>
              <button
                onClick={() => {
                  onClose();
                  onManageAvailability(coach);
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Manage
              </button>
            </div>
            
            {coach.availability && coach.availability.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coach.availability.map((slot, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="font-medium text-gray-900 capitalize">{slot.day}</div>
                      <div className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No availability set. Click "Manage" to add availability slots.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(coach);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Coach Modal Component
const EditCoachModal = ({ coach, form, setForm, onSubmit, onClose }) => {
  const [selectedSpecializations, setSelectedSpecializations] = useState(form.specializations || []);

  // Update selected specializations when form changes
  React.useEffect(() => {
    console.log('Form specializations changed:', form.specializations);
    setSelectedSpecializations(form.specializations || []);
  }, [form.specializations]);

  // Initialize specializations when modal opens
  React.useEffect(() => {
    if (coach && coach.specializations) {
      console.log('Initializing specializations:', coach.specializations);
      setSelectedSpecializations(coach.specializations);
      setForm(prev => ({ ...prev, specializations: coach.specializations }));
    }
  }, [coach]);

  const availableSpecializations = [
    'Batting', 'Bowling', 'Fielding', 'Wicket Keeping', 'Captaincy',
    'Fast Bowling', 'Spin Bowling', 'Medium Pace', 'Opening Batting',
    'Middle Order', 'Lower Order', 'Power Hitting', 'Defensive Batting',
    'Close Fielding', 'Outfield', 'Slip Catching', 'Umpiring',
    'Coaching', 'General', 'All Rounder', 'Fitness & Conditioning',
    'Mental Training', 'Strategy & Tactics', 'Youth Development',
    'Professional Training', 'Beginner Training', 'Advanced Training',
    'Team Building', 'Match Preparation'
  ];

  const handleSpecializationToggle = (spec) => {
    console.log('Toggling specialization:', spec);
    console.log('Current specializations:', selectedSpecializations);
    
    let newSpecializations;
    if (selectedSpecializations.includes(spec)) {
      newSpecializations = selectedSpecializations.filter(s => s !== spec);
    } else {
      newSpecializations = [...selectedSpecializations, spec];
    }
    
    console.log('New specializations:', newSpecializations);
    setSelectedSpecializations(newSpecializations);
    
    // Update form immediately
    setForm(prev => ({ ...prev, specializations: newSpecializations }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION ===');
    console.log('Selected Specializations:', selectedSpecializations);
    console.log('Current Form:', form);
    
    // Ensure specializations are included in the form
    const updatedForm = {
      ...form,
      specializations: selectedSpecializations
    };
    
    console.log('Updated Form:', updatedForm);
    
    // Update the form state
    setForm(updatedForm);
    
    // Call the submit handler
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Coach</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({...form, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({...form, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={form.experience}
              onChange={(e) => setForm({...form, experience: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (LKR) <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              value={form.hourlyRate}
              onChange={(e) => setForm({...form, hourlyRate: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter hourly rate"
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {availableSpecializations.map((spec) => (
                <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSpecializations.includes(spec)}
                    onChange={() => handleSpecializationToggle(spec)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
            {selectedSpecializations.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Selected specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSpecializations.map((spec) => (
                    <span key={spec} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({...form, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active Coach
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Coach
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Availability Modal Component
const AvailabilityModal = ({ 
  coach, 
  form, 
  setForm, 
  editingAvailability, 
  onAdd, 
  onUpdate, 
  onEdit, 
  onDelete, 
  onClose 
}) => {
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleSubmit = (e) => {
    if (editingAvailability !== null) {
      onUpdate(e);
    } else {
      onAdd(e);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      day: '',
      startTime: '',
      endTime: ''
    });
    onEdit(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Availability - {coach.userId?.firstName} {coach.userId?.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Current Availability */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Availability</h3>
            {coach.availability && coach.availability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coach.availability.map((slot, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{slot.day}</div>
                        <div className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(slot, index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                No availability slots set. Add one below to get started.
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAvailability !== null ? 'Edit Availability Slot' : 'Add New Availability Slot'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Day</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {editingAvailability !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingAvailability !== null ? 'Update Availability' : 'Add Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payroll Tab Component
const PayrollTab = ({ coaches }) => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');

  // Set default date range (current month)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Fetch payroll data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchPayrollData();
    }
  }, [startDate, endDate, selectedCoach]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const params = new URLSearchParams({
        startDate,
        endDate,
        page: 1,
        limit: 50
      });

      if (selectedCoach) {
        params.append('coachId', selectedCoach);
      }

      const response = await axios.get(`http://localhost:5000/api/coaches/payroll?${params}`, config);
      
      if (response.data.success) {
        setPayrollData(response.data.data.payrollData || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch payroll data');
      }
    } catch (err) {
      console.error('Error fetching payroll data:', err);
      setError(err.message);
      // Use mock data for development
      setPayrollData([
        {
          coach: {
            _id: 'coach1',
            userId: { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com' },
            hourlyRate: 50,
            specializations: ['Batting', 'Bowling'],
            experience: 5
          },
          payroll: {
            totalHours: 40,
            totalSessions: 20,
            completedSessions: 18,
            completionRate: 90,
            hourlyRate: 50,
            totalPayroll: 2000
          }
        },
        {
          coach: {
            _id: 'coach2',
            userId: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com' },
            hourlyRate: 60,
            specializations: ['Fielding', 'Wicket Keeping'],
            experience: 8
          },
          payroll: {
            totalHours: 35,
            totalSessions: 15,
            completedSessions: 15,
            completionRate: 100,
            hourlyRate: 60,
            totalPayroll: 2100
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  const calculateTotalPayroll = () => {
    return payrollData.reduce((total, item) => total + item.payroll.totalPayroll, 0);
  };

  const calculateTotalHours = () => {
    return payrollData.reduce((total, item) => total + item.payroll.totalHours, 0);
  };

  const calculateTotalSessions = () => {
    return payrollData.reduce((total, item) => total + item.payroll.totalSessions, 0);
  };

  const exportPayrollData = () => {
    if (payrollData.length === 0) {
      alert('No payroll data to export');
      return;
    }

    // Create CSV content
    const headers = [
      'Coach Name',
      'Email',
      'Hourly Rate',
      'Total Hours',
      'Total Sessions',
      'Total Payroll',
      'Payment Status',
      'Payment Date'
    ];

    const csvContent = [
      headers.join(','),
      ...payrollData.map(item => [
        `"${item.coach.userId?.firstName} ${item.coach.userId?.lastName}"`,
        `"${item.coach.userId?.email}"`,
        item.coach.hourlyRate,
        item.payroll.totalHours,
        item.payroll.totalSessions,
        item.payroll.totalPayroll,
        item.paymentStatus,
        item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with date range
    const startDateStr = new Date(startDate).toLocaleDateString('en-CA');
    const endDateStr = new Date(endDate).toLocaleDateString('en-CA');
    const filename = `coach-payroll-${startDateStr}-to-${endDateStr}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePaymentStatus = async (payrollItem) => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const newStatus = payrollItem.paymentStatus === 'paid' ? 'pending' : 'paid';
      
      // If there's no payrollId, create a new payroll record first
      if (!payrollItem.payrollId) {
        const createResponse = await axios.post(
          `http://localhost:5000/api/coaches/${payrollItem.coach._id}/payroll`,
          {
            period: payrollItem.period,
            payroll: payrollItem.payroll,
            paymentStatus: newStatus,
            paymentMethod: 'bank_transfer',
            paymentNotes: ''
          },
          config
        );

        if (createResponse.data.success) {
          // Refresh payroll data
          await fetchPayrollData();
          alert(`Payment status updated to ${newStatus}`);
        } else {
          throw new Error(createResponse.data.message || 'Failed to update payment status');
        }
      } else {
        // Update existing payroll record
        const updateResponse = await axios.put(
          `http://localhost:5000/api/coaches/${payrollItem.coach._id}/payroll/${payrollItem.payrollId}/payment-status`,
          {
            paymentStatus: newStatus,
            paymentMethod: 'bank_transfer',
            paymentNotes: ''
          },
          config
        );

        if (updateResponse.data.success) {
          // Refresh payroll data
          await fetchPayrollData();
          alert(`Payment status updated to ${newStatus}`);
        } else {
          throw new Error(updateResponse.data.message || 'Failed to update payment status');
        }
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError(err.message);
      alert(`Error updating payment status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Payroll</h1>
          <p className="text-gray-600">Calculate and manage coach payments based on sessions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportPayrollData}
            disabled={loading || payrollData.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchPayrollData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Coaches</option>
              {coaches.map(coach => (
                <option key={coach._id} value={coach._id}>
                  {coach.userId?.firstName} {coach.userId?.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">${calculateTotalPayroll().toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{calculateTotalHours().toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{calculateTotalSessions()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{payrollData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Coach Payroll Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Payroll
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Loading payroll data...
                    </div>
                  </td>
                </tr>
              ) : payrollData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No payroll data found for the selected period
                  </td>
                </tr>
              ) : (
                payrollData.map((item) => (
                  <tr key={item.coach._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {item.coach.userId?.firstName?.charAt(0)}{item.coach.userId?.lastName?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.coach.userId?.firstName} {item.coach.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{item.coach.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.coach.hourlyRate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.payroll.totalHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.payroll.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.payroll.totalPayroll.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePaymentStatus(item)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                          item.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {item.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </button>
                      {item.paymentDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(item.paymentDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};



export default ManagerDashboard;
