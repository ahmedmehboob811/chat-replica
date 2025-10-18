import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';

// IMPORTANT: In a real application, these should be in a .env file
// and not hardcoded. For this environment, we are defining them here.
const CLERK_PUBLISHABLE_KEY = 'pk_test_aW5mb3JtZWQtbXVzdGFuZy00Ni5jbGVyay5hY2NvdW50cy5kZXYk';

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
