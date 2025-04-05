'use client'; // Required for state and event handlers

import React, { useMemo } from 'react'; // Import useMemo
import { useRouter } from 'next/navigation';
import { useAppStore, Microservice } from '@/lib/store';
import { useState } from 'react';
import { validateFeatureForm, FeatureFormFields, FeatureFormErrors } from '@/utils/validation';

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
    setCurrentStep,
  } = useAppStore();

  // --- Validation ---
  const validateForm = (): boolean => {
    const formFields: FeatureFormFields = {
      featureName,
      featureDescription,
      userId,
      selectedMicroservice,
    };
    const newErrors = validateFeatureForm(formFields);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check form validity whenever relevant state changes (optional, can just validate on submit)
   const isFormValid = useMemo(() => {
     // Basic check for button state, actual validation runs on submit attempt
     return featureName.trim() !== '' && featureDescription.trim() !== '' && userId.trim() !== '' && selectedMicroservice !== null;
   }, [featureName, featureDescription, userId, selectedMicroservice]);


  // --- Handlers ---
  const handleMicroserviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    const service = availableMicroservices.find(ms => ms.repoUrl === selectedUrl) || null;
    setSelectedMicroservice(service);
  };

  const handleNext = () => {
    if (validateForm()) { // Validate before navigating
      setCurrentStep(2);
      router.push('/create/step-2');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Step 1: Initial Setup</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="featureName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Feature Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="featureName"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            required
          />
          {errors.featureName && (
            <p className="text-xs text-red-700 bg-red-100 border border-red-300 rounded p-2 mt-1">
              {errors.featureName}
            </p>
          )}
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
          {errors.featureDescription && (
            <p className="text-xs text-red-700 bg-red-100 border border-red-300 rounded p-2 mt-1">
              {errors.featureDescription}
            </p>
          )}
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
          {errors.userId && (
            <p className="text-xs text-red-700 bg-red-100 border border-red-300 rounded p-2 mt-1">
              {errors.userId}
            </p>
          )}
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
           {errors.microservice && (
            <p className="text-xs text-red-700 bg-red-100 border border-red-300 rounded p-2 mt-1">
              {errors.microservice}
            </p>
          )}
        </div>
      </div>

      {/* Navigation button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid}
        >
          Next: Define Specs
        </button>
      </div>
    </div>
  );
}
