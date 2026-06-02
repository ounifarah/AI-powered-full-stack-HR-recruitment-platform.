import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Openings = ({ id }) => {
    const [activeFilter, setActiveFilter] = useState('All Roles');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Application Modal State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applyForm, setApplyForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        cv: null
    });

    const filters = ['All Roles', 'FULL-TIME', 'INTERNSHIP', 'CONTRACT', 'PART-TIME'];

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/jobs');
                setRoles(res.data);
            } catch (err) {
                console.error('Failed to fetch jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const activeJobs = roles.filter(role => role.status === 'Open' || role.status === 'Ouvert' || role.status === null || role.status === undefined);
    
    const filteredRoles = activeFilter === 'All Roles' 
        ? activeJobs 
        : activeJobs.filter(role => role.type === activeFilter);

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setApplyError('');
        
        const formData = new FormData();
        formData.append('firstName', applyForm.firstName);
        formData.append('lastName', applyForm.lastName);
        formData.append('email', applyForm.email);
        formData.append('jobId', selectedJob._id);
        if (applyForm.cv) {
            formData.append('cv', applyForm.cv);
        }

        try {
            await axios.post('http://localhost:5001/api/candidates', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setApplySuccess(true);
            setApplyForm({ firstName: '', lastName: '', email: '', cv: null });
        } catch (err) {
            console.error('Failed to submit application', err);
            const serverMsg = err.response?.data?.error || err.response?.data?.msg || err.message;
            setApplyError(`Failed to submit: ${serverMsg}. Please try again.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id={id} className="max-w-[1600px] w-full mx-auto px-6 lg:px-20 mx-auto px-8 py-24 scroll-mt-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-gray-200">
                        <Briefcase className="w-3.5 h-3.5" />
                        We're Hiring
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-6 tracking-tight">Current Openings</h2>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">Join our mission to deliver world-class infrastructure. We're looking for passionate engineers and builders to join ApexIT.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeFilter === filter
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-blue-900 hover:bg-gray-100'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-16">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-sm">
                            Loading openings...
                        </motion.div>
                    ) : filteredRoles.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-sm">
                            No job openings available right now.
                        </motion.div>
                    ) : filteredRoles.map((role) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            key={role._id} 
                            className="bg-white rounded-[2rem] p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 group border-b-4 hover:border-b-gray-900"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest truncate max-w-full">
                                        {role.department || 'ENGINEERING'}
                                    </span>
                                    <span className="bg-gray-800 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest whitespace-nowrap">
                                        {role.type === 'FULL-TIME' ? 'FULL-TIME' : role.type === 'CONTRACT' ? 'CONTRACT' : role.type === 'PART-TIME' ? 'PART-TIME' : 'INTERNSHIP'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-blue-950 group-hover:text-gray-700 transition-colors mb-3 tracking-tight truncate">{role.title}</h3>
                                
                                {role.salary && (
                                    <p className="text-sm font-bold text-gray-800 mb-2">{role.salary}</p>
                                )}
                                {role.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{role.description}</p>
                                )}
                                {role.requirements && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-4"><span className="font-bold text-gray-600">Requirements:</span> {role.requirements}</p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 font-bold">
                                    <div className="flex items-center gap-2 border-r border-gray-200 pr-4 md:pr-6">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="truncate max-w-[150px] md:max-w-[200px]">{role.location || 'Remote'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        <span className="text-red-600">Active Recruitment</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedJob(role);
                                    setApplySuccess(false);
                                    setApplyError('');
                                    setShowApplyModal(true);
                                }}
                                className="px-8 py-4 rounded-2xl text-sm font-black transition-all min-w-[140px] text-center shadow-lg transform md:group-hover:-translate-y-1 bg-blue-600 hover:bg-blue-700 text-white mt-4 md:mt-0 flex-shrink-0 whitespace-nowrap"
                            >
                                Apply Now
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Application Modal */}
            <AnimatePresence>
                {showApplyModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-600/50 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-black text-blue-950 tracking-tight">
                                    {applySuccess ? 'Application Sent!' : `Apply for ${selectedJob?.title}`}
                                </h3>
                                <button 
                                    onClick={() => setShowApplyModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white border border-gray-200"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            
                            <div className="p-8">
                                {applySuccess ? (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h4 className="text-2xl font-black text-blue-900 mb-3 tracking-tight">Application Received</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            Your profile for <strong className="text-blue-900">{selectedJob?.title}</strong> has been submitted. Our engineering recruiting team will review it shortly!
                                        </p>
                                        <button
                                            onClick={() => setShowApplyModal(false)}
                                            className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wide transition-colors"
                                        >
                                            Return to Openings
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplySubmit} className="space-y-5">
                                        {applyError && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">{applyError}</div>}
                                        
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">First Name</label>
                                                <input 
                                                    required 
                                                    value={applyForm.firstName}
                                                    onChange={e => setApplyForm({...applyForm, firstName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-blue-600 transition-shadow" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
                                                <input 
                                                    required 
                                                    value={applyForm.lastName}
                                                    onChange={e => setApplyForm({...applyForm, lastName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-blue-600 transition-shadow" 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                            <input 
                                                required 
                                                type="email"
                                                value={applyForm.email}
                                                onChange={e => setApplyForm({...applyForm, email: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-blue-600 transition-shadow" 
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Upload CV / Resume (PDF, DOC)</label>
                                            <input 
                                                required 
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={e => setApplyForm({...applyForm, cv: e.target.files[0]})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-blue-600 transition-shadow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300" 
                                            />
                                        </div>

                                        <div className="pt-6 flex gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => setShowApplyModal(false)}
                                                className="w-1/3 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-blue-900 rounded-xl font-bold tracking-wide transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wide transition-colors disabled:opacity-50 flex justify-center items-center"
                                            >
                                                {submitting ? (
                                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                                ) : 'Submit Application'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Openings;
