import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MyProfile from './MyProfile';
import RequestLeave from './RequestLeave';
import ReportConflict from './ReportConflict';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeDashboard = () => {
    const [activeTab, setActiveTab] = useState('My Profile');
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans selection:bg-red-500 selection:text-white">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar">
                <header className="px-10 py-8 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-2xl z-30 border-b border-gray-100 shadow-sm">
                    <div>
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={activeTab}
                            className="text-3xl font-black text-blue-900 tracking-tight leading-none"
                        >
                            {activeTab}
                        </motion.h2>
                        <p className="text-sm text-blue-500 font-bold mt-2 tracking-widest uppercase">ApexIT Employee Portal</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-600 border border-blue-500 rounded-2xl flex items-center justify-center text-white hover:to-blue-500 transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 overflow-hidden"
                            >
                                {(user?.avatar || user?.image) ? (
                                    <img src={user?.avatar || user?.image} alt="avatar" className="w-12 h-12 rounded-2xl object-cover" />
                                ) : (
                                    <span className="font-bold text-sm tracking-widest">{user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}</span>
                                )}
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-5 w-60 bg-white rounded-[2rem] shadow-[0_10px_40px_-5px_rgba(30,58,138,0.2)] border border-gray-100 py-3 z-50 overflow-hidden"
                                    >
                                        <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50">
                                            <p className="text-base font-black text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-xs font-bold text-blue-500 mt-1 truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <button 
                                                onClick={() => { setActiveTab('My Profile'); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-4 py-4 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-bold transition-colors cursor-pointer text-left rounded-xl"
                                            >
                                                <Settings className="w-5 h-5" />
                                                <span>Settings & Profile</span>
                                            </button>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-4 px-4 py-4 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 font-bold transition-colors cursor-pointer text-left rounded-xl"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="px-10 py-10 space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        key={activeTab}
                    >
                        {activeTab === 'My Profile' ? (
                            <MyProfile onUserUpdated={setUser} />
                        ) : activeTab === 'Request Leave' ? (
                            <RequestLeave />
                        ) : (
                            <ReportConflict />
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
