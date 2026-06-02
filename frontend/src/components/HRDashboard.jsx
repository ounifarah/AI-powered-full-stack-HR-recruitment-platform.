import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Hammer } from 'lucide-react';

// Sub-components
import Sidebar from './hr/Sidebar';
import Header from './hr/Header';
import DashboardOverview from './hr/DashboardOverview';
import JobPostings from './hr/JobPostings';
import JobCreationModal from './hr/JobCreationModal';
import Candidates from './hr/Candidates';
import Employees from './hr/Employees';
import Conflicts from './hr/Conflicts';
import Interviews from './hr/Interviews';
import LeaveRequests from './hr/LeaveRequests';
import MyProfile from './employee-dashboard/MyProfile';

const HRDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [newJob, setNewJob] = useState({ title: '', type: 'FULL-TIME', department: '', location: '', description: '', salary: '', requirements: '', status: 'Ouvert' });
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    useEffect(() => {
        if (activeTab === 'Job Offers' || activeTab === 'Overview') {
            fetchJobs();
        }
    }, [activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/jobs', newJob);
            setJobs([res.data, ...jobs]);
            setShowJobModal(false);
            setNewJob({ title: '', type: 'FULL-TIME', department: '', location: '', description: '', salary: '', requirements: '' });
        } catch (err) {
            console.error('Failed to create job', err);
            throw err; // Let the modal display the error
        }
    };

    const handleUpdateJob = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5001/api/jobs/${editingJob._id}`, newJob);
            setJobs(jobs.map(j => j._id === editingJob._id ? res.data : j));
            setShowJobModal(false);
            setEditingJob(null);
            setNewJob({ title: '', type: 'FULL-TIME', department: '', location: '', description: '', salary: '', requirements: '', status: 'Ouvert' });
        } catch (err) {
            console.error('Failed to update job', err);
            throw err;
        }
    };

    const openCreateModal = () => {
        setEditingJob(null);
        setNewJob({ title: '', type: 'FULL-TIME', department: '', location: '', description: '', salary: '', requirements: '', status: 'Ouvert' });
        setShowJobModal(true);
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        setNewJob({
            _id: job._id, // Added _id for modal deletion
            title: job.title || '',
            type: job.type || 'FULL-TIME',
            department: job.department || '',
            location: job.location || '',
            description: job.description || '',
            salary: job.salary || '',
            requirements: job.requirements || '',
            status: job.status || 'Ouvert'
        });
        setShowJobModal(true);
    };

    const handleDeleteJobFromModal = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/api/jobs/${id}`);
            setJobs(jobs.filter(j => j._id !== id));
            setShowJobModal(false);
        } catch (err) {
            console.error('Failed to delete job', err);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                handleLogout={handleLogout} 
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar">
                <Header activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

                <div className="px-10 py-10 space-y-10">
                    {activeTab === 'Overview' ? (
                        <DashboardOverview 
                            jobs={jobs} 
                            setActiveTab={setActiveTab} 
                            setShowJobModal={setShowJobModal} 
                        />
                    ) : activeTab === 'Job Offers' ? (
                        <JobPostings 
                            jobs={jobs} 
                            loading={loading} 
                            openCreateModal={openCreateModal}
                            openEditModal={openEditModal}
                            refreshJobs={fetchJobs}
                            setActiveTab={setActiveTab}
                        />
                    ) : activeTab === 'Candidates' ? (
                        <Candidates setActiveTab={setActiveTab} />
                    ) : activeTab === 'Employees' ? (
                        <Employees />
                    ) : activeTab === 'Conflicts' ? (
                        <Conflicts />
                    ) : activeTab === 'Interviews' ? (
                        <Interviews />
                    ) : activeTab === 'Leave Requests' ? (
                        <LeaveRequests />
                    ) : activeTab === 'My Profile' ? (
                        <MyProfile />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                            <div className="w-32 h-32 bg-purple-50 rounded-[2.5rem] flex items-center justify-center text-[#8b5cf6]">
                                <Hammer className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-blue-900 tracking-tight leading-none mb-4 uppercase">{activeTab}</h3>
                                <p className="text-gray-400 font-bold tracking-wide italic">This section is currently under development.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('Overview')}
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-purple-200 active:scale-95 transition-all"
                            >
                                Back to Overview
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <JobCreationModal 
                showJobModal={showJobModal} 
                setShowJobModal={setShowJobModal} 
                newJob={newJob} 
                setNewJob={setNewJob} 
                handleCreateJob={handleCreateJob} 
                handleUpdateJob={handleUpdateJob}
                handleDeleteJob={handleDeleteJobFromModal}
                isEditing={!!editingJob}
            />
        </div>
    );
};

export default HRDashboard;
