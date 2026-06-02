import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, quote, quoteAuthor, quoteRole }) => {
    return (
        <div className="flex justify-center items-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-80px)]">
            <div className="flex max-w-[1600px] w-full mx-auto px-6 lg:px-20 w-full bg-white rounded-3xl overflow-hidden shadow-[0_4px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 min-h-[600px] relative">

                {/* Back to Home Link */}
                <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors bg-black/20 hover:bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à l'accueil
                </Link>

                {/* Left Panel - Purple Background */}
                <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary-600 to-primary-800 p-10 flex-col justify-between relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute w-[800px] h-[800px] rounded-full bg-white blur-3xl -top-64 -left-64"></div>
                        <div className="absolute w-[600px] h-[600px] rounded-full bg-primary-400 blur-3xl bottom-0 right-0"></div>
                    </div>

                    <div className="relative z-10 pt-16">
                        <div className="max-w-xl">
                            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                                Secure Access for<br />
                                Modern Teams
                            </h1>
                            <p className="text-primary-100 text-base leading-relaxed">
                                Experience the next generation of workforce management with advanced biometric security and seamless integration.
                            </p>
                        </div>
                    </div>

                    {/* Testimonial/Quote Card */}
                    <div className="relative z-10 mt-12">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                            <div className="flex gap-4">
                                <img
                                    src="images/Matt_Mullenweg.jpg"
                                    alt={quoteAuthor || "User"}
                                    className="w-12 h-12 rounded-full border-2 border-primary-300 object-cover shrink-0"
                                />
                                <div>
                                    <p className="text-white font-medium italic mb-2 text-sm">
                                        "{quote || 'The facial recognition login is a total game-changer for our daily workflow security.'}"
                                    </p>
                                    <p className="text-primary-200 text-xs">
                                        <span className="font-medium text-white">{quoteAuthor || 'Matt Davis'}</span>
                                        {`, ${quoteRole || 'developer of WordPress'}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Content */}
                <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
