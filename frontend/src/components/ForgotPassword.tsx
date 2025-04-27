import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from './Input';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send OTP. Please try again.');
      setSuccess('OTP sent to your email. Please check your inbox.');
      setTimeout(() => navigate('/reset-password', { state: { email: form.email } }), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="logo-wrapper">
          <img
            src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg"
            alt="IEEE Tunisia Section Logo"
            className="logo"
          />
        </div>
        <h2 className="forgot-password-title">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={error}
            placeholder="Enter your email"
          />
          {error && <p className="error-message">{error}</p>}
          {success && <p className="error-message" style={{ color: '#2ecc71' }}>{success}</p>}
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        <div className="login-link-wrapper">
          <p className="login-text">
            Back to{' '}
            <Link to="/" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;