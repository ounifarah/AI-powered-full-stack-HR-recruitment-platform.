import React from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';

const JobPostings = ({ jobs, loading, openCreateModal, openEditModal, refreshJobs, setActiveTab }) => {
    // Delete Job
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/jobs/${id}`);
            if (refreshJobs) refreshJobs();
            else window.location.reload(); 
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    // Update Status
    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/jobs/${id}/status`, { status: newStatus });
            if (refreshJobs) refreshJobs();
            else window.location.reload(); 
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    // Status mapping for visual styling - English
    const getStatusStyle = (status) => {
        const s = (status || 'OPEN').toUpperCase();
        if (s.includes('OPEN') || s.includes('ACTIVE') || s.includes('OUVERT')) {
            return 'bg-green-100 text-green-700 border border-green-200';
        } else if (s.includes('CLOSE') || s.includes('FERMÉ')) {
            return 'bg-red-100 text-red-700 border border-red-200';
        } else if (s.includes('DRAFT') || s.includes('RÉVISION')) {
            return 'bg-gray-100 text-gray-700 border border-gray-200';
        } else if (s.includes('SOON')) {
            return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        }
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    return (
        <div className="bg-white min-h-[calc(100vh-100px)] p-8 rounded-[2rem] font-sans shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-blue-900 text-2xl font-black tracking-tight mb-1">Job Offers</h2>
                    <p className="text-gray-500 font-medium text-sm">Manage job postings and applications.</p>
                </div>
                <button 
                    onClick={() => openCreateModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-sm shadow-gray-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Job Offer
                </button>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="text-gray-400 uppercase text-[11px] font-black tracking-wider border-b border-gray-100">
                            <th className="pb-4 pl-4">Title</th>
                            <th className="pb-4">Department</th>
                            <th className="pb-4">Type</th>
                            <th className="pb-4">Salary</th>
                            <th className="pb-4 max-w-[150px]">Description</th>
                            <th className="pb-4 max-w-[150px]">Requirements</th>
                            <th className="pb-4 text-center">Applications</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading && (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-400 font-bold">Loading job postings...</td>
                            </tr>
                        )}
                        {!loading && jobs.map((job) => (
                            <tr key={job._id} className="text-blue-900 hover:bg-gray-50/50 transition-colors group">
                                <td className="py-5 pl-4 font-bold text-[15px] group-hover:text-blue-900 transition-colors">{job.title}</td>
                                <td className="py-5 font-semibold text-gray-600">{job.department || 'Technical'}</td>
                                <td className="py-5 font-semibold text-gray-600 capitalize">
                                    {(job.type || 'Full-time').toLowerCase().replace('-', ' ')}
                                </td>
                                <td className="py-5 font-semibold text-gray-600 text-xs">{job.salary || '-'}</td>
                                <td className="py-5 text-gray-500 text-xs truncate max-w-[150px]">{job.description || '-'}</td>
                                <td className="py-5 text-gray-500 text-xs truncate max-w-[150px]">{job.requirements || '-'}</td>
                                <td className="py-5 text-center">
                                    <button 
                                        onClick={() => setActiveTab('Candidates')}
                                        className="bg-gray-50 hover:bg-gray-100 text-blue-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                        {job.candidatesCount || 0} apps
                                    </button>
                                </td>
                                <td className="py-5">
                                    <select 
                                        value={job.status || 'Open'}
                                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                                        className={`font-black uppercase tracking-wider text-[10px] px-3 py-1.5 rounded-lg outline-none cursor-pointer appearance-none ${getStatusStyle(job.status)}`}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Closing Soon">Closing Soon</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </td>
                                <td className="py-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openEditModal(job)} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(job._id)} className="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-100 text-gray-700 text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && jobs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-500 font-semibold">No jobs found. Create one.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobPostings;
