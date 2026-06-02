import React from 'react';
import { LayoutDashboard, Briefcase, Users, Calendar, UserCheck, AlertTriangle, CalendarDays, Hexagon } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const sidebarItems = [
        { name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Job Offers', icon: <Briefcase className="w-5 h-5" /> },
        { name: 'Candidates', icon: <Users className="w-5 h-5" /> },
        { name: 'Interviews', icon: <Calendar className="w-5 h-5" /> },
        { name: 'Employees', icon: <UserCheck className="w-5 h-5" /> },
        { name: 'Leave Requests', icon: <CalendarDays className="w-5 h-5" /> },
        { name: 'Conflicts', icon: <AlertTriangle className="w-5 h-5" /> },
    ];

    return (
        <aside className="w-[300px] bg-slate-950 border-r border-slate-900 flex flex-col h-screen z-20 font-sans shadow-2xl relative">
            <div className="p-8 pb-4 h-full flex flex-col relative z-10">
                <div className="flex items-center gap-4 mb-12 pb-8 border-b border-slate-800/50">
                    <div className="p-2.5 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 border border-red-500/50">
                        <Hexagon className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white">ApexIT Admin</h1>
                        <p className="text-[10px] text-blue-400 font-bold tracking-widest mt-1 uppercase">Infrastructure & HR</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-grow">
                    {sidebarItems.map((item) => {
                        const isActive = activeTab === item.name || (activeTab === "Offres d'Emploi" && item.name === 'Job Offers') || (activeTab === 'Dashboard' && item.name === 'Overview') || (activeTab === 'Tableau de Bord' && item.name === 'Overview');
                        
                        return (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${isActive
                                        ? 'text-white bg-slate-900/80 shadow-inner'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                    }`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />}
                                <span className={`${isActive ? 'text-red-500' : 'opacity-70 group-hover:text-blue-400 group-hover:opacity-100 transition-colors'}`}>{item.icon}</span>
                                {item.name}
                            </button>
                        );
                    })}
                </nav>
                
                <div className="mt-8 pt-8 border-t border-slate-900 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">
                    ApexIT Systems v3.0
                </div>
            </div>
            
            {/* Background design accent */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
        </aside>
    );
};

export default Sidebar;
