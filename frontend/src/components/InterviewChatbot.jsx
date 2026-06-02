import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getAiHealth, getAuthHeaders, readErrorMessage } from '../config/api';

export default function InterviewChatbot() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [evalScore, setEvalScore] = useState(null);
    const [evalSummary, setEvalSummary] = useState('');
    const [evalBreakdown, setEvalBreakdown] = useState(null);
    const [evalStrengths, setEvalStrengths] = useState([]);
    const [evalImprovements, setEvalImprovements] = useState([]);
    const [evalEvidence, setEvalEvidence] = useState([]);
    const [evaluating, setEvaluating] = useState(false);
    const [showEvaluationPage, setShowEvaluationPage] = useState(false);
    const chatEndRef = useRef(null);

    const toPercent = (value, max = 20) => Math.round(((Number(value) || 0) / max) * 100);
    const confidenceDisplay = 'Locked';

    const isEvaluateCommand = (value) => {
        const command = value.trim().toLowerCase();
        return command === 'evaluate' || command === '/evaluate' || command === 'finish evaluate';
    };

    const formatEvaluationMessage = (data) => {
        const breakdown = data?.breakdown || {};

        return [
            'Evaluation completed.',
            '',
            `Overall score: ${data?.score ?? 0}%`,
            '',
            'Breakdown:',
            `- Technical Skills: ${toPercent(breakdown.technicalSkills)}%`,
            `- Communication: ${toPercent(breakdown.communication)}%`,
            `- Problem Solving: ${toPercent(breakdown.problemSolving)}%`,
            `- Role Fit: ${toPercent(breakdown.roleFit)}%`,
            `- Confidence: ${confidenceDisplay}`,
            '',
            `Summary: ${data?.summary || 'No summary provided.'}`
        ].join('\n');
    };

    // Initial greeting from AI
    useEffect(() => {
        setHistory([{
            role: 'assistant',
            content: "Hello! I'm the AI Interview Assistant. I've reviewed the candidate's CV and the job description. Please type the candidate's responses or notes here, and I'll generate the next best question to ask."
        }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');

        const aiHealth = await getAiHealth();
        if (!aiHealth.ok) {
            setHistory(prev => prev.slice(0, -1));
            alert('Local AI services are offline. Start Ollama and Chroma, then try again.');
            return;
        }

        if (isEvaluateCommand(userMsg)) {
            setLoading(true);
            await finishEvaluation({ skipConfirm: true, showInChat: true });
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ message: userMsg })
            });
            
            if (!res.ok) {
                alert(`Error from AI: ${await readErrorMessage(res, 'Server failed to respond')}`);
                // Remove the failed message from UI history
                setHistory(prev => prev.slice(0, -1));
                return;
            }

            const data = await res.json();
            
            if (data.aiMessage) {
                setHistory(prev => [...prev, { role: 'assistant', content: data.aiMessage }]);
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            alert("Network error. Please check your connection or backend server.");
            setHistory(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    const finishEvaluation = async ({ skipConfirm = false, showInChat = false } = {}) => {
        if (!skipConfirm && !window.confirm("Are you sure you want to finalize this interview and generate the score?")) return;

        setEvaluating(true);
        try {
            const aiHealth = await getAiHealth();
            if (!aiHealth.ok) {
                alert('Local AI services are offline. Start Ollama and Chroma, then try again.');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            if (!res.ok) {
                alert(`Error from AI: ${await readErrorMessage(res, 'Server failed to respond')}`);
                return;
            }

            const data = await res.json();
            setEvalScore(data.score);
            setEvalSummary(data.summary);
            setEvalBreakdown(data.breakdown || null);
            setEvalStrengths(Array.isArray(data.strengths) ? data.strengths : []);
            setEvalImprovements(Array.isArray(data.improvements) ? data.improvements : []);
            setEvalEvidence(Array.isArray(data.evidence) ? data.evidence : []);
            setShowEvaluationPage(true);

            if (showInChat) {
                setHistory(prev => [...prev, { role: 'assistant', content: formatEvaluationMessage(data) }]);
            }
        } catch (err) {
            console.error('Failed to evaluate:', err);
            if (showInChat) {
                setHistory(prev => [...prev, { role: 'assistant', content: 'Evaluation failed. Please check Ollama and try again.' }]);
            }
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 p-4 sm:p-6 mt-2 sm:mt-4 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">
                        {showEvaluationPage && evalScore !== null ? 'Final Interview Evaluation' : 'AI Interview Assistant'}
                    </h2>
                    <p className="text-gray-500 mt-1">Real-time interview guidance and scoring</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 font-medium transition-colors"
                    >
                        Back
                    </button>
                    {!evalScore && !showEvaluationPage && (
                        <button 
                            onClick={finishEvaluation}
                            disabled={evaluating || loading}
                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                        >
                            {evaluating ? 'Evaluating...' : 'Finish & Evaluate'}
                        </button>
                    )}
                    {evalScore !== null && (
                        <button
                            onClick={() => setShowEvaluationPage(prev => !prev)}
                            className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 font-medium transition-colors"
                        >
                            {showEvaluationPage ? 'Back To Chat' : 'View Full Evaluation'}
                        </button>
                    )}
                </div>
            </div>

            {showEvaluationPage && evalScore !== null ? (
                <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-100 animate-fade-in-up overflow-y-auto">
                    <div className="flex items-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-purple-100 mb-8">
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800 mb-2">Interview Score</h4>
                            <div className="w-full bg-white rounded-full h-4 shadow-inner border border-gray-100">
                                <div className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" style={{ width: `${evalScore}%` }}></div>
                            </div>
                        </div>
                        <div className="ml-8 text-center bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg border border-purple-100">
                            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{evalScore}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                        <h4 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                            <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                            AI Summary
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-lg">{evalSummary}</p>
                    </div>

                    {evalBreakdown && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                            <h4 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                                Score Breakdown (Percentages)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-semibold text-gray-700">
                                <div className="bg-indigo-50 rounded-xl px-4 py-3">Technical Skills: <span className="font-black">{toPercent(evalBreakdown.technicalSkills)}%</span></div>
                                <div className="bg-indigo-50 rounded-xl px-4 py-3">Communication: <span className="font-black">{toPercent(evalBreakdown.communication)}%</span></div>
                                <div className="bg-indigo-50 rounded-xl px-4 py-3">Problem Solving: <span className="font-black">{toPercent(evalBreakdown.problemSolving)}%</span></div>
                                <div className="bg-indigo-50 rounded-xl px-4 py-3">Role Fit: <span className="font-black">{toPercent(evalBreakdown.roleFit)}%</span></div>
                                <div className="bg-slate-100 rounded-xl px-4 py-3 md:col-span-2 text-slate-500 border border-slate-200">Confidence: <span className="font-black uppercase tracking-wider">{confidenceDisplay}</span></div>
                            </div>
                        </div>
                    )}

                    {evalEvidence.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                            <h4 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                                Evaluation Evidence
                            </h4>
                            <ul className="space-y-2 text-gray-700">
                                {evalEvidence.map((item, idx) => (
                                    <li key={idx} className="bg-blue-50 rounded-xl px-4 py-2 text-sm font-medium">{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-green-200 shadow-sm">
                            <h4 className="text-lg font-bold text-green-700 mb-3">Strengths</h4>
                            {evalStrengths.length > 0 ? (
                                <ul className="space-y-2 text-gray-700">
                                    {evalStrengths.map((item, idx) => (
                                        <li key={idx} className="bg-green-50 rounded-xl px-4 py-2 text-sm font-medium">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No strengths extracted.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm">
                            <h4 className="text-lg font-bold text-amber-700 mb-3">Areas to Improve</h4>
                            {evalImprovements.length > 0 ? (
                                <ul className="space-y-2 text-gray-700">
                                    {evalImprovements.map((item, idx) => (
                                        <li key={idx} className="bg-amber-50 rounded-xl px-4 py-2 text-sm font-medium">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No improvement areas extracted.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                    <div className="px-6 py-3 border-b border-purple-100 bg-purple-50/40 text-sm text-gray-600">
                        Type a message, then type <span className="font-bold text-purple-700">evaluate</span> to generate the final score.
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                    <div className={`text-xs mb-1 opacity-70 font-semibold ${msg.role === 'user' ? 'text-purple-100' : 'text-purple-600'}`}>
                                        {msg.role === 'user' ? 'HR / Candidate' : 'AI Assistant'}
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-tl-none p-4 shadow-sm flex space-x-2 items-center">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-purple-100">
                        <form onSubmit={sendMessage} className="flex gap-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type answer or notes... type evaluate to generate the score"
                                className="flex-1 px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 disabled:bg-gray-300 transition-colors flex items-center"
                            >
                                Send
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
