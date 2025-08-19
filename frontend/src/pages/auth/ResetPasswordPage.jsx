import React from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useParams } from '@tanstack/react-router';

export default function ResetPasswordPage() {
  // Get the token param directly from useParams
  const { token } = useParams({ from: '/auth/reset-password/$token' });

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ResetPasswordForm token={token} />
    </div>
  );
}
