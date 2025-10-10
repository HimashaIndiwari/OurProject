import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterCoach, setFilterCoach] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Coach profile modal
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showCoachModal, setShowCoachModal] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchCoaches();
    
    // Listen for coach updates from other pages
    const handleCoachUpdate = () => {
      fetchPrograms();
      fetchCoaches();
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
        const programsData = response.data.data.docs || [];
        setPrograms(programsData);
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

  const fetchCoaches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/coaches');
      
      if (response.data.success) {
        setCoaches(response.data.data.docs || []);
      }
    } catch (err) {
      console.error('Error fetching coaches:', err);
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

  // Filter programs based on search and filters
  const filteredPrograms = programs.filter(program => {
    // Ensure all fields exist with fallbacks
    const title = program.title || '';
    const description = program.description || '';
    const category = program.category || '';
    const difficulty = program.difficulty || '';
    const fee = program.fee || 0;
    const duration = program.duration || 0;
    const coachName = program.coach?.userId ? 
      `${program.coach.userId.firstName} ${program.coach.userId.lastName}` : '';
    
    // Search filter
    const matchesSearch = !searchTerm || 
                         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coachName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !filterCategory || category === filterCategory;
    
    // Difficulty filter
    const matchesDifficulty = !filterDifficulty || difficulty === filterDifficulty;
    
    // Price range filter
    const matchesPrice = !filterPriceRange || 
                        (filterPriceRange === 'under-5000' && fee < 5000) ||
                        (filterPriceRange === '5000-10000' && fee >= 5000 && fee <= 10000) ||
                        (filterPriceRange === '10000-20000' && fee >= 10000 && fee <= 20000) ||
                        (filterPriceRange === 'over-20000' && fee > 20000);
    
    // Duration filter
    const matchesDuration = !filterDuration || 
                           (filterDuration === 'short' && duration <= 4) ||
                           (filterDuration === 'medium' && duration > 4 && duration <= 8) ||
                           (filterDuration === 'long' && duration > 8);
    
    // Coach filter
    const matchesCoach = !filterCoach || coachName.toLowerCase().includes(filterCoach.toLowerCase());

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice && matchesDuration && matchesCoach;
  });

  // Get unique values for filter options
  const categories = [...new Set(programs.map(p => p.category))].filter(Boolean);
  const coachNames = [...new Set(programs.map(p => p.coach?.userId ? 
    `${p.coach.userId.firstName} ${p.coach.userId.lastName}` : ''))].filter(Boolean);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterDifficulty('');
    setFilterPriceRange('');
    setFilterDuration('');
    setFilterCoach('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterCategory || filterDifficulty || 
                          filterPriceRange || filterDuration || filterCoach;

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
        <div className="bg-gradient-to-r from-blue-500 via-blue-800 to-blue-500 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Coaching Programs</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Discover our comprehensive coaching programs designed to help you improve your cricket skills
              </p>
            </div>
          </div>
        </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs by title, description, category, or coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
              {hasActiveFilters && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {[searchTerm, filterCategory, filterDifficulty, filterPriceRange, filterDuration, filterCoach].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={filterPriceRange}
                  onChange={(e) => setFilterPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Prices</option>
                  <option value="under-5000">Under LKR 5,000</option>
                  <option value="5000-10000">LKR 5,000 - 10,000</option>
                  <option value="10000-20000">LKR 10,000 - 20,000</option>
                  <option value="over-20000">Over LKR 20,000</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Durations</option>
                  <option value="short">Short (≤4 weeks)</option>
                  <option value="medium">Medium (5-8 weeks)</option>
                    <option value="long">Long (&gt;8 weeks)</option>
                </select>
              </div>

              {/* Coach Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
                <select
                  value={filterCoach}
                  onChange={(e) => setFilterCoach(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Coaches</option>
                  {coachNames.map(coachName => (
                    <option key={coachName} value={coachName}>{coachName}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Filter Results and Clear Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredPrograms.length} of {programs.length} programs
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600 font-medium">
                  (filtered)
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Programs Horizontal Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏏</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {programs.length === 0 ? 'No Programs Available' : 'No Programs Match Your Filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {programs.length === 0 
                ? 'Check back later for new coaching programs.' 
                : 'Try adjusting your search criteria to find programs.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
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
              {filteredPrograms.map((program) => (
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 border-2 border-blue-200 overflow-hidden">
                      {program.coach?.profileImage ? (
                        <img 
                          src={`http://localhost:5000${program.coach.profileImage}`} 
                          alt={`${program.coach?.userId?.firstName} ${program.coach?.userId?.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {program.coach?.userId?.firstName?.charAt(0) || 'C'}
                        </span>
                      )}
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

      {/* Coaches Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Expert Coaches</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our experienced coaches bring years of expertise to help you improve your cricket skills
          </p>
        </div>

        {coaches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Coaches Available</h3>
            <p className="text-gray-600">Check back later for our coaching team.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {coaches.map((coach) => (
              <div 
                key={coach._id} 
                className="group cursor-pointer flex flex-col items-center text-center hover:scale-105 transition-all duration-300"
                onClick={() => {
                  setSelectedCoach(coach);
                  setShowCoachModal(true);
                }}
              >
                {/* Coach Photo/Avatar */}
                <div className="relative w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    {/* Coach Photo or Initial */}
                    {coach.profileImage ? (
                      <img 
                        src={`http://localhost:5000${coach.profileImage}`} 
                        alt={`${coach.userId?.firstName} ${coach.userId?.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {coach.userId?.firstName?.charAt(0) || 'C'}
                      </span>
                    )}
                  </div>
                  
                  {/* Cricket Ball Decoration */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-blue-600 text-sm">🏏</span>
                  </div>
                </div>

                {/* Coach Name */}
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {coach.userId?.firstName} {coach.userId?.lastName}
                </h3>
                
                {/* Coach Title */}
                <p className="text-sm text-gray-600 mt-1">
                  Cricket Coach
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coach Profile Modal */}
      {showCoachModal && selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <button
                onClick={() => setShowCoachModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-4">
                {/* Coach Avatar */}
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 overflow-hidden">
                  {selectedCoach.profileImage ? (
                    <img 
                      src={`http://localhost:5000${selectedCoach.profileImage}`} 
                      alt={`${selectedCoach.userId?.firstName} ${selectedCoach.userId?.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {selectedCoach.userId?.firstName?.charAt(0) || 'C'}
                    </span>
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCoach.userId?.firstName} {selectedCoach.userId?.lastName}
                  </h2>
                  <p className="text-blue-200">Cricket Coach</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Specializations */}
              {selectedCoach.specializations && selectedCoach.specializations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoach.specializations.map((spec, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedCoach.experience && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
                  <div className="flex items-center text-gray-700">
                    <span className="text-blue-600 mr-2">⭐</span>
                    <span>{selectedCoach.experience} years of coaching experience</span>
                  </div>
                </div>
              )}

              {/* Programs */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Programs</h3>
                <div className="space-y-2">
                  {programs.filter(p => p.coach && p.coach._id === selectedCoach._id).map(program => (
                    <div key={program._id} className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900">{program.title}</h4>
                      <p className="text-sm text-gray-600">{program.category} • {program.duration} weeks</p>
                    </div>
                  ))}
                  {programs.filter(p => p.coach && p.coach._id === selectedCoach._id).length === 0 && (
                    <p className="text-gray-500 italic">No programs assigned yet</p>
                  )}
                </div>
              </div>

              {/* Contact Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCoachModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Coach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        
        <Footer />
      </div>
    </div>
  );
}
