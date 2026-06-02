import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Edit, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Candidates = ({ setActiveTab }) => {
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    // Form state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', jobId: '', cv: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCandidates();
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/candidates');
            setCandidates(res.data);
        } catch (err) {
            console.error('Failed to fetch candidates', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this candidate?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/candidates/${id}`);
            setCandidates(candidates.filter(c => c._id !== id));
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5001/api/candidates/${id}`, { status: newStatus });
            setCandidates(candidates.map(c => c._id === id ? res.data : c));
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleConvertToEmployee = async (candidate) => {
        if (!window.confirm(`Convert ${candidate.firstName} ${candidate.lastName} to employee?`)) return;

        setActionMessage({ type: '', text: '' });
        try {
            const res = await axios.post(`http://localhost:5001/api/candidates/${candidate._id}/convert-to-employee`);
            const msg = res.data?.employeeAlreadyExisted
                ? 'Candidate already had a user account. Marked as converted.'
                : `Converted successfully. Temporary password: ${res.data?.temporaryPassword || 'sent by email'}`;

            setActionMessage({ type: 'success', text: msg });
            fetchCandidates();
        } catch (err) {
            const message = err.response?.data?.msg || err.response?.data?.error || 'Failed to convert candidate to employee.';
            setActionMessage({ type: 'error', text: message });
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ firstName: '', lastName: '', email: '', jobId: '', cv: null });
        setShowModal(true);
    };

    const openEditModal = (candidate) => {
        setIsEditing(true);
        setCurrentId(candidate._id);
        setFormData({
            firstName: candidate.firstName || '',
            lastName: candidate.lastName || '',
            email: candidate.email || '',
            jobId: candidate.jobId?._id || '',
            cv: null
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('email', formData.email);
        data.append('jobId', formData.jobId);
        if (formData.cv) {
            data.append('cv', formData.cv);
        }

        try {
            if (isEditing) {
                const putData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    jobId: formData.jobId
                };
                await axios.put(`http://localhost:5001/api/candidates/${currentId}`, putData);
            } else {
                await axios.post('http://localhost:5001/api/candidates', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            fetchCandidates();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-700 bg-yellow-50';
            case 'Shortlisted': return 'text-blue-900 bg-blue-50';
            case 'Interview Scheduled': return 'text-blue-900 bg-blue-50';
            case 'Rejected': return 'text-red-700 bg-red-50';
            case 'Accepted': return 'text-green-700 bg-green-50';
            default: return 'text-slate-700 bg-slate-50';
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getCandidateImage = (candidate) => {
        const value = candidate?.avatar || candidate?.image || '';
        if (!value || typeof value !== 'string') return '';
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/')) {
            return value;
        }
        return '';
    };

    return (
        <div className="bg-white min-h-[calc(100vh-100px)] p-8 rounded-[2rem] font-sans shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-slate-900 text-2xl font-black tracking-tight">All Candidates</h2>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search candidate..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-50 text-slate-900 text-sm font-semibold rounded-xl pl-10 pr-4 py-2.5 outline-none w-64 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
                        />
                    </div>
                    
                    <button onClick={openCreateModal} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500">
                        <Plus className="w-4 h-4" /> Add Candidate
                    </button>
                </div>
            </div>

            {actionMessage.text && (
                <div className={`mb-5 p-3 rounded-xl text-sm font-bold border ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {actionMessage.text}
                </div>
            )}

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-100">
                            <th className="pb-4 pl-4">Candidate</th>
                            <th className="pb-4">Position</th>
                            <th className="pb-4">Applied</th>
                            <th className="pb-4">AI Score</th>
                            <th className="pb-4">Interview</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading && (
                            <tr>
                                <td colSpan="7" className="text-center py-12 text-slate-400 font-bold">Loading candidates...</td>
                            </tr>
                        )}
                        {!loading && filteredCandidates.map((candidate) => (
                            <tr key={candidate._id} className="text-slate-800 hover:bg-blue-50/30 transition-colors group">
                                <td className="py-5 pl-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm text-white" style={{ backgroundColor: (candidate.firstName || '').length % 2 === 0 ? '#2563eb' : '#dc2626' }}>
                                        {getCandidateImage(candidate) ? (
                                            <img
                                                src={getCandidateImage(candidate)}
                                                alt={`${candidate.firstName || ''} ${candidate.lastName || ''}`.trim()}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            `${candidate.firstName?.charAt(0) || ''}${candidate.lastName?.charAt(0) || ''}`.toUpperCase() || '??'
                                        )}
                                    </div>
                                    <span className="font-bold text-[15px] group-hover:text-blue-700 transition-colors">{`${candidate.firstName || ''} ${candidate.lastName || ''}`.trim()}</span>
                                </td>
                                <td className="py-5 font-semibold text-slate-600">{candidate.jobId?.title || 'Unknown Position'}</td>
                                <td className="py-5 font-semibold text-slate-500">{formatDate(candidate.appliedDate)}</td>
                                <td className="py-5">
                                    <div className="flex items-center gap-3 w-36">
                                        <span className="font-black text-slate-800 w-9">{candidate.aiScore !== null && candidate.aiScore !== undefined ? `${candidate.aiScore}%` : '--'}</span>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${candidate.aiScore > 80 ? 'bg-teal-500' : candidate.aiScore > 50 ? 'bg-amber-500' : candidate.aiScore > 0 ? 'bg-red-500' : 'bg-transparent'}`}
                                                style={{ width: `${candidate.aiScore || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5 font-semibold text-slate-500">{formatDate(candidate.interviewDate)}</td>
                                <td className="py-5">
                                    <select 
                                        value={candidate.status}
                                        onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                                        className={`font-bold px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer border-none appearance-none ${getStatusStyle(candidate.status)}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shortlisted">Shortlisted</option>
                                        <option value="Interview Scheduled">Interview Scheduled</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>
                                <td className="py-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => navigate('/cv-scorer/' + candidate._id)}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-sm border border-slate-200">
                                            AI Report
                                        </button>
                                        <button onClick={() => window.open(`http://localhost:5001${candidate.cvPath}`, '_blank')} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-sm">
                                            View CV
                                        </button>
                                        <button 
                                            onClick={() => {
                                                localStorage.setItem('scheduleCandidateId', candidate._id);
                                                setActiveTab('Interviews');
                                            }}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-sm border border-red-100">
                                            Schedule
                                        </button>
                                        <button onClick={() => openEditModal(candidate)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleConvertToEmployee(candidate)}
                                            disabled={candidate.convertedToEmployee}
                                            className={`text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-sm border ${candidate.convertedToEmployee ? 'bg-green-50 text-green-700 border-green-100 cursor-not-allowed' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'}`}
                                        >
                                            {candidate.convertedToEmployee ? 'Converted' : 'To Employee'}
                                        </button>
                                        <button onClick={() => handleDelete(candidate._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredCandidates.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-12 text-slate-500 font-semibold">No candidates found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative border border-slate-100">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-900">{isEditing ? 'Edit Candidate' : 'Add Candidate'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                    <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})} className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                    <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})} className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Job Application Target</label>
                                <select required value={formData.jobId} onChange={e => setFormData({...formData, jobId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                    <option value="">Select an opening</option>
                                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                                </select>
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">CV File Upload</label>
                                    <input type="file" required accept=".pdf,.doc,.docx" onChange={e => setFormData({...formData, cv: e.target.files[0]})} className="w-full text-sm font-semibold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" />
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Candidate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Candidates;
