'use client';

import React from 'react';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Feature Spec Creator</span>
        <button
          onClick={() => {
            if (typeof document !== 'undefined') {
              document.documentElement.classList.toggle('dark');
              const isDark = document.documentElement.classList.contains('dark');
              localStorage.setItem('theme', isDark ? 'dark' : 'light');
            }
          }}
          className="ml-4 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Toggle Theme
        </button>
      </nav>
    </header>
  );
}
