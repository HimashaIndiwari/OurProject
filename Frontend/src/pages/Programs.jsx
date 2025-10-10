import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchPrograms();
    
    // Listen for coach updates from other pages
    const handleCoachUpdate = () => {
      fetchPrograms();
    };
    
    window.addEventListener('coachUpdated', handleCoachUpdate);
    
    return () => {
      window.removeEventListener('coachUpdated', handleCoachUpdate);
    };
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/programs');
      
      if (response.data.success) {
        setPrograms(response.data.data.docs || []);
      } else {
        setError('Failed to load programs');
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(err.response?.data?.message || 'Failed to load programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      console.log('Scrolling left...');
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      console.log('Scrolling right...');
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
      };
    }
  }, [programs]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* CSS for Wave Animation */}
        <style jsx>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
            25% { transform: translateX(5px) translateY(-10px) rotate(1deg); }
            50% { transform: translateX(10px) translateY(-5px) rotate(0deg); }
            75% { transform: translateX(5px) translateY(-15px) rotate(-1deg); }
          }
        `}</style>
        
        {/* Animated Wave Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-r from-blue-200 to-blue-300 opacity-60" 
               style={{
                 clipPath: 'polygon(0% 100%, 0% 0%, 25% 20%, 50% 0%, 75% 30%, 100% 0%, 100% 100%)',
                 animation: 'wave 8s ease-in-out infinite'
               }}></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading programs...</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* CSS for Wave Animation */}
        <style jsx>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
            25% { transform: translateX(5px) translateY(-10px) rotate(1deg); }
            50% { transform: translateX(10px) translateY(-5px) rotate(0deg); }
            75% { transform: translateX(5px) translateY(-15px) rotate(-1deg); }
          }
        `}</style>
        
        {/* Animated Wave Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-r from-blue-200 to-blue-300 opacity-60" 
               style={{
                 clipPath: 'polygon(0% 100%, 0% 0%, 25% 20%, 50% 0%, 75% 30%, 100% 0%, 100% 100%)',
                 animation: 'wave 8s ease-in-out infinite'
               }}></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Programs</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchPrograms}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* CSS for Wave Animation */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(5px) translateY(-10px) rotate(1deg); }
          50% { transform: translateX(10px) translateY(-5px) rotate(0deg); }
          75% { transform: translateX(5px) translateY(-15px) rotate(-1deg); }
        }
      `}</style>
      
      {/* Animated Wave Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100">
        {/* Wave 1 */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-r from-blue-200 to-blue-300 opacity-60" 
             style={{
               clipPath: 'polygon(0% 100%, 0% 0%, 25% 20%, 50% 0%, 75% 30%, 100% 0%, 100% 100%)',
               animation: 'wave 8s ease-in-out infinite'
             }}></div>
        
        {/* Wave 2 */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-r from-blue-300 to-blue-400 opacity-50" 
             style={{
               clipPath: 'polygon(0% 100%, 0% 0%, 30% 15%, 60% 0%, 80% 25%, 100% 0%, 100% 100%)',
               animation: 'wave 6s ease-in-out infinite reverse'
             }}></div>
        
        {/* Wave 3 */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-blue-400 to-blue-500 opacity-40" 
             style={{
               clipPath: 'polygon(0% 100%, 0% 0%, 20% 10%, 40% 0%, 60% 20%, 80% 0%, 100% 15%, 100% 100%)',
               animation: 'wave 10s ease-in-out infinite'
             }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-3 h-3 bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-50 animate-pulse delay-2000"></div>
        <div className="absolute top-60 right-1/3 w-5 h-5 bg-blue-200 rounded-full opacity-25 animate-pulse delay-500"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        {/* Page Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Coaching Programs</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our comprehensive coaching programs designed to help you improve your cricket skills
              </p>
            </div>
          </div>
        </div>

      {/* Programs Horizontal Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏏</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Programs Available</h3>
            <p className="text-gray-600">Check back later for new coaching programs.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                canScrollLeft 
                  ? 'text-blue-600 hover:text-blue-700 hover:scale-110' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                canScrollRight 
                  ? 'text-blue-600 hover:text-blue-700 hover:scale-110' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Horizontal Scroll Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {programs.map((program) => (
                <div key={program._id} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-105 border border-blue-100 flex-shrink-0 w-80">
                {/* Blue Gradient Header */}
                <div className="relative h-40 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 overflow-hidden">
                  {/* Subtle Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                  
                  {/* Cricket Bat Silhouette */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30">
                    <div className="w-16 h-2 bg-white/40 rounded-full transform rotate-12"></div>
                    <div className="w-2 h-12 bg-white/40 rounded-full ml-6 -mt-2"></div>
                  </div>
                  
                  {/* Target Circles */}
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                    <div className="w-12 h-12 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/40 rounded-full"></div>
                  </div>
                  
                  {/* Header Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-1">
                        {program.category || 'PROGRAM'}
                      </p>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                        {program.title}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* White Content Section */}
                <div className="p-6 bg-white">
                  {/* Coach Information */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 border-2 border-blue-200">
                      <span className="text-white text-lg font-bold">
                        {program.coach?.userId?.firstName?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-600 text-xs uppercase tracking-wider font-medium">COACH</p>
                      <p className="text-gray-900 text-lg font-bold">
                        {program.coach?.userId?.firstName} {program.coach?.userId?.lastName}
                      </p>
                    </div>
                    {program.category && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {program.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Program Details */}
                  <div className="flex items-center justify-between mb-6">
                    {program.duration && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm">⏱️</span>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase">Duration</p>
                          <p className="text-gray-900 font-bold">{program.duration} Weeks</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="w-px h-12 bg-gray-200"></div>
                    
                    {program.fee && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 text-sm">💰</span>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase">Price</p>
                          <p className="text-gray-900 font-bold">LKR {program.fee}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {program.description || 'Sharpen your skills with expert guidance in this intensive coaching program.'}
                  </p>
                  
                  {/* See More Button */}
                  <Link
                    to={`/programs/${program._id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">See Program Details</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                  </Link>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}
      </div>
        
        <Footer />
      </div>
    </div>
  );
}
