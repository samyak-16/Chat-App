import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router'; // or your router
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { resetPassword } from '@/api/auth'; // your API function

const ResetPasswordForm = ({ token }) => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const appToken = import.meta.env.VITE_BACKEND_APP_TOKE_FOR_AUTH;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter a new password');
      setMessage('');
      return;
    }

    setError('');
    setMessage('');

    try {
      setIsLoading(true);
      const response = await resetPassword({ token, password, appToken });

      setMessage(response.message || 'Password reset successful!');
      setError('');
      // redirect to login after 2s
      setTimeout(() => navigate({ to: '/auth/login' }), 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || 'Something went wrong.'
      );
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
          {error && <p className="text-sm mt-2 text-red-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
