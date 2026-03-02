import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Make sure you import it at the top! (Adjust the path if your folder structure is different)
import PatientsList from './components/PatientsList'; 
import Home from './components/Home';
import NewPatient from './components/NewPatient';
import OldPatient from './components/OldPatient';
// ... other imports ...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/new-patient" element={<NewPatient />} />
        <Route path="/old-patient" element={<OldPatient />} />
        
        {/* 2. ADD THIS EXACT LINE HERE: */}
        <Route path="/patient" element={<PatientsList />} />
        
      </Routes>
    </Router>
  );
}

export default App;