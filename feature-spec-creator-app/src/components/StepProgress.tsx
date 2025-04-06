'use client';

import { usePathname } from 'next/navigation';

const steps = [
  { step: 1, path: '/create/setup', label: 'Setup' },
  { step: 2, path: '/create/specification', label: 'OpenAPI Editor' },
  { step: 3, path: '/create/vendor-extensions', label: 'Vendor Extensions' },
  { step: 4, path: '/create/standalone-entities', label: 'Standalone Entities' },
  { step: 5, path: '/create/review', label: 'Review & Submit' },
];

export default function StepProgress() {
  const pathname = usePathname();

  // Find the current step based on the pathname
  const currentStepData = steps.find(s => pathname.startsWith(s.path));
  const currentStep = currentStepData ? currentStepData.step : 1; // Default to 1 if no match

  return (
    <div className="container mx-auto my-4 flex justify-center space-x-4">
      {steps.map(({ step, label }) => (
        <div key={step} className="flex items-center space-x-2">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2
              ${step === currentStep ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500'}
            `}
          >
            {step}
          </div>
          <span className={`text-sm ${step === currentStep ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {label}
          </span>
          {step !== steps.length && (
            <div className="w-6 border-t-2 border-gray-400 dark:border-gray-500"></div>
          )}
        </div>
      ))}
    </div>
  );
}
