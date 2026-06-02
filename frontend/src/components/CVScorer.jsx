import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getAiHealth, getAuthHeaders, readErrorMessage } from '../config/api';

export default function CVScorer() {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const [, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const hasRun = React.useRef(false);

    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            scoreCV();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateId]);

    const scoreCV = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const aiHealth = await getAiHealth();
            if (!aiHealth.ok) {
                setError('Local AI services are offline. Start Ollama and Chroma, then try again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                throw new Error(await readErrorMessage(response, 'Failed to score CV'));
            }
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err?.message || 'Failed to score CV');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <button 
                onClick={() => navigate(-1)}
                className="text-purple-600 hover:text-purple-800 mb-6 font-medium flex items-center"
            >
                ← Back
            </button>
            
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-purple-100">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">
                            AI CV Analyzer
                        </h2>
                        <p className="text-gray-500 mt-2">Evaluate candidate profile against the job requirements</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center border border-red-100">
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                {result && result.analysis && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Score Section */}
                        <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-purple-100">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Overall Match Score</h3>
                                <div className="w-full bg-white rounded-full h-4 mb-2 overflow-hidden shadow-inner border border-gray-100">
                                    <div 
                                        className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-out" 
                                        style={{ width: `${result.analysis.score}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="ml-8 text-center bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg border border-purple-100">
                                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                    {result.analysis.score}
                                </span>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                                AI Recommendation
                            </h3>
                            <p className="text-gray-600 leading-relaxed bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                {result.analysis.recommendation}
                            </p>
                        </div>

                        {/* Skills Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Matched Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.matchedSkills && result.analysis.matchedSkills.length > 0 ? (
                                        result.analysis.matchedSkills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">None found</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Missing Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.missingSkills && result.analysis.missingSkills.length > 0 ? (
                                        result.analysis.missingSkills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-200">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">None missing!</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
