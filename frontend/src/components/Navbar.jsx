import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, LogOut, Hexagon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dashboardLink = user?.role === 'HR Manager' ? '/hr-dashboard' : '/employee-dashboard';

    return (
        <nav className="flex items-center justify-between px-8 py-5 bg-white/90 backdrop-blur-md border-b border-blue-50 sticky top-0 z-50">
            <div className="flex items-center gap-10">
                <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                    <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                        <Hexagon className="w-7 h-7 fill-blue-600 stroke-blue-600 group-hover:fill-red-500 group-hover:stroke-red-500 transition-colors duration-300" />
                    </motion.div>
                    <span className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center">
                        Apex<span className="font-light text-red-500">IT</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-bold uppercase tracking-widest">
                    <a href="/#openings" className="hover:text-blue-600 transition-colors">Careers</a>
                    <a href="/#culture" className="hover:text-blue-600 transition-colors">Culture</a>
                    <a href="/#contact" className="hover:text-blue-600 transition-colors">Contact</a>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors shadow-sm cursor-pointer border border-blue-100"
                            >
                                {(user?.avatar || user?.image) ? (
                                    <img
                                        src={user?.avatar || user?.image}
                                        alt="Profile"
                                        className="w-11 h-11 rounded-2xl object-cover"
                                    />
                                ) : (
                                    <span className="font-bold text-sm tracking-widest">{user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}</span>
                                )}
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-60 bg-white rounded-[1.5rem] shadow-[0_10px_40px_-5px_rgba(30,58,138,0.2)] border border-blue-50 py-2 z-50 overflow-hidden transform origin-top-right transition-all"
                                    >
                                        <div className="px-5 py-4 border-b border-gray-50 bg-slate-50/50">
                                            <p className="text-sm font-black text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs font-bold text-blue-500 truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link 
                                                to={dashboardLink}
                                                className="flex items-center gap-3 px-4 py-3.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-bold transition-colors cursor-pointer rounded-xl"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>My Dashboard</span>
                                            </Link>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 font-bold transition-colors cursor-pointer text-left rounded-xl"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-7 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
