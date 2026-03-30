import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your Layout component
import Layout from './components/Layout'; 

// Import all pages
import Login from './pages/Login';
import Home from './pages/Home';
import NewPatient from './pages/NewPatient';
import OldPatient from './pages/OldPatient';
import PatientsList from './pages/PatientsList'; 
import Profile from './pages/Profile';

// Import new public pages
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages (No Sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        
        {/* NEW DASHBOARD - Has its own built-in sidebar now! Do not wrap in Layout */}
        <Route path="/home" element={<Home />} />

        {/* Other Authenticated Pages (Still use the old Layout/Sidebar for now) */}
        <Route path="/new-patient" element={<Layout><NewPatient /></Layout>} />
        <Route path="/old-patient" element={<Layout><OldPatient /></Layout>} />
        <Route path="/patients" element={<Layout><PatientsList /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;