import React from 'react';
import { ArrowRight, Code } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-20 mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-200 to-transparent blur-3xl"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-red-100 to-transparent blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black tracking-widest mb-8 border border-blue-100 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                        <span className="uppercase">ApexIT Innovation Hub</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05] mb-8">
                        Building the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-500">Future of Tech.</span>
                    </h1>

                    <p className="text-xl text-slate-500 mb-10 leading-relaxed font-semibold">
                        ApexIT delivers bleeding-edge software solutions and cloud infrastructure for the modern enterprise. Join us in shaping tomorrow's digital landscape.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href="/#openings"
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-bold tracking-wide transition-all shadow-xl shadow-blue-600/20 text-center flex items-center justify-center gap-2 group"
                        >
                            View Opportunities
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href="/#culture"
                            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold tracking-wide transition-all text-center shadow-sm"
                        >
                            Our Engineering Culture
                        </motion.a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 w-full relative"
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-blue-50 bg-white">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-red-500/10 z-10 pointer-events-none mix-blend-overlay"></div>
                        <img
                            src="images/hero.jpg"
                            alt="ApexIT Engineering Team"
                            className="w-full h-[400px] md:h-[600px] object-cover transition-all duration-700"
                        />
                        <div className="absolute bottom-6 right-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white shadow-lg shadow-red-500/30">
                                <Code className="w-6 h-6" />
                            </div>
                            <div className="pr-2">
                                <p className="text-sm font-black text-slate-900">Engineering Excellence</p>
                                <p className="text-xs text-blue-600 font-bold">500+ successful deployments</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
