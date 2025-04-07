'use client';

import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store'; // Import the store
import { useMemo } from 'react'; // Import useMemo

// Define all possible steps with unique keys and default labels
const allSteps = [
  { key: 'setup', path: '/create/setup', label: 'Setup' },
  { key: 'specification', path: '/create/specification', label: 'Specification' },
  { key: 'vendor', path: '/create/vendor-extensions', label: 'Vendor Ext.' },
  { key: 'entities', path: '/create/standalone-entities', label: 'Entities' },
  { key: 'review', path: '/create/review', label: 'Review' },
];

export default function StepProgress() {
  const pathname = usePathname();
  const workflowType = useAppStore(state => state.workflowType);

  // Determine the sequence of step keys for each workflow
  const stepSequences: { [key: string]: string[] } = {
    'api-entity': ['setup', 'specification', 'vendor', 'entities', 'review'], // 5 steps
    'api-only': ['setup', 'specification', 'vendor', 'review'],             // 4 steps
    'entity-only': ['setup', 'entities', 'review'],                         // 3 steps
  };

  // Get the active sequence based on workflowType, default to api-entity if null/undefined
  const activeSequence = stepSequences[workflowType || 'api-entity'];

  // Filter allSteps based on the active sequence and maintain order, then renumber
  const activeSteps = useMemo(() => {
    const filteredSteps = activeSequence.map(key => {
      const stepData = allSteps.find(s => s.key === key);
      if (!stepData) {
        console.error(`StepProgress: Step with key "${key}" not found in allSteps.`);
        return null; // Should not happen if keys match
      }
      return stepData;
    }).filter(step => step !== null) as typeof allSteps; // Filter out nulls and assert type

    // Renumber steps sequentially based on the filtered order
    return filteredSteps.map((step, index) => ({
      ...step,
      step: index + 1, // Assign sequential step number (1-based)
    }));
  }, [workflowType]);

  // Find the current step based on the pathname within the *active* steps
  const currentStepData = activeSteps.find(s => pathname.startsWith(s.path));
  const currentStepNumber = currentStepData ? currentStepData.step : 1; // Use the renumbered step

  return (
    <div className="container mx-auto my-4 flex justify-center items-center space-x-2 md:space-x-4 overflow-x-auto pb-2"> {/* Added padding and overflow */}
      {activeSteps.map(({ key, step, label }, index) => {
        // Pre-calculate conditional classes
        const isCurrent = step === currentStepNumber;
        const stepBaseClasses = "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 text-xs md:text-sm shrink-0";
        const stepConditionalClasses = isCurrent
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500';
        const labelConditionalClasses = isCurrent
          ? 'font-semibold text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300';

        return (
          <div key={key} className="flex items-center space-x-2 md:space-x-3"> {/* Adjusted spacing */}
            <div className={stepBaseClasses + " " + stepConditionalClasses}> {/* Use concatenation */}
              {step}
            </div>
            <span className={`text-xs md:text-sm whitespace-nowrap ${labelConditionalClasses}`}> {/* Added whitespace-nowrap */}
              {label}
            </span>
            {index !== activeSteps.length - 1 && ( // Check index instead of step number
              <div className="w-4 md:w-6 border-t-2 border-gray-400 dark:border-gray-500 shrink-0"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
