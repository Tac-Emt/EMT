import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from './Input';
import { SignupForm, AuthResponse } from '../types/auth';
import './Signup.css';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<SignupForm>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [progress, setProgress] = useState(0); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(33); 
    try {
      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setProgress(66); 
      navigate('/verify-otp', { state: { email: form.email } });
      setProgress(100); 
    } catch (error: any) {
      setProgress(0);
      setServerError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <div className="logo-wrapper">
          <img
            src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg"
            alt="IEEE Tunisia Section Logo"
            className="logo"
          />
        </div>
        <h2 className="signup-title">Join Event Toolbox</h2>
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <form onSubmit={handleSubmit} className="form-content">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
          />
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Create a password"
          />
          {serverError && <p className="error-message">{serverError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="organizer-link-wrapper">
          <a
            href="https://forms.gle/organizer-request"
            target="_blank"
            rel="noopener noreferrer"
            className="organizer-link"
          >
            Become an Organizer
          </a>
        </div>
        <div className="login-link-wrapper">
          <p className="login-text">
            Already have an account?{' '}
            <Link to="/" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;