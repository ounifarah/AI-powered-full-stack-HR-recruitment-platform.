import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', {
                email: formData.email,
                password: formData.password
            });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                if (res.data.user.role === 'HR Manager') {
                    navigate('/hr-dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            quote="Technology is best when it brings people together"
            quoteAuthor="Matt Mullenweg"
        >
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-blue-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Please enter your credentials to log in.</p>
            </div>

            {error && <div className="text-red-500 text-sm font-medium mb-4 text-center">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="name@gmail.com"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-blue-900"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                        <a href="#/" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                            Forgot password?
                        </a>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-blue-900"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 mt-8"
                >
                    {isLoading ? 'Logging In...' : 'Log In'}
                    {!isLoading && <LogIn className="w-4 h-4" />}
                </button>
            </form>

        </AuthLayout>
    );
};

export default Login;
