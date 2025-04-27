import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from './Input';
import { LoginForm, AuthResponse } from '../types/auth';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
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
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      
      localStorage.setItem('token', data.accessToken!);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        name: data.name,
        role: data.role,
      }));

     
      const userRole = data.role;
      if (userRole === 'USER') {
        navigate('/dashboard');
      } else if (userRole === 'ADMIN') {
        navigate('/AdminPanel');
      } else if (userRole === 'ORGANIZER') {
        navigate('/OrganizerPanel');
      } else {
        
        throw new Error('Invalid user role');
      }
    } catch (error: any) {
      setServerError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ margin: 0, padding: 0, width: '100vw', height: '100vh' }}>
      <div className="login-form">
        <div className="logo-wrapper">
          <img
            src="https://i.ibb.co/mFNZgbnN/291928103-5203979969682022-8308932685346856936-n.jpg"
            alt="IEEE Tunisia Section Logo"
            className="logo"
          />
        </div>
        <h2 className="login-title">Login to Event Toolbox</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address :"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Email Address"
          />
          <Input
            label="Password :"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Password"
          />
          {serverError && <p className="error-message">{serverError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="forgot-password-link">
          <Link to="/forgot-password" className="login-link">
            Forgot Password?
          </Link>
        </div>
        <div className="login-link-wrapper">
          <p className="login-text">
            Don't have an account?{' '}
            <Link to="/signup" className="login-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;