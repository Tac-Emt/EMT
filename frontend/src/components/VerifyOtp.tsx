import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from './Input';
import { VerifyOtpForm, AuthResponse } from '../types/auth';
import './VerifyOtp.css';

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [form, setForm] = useState<VerifyOtpForm>({ email, otp: '' });
  const [errors, setErrors] = useState<Partial<VerifyOtpForm>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      localStorage.setItem('token', data.accessToken!);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        name: data.name,
        role: data.role,
      }));
      navigate('/dashboard');
    } catch (error: any) {
      setServerError(error.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-form">
        <div className="logo-wrapper">
          <img
            src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg"
            alt="IEEE Tunisia Section Logo"
            className="logo"
          />
        </div>
        <h2 className="verify-title">Verify Your Email</h2>
        <form onSubmit={handleSubmit} className="form-content">
          <div className="mb-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={!!email}
            />
          </div>
          <div className="mb-4">
            <Input
              label="OTP"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              error={errors.otp}
            />
          </div>
          {serverError && (
            <p className="error-message">{serverError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/signup" className="back-link">
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;