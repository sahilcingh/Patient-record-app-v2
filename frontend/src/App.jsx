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

function App() {
  return (
    <Router>
      <Routes>
        {/* Login has no sidebar */}
        <Route path="/" element={<Login />} />
        
        {/* Wrap each individual page explicitly in the Layout component */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/new-patient" element={<Layout><NewPatient /></Layout>} />
        <Route path="/old-patient" element={<Layout><OldPatient /></Layout>} />
        <Route path="/patients" element={<Layout><PatientsList /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;