import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your Layout component (This brings back the sidebar!)
import Layout from './components/Layout'; 

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
        {/* Login sits outside the layout (no sidebar on login screen) */}
        <Route path="/" element={<Login />} />
        
        {/* All other pages sit inside the Layout (sidebar + constrained width) */}
        <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/new-patient" element={<NewPatient />} />
            <Route path="/old-patient" element={<OldPatient />} />
            <Route path="/patients" element={<PatientsList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;