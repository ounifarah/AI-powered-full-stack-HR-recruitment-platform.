import React, { useState } from 'react';
import { X,  Plus, Edit2, Trash2 } from 'lucide-react';

const JobCreationModal = ({ showJobModal, setShowJobModal, newJob, setNewJob, handleCreateJob, handleUpdateJob, isEditing, handleDeleteJob }) => {
    const [error, setError] = useState('');
    if (!showJobModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={() => setShowJobModal(false)}
                    className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-700 transition-all font-bold"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                    {isEditing ? <Edit2 className="w-6 h-6 text-[#6e59c5] font-bold" /> : <Plus className="w-6 h-6 text-[#6e59c5] font-bold" />}
                    <h3 className="text-2xl font-bold text-blue-900">{isEditing ? "Update Job Offer" : "Create Job Offer"}</h3>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                        {error}
                    </div>
                )}
                <form onSubmit={async (e) => {
                    setError('');
                    try {
                        if (isEditing) {
                            await handleUpdateJob(e);
                        } else {
                            await handleCreateJob(e);
                        }
                    } catch (err) {
                        setError(isEditing ? 'Failed to update job.' : 'Failed to create job.');
                    }
                }} className="space-y-5">

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                            <input
                                type="text" required
                                value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700"
                                placeholder="Ex: Full Stack Developer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Contract Type *</label>
                            <select
                                value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700 bg-white"
                            >
                                <option value="FULL-TIME">Permanent</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="PART-TIME">Part-Time</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Job Status</label>
                                <select
                                    value={newJob.status || 'Ouvert'} onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700 bg-white"
                                >
                                    <option value="Ouvert">Open</option>
                                    <option value="Fermé">Closed</option>
                                    <option value="En révision">Under Review</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                            <input
                                type="text"
                                value={newJob.department || ''}
                                onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700"
                                placeholder="Ex: Technical, Sales, HR..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                            <input
                                type="text" required
                                value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700"
                                placeholder="Ex: Tunis"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Salary</label>
                        <input
                            type="text"
                            value={newJob.salary || ''}
                            onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700"
                            placeholder="Ex: 2000-2500DT"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Job Description *</label>
                        <textarea
                            required
                            rows="4"
                            value={newJob.description || ''}
                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700 resize-none"
                            placeholder="Describe the job and responsibilities..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Requirements</label>
                        <textarea
                            rows="3"
                            value={newJob.requirements || ''}
                            onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6e59c5] focus:ring-1 focus:ring-[#6e59c5] transition-all text-sm text-gray-700 resize-none"
                            placeholder="List the necessary skills..."
                        ></textarea>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-between items-center sm:items-stretch">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-gray-200"
                            >
                                {isEditing ? "Update" : "Publish"}
                            </button>
                            <button
                                type="button" onClick={() => setShowJobModal(false)}
                                className="flex-1 sm:flex-none px-8 py-3.5 rounded-lg font-bold text-sm text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this job offer?')) {
                                        handleDeleteJob(newJob._id); // Assuming we can pass _id in newJob
                                    }
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobCreationModal;
