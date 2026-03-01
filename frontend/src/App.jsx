import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import NewPatient from './pages/NewPatient';
import OldPatient from './pages/OldPatient'; // <-- 1. MAKE SURE THIS IS IMPORTED
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/new-patient" element={<Layout><NewPatient /></Layout>} />
        
        {/* 2. MAKE SURE THIS ROUTE EXISTS */}
        <Route path="/old-patient" element={<Layout><OldPatient /></Layout>} /> 
        
      </Routes>
    </Router>
  );
}

export default App;