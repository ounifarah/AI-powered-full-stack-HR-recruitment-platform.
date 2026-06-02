import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const LeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/leaverequests');
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5001/api/leaverequests/${id}`, { status: newStatus });
            setRequests(requests.map(req => req._id === id ? res.data : req));
        } catch (error) {
            console.error('Error updating leave request:', error);
        }
    };

    if (loading) return <div className="text-center py-10 font-bold text-gray-500">Loading leave requests...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-blue-900 tracking-tight">Leave Requests</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Review and manage employee time off</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Leave Type</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {requests.map((req) => (
                            <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-blue-900">
                                        {req.employeeId ? `${req.employeeId.firstName || ''} ${req.employeeId.lastName || ''}` : 'Unknown Employee'}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {req.employeeId ? req.employeeId.department : ''}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 font-medium">
                                    {req.type}
                                </td>
                                <td className="p-4 text-gray-600 font-medium">
                                    <div className="whitespace-nowrap">From: {new Date(req.startDate).toLocaleDateString()}</div>
                                    <div className="whitespace-nowrap">To: {new Date(req.endDate).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4 text-gray-600 font-medium max-w-[200px] truncate" title={req.reason}>
                                    {req.reason || 'No reason provided'}
                                </td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold ${
                                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                        req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                                        {req.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                                        {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                                        {req.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {req.status === 'Pending' && (
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => updateStatus(req._id, 'Approved')}
                                                className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(req._id, 'Rejected')}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 font-semibold">
                                    No leave requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveRequests;
