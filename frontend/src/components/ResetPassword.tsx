import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from './Input';
import { ResetPasswordForm, AuthResponse } from '../types/auth';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const [form, setForm] = useState<ResetPasswordForm>({ email: emailFromState, otp: '', newPassword: '' });
  const [errors, setErrors] = useState<Partial<ResetPasswordForm>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setServerError('Email is required.');
      return;
    }
    setLoading(true);
    setProgress(33); 
    try {
      const res = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');
      setProgress(66); 
      setSuccess('Password reset successful. Redirecting to login...');
      setProgress(100);
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      setProgress(0);
      setServerError(error.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <div className="logo-wrapper">
          <img
            src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg"
            alt="IEEE Tunisia Section Logo"
            className="logo"
          />
        </div>
        <h2 className="reset-password-title">Reset Your Password</h2>
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <form onSubmit={handleSubmit} className="form-content">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            disabled={!!emailFromState}
            placeholder="Enter your email"
          />
          <Input
            label="OTP"
            name="otp"
            value={form.otp}
            onChange={handleChange}
            error={errors.otp}
            placeholder="Enter OTP"
          />
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="Enter new password"
          />
          {serverError && <p className="error-message">{serverError}</p>}
          {success && <p className="success-message">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="login-link-wrapper">
          <Link to="/" className="login-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;