import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyOtp from './components/VerifyOtp';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import OrganizerPanel from './components/OrganizerPanel';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/AdminPanel" element={<AdminPanel />} />
        <Route path="/OrganizerPanel" element={<OrganizerPanel />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;