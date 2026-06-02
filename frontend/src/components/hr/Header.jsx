import React, { useState, useRef, useEffect } from 'react';
import { 
    BarChart3, 
    Briefcase,
    LayoutDashboard,
    Users,
    Calendar,
    UserCheck,
    AlertTriangle,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ activeTab, setActiveTab, handleLogout }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const getIcon = () => {
        switch (activeTab) {
            case 'Overview': return <BarChart3 className="w-6 h-6" />;
            case 'Job Offers': return <Briefcase className="w-6 h-6" />;
            case 'Candidates': return <Users className="w-6 h-6" />;
            case 'Interviews': return <Calendar className="w-6 h-6" />;
            case 'Employees': return <UserCheck className="w-6 h-6" />;
            case 'Conflicts': return <AlertTriangle className="w-6 h-6" />;
            case 'My Profile': return <User className="w-6 h-6" />;
            default: return <LayoutDashboard className="w-6 h-6" />;
        }
    };

    return (
        <header className="px-10 py-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-2xl z-30 font-sans border-b border-blue-50 shadow-sm">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-[1.25rem] flex items-center justify-center text-blue-700 border border-blue-200 shadow-inner">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {getIcon()}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div>
                    <motion.h2 
                        key={`title-${activeTab}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-3xl font-black text-slate-900 tracking-tight"
                    >
                        {activeTab}
                    </motion.h2>
                    <p className="text-xs text-blue-500 font-bold tracking-widest uppercase mt-1 drop-shadow-sm">System Administration</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-14 h-14 bg-gradient-to-r from-blue-700 to-blue-600 rounded-[1.25rem] flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 border border-blue-500"
                    >
                        {(user?.avatar || user?.image) ? (
                            <img
                                src={user?.avatar || user?.image}
                                alt="Profile"
                                className="w-14 h-14 rounded-[1.25rem] object-cover"
                            />
                        ) : (
                            <span className="font-bold tracking-widest">{user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}</span>
                        )}
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-5 w-64 bg-white rounded-3xl shadow-[0_10px_40px_-5px_rgba(30,58,138,0.2)] border border-blue-50 py-3 z-50 overflow-hidden"
                            >
                                <div className="px-6 py-5 border-b border-blue-50/50 bg-slate-50/30">
                                    <p className="text-base font-black text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-sm font-bold text-blue-500 mt-1 truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <button 
                                        onClick={() => { setActiveTab('My Profile'); setDropdownOpen(false); }}
                                        className="w-full flex items-center gap-4 px-4 py-4 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-bold transition-colors cursor-pointer text-left rounded-xl"
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span>System Settings</span>
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
    );
};

export default Header;
