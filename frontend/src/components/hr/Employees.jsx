import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search,
    Mail,
    Briefcase,
    X,
    UserPlus
} from 'lucide-react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editingEmp, setEditingEmp] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: 'Engineering',
        phoneNumber: '',
        joinDate: ''
    });

    // We'll mock the fetch for now if there isn't an explicit endpoint, 
    // or we can just keep local state if the user only wanted the UI for now.
    // Let's implement a realistic UI.
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/auth/users?role=Employee');
            setEmployees(res.data);
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                department: formData.department,
                phoneNumber: formData.phoneNumber,
                joinDate: formData.joinDate
            };
            
            if (editingEmp) {
                // Update existing employee
                await axios.put(`http://localhost:5001/api/auth/users/${editingEmp._id}`, payload);
                setSuccessMsg('Employee updated successfully.');
                setTimeout(() => {
                    setShowModal(false);
                    setSuccessMsg('');
                }, 1500);
            } else {
                // Create new employee (admin route)
                const res = await axios.post('http://localhost:5001/api/auth/employee', payload);
                setGeneratedPassword(res.data.temporaryPassword);
                setSuccessMsg(`Employee account created successfully! Temporary Password: ${res.data.temporaryPassword}`);
            }
            
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save employee');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this employee?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/auth/users/${id}`);
            fetchEmployees();
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const openCreateModal = () => {
        setEditingEmp(null);
        setFormData({ firstName: '', lastName: '', email: '', department: 'Engineering', phoneNumber: '', joinDate: '' });
        setGeneratedPassword('');
        setError('');
        setSuccessMsg('');
        setShowModal(true);
    };

    const openEditModal = (emp) => {
        setEditingEmp(emp);
        setFormData({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            department: emp.department || 'General',
            phoneNumber: emp.phoneNumber || '',
            joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : ''
        });
        setGeneratedPassword('');
        setError('');
        setSuccessMsg('');
        setShowModal(true);
    };

    const filteredEmployees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="font-sans">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Employee Registry</h2>
                    <p className="text-gray-500 font-semibold mt-2">Manage your company workforce and add new employees.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search employees..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-semibold w-72 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-gray-200 active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Employee</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Department</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Join Date</th>
                            <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredEmployees.map((emp) => (
                            <tr key={emp._id} className="hover:bg-gray-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-blue-900 flex items-center justify-center font-black text-sm">
                                            {(emp.avatar || emp.image) ? (
                                                <img
                                                    src={emp.avatar || emp.image}
                                                    alt={`${emp.firstName} ${emp.lastName}`}
                                                    className="w-10 h-10 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <span>{emp.firstName[0]}{emp.lastName[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-900 group-hover:text-blue-900 transition-colors">{emp.firstName} {emp.lastName}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-0.5">
                                                <Mail className="w-3 h-3" /> {emp.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        {emp.department || 'General'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-green-50 text-green-600 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        Active
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                    {new Date(emp.joinDate).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEditModal(emp)} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(emp._id)} className="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-100 text-gray-700 text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
                                            Remove
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-16 text-center text-gray-400 font-bold">
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-blue-600/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute right-8 top-8 p-2 text-gray-400 hover:text-blue-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-900">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-blue-900">Add New Employee</h3>
                                <p className="text-sm text-gray-500 font-semibold">Create an account for a new team member.</p>
                            </div>
                        </div>

                        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 text-center">{error}</div>}
                        {successMsg && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 text-center">
                                {successMsg}
                                {generatedPassword && (
                                    <div className="mt-2 text-xs font-medium text-green-600 italic">
                                        (In a real app, this password would be emailed to the user)
                                    </div>
                                )}
                            </div>
                        )}

                        {!generatedPassword && (
                            <form onSubmit={handleCreateEmployee} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Join Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Department</label>
                                    <select 
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-gray-100 transition-all text-blue-900"
                                    >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">HR</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-black text-white py-4 rounded-xl font-black text-sm transition-all shadow-md active:scale-95">
                                    {editingEmp ? "Update Employee" : "Create Employee Account"}
                                </button>
                                {!editingEmp && (
                                    <p className="text-center text-xs text-gray-400 font-semibold mt-4">
                                        A secure password will be automatically generated and sent to this email.
                                    </p>
                                )}
                            </div>
                        </form>
                        )}
                        {generatedPassword && (
                            <div className="pt-6">
                                <button onClick={() => setShowModal(false)} className="w-full bg-blue-600 hover:bg-black text-white py-4 rounded-xl font-black text-sm transition-all shadow-md active:scale-95">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
