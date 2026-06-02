import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Edit2, Check, X } from 'lucide-react';
import axios from 'axios';

const MyProfile = ({ onUserUpdated }) => {
    const [user, setUser] = useState(() => {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : { firstName: 'Employee', lastName: 'User', email: 'employee@hrplatform.com' };
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        avatar: user.avatar || user.image || ''
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchLatestUser = async () => {
            const userId = user.id || user._id;
            if (!userId) return;

            setInitialLoading(true);
            try {
                const res = await axios.get(`http://localhost:5001/api/auth/users/${userId}`);
                const fetchedUser = {
                    ...user,
                    ...res.data,
                    id: res.data.id || res.data._id || user.id || user._id
                };

                setUser(fetchedUser);
                setFormData({
                    firstName: fetchedUser.firstName || '',
                    lastName: fetchedUser.lastName || '',
                    email: fetchedUser.email || '',
                    phoneNumber: fetchedUser.phoneNumber || '',
                    avatar: fetchedUser.avatar || fetchedUser.image || ''
                });
                localStorage.setItem('user', JSON.stringify(fetchedUser));
                if (typeof onUserUpdated === 'function') {
                    onUserUpdated(fetchedUser);
                }
            } catch (err) {
                console.error('Error loading user profile from database:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchLatestUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.put(`http://localhost:5001/api/auth/users/${user.id || user._id}`, formData);
            const updatedUser = { ...user, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // update session
            if (typeof onUserUpdated === 'function') {
                onUserUpdated(updatedUser);
            }
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            avatar: user.avatar || user.image || ''
        });
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setFormData((prev) => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="font-sans max-w-4xl bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
            {initialLoading && (
                <div className="mb-5 p-3 rounded-xl text-sm font-bold border bg-blue-50 text-blue-700 border-blue-100">
                    Loading profile from database...
                </div>
            )}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-black text-blue-900 tracking-tight">My Profile</h2>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-950 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 transition-all shadow-sm active:scale-95"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 transition-all shadow-sm active:scale-95"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
            <p className="text-gray-500 font-semibold mb-8">Review and manage your employment information.</p>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="rounded-[2rem] relative overflow-hidden">
                <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-100 relative z-10">
                    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-blue-900 shadow-inner shrink-0 border-4 border-white ring-1 ring-gray-100">
                        {((isEditing ? formData.avatar : user.avatar) ? (
                            <img
                                src={isEditing ? formData.avatar : user.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <User className="w-16 h-16" />
                        ))}
                    </div>
                    <div className="w-full">
                        {isEditing && (
                            <div className="mb-4">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Profile Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="w-full max-w-md text-sm font-semibold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                />
                            </div>
                        )}
                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">First Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-3xl font-black text-blue-900 mb-2">{user.firstName} {user.lastName}</h3>
                                <p className="text-blue-950 font-bold text-sm bg-gray-50 px-3 py-1 rounded-lg inline-block mb-3">{user.department || 'Employee'}</p>
                                <p className="text-gray-500 font-medium text-sm flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" />
                                    {user.role || 'Employee'}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <h4 className="text-lg font-black text-blue-900 mb-6 uppercase tracking-wider text-sm relative z-10">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><Mail className="w-5 h-5 text-gray-400" /></div>
                        <div className="w-full">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                            {isEditing ? (
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all mt-1"
                                />
                            ) : (
                                <p className="font-bold text-blue-900 text-sm mt-1 truncate">{user.email}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><Phone className="w-5 h-5 text-gray-400" /></div>
                        <div className="w-full">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={formData.phoneNumber}
                                    placeholder="+1 (555) 000-0000"
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all mt-1"
                                />
                            ) : (
                                <p className="font-bold text-blue-900 text-sm mt-1">{user.phoneNumber || 'Not provided'}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><MapPin className="w-5 h-5 text-gray-400" /></div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                            <p className="font-bold text-blue-900 text-sm mt-1">Remote</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><Briefcase className="w-5 h-5 text-gray-400" /></div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Department</p>
                            <p className="font-bold text-blue-900 text-sm mt-1">{user.department || 'General'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
