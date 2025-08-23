import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import InputField from './InputField';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import RedirectLink from './RedirectLink';
import AuthCard from './AuthCard';
import { registerUser } from '../../api/auth.api';
import OkMessage from './OkMessage';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const appToken = import.meta.env.VITE_BACKEND_APP_TOKE_FOR_AUTH;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    console.log('Signing up:', { name, email, password });
    // 🔗 Calling backend API here
    try {
      setIsLoading(true);
      const response = await registerUser({ email, password, name, appToken });
      setError('');
      setMessage(response.message);
      setTimeout(() => {
        navigate({ to: '/auth/login' });
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setMessage('');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Signup">
      <form onSubmit={handleSubmit}>
        <InputField
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <ErrorMessage message={error} />
        <OkMessage message={message} />
        <Button disabled={isLoading} type="submit" label="Signup" />
      </form>
      <RedirectLink
        text="Already have an account?"
        linkText="Login"
        to="/auth/login"
      />
    </AuthCard>
  );
};

export default SignupForm;
