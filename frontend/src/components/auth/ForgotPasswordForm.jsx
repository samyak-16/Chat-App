import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { forgotPassword } from '@/api/auth.api';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const appToken = import.meta.env.VITE_BACKEND_APP_TOKE_FOR_AUTH;

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents reload on submit

    if (!email) {
      setError('Please fill all the fields');
      setMessage('');
      return;
    }

    setError('');
    setMessage('');
    console.log('Verifying Email', email);

    try {
      setIsLoading(true);
      const response = await forgotPassword({ email, appToken });

      setMessage(response.message || 'Check your email for reset link!');
      setError('');
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
        <CardTitle>Forgot Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
          {error && <p className="text-sm mt-2 text-red-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;
