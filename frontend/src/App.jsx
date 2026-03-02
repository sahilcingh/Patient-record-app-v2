import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing all components from your 'pages' directory
import Login from './pages/Login';
import Home from './pages/Home';
import NewPatient from './pages/NewPatient';
import OldPatient from './pages/OldPatient';
import PatientsList from './pages/PatientsList'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/new-patient" element={<NewPatient />} />
        <Route path="/old-patient" element={<OldPatient />} />
        
        {/* The new Patients Directory route */}
        <Route path="/patients" element={<PatientsList />} />
      </Routes>
    </Router>
  );
}

export default App;