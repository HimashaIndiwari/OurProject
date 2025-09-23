import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import SessionBooking from '../components/SessionBooking';
import SessionManager from '../components/SessionManager';
import SessionCalendar from '../components/SessionCalendar';
import PaymentEnrollment from '../components/PaymentEnrollment';
import { 
  cacheUserProfile, 
  cacheUserEnrollments, 
  getCachedUserProfile, 
  getCachedUserEnrollments,
  isUserLoggedIn 
} from '../utils/sessionManager';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showSessionManager, setShowSessionManager] = useState(false);
    const [showSessionCalendar, setShowSessionCalendar] = useState(false);
    const [showPaymentEnrollment, setShowPaymentEnrollment] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [paymentEnrollmentData, setPaymentEnrollmentData] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const navigate = useNavigate(); // <-- Import and use navigate for redirects

    // Fallback component in case of any errors
    const FallbackComponent = () => (
        <div className="text-center p-10 bg-surface rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-primary mb-4">Profile Page</h2>
            <p className="text-gray-600 mb-4">There was an issue loading your profile. Please try refreshing the page.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="bg-secondary text-white font-bold py-2 px-4 rounded-lg"
            >
                Refresh Page
            </button>
        </div>
    );

    useEffect(() => {
        const fetchUserProfile = async () => {
            // --- ENHANCED PROFILE FETCHING ---
            // First, get the user info from storage
            const userInfoString = localStorage.getItem('userInfo');

            // Check if user is logged in
            if (!userInfoString) {
                // User is not logged in, but we can still show cached profile data
                const cachedProfile = getCachedUserProfile();
                if (cachedProfile) {
                    setUser(cachedProfile);
                    setIsOfflineMode(true);
                    setLoading(false);
                    return;
                }
                setError('You are not logged in. Please log in to view your profile.');
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const userInfo = JSON.parse(userInfoString);
                
                // Safety Check: Make sure the user info has a token
                if (!userInfo.token) {
                    setError('Authentication token is missing. Please log in again.');
                    setLoading(false);
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
                setUser(data);
                setIsOfflineMode(false);
                
                // Cache the profile data for offline viewing
                cacheUserProfile(data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                // Fallback: Use localStorage user data if API fails
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (userInfo && userInfo._id) {
                    const fallbackUser = {
                        _id: userInfo._id,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        username: userInfo.username,
                        email: userInfo.email,
                        role: userInfo.role,
                        contactNumber: userInfo.contactNumber,
                        address: userInfo.address,
                        dob: userInfo.dob,
                        createdAt: userInfo.createdAt || new Date().toISOString()
                    };
                    setUser(fallbackUser);
                    setIsOfflineMode(true);
                    // Cache the fallback data
                    cacheUserProfile(fallbackUser);
                } else {
                    setError('Failed to fetch profile data. Your session may have expired.');
                    localStorage.removeItem('userInfo'); // Clear the bad data
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    // Check for payment completion data in localStorage
    useEffect(() => {
        const paymentData = localStorage.getItem('paymentEnrollmentData');
        if (paymentData) {
            try {
                const data = JSON.parse(paymentData);
                // Only show PaymentEnrollment modal if enrollment is not already active
                if (data.enrollment && data.enrollment.status !== 'active') {
                    setPaymentEnrollmentData(data);
                    setShowPaymentEnrollment(true);
                } else {
                    // Enrollment is already active, just show success message
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 5000);
                }
                // Clear the data from localStorage after processing
                localStorage.removeItem('paymentEnrollmentData');
            } catch (err) {
                console.error('Error parsing payment enrollment data:', err);
            }
        }
    }, []);

    // Refresh enrollments when user arrives from payment
    useEffect(() => {
        const refreshEnrollments = async () => {
            if (user && user.role === 'customer') {
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    
                    // Check if user is logged in
                    if (!userInfo || !userInfo.token) {
                        // User is not logged in, try to get cached enrollments
                        const cachedEnrollments = getCachedUserEnrollments();
                        if (cachedEnrollments) {
                            setEnrollments(cachedEnrollments);
                        }
                        return;
                    }

                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };
                    const { data } = await axios.get(`http://localhost:5000/api/enrollments/user/${userInfo._id}`, config);
                    
                    // Handle both response structures
                    let enrollmentsData = [];
                    if (data.data && data.data.docs) {
                        enrollmentsData = data.data.docs || [];
                    } else if (data.data && Array.isArray(data.data)) {
                        enrollmentsData = data.data || [];
                    } else if (data.enrollments) {
                        enrollmentsData = data.enrollments || [];
                    }
                    
                    setEnrollments(enrollmentsData);
                    
                    // Cache the updated enrollments data
                    cacheUserEnrollments(enrollmentsData);
                } catch (err) {
                    console.error('Error refreshing enrollments:', err);
                    // Try to use cached data if API fails
                    const cachedEnrollments = getCachedUserEnrollments();
                    if (cachedEnrollments) {
                        setEnrollments(cachedEnrollments);
                    }
                }
            }
        };

        // Only refresh if we have user data and no existing enrollments
        if (user && enrollments.length === 0) {
            refreshEnrollments();
        }
    }, [user]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            if (!user || user.role !== 'customer') return;
            
            setEnrollmentsLoading(true);
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                
                // Check if user is logged in
                if (!userInfo || !userInfo.token) {
                    // User is not logged in, try to get cached enrollments
                    const cachedEnrollments = getCachedUserEnrollments();
                    if (cachedEnrollments) {
                        setEnrollments(cachedEnrollments);
                    } else {
                        setEnrollments([]);
                    }
                    setEnrollmentsLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                const { data } = await axios.get(`http://localhost:5000/api/enrollments/user/${userInfo._id}`, config);
                
                // Handle both response structures
                let enrollmentsData = [];
                if (data.data && data.data.docs) {
                    // Paginated response
                    enrollmentsData = data.data.docs || [];
                } else if (data.data && Array.isArray(data.data)) {
                    // Direct array response
                    enrollmentsData = data.data || [];
                } else if (data.enrollments) {
                    // Legacy response structure
                    enrollmentsData = data.enrollments || [];
                }
                
                setEnrollments(enrollmentsData);
                
                // Cache the enrollments data for offline viewing
                cacheUserEnrollments(enrollmentsData);
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                // Try to use cached data if API fails
                const cachedEnrollments = getCachedUserEnrollments();
                if (cachedEnrollments) {
                    setEnrollments(cachedEnrollments);
                } else {
                    setEnrollments([]);
                }
            } finally {
                setEnrollmentsLoading(false);
            }
        };

        if (user) {
            fetchEnrollments();
        }
    }, [user]);

    const handleBookSession = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowBookingModal(true);
    };

    const handleViewSessions = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowSessionManager(true);
    };

    const handleViewCalendar = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowSessionCalendar(true);
    };

    const handleBookingSuccess = () => {
        // Refresh enrollments to show updated session count
        fetchEnrollments();
    };

    const closeModals = () => {
        setShowBookingModal(false);
        setShowSessionManager(false);
        setShowSessionCalendar(false);
        setShowPaymentEnrollment(false);
        setSelectedEnrollment(null);
        setPaymentEnrollmentData(null);
    };

    const handlePaymentEnrollmentComplete = () => {
        // Refresh enrollments to show the new enrollment
        if (user && user.role === 'customer') {
            const fetchEnrollments = async () => {
                setEnrollmentsLoading(true);
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    
                    // Check if user is logged in
                    if (!userInfo || !userInfo.token) {
                        // User is not logged in, try to get cached enrollments
                        const cachedEnrollments = getCachedUserEnrollments();
                        if (cachedEnrollments) {
                            try {
                                const cachedData = JSON.parse(cachedEnrollments);
                                setEnrollments(cachedData);
                            } catch (err) {
                                console.error('Error parsing cached enrollments:', err);
                            }
                        }
                        setEnrollmentsLoading(false);
                        return;
                    }

                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };
                    const { data } = await axios.get(`http://localhost:5000/api/enrollments/user/${userInfo._id}`, config);
                    
                    // Handle both response structures
                    let enrollmentsData = [];
                    if (data.data && data.data.docs) {
                        // Paginated response
                        enrollmentsData = data.data.docs || [];
                    } else if (data.data && Array.isArray(data.data)) {
                        // Direct array response
                        enrollmentsData = data.data || [];
                    } else if (data.enrollments) {
                        // Legacy response structure
                        enrollmentsData = data.enrollments || [];
                    }
                    
                    setEnrollments(enrollmentsData);
                    
                    // Cache the updated enrollments data
                    cacheUserEnrollments(enrollmentsData);
                } catch (err) {
                    console.error('Error fetching enrollments:', err);
                    // Try to use cached data if API fails
                    const cachedEnrollments = getCachedUserEnrollments();
                    if (cachedEnrollments) {
                        setEnrollments(cachedEnrollments);
                    }
                } finally {
                    setEnrollmentsLoading(false);
                }
            };
            fetchEnrollments();
        }
        closeModals();
        
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 5000);
    };

    if (loading) return <div className="text-center p-10">Loading profile...</div>;
    
    // Show error and a button to go back to login
    if (error) {
        return (
            <div className="text-center p-10 bg-surface rounded-lg shadow-md">
                <p className="text-red-500">{error}</p>
                <Link to="/login" className="mt-4 inline-block bg-secondary text-white font-bold py-2 px-4 rounded-lg">
                    Go to Login
                </Link>
            </div>
        );
    }
    
    
    if (!user) {
        return (
            <div className="text-center p-10 bg-surface rounded-lg shadow-md">
                <p className="text-red-500">User data not loaded. Please try refreshing the page.</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 inline-block bg-secondary text-white font-bold py-2 px-4 rounded-lg"
                >
                    Refresh Page
                </button>
                <Link to="/login" className="mt-4 ml-4 inline-block bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                    Go to Login
                </Link>
            </div>
        );
    }

    try {
        return (
            <div className="bg-surface rounded-2xl shadow-lg p-8">
            {/* Offline Mode Indicator */}
            {isOfflineMode && (
                <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-yellow-600 text-2xl mr-3">📱</div>
                        <div>
                            <h3 className="font-bold text-yellow-800">Offline Mode</h3>
                            <p className="text-sm text-yellow-700">You're viewing cached data. Some features may be limited. Please log in to access all features.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-green-600 text-2xl mr-3">🎉</div>
                        <div>
                            <h3 className="font-bold text-green-800">Enrollment Successful!</h3>
                            <p className="text-sm text-green-700">Your enrollment has been completed and is now active.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-primary">{user.firstName} {user.lastName}</h1>
                    <p className="text-lg text-text-body mt-1">@{user.username}</p>
                </div>
                <Link 
                    to={user.role === 'admin' ? '/admin/edit-account' : user.role === 'order_manager' ? '/order_manager/edit-account' : '/customer/edit-account'} 
                    className="bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors"
                >
                    Edit Profile
                </Link>
            </div>

            <div className="border-t mt-8 pt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-text-body">
                    {user.email && <div><strong>Email:</strong> {user.email}</div>}
                    {user.contactNumber && <div><strong>Contact:</strong> {user.contactNumber}</div>}
                    {user.address && <div><strong>Address:</strong> {user.address}</div>}
                    {user.dob && <div><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</div>}
                    <div><strong>Role:</strong> <span className="capitalize">{user.role.replace('_', ' ')}</span></div>
                    <div><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
            </div>

            {/* Enrolled Programs Section - Only show for customers */}
            {user.role === 'customer' && (
                <div className="border-t mt-8 pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-primary">My Enrolled Programs</h3>
                        <Link 
                            to="/programs" 
                            className="bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Browse More Programs
                        </Link>
                    </div>

                    {/* Enrollment Summary Stats */}
                    {enrollments.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
                                <div className="text-sm text-blue-800">Total Programs</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {enrollments.filter(e => e.status === 'active').length}
                                </div>
                                <div className="text-sm text-green-800">Active Programs</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {enrollments.filter(e => e.status === 'completed').length}
                                </div>
                                <div className="text-sm text-purple-800">Completed</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {enrollments.filter(e => e.paymentStatus === 'completed').length}
                                </div>
                                <div className="text-sm text-orange-800">Paid Programs</div>
                            </div>
                        </div>
                    )}
                    
                    {enrollmentsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-text-body text-lg">Loading your enrollments...</p>
                        </div>
                    ) : enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {enrollments.map((enrollment) => (
                                <div 
                                    key={enrollment._id} 
                                    className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                    onClick={() => navigate(`/enrollment/${enrollment._id}`)}
                                >
                                    {/* Program Header */}
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl text-primary mb-2">
                                                    {enrollment.program?.title || 'Program Title'}
                                                </h4>
                                                <p className="text-text-body text-sm mb-1">
                                                    <span className="font-medium">Coach:</span> {enrollment.program?.coach?.userId?.firstName} {enrollment.program?.coach?.userId?.lastName}
                                                </p>
                                                <p className="text-text-body text-sm mb-1">
                                                    <span className="font-medium">Duration:</span> {enrollment.program?.duration} weeks
                                                </p>
                                                <p className="text-text-body text-sm mb-1">
                                                    <span className="font-medium">Fee:</span> LKR {enrollment.program?.fee}
                                                </p>
                                                <p className="text-text-body text-sm">
                                                    <span className="font-medium">Enrolled:</span> {new Date(enrollment.enrollmentDate || enrollment.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    enrollment.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : enrollment.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : enrollment.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : enrollment.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {enrollment.status === 'active' ? '✅ Active' : 
                                                     enrollment.status === 'pending' ? '⏳ Pending' : 
                                                     enrollment.status === 'completed' ? '🎓 Completed' :
                                                     enrollment.status === 'cancelled' ? '❌ Cancelled' :
                                                     '📋 ' + enrollment.status}
                                                </span>
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        enrollment.paymentStatus === 'completed' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : enrollment.paymentStatus === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {enrollment.paymentStatus === 'completed' ? '💳 Paid' : 
                                                         enrollment.paymentStatus === 'pending' ? '⏳ Payment Pending' : 
                                                         '❌ Payment Failed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        {enrollment.progress && (
                                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm font-bold text-primary">
                                                        {enrollment.progress.completedSessions || 0} / {enrollment.progress.totalSessions || 0} sessions
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ 
                                                            width: `${enrollment.progress.progressPercentage || 0}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {enrollment.progress.progressPercentage || 0}% complete
                                                </p>
                                            </div>
                                        )}

                                        {/* Program Details */}
                                        {enrollment.program?.description && (
                                            <div className="mb-4">
                                                <p className="text-text-body text-sm">
                                                    <span className="font-medium">Description:</span> {enrollment.program.description.substring(0, 100)}
                                                    {enrollment.program.description.length > 100 && '...'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Goals and Experience */}
                                        {(enrollment.goals || enrollment.experience) && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                                {enrollment.goals && (
                                                    <p className="text-text-body text-sm mb-1">
                                                        <span className="font-medium">Goals:</span> {enrollment.goals}
                                                    </p>
                                                )}
                                                {enrollment.experience && (
                                                    <p className="text-text-body text-sm">
                                                        <span className="font-medium">Experience:</span> {enrollment.experience}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                            {enrollment.status === 'active' && (
                                                <>
                                                    <button
                                                        onClick={() => handleBookSession(enrollment)}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                                    >
                                                        📅 Book Session
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewSessions(enrollment)}
                                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                                    >
                                                        📋 My Sessions
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewCalendar(enrollment)}
                                                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                                    >
                                                        📊 Calendar
                                                    </button>
                                                </>
                                            )}
                                            
                                            {enrollment.status === 'pending' && enrollment.paymentStatus === 'pending' && (
                                                <button
                                                    onClick={() => navigate('/payment', { 
                                                        state: { 
                                                            enrollment: enrollment,
                                                            program: enrollment.program,
                                                            amount: enrollment.program?.fee,
                                                            type: 'enrollment'
                                                        } 
                                                    })}
                                                    className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                                                >
                                                    💳 Complete Payment
                                                </button>
                                            )}

                                            {enrollment.status === 'completed' && (
                                                <div className="flex items-center text-green-600 text-sm font-medium">
                                                    🎓 Program Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-6">🏏</div>
                            <h4 className="text-xl font-semibold text-gray-700 mb-2">No Enrollments Yet</h4>
                            <p className="text-text-body mb-6">You haven't enrolled in any programs yet. Start your coaching journey today!</p>
                            <Link 
                                to="/programs" 
                                className="inline-block bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary-hover transition-colors"
                            >
                                Browse Available Programs
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Session Booking Modal */}
            {showBookingModal && selectedEnrollment && (
                <SessionBooking
                    enrollment={selectedEnrollment}
                    onClose={closeModals}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}

            {/* Session Manager Modal */}
            {showSessionManager && selectedEnrollment && (
                <SessionManager
                    enrollment={selectedEnrollment}
                    onClose={closeModals}
                />
            )}

            {/* Session Calendar Modal */}
            {showSessionCalendar && selectedEnrollment && (
                <SessionCalendar
                    enrollment={selectedEnrollment}
                    onClose={closeModals}
                />
            )}

            {/* Payment Enrollment Modal */}
            {showPaymentEnrollment && paymentEnrollmentData && (
                <PaymentEnrollment
                    enrollment={paymentEnrollmentData.enrollment}
                    program={paymentEnrollmentData.program}
                    onClose={handlePaymentEnrollmentComplete}
                />
            )}
        </div>
    );
    } catch (error) {
        console.error('Profile component error:', error);
        return <FallbackComponent />;
    }
}
