import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    Calendar, 
    UserCheck, 
    Plus, 
    TrendingUp,
    BarChart,
    Zap,
    Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { API_BASE_URL, getAuthHeaders } from '../../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardOverview = ({ jobs, setActiveTab, setShowJobModal }) => {
    const [counts, setCounts] = useState({ candidates: 0, interviews: 0, employees: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const authConfig = { headers: getAuthHeaders() };
                const [candRes, intRes, empRes] = await Promise.allSettled([
                    axios.get(`${API_BASE_URL}/api/candidates`),
                    axios.get(`${API_BASE_URL}/api/interviews`, authConfig),
                    axios.get(`${API_BASE_URL}/api/auth/users?role=Employee`)
                ]);

                const candidatesCount = candRes.status === 'fulfilled' && Array.isArray(candRes.value.data)
                    ? candRes.value.data.length
                    : 0;
                const interviewsCount = intRes.status === 'fulfilled' && Array.isArray(intRes.value.data)
                    ? intRes.value.data.length
                    : 0;
                const employeesCount = empRes.status === 'fulfilled' && Array.isArray(empRes.value.data)
                    ? empRes.value.data.length
                    : 0;

                setCounts({
                    candidates: candidatesCount,
                    interviews: interviewsCount,
                    employees: employeesCount
                });
            } catch (err) {
                console.error("Failed to fetch dashboard counts", err);
            }
        };
        fetchCounts();
    }, []);

    const activeJobsCount = jobs.filter(j => j.status !== 'Closed').length;

    const stats = [
        { label: 'ACTIVE POSTINGS', value: activeJobsCount.toString() || '0', trend: 'Currently open', icon: <Briefcase className="w-6 h-6 text-white" /> },
        { label: 'CANDIDATES', value: counts.candidates.toString(), trend: 'Being processed', icon: <Users className="w-6 h-6 text-white" /> },
        { label: 'INTERVIEWS', value: counts.interviews.toString(), trend: 'Scheduled', icon: <Calendar className="w-6 h-6 text-white" /> },
        { label: 'EMPLOYEES', value: counts.employees.toString(), trend: 'Total workforce', icon: <UserCheck className="w-6 h-6 text-white" /> },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const chartData = {
        labels: ['Job Postings', 'Candidates', 'Interviews', 'Employees'],
        datasets: [
            {
                label: 'Overall Platform Metrics',
                data: [activeJobsCount, counts.candidates, counts.interviews, counts.employees],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // blue-500
                    'rgba(239, 68, 68, 0.8)', // red-500
                    'rgba(37, 99, 235, 0.8)', // blue-600
                    'rgba(220, 38, 38, 0.8)', // red-600
                ],
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 13, family: 'Inter, sans-serif' },
                bodyFont: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
                padding: 12,
                cornerRadius: 12,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(241, 245, 249, 1)', // slate-100
                    drawBorder: false,
                },
                ticks: {
                    font: { family: 'Inter, sans-serif', weight: '600' },
                    color: '#64748b' // slate-500
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: { family: 'Inter, sans-serif', weight: '700' },
                    color: '#334155' // slate-700
                }
            }
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="font-sans">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div variants={itemVariants} key={idx} className="p-8 bg-white rounded-3xl shadow-lg shadow-blue-900/5 border border-blue-50 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-28 h-28 bg-gradient-to-bl from-blue-50 to-transparent rounded-full group-hover:scale-150 transition-transform duration-700 z-0 opacity-50"></div>
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                {stat.label}
                            </p>
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/30 transform group-hover:-rotate-6 group-hover:scale-110 transition-all">
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-5xl font-black text-slate-900 leading-tight mb-3 tracking-tighter relative z-10">{stat.value}</p>
                        <p className="text-xs text-blue-600 font-bold flex items-center gap-2 relative z-10">
                            <TrendingUp className="w-4 h-4 text-red-500" />
                            {stat.trend}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-12">
                {/* Analytics Chart */}
                <motion.div variants={itemVariants} className="col-span-8 bg-white rounded-[2rem] p-10 shadow-lg shadow-blue-900/5 border border-blue-50 min-h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <BarChart className="w-6 h-6 text-blue-600" /> Platform Analytics overview
                        </h3>
                        <div className="inline-flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        </div>
                    </div>
                    <div className="relative flex-1 w-full h-[300px]">
                        <Bar options={chartOptions} data={chartData} />
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="col-span-4 space-y-6">
                    <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden h-full flex flex-col border border-slate-900">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl mix-blend-screen translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl mix-blend-screen -translate-x-1/2 translate-y-1/2"></div>
                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4 mb-10 relative z-10">
                            <Zap className="w-6 h-6 text-yellow-500" /> Admin Controls
                        </h3>
                        <div className="space-y-4 text-center flex-1 flex flex-col justify-center relative z-10">
                            <button 
                                onClick={() => { setActiveTab('Job Offers'); setShowJobModal(true); }}
                                className="w-full flex items-center justify-center gap-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 py-5 px-6 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-red-500/20 active:scale-95 group border border-red-400/50"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                Deploy Job Opening
                            </button>
                            <button 
                                onClick={() => setActiveTab('Candidates')}
                                className="w-full flex items-center justify-center gap-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-blue-200 hover:text-white py-5 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg"
                            >
                                <Users className="w-5 h-5 text-blue-400" /> View Candidates
                            </button>
                            <button 
                                onClick={() => setActiveTab('Interviews')}
                                className="w-full flex items-center justify-center gap-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-blue-200 hover:text-white py-5 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg"
                            >
                                <Calendar className="w-5 h-5 text-blue-400" /> Schedule Technical Review
                            </button>
                            <button 
                                onClick={() => setActiveTab('Employees')}
                                className="w-full flex items-center justify-center gap-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-blue-200 hover:text-white py-5 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg"
                            >
                                <UserCheck className="w-5 h-5 text-blue-400" /> View Employee
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardOverview;
