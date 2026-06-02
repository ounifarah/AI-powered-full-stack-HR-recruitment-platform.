import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewsCulture from './components/NewsCulture';
import Openings from './components/Openings';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './components/Login';
import HRDashboard from './components/HRDashboard';
import EmployeeDashboard from './components/employee-dashboard/EmployeeDashboard';
import CVScorer from './components/CVScorer';
import InterviewChatbot from './components/InterviewChatbot';
import ProtectedRoute from './components/ProtectedRoute';



function Home() {
  return (
    <>
      <Hero />
      <div id="culture"><NewsCulture /></div>
      <div id="openings"><Openings id="offres" /></div>
      <div id="contact"><Contact /></div>
      <Footer />
    </>
  );
}

function MainLayout({ children }) {
  const location = useLocation();
  // Hide navbar only on the dashboard itself
  const isDashboard = location.pathname.includes('-dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {!isDashboard && <Navbar />}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hr-dashboard" element={<ProtectedRoute allowedRoles={['HR Manager', 'Admin']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/cv-scorer/:candidateId" element={<CVScorer />} />
          <Route path="/interview-chat/:interviewId" element={<InterviewChatbot />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
