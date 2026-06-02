import React, { useState } from 'react';
import { CalendarDays, Send } from 'lucide-react';
import axios from 'axios';

const RequestLeave = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication required");
            const payload = JSON.parse(atob(token.split('.')[1]));

            await axios.post('http://localhost:5001/api/leaverequests', {
                employeeId: payload.user.id,
                ...formData
            });

            setSubmitted(true);
            setFormData({ type: '', startDate: '', endDate: '', reason: '' });
        } catch (err) {
            console.error(err);
            setError('Failed to submit leave request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="font-sans max-w-3xl">
                <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CalendarDays className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-black text-blue-900 mb-4">Leave Request Submitted</h3>
                    <p className="text-gray-600 font-medium text-lg max-w-lg mb-8">
                        Your leave request has been forwarded to your manager and HR for approval. You will receive an email once it is reviewed.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans max-w-3xl">
            <h2 className="text-3xl font-black text-blue-900 tracking-tight mb-2">Request Leave</h2>
            <p className="text-gray-500 font-semibold mb-10">Submit time off, vacation, or sick leave requests.</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Leave Type</label>
                        <select 
                            required 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 appearance-none"
                        >
                            <option value="">Select leave type</option>
                            <option value="Annual">Paid Time Off / Vacation (Annual)</option>
                            <option value="Sick">Sick Leave</option>
                            <option value="Unpaid">Unpaid Leave</option>
                            <option value="Other">Personal/Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                        <input 
                            required 
                            type="date" 
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">End Date</label>
                        <input 
                            required 
                            type="date" 
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900" 
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Reason / Comments (Optional)</label>
                        <textarea 
                            rows={4}
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            placeholder="Provide any additional context for your manager..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 placeholder-gray-400 resize-none"
                        ></textarea>
                    </div>

                    <div className="col-span-2 pt-4 flex justify-end border-t border-gray-100">
                        <button disabled={loading} type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-md shadow-gray-200 active:scale-95 group disabled:opacity-50">
                            {loading ? 'Submitting...' : 'Submit Request'}
                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RequestLeave;
