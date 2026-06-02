import React from 'react';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
    {
        title: 'Integrity First',
        description: 'We believe in honest communication and transparent processes, ensuring every decision is strictly secure, clear, and builds lasting trust with our enterprise partners.',
        icon: <ShieldCheck className="w-8 h-8 text-white" />,
        bgColor: 'bg-blue-600',
        borderColor: 'border-gray-200'
    },
    {
        title: 'Continuous Innovation',
        description: 'We actively invest in cutting-edge tech. Your career journey is continuous, and we provide the infrastructure to help you architect solutions that push boundaries.',
        icon: <TrendingUp className="w-8 h-8 text-white" />,
        bgColor: 'bg-gray-800',
        borderColor: 'border-gray-200'
    },
    {
        title: 'People at the Core',
        description: 'Technology is our tool, but people are our purpose. We prioritize well-being and inclusive collaboration, creating a high-performance space where everyone belongs.',
        icon: <Users className="w-8 h-8 text-blue-900" />,
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const NewsCulture = () => {
    return (
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-20 mx-auto px-8 py-24 relative">
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-6 tracking-tighter">Our Core Engineering Values</h2>
                <p className="text-lg text-gray-500 font-medium">These three pillars define who we are, shape how we engineer, and guide every single architectural decision we make.</p>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {values.map((val, idx) => (
                    <motion.div 
                        key={idx} 
                        variants={itemVariants}
                        className={`bg-white rounded-3xl p-10 border ${val.borderColor} hover:-translate-y-2 transition-transform duration-500 shadow-xl shadow-gray-200/40 relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
                        <div className={`w-16 h-16 ${val.bgColor} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            {val.icon}
                        </div>
                        
                        <h3 className="font-black text-2xl text-blue-950 mb-4 tracking-tight">{val.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">{val.description}</p>
                        
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default NewsCulture;
