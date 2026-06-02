import React from 'react';
import { Hexagon, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white px-8 py-20 mt-16 border-t border-gray-100">
            <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-20 mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2 md:pr-12">
                    <div className="flex items-center gap-2 font-black text-2xl text-blue-950 tracking-tight mb-6">
                        <Hexagon className="w-7 h-7 fill-gray-900" />
                        <span>Apex<span className="font-light text-gray-500">IT</span></span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                        Architecting the digital future. ApexIT empowers global organizations with secure, scalable, and innovative software solutions.
                    </p>
                </div>

                <div>
                    <h4 className="font-black text-blue-950 mb-6 tracking-wide">Platform</h4>
                    <ul className="space-y-4 text-sm font-semibold text-gray-500">
                        <li><a href="/#openings" className="hover:text-blue-900 transition-colors">Infrastructure</a></li>
                        <li><a href="/#openings" className="hover:text-blue-900 transition-colors">Integrations</a></li>
                        <li><a href="/#openings" className="hover:text-blue-900 transition-colors">Cloud Security</a></li>
                        <li><a href="/#openings" className="hover:text-blue-900 transition-colors">Changelog</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-blue-950 mb-6 tracking-wide">Company</h4>
                    <ul className="space-y-4 text-sm font-semibold text-gray-500">
                        <li><a href="/#culture" className="hover:text-blue-900 transition-colors">About Us</a></li>
                        <li><a href="/#openings" className="hover:text-blue-900 transition-colors">Careers</a></li>
                        <li><a href="/#culture" className="hover:text-blue-900 transition-colors">Engineering Blog</a></li>
                        <li><a href="/#contact" className="hover:text-blue-900 transition-colors">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-blue-950 mb-6 tracking-wide">Legal</h4>
                    <ul className="space-y-4 text-sm font-semibold text-gray-500">
                        <li><a href="#/" className="hover:text-blue-900 transition-colors">Privacy Policy</a></li>
                        <li><a href="#/" className="hover:text-blue-900 transition-colors">Terms of Service</a></li>
                        <li><a href="#/" className="hover:text-blue-900 transition-colors">Cookie Policy</a></li>
                        <li><a href="#/" className="hover:text-blue-900 transition-colors">Compliance</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-20 mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-sm text-gray-400 font-bold">
                <p>© {new Date().getFullYear()} ApexIT Engineering. All rights reserved.</p>
                <div className="flex items-center gap-6 mt-6 md:mt-0">
                    <a href="#/" className="hover:text-blue-900 transition-colors"><Github className="w-5 h-5" /></a>
                    <a href="#/" className="hover:text-blue-900 transition-colors"><Twitter className="w-5 h-5" /></a>
                    <a href="#/" className="hover:text-blue-900 transition-colors"><Linkedin className="w-5 h-5" /></a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
