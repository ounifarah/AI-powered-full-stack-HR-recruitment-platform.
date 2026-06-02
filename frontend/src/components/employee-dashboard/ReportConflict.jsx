import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import axios from 'axios';

const ReportConflict = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        issueType: '',
        partiesInvolved: '',
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Get user from localStorage Token
            const token = localStorage.getItem('token');
            // Decode token safely to get user ID
            if (!token) throw new Error("Authentication required");
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            await axios.post('http://localhost:5001/api/reports', {
                reportedBy: payload.user.id,
                ...formData
            });
            
            setSubmitted(true);
            setFormData({ issueType: '', partiesInvolved: '', description: '' });
        } catch (err) {
            console.error(err);
            setError('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="font-sans max-w-3xl">
                <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-black text-blue-900 mb-4">Conflict Reported Successfully</h3>
                    <p className="text-gray-600 font-medium text-lg max-w-lg mb-8">
                        Your report has been securely submitted to HR. A representative will review it and contact you shortly. Rest assured, your privacy is our priority.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                        Submit Another Report
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans max-w-3xl">
            <h2 className="text-3xl font-black text-blue-900 tracking-tight mb-2">Report a Conflict</h2>
            <p className="text-gray-500 font-semibold mb-10">Confidential channel for reporting workplace issues to HR.</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Issue Type</label>
                        <select 
                            required 
                            value={formData.issueType}
                            onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 appearance-none"
                        >
                            <option value="">Select a category</option>
                            <option value="harassment">Harassment</option>
                            <option value="discrimination">Discrimination</option>
                            <option value="interpersonal">Interpersonal Conflict</option>
                            <option value="policy">Policy Violation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Parties Involved (Optional)</label>
                        <input 
                            type="text" 
                            value={formData.partiesInvolved}
                            onChange={(e) => setFormData({...formData, partiesInvolved: e.target.value})}
                            placeholder="Names of individuals involved..." 
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 placeholder-gray-400" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Description of the Incident</label>
                        <textarea 
                            required
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Please provide details about what happened, when, and where..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 placeholder-gray-400 resize-none"
                        ></textarea>
                    </div>

                    <div className="bg-gray-50 border border-blue-100 rounded-xl p-5 flex gap-4 mt-6">
                        <AlertTriangle className="w-6 h-6 text-blue-950 shrink-0" />
                        <p className="text-blue-800 text-sm font-medium leading-relaxed">
                            This report will be sent directly to the HR Management team. Your submission will be treated with confidentiality in accordance with company policy.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button disabled={loading} type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-md shadow-gray-200 active:scale-95 group disabled:opacity-50">
                            {loading ? 'Submitting...' : 'Submit Report'}
                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReportConflict;
