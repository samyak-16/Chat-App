import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import InputField from './InputField';
import AuthCard from './AuthCard';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import OkMessage from './OkMessage';
import { loginUser } from '../../api/auth';
import { useAuth } from '../../store/useAuth';

const LoginForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { setUser } = useAuth(); // Rerenders everyTime so not useFull - Read Zustand.md
  const setUser = useAuth((state) => state.setUser);
  //Here state is the whole store object
  // The selector (state) => state.setUser returns only the piece of state or function you want.

  const appToken = import.meta.env.VITE_BACKEND_APP_TOKE_FOR_AUTH;
  const navigate = useNavigate(); //TODO

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents reload on submit

    if (!form.email || !form.password) {
      setError('Please fill all the fields');
      return;
    }
    setError('');
    console.log('You are beeing LoggedIn', form);
    try {
      setIsLoading(true);
      const response = await loginUser({ ...form, appToken });
      localStorage.setItem('token', response.data.token);
      setUser(response.user);
      setError('');
      setMessage(response.message);
      // setTimeout(() => {
      //   navigate({ to: '/messages' });
      // }, 1500);
      console.log(response.data);
    } catch (error) {
      setIsLoading(false);
      setMessage('');
      setError(error.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your Email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
          }}
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Enter your Password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
          }}
        />

        <ErrorMessage message={error} />
        <OkMessage message={message} />
        <Button disabled={isLoading} type="submit" label="Login" />
      </form>
    </AuthCard>
  );
};

export default LoginForm;
