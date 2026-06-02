import React, { useState } from 'react';
import { MapPin, Phone, Mail, Twitter, Linkedin, CheckCircle, Hexagon } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Contact = () => {
    const [formData, setFormData] = useState({ email: '', message: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.message) {
            setStatus({ loading: false, success: false, error: 'Please fill in all fields.' });
            return;
        }

        setStatus({ loading: true, success: false, error: '' });
        try {
            await axios.post('http://localhost:5001/api/contact', formData);
            setStatus({ loading: false, success: true, error: '' });
            setFormData({ email: '', message: '' });

            // clear success message after 5 seconds
            setTimeout(() => setStatus({ loading: false, success: false, error: '' }), 5000);
        } catch (err) {
            console.error(err);
            setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again.' });
        }
    };

    return (
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-20 mx-auto px-8 py-24">
            <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-6 tracking-tighter text-center">Contact Us</h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100"
            >
                <div className="flex flex-col md:flex-row">

                    {/* Left Side: Form */}
                    <div className="flex-1 p-8 md:p-14 lg:p-16">
                        <div className="flex items-center gap-2 mb-6 text-gray-400">
                            <Hexagon className="w-5 h-5 fill-current" />
                            <span className="text-xs font-black tracking-widest uppercase">ApexIT Operations</span>
                        </div>
                        <h2 className="text-4xl font-black text-blue-950 mb-4 tracking-tight">Get in Touch</h2>
                        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                            Have questions about our technology stack, enterprise solutions, or open roles? Drop us a message.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status.error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">{status.error}</div>
                            )}
                            {status.success && (
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    Message received! A representative will connect shortly.
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@gmail.com"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-blue-600 transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Message</label>
                                <textarea
                                    rows="5"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="How can we build together?"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-blue-600 transition-all placeholder:text-gray-400 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status.loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold tracking-wide py-4 rounded-xl transition-all shadow-lg flex justify-center items-center"
                            >
                                {status.loading ? (
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                ) : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Right Side: Contact Info */}
                    <div className="w-full md:w-2/5 bg-gray-50 p-8 md:p-14 lg:p-16 border-l border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <h3 className="text-xl font-black text-blue-950 mb-10 tracking-tight relative z-10">Corporate Contact</h3>

                        <div className="space-y-10 mb-12 relative z-10">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-900 shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="pt-1">
                                    <h4 className="font-bold text-blue-950 mb-1">ApexIT HQ</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                        Avenue Habibi Borguiba<br />

                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-900 shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="pt-1">
                                    <h4 className="font-bold text-blue-950 mb-1">Direct Line</h4>
                                    <p className="text-gray-500 text-sm font-medium">+(216) 12 345 678</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-900 shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="pt-1">
                                    <h4 className="font-bold text-blue-950 mb-1">Email</h4>
                                    <p className="text-gray-500 text-sm font-medium">ounifarah95@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-200/80 relative z-10">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Connect with ApexIT</h4>
                            <div className="flex items-center gap-3">
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-900 hover:border-gray-400 hover:shadow-md transition-all">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-900 hover:border-gray-400 hover:shadow-md transition-all">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default Contact;
