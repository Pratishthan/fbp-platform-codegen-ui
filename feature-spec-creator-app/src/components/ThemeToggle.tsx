'use client';

import React from 'react';

export default function ThemeToggle() {
  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      Toggle Dark Mode
    </button>
  );
}
