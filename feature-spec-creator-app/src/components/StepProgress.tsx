'use client';

import { usePathname } from 'next/navigation';

const steps = [
  { step: 1, label: 'Setup' },
  { step: 2, label: 'Specification' },
  { step: 3, label: 'Review' },
];

export default function StepProgress() {
  const pathname = usePathname();

  let currentStep = 1;
  if (pathname.includes('/create/step-2')) currentStep = 2;
  if (pathname.includes('/create/step-3')) currentStep = 3;

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
