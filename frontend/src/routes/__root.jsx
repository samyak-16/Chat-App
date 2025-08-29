import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ToastProvider } from '@/components/ui/toast';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Oops! Something went wrong.</h1>
      <p className="text-red-600">{error?.message || 'Unknown error'}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
    </div>
  ),
});

function RootComponent() {
  return (
    <ToastProvider>
      <React.Fragment>
        <Outlet />
      </React.Fragment>
    </ToastProvider>
  );
}
