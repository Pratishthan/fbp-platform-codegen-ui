'use client';

import React from 'react';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      className={`text-xs text-red-700 bg-red-100 border border-red-300 rounded p-2 mt-1 ${className}`}
    >
      {message}
    </p>
  );
}
