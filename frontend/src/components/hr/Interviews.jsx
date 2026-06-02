import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getAuthHeaders } from '../../config/api';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        candidateId: '',
        jobId: '',
        type: 'Online',
        scheduledDate: '',
        status: 'Scheduled',
        result: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const authConfig = { headers: getAuthHeaders() };
            const [interviewsRes, candidatesRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/api/interviews`, authConfig),
                axios.get(`${API_BASE_URL}/api/candidates`)
            ]);

            if (interviewsRes.status === 'fulfilled' && Array.isArray(interviewsRes.value.data)) {
                setInterviews(interviewsRes.value.data);
            } else {
                setInterviews([]);
                setErrorMsg('Could not load interviews. Please log in again as HR Manager.');
            }

            const candidatesData = candidatesRes.status === 'fulfilled' && Array.isArray(candidatesRes.value.data)
                ? candidatesRes.value.data
                : [];

            setCandidates(candidatesData);

            if (candidatesRes.status !== 'fulfilled') {
                setErrorMsg((prev) => prev || 'Could not load candidates list.');
            }

            const preselectedId = localStorage.getItem('scheduleCandidateId');
            if (preselectedId && candidatesData.length > 0) {
                const cand = candidatesData.find(c => c._id === preselectedId);
                if (cand) {
                    setIsEditing(false);
                    setCurrentId(null);
                    setFormData({
                        candidateId: cand._id,
                        jobId: cand.jobId?._id || cand.jobId || '',
                        type: 'Online',
                        scheduledDate: '',
                        status: 'Scheduled',
                        result: '',
                        notes: ''
                    });
                    setShowModal(true);
                }
                localStorage.removeItem('scheduleCandidateId');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        if (e.target.name === 'candidateId') {
            const selectedCand = candidates.find(c => c._id === e.target.value);
            setFormData({ 
                ...formData, 
                candidateId: e.target.value,
                jobId: selectedCand?.jobId?._id || selectedCand?.jobId || ''
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const openCreateModal = () => {
        setSubmitError('');
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            candidateId: '',
            jobId: '',
            type: 'Online',
            scheduledDate: '',
            status: 'Scheduled',
            result: '',
            notes: ''
        });
        setShowModal(true);
    };

    const openEditModal = (interview) => {
        setSubmitError('');
        setIsEditing(true);
        setCurrentId(interview._id);
        
        let formattedDate = '';
        if (interview.scheduledDate) {
            const date = new Date(interview.scheduledDate);
            // Handle timezone offset for local datetime input
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            formattedDate = date.toISOString().slice(0, 16);
        }

        setFormData({
            candidateId: interview.candidateId?._id || '',
            jobId: interview.jobId?._id || '',
            type: interview.type || 'Online',
            scheduledDate: formattedDate,
            status: interview.status || 'Scheduled',
            result: interview.result || '',
            notes: interview.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!formData.candidateId) {
            window.alert('Please select a candidate.');
            return;
        }
        if (!formData.jobId) {
            window.alert('Selected candidate has no linked job offer. Please edit the candidate and assign a job first.');
            return;
        }
        try {
            setSaving(true);
            const authConfig = { headers: getAuthHeaders() };
            if (isEditing) {
                const res = await axios.put(`${API_BASE_URL}/api/interviews/${currentId}`, formData, authConfig);
                setInterviews(interviews.map(inv => inv._id === currentId ? res.data : inv));
            } else {
                const res = await axios.post(`${API_BASE_URL}/api/interviews`, formData, authConfig);
                setInterviews([res.data, ...interviews]);
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving interview:', error);
            const status = error?.response?.status;
            const backendMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.error;

            if (status === 401 || status === 403) {
                setSubmitError('Your session expired or you are not authorized. Please log in again as HR Manager.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => navigate('/login'), 800);
                return;
            }

            setSubmitError(backendMsg || 'Failed to schedule interview. Please check candidate/job/date and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this interview?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/interviews/${id}`, { headers: getAuthHeaders() });
                setInterviews(interviews.filter(inv => inv._id !== id));
            } catch (error) {
                console.error('Error deleting interview:', error);
            }
        }
    };

    if (loading) return <div className="text-center py-10 font-bold text-gray-500">Loading interviews...</div>;

    return (
        <div className="space-y-6">
            {errorMsg && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm font-semibold">
                    {errorMsg}
                </div>
            )}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-blue-900 tracking-tight">Interview Management</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">Schedule and track candidate interviews</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-gray-200"
                >
                    <Plus className="w-5 h-5" />
                    Schedule Interview
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Job Offer</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {interviews.map((interview) => (
                            <tr key={interview._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-semibold text-blue-900">
                                    {interview.candidateId ? `${interview.candidateId.firstName || ''} ${interview.candidateId.lastName || ''}` : 'Unknown Candidate'}
                                </td>
                                <td className="p-4 text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={interview.jobId?.title}>
                                    {interview.jobId ? interview.jobId.title : 'Unknown Job'}
                                </td>
                                <td className="p-4 text-gray-600 font-medium">
                                    {new Date(interview.scheduledDate).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <span className="px-3 py-1 bg-gray-100 text-blue-900 rounded-full text-xs font-bold w-fit">
                                            {interview.type}
                                        </span>
                                        {interview.meetingLink && (
                                            <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-wider text-blue-900 hover:text-gray-800 transition-colors bg-gray-50 px-2 py-0.5 rounded-md border border-purple-100">
                                                Join Meet &rarr;
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        interview.status === 'Scheduled' ? 'bg-gray-100 text-blue-900' : 
                                        interview.status === 'Done' ? 'bg-green-100 text-green-700' : 
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {interview.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => navigate('/interview-chat/' + interview._id)} 
                                        className="bg-gray-100 hover:bg-purple-200 text-blue-900 text-xs px-3 py-1.5 rounded-lg mr-3 transition-all font-bold"
                                    >
                                        AI Chat
                                    </button>
                                    <button onClick={() => openEditModal(interview)} className="text-gray-400 hover:text-blue-900 mr-3 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(interview._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {interviews.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 font-semibold">
                                    No interviews scheduled yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-600/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-black text-blue-900">{isEditing ? 'Edit Interview' : 'Schedule Interview'}</h3>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                                        {submitError}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Candidate</label>
                                    <select 
                                        name="candidateId" 
                                        value={formData.candidateId} 
                                        onChange={handleInputChange} 
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
                                    >
                                        <option value="">Select a Candidate</option>
                                        {candidates.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.firstName} {c.lastName}{c.jobId?.title ? ` - ${c.jobId.title}` : ' - No job assigned'}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Interview Type</label>
                                        <select 
                                            name="type" 
                                            value={formData.type} 
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
                                        >
                                            <option value="Online">Online</option>
                                            <option value="In-person">In-person</option>
                                            <option value="Phone">Phone</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                        <select 
                                            name="status" 
                                            value={formData.status} 
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Done">Done</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="scheduledDate" 
                                        value={formData.scheduledDate} 
                                        onChange={handleInputChange} 
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                                    <textarea 
                                        name="notes" 
                                        value={formData.notes} 
                                        onChange={handleInputChange} 
                                        rows="2"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Interviews;
