import { createFileRoute } from '@tanstack/react-router';

import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Export the route as 'Route' — file-based system uses this automatically
export const Route = createFileRoute('/auth/reset-password/$token')({
  component: ResetPasswordPage,
});
