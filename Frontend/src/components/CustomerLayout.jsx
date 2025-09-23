import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

// Icon Components
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default function CustomerLayout() {
    const [showSidebar, setShowSidebar] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            // Only remove the authentication token, keep cached data for offline viewing
            localStorage.removeItem('userInfo');
            // Note: We keep 'cachedUserProfile' and 'cachedUserEnrollments' for offline viewing
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar Overlay */}
            {showSidebar && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-screen w-64 bg-surface shadow-xl transform transition-transform duration-300 z-40 ${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:flex-shrink-0`}>
                <div className="p-4 flex flex-col h-full">
                    <div className="mb-8 text-center">
                        <img 
                            src={userInfo?.profileImageURL ? `http://localhost:5000${userInfo.profileImageURL}` : `https://placehold.co/100x100/42ADF5/FFFFFF?text=${userInfo?.username?.charAt(0).toUpperCase()}`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-secondary"
                        />
                        <h2 className="text-lg font-bold text-primary">Hello, {userInfo?.username}!</h2>
                        <p className="text-sm text-text-body capitalize">{userInfo?.role.replace('_', ' ')}</p>
                    </div>

                    <nav className="space-y-2 flex-grow">
                        <Link to="/customer/profile" className="flex items-center px-4 py-3 rounded-lg font-medium text-text-body hover:bg-secondary hover:text-white transition-colors">
                           <UserCircleIcon /> My Account
                        </Link>
                         <Link to="/customer/edit-account" className="flex items-center px-4 py-3 rounded-lg font-medium text-text-body hover:bg-secondary hover:text-white transition-colors">
                           <CogIcon /> Edit Account
                        </Link>
                         <a href="/customer/my-orders" className="flex items-center px-4 py-3 rounded-lg font-medium text-text-body hover:bg-secondary hover:text-white transition-colors">
                           <ClipboardListIcon /> My Orders
                        </a>
                         <a href="#" className="flex items-center px-4 py-3 rounded-lg font-medium text-text-body hover:bg-secondary hover:text-white transition-colors">
                           <BellIcon /> Notifications
                        </a>
                    </nav>

                    <div className="mt-auto">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium text-red-500 bg-red-100 hover:bg-red-200 transition-colors">
                           <LogoutIcon /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64">
                 <header className="p-4 bg-surface shadow-md lg:hidden sticky top-0 z-20">
                    <button onClick={() => setShowSidebar(true)}>
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </header>
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
