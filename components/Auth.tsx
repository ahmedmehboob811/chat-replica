
import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Auth: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-gray-800">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
};

export default Auth;
