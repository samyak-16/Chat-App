import { createFileRoute } from '@tanstack/react-router';
import SignupForm from '../../pages/auth/SignupPage';

export const Route = createFileRoute('/auth/register')({
  component: SignupForm,
});
