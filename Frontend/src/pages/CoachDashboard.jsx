import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Star, Clock, MapPin, BookOpen, MessageSquare, Plus, LogOut } from 'lucide-react';
import axios from 'axios';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      
      // Use mock data for testing - no authentication required
      const mockCoach = {
        _id: 'mock-coach-id',
        userId: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com'
        },
        specializations: ['Batting', 'Bowling', 'Fielding'],
        assignedPrograms: ['program1', 'program2']
      };
      setCoach(mockCoach);
      
      // Mock programs
      const mockPrograms = [
        {
          _id: 'program1',
          title: 'Beginner Cricket Training',
          description: 'Learn the basics of cricket including batting, bowling, and fielding techniques.',
          currentEnrollments: 8,
          maxParticipants: 15,
          duration: 8,
          difficulty: 'beginner',
          category: 'Training'
        },
        {
          _id: 'program2',
          title: 'Advanced Batting Masterclass',
          description: 'Advanced techniques for experienced players looking to improve their batting skills.',
          currentEnrollments: 5,
          maxParticipants: 10,
          duration: 6,
          difficulty: 'advanced',
          category: 'Specialized'
        }
      ];
      setAssignedPrograms(mockPrograms);
      
      // Mock sessions
      const mockSessions = [
        {
          _id: 'session1',
          title: 'Basic Batting Techniques',
          program: { title: 'Beginner Cricket Training' },
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          startTime: '10:00',
          endTime: '12:00',
          status: 'scheduled',
          ground: { name: 'Main Cricket Ground' },
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
          ground: { name: 'Practice Ground' },
          participants: [
            { _id: 'p3', user: { firstName: 'Charlie', lastName: 'Brown' } }
          ]
        }
      ];
      setUpcomingSessions(mockSessions);
      
    } catch (error) {
      console.error('Error fetching coach data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      const response = await axios.post('/api/player-feedback', feedbackData);
      console.log('Feedback submitted successfully:', response.data);
      setShowFeedbackModal(false);
      setSelectedParticipant(null);
      // Refresh data after feedback submission
      fetchCoachData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Only remove the authentication token, keep cached data for offline viewing
      localStorage.removeItem('userInfo');
      // Note: We keep 'cachedUserProfile' and 'cachedUserEnrollments' for offline viewing
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
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold">Coach Dashboard</h1>
              <p className="mt-2 text-blue-100 text-lg">
                Welcome back, {coach?.userId?.firstName} {coach?.userId?.lastName}
              </p>
              {coach?.specializations && coach.specializations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {coach.specializations.map((spec, index) => (
                    <span key={index} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Programs</p>
                <p className="text-3xl font-bold">{assignedPrograms.length}</p>
              </div>
              <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Upcoming Sessions</p>
                <p className="text-3xl font-bold">{upcomingSessions.length}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Programs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Assigned Programs
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {assignedPrograms.length} programs
                  </span>
                </div>
              </div>
              <div className="p-6">
                {assignedPrograms.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No programs assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedPrograms.map((program) => (
                      <ProgramCard
                        key={program._id}
                        program={program}
                        onViewSessions={() => setSelectedProgram(program)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Upcoming Sessions
                </h2>
              </div>
              <div className="p-6">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming sessions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <SessionCard
                        key={session._id}
                        session={session}
                        onGiveFeedback={(participant) => {
                          setSelectedParticipant(participant);
                          setShowFeedbackModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
    </div>
  );
};

// Program Card Component
const ProgramCard = ({ program, onViewSessions }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <Users className="h-4 w-4 mr-1" />
              {program.currentEnrollments}/{program.maxParticipants} enrolled
            </span>
            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 mr-1" />
              {program.duration} weeks
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              program.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              program.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {program.difficulty}
            </span>
          </div>
          {program.category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {program.category}
            </span>
          )}
        </div>
        <button
          onClick={onViewSessions}
          className="ml-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          View Sessions
        </button>
      </div>
    </div>
  );
};

// Session Card Component
const SessionCard = ({ session, onGiveFeedback }) => {
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

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{session.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
              {session.status}
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
        <div className="ml-4 text-center bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Participants</p>
          <p className="text-2xl font-bold text-blue-600">{session.participants?.length || 0}</p>
        </div>
      </div>
      
      {session.participants && session.participants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
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

export default CoachDashboard;
