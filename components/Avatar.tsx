import React from 'react';
import { Profile } from '../types.ts';

interface AvatarProps {
  user: Profile;
}

const Avatar: React.FC<AvatarProps> = ({ user }) => {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-300">
          {user.full_name?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};

export default Avatar;
