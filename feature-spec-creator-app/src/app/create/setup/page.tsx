'use client'; // Required for state and event handlers

import React, { useMemo, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import { useAppStore, Microservice } from '@/lib/store';
// Removed duplicate useState import
import { validateFeatureForm, FeatureFormFields, FeatureFormErrors } from '@/utils/validation';
import ErrorMessage from '@/components/ErrorMessage';
import Button from '@/components/Button';

export default function Step1Page() {
  const router = useRouter();
  const [errors, setErrors] = useState<FeatureFormErrors>({}); // State for errors
  const {
    featureName,
    setFeatureName,
    // Removed duplicate featureName and setFeatureName
    featureDescription,
    setFeatureDescription,
    userId,
    setUserId,
    availableMicroservices, // Get available services
    selectedMicroservice, // Get selected service state
    setSelectedMicroservice, // Get setter for selected service
    workflowType, // Get workflow type state
    setWorkflowType, // Get workflow type setter
    setCurrentStep,
  } = useAppStore();

  // --- Validation ---
  const validateForm = (): boolean => {
    const formFields: FeatureFormFields = {
      featureName,
      featureDescription,
      userId,
      selectedMicroservice,
      workflowType, // Include workflowType in validation
    };
    const newErrors = validateFeatureForm(formFields); // Assuming validateFeatureForm is updated or handles the new field gracefully
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check form validity whenever relevant state changes (optional, can just validate on submit)
  const isFormValid = useMemo(() => {
    // Basic check for button state, actual validation runs on submit attempt
    return featureName.trim() !== '' && featureDescription.trim() !== '' && userId.trim() !== '' && selectedMicroservice !== null && workflowType !== null; // Add workflowType check
  }, [featureName, featureDescription, userId, selectedMicroservice, workflowType]); // Add workflowType dependency


  // --- Handlers ---
  const handleMicroserviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    const service = availableMicroservices.find(ms => ms.repoUrl === selectedUrl) || null;
    setSelectedMicroservice(service);
  };

  const handleNext = () => {
    if (validateForm()) { // Validate before navigating
      setCurrentStep(2); // Set step regardless of path
      if (workflowType === 'entity-only') {
        router.push('/create/standalone-entities');
      } else {
        // For 'api-entity' or 'api-only'
        router.push('/create/specification');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Step 1: Initial Setup</h2>

      <div className="space-y-6"> {/* Increased spacing */}
        {/* Workflow Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Workflow Type <span className="text-red-600">*</span>
          </label>
          <div className="space-y-2">
            {(['api-entity', 'api-only', 'entity-only'] as const).map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="workflowType"
                  value={type}
                  checked={workflowType === type}
                  onChange={() => setWorkflowType(type)}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {type === 'api-entity' ? 'Define API + Entity' : type === 'api-only' ? 'Define only API' : 'Define only Entity'}
                </span>
              </label>
            ))}
          </div>
           <ErrorMessage message={errors.workflowType} />
        </div>

        {/* Existing Fields */}
        <div>
          <label htmlFor="featureName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Service Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="featureName"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            required
          />
          <ErrorMessage message={errors.featureName} />
        </div>
        <div>
          <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="featureDescription"
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            required
          />
          <ErrorMessage message={errors.featureDescription} />
        </div>
         <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Your Name/ID (for PR) <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            required
          />
          <ErrorMessage message={errors.userId} />
          <p className="text-xs text-gray-500 mt-1">Used in the Pull Request description.</p>
        </div>
        <div>
          <label htmlFor="microservice" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Select Microservice <span className="text-red-600">*</span>
          </label>
          <select
            id="microservice"
            value={selectedMicroservice?.repoUrl || ''}
            onChange={handleMicroserviceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:text-gray-100 dark:bg-gray-800" // Added dark mode styles
            required
          >
            <option value="" disabled>-- Select a Microservice --</option>
            {/* Ensure availableMicroservices is loaded before mapping */}
            {availableMicroservices && availableMicroservices.map((ms) => (
              <option key={ms.repoUrl} value={ms.repoUrl}>
                {ms.name} ({ms.repoOwner}/{ms.repoName})
              </option>
            ))}
          </select>
           <ErrorMessage message={errors.microservice} />
        </div>
      </div>

      {/* Navigation button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!isFormValid}
        >
          Next: Define Specs
        </Button>
      </div>
    </div>
  );
}
