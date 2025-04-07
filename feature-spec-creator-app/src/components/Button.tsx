'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  let baseStyles =
    'font-semibold px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-blue-600 text-white hover:bg-blue-700';
      break;
    case 'secondary':
      variantStyles =
        'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 hover:dark:bg-gray-600';
      break;
    case 'danger':
      variantStyles =
        'bg-red-600 text-white hover:bg-red-700';
      break;
    case 'success':
      variantStyles =
        'bg-green-600 text-white hover:bg-green-700';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
