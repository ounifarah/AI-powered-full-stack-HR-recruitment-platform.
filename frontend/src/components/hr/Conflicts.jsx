import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search,
    CheckCircle2,
    Clock,
    MoreVertical,
    User
} from 'lucide-react';

const Conflicts = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/reports');
            setReports(res.data);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        } finally {
            setLoading(false);
        }
    };

    const updateReportStatus = async (id, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5001/api/reports/${id}`, { status: newStatus });
            // Update local state without re-fetching everything
            setReports(reports.map(report => 
                report._id === id ? { ...report, status: newStatus } : report
            ));

            const emailSent = !!res.data?.emailSent;
            const emailMessage = res.data?.emailMessage || 'Status updated.';
            setMessage({
                type: emailSent ? 'success' : 'warning',
                text: emailMessage
            });
        } catch (err) {
            console.error('Failed to update report status', err);
            setMessage({ type: 'error', text: 'Failed to update report status.' });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved':
                return 'bg-green-50 text-green-600 border-green-100';
            case 'In Progress':
                return 'bg-gray-50 text-blue-950 border-blue-100';
            default:
                return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = 
            report.reportedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportedBy?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.issueType?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'All' || report.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="font-sans">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Reported Conflicts</h2>
                    <p className="text-gray-500 font-semibold mt-2">Manage and resolve workplace issues securely.</p>
                </div>
                <div className="flex gap-4">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-gray-100 rounded-2xl px-6 py-3.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 shadow-sm transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search reports..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-semibold w-72 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-8">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : message.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {message.text}
                    </div>
                )}
                {loading ? (
                    <div className="text-center py-16 text-gray-400 font-bold">Loading reports...</div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">No conflicts found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredReports.map((report) => (
                            <div key={report._id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-blue-900">
                                                {report.reportedBy ? `${report.reportedBy.firstName} ${report.reportedBy.lastName}` : 'Unknown Employee'}
                                            </h4>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
                                                {report.issueType}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider ${getStatusStyle(report.status)}`}>
                                            {report.status}
                                        </span>
                                        
                                        <div className="relative group">
                                            <button className="p-2 text-gray-400 hover:text-blue-900 rounded-lg hover:bg-gray-50 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                                                <button onClick={() => updateReportStatus(report._id, 'Pending')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Mark as Pending</button>
                                                <button onClick={() => updateReportStatus(report._id, 'In Progress')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-950 transition-colors border-t border-gray-50">Mark as In Progress</button>
                                                <button onClick={() => updateReportStatus(report._id, 'Resolved')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors border-t border-gray-50">Mark as Resolved</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-5 mb-4">
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{report.description}</p>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {new Date(report.createdAt).toLocaleString()}
                                    </div>
                                    {report.partiesInvolved && (
                                        <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg">
                                            <span className="text-gray-500 uppercase tracking-wider text-[10px] mr-2">Parties:</span>
                                            <span className="text-gray-700">{report.partiesInvolved}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Conflicts;
