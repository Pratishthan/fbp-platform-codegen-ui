'use client';

import React, { useState, useMemo } from 'react'; // Import useMemo
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Editor from '@monaco-editor/react';
import * as yaml from 'js-yaml'; // Import js-yaml
import { toast } from 'react-toastify';
import { submitToGitHub, logSubmission } from '@/utils/api';
import ErrorMessage from '@/components/ErrorMessage';
import Button from '@/components/Button';

export default function Step3Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [submitted, setSubmitted] = useState(false); // Submission state
  const {
    featureName,
    featureDescription,
    userId,
    selectedMicroservice,
    openApiYaml,
    entities,
    workflowType, // Get workflow type
    setCurrentStep,
    resetState, // Get reset action for success
  } = useAppStore();

  const handleSubmit = async () => {
    setError(null); // Clear previous errors
    if (!selectedMicroservice) {
      setError("No microservice selected.");
      return;
    }
    if (!featureName || !featureDescription || !userId) {
        setError("Service Name, Description, or User ID is missing.");
        return;
    }

    // --- YAML Validation (Only if relevant) ---
    if (workflowType === 'api-entity' || workflowType === 'api-only') {
      try {
          yaml.load(openApiYaml); // Try parsing
      } catch (yamlError: any) {
          setError(`Invalid OpenAPI YAML syntax: ${yamlError.message}`);
          return; // Stop submission if YAML is invalid
      }
      // Add more advanced OpenAPI schema validation here if needed later
    }

    setIsLoading(true);

    // --- Build Payload Conditionally ---
    const basePayload = {
      repoOwner: selectedMicroservice.repoOwner,
      repoName: selectedMicroservice.repoName,
      featureName,
      featureDescription,
      userId,
      workflowType, // Include workflow type in payload
    };

    const payload = {
      ...basePayload,
      ...( (workflowType === 'api-entity' || workflowType === 'api-only') && { openApiYaml } ),
      ...( (workflowType === 'api-entity' || workflowType === 'entity-only') && { entities } ),
    };

    try {
      const { pullRequestUrl } = await submitToGitHub(payload);

      toast.success(`Pull Request created!`, {
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
        onClick: () => window.open(pullRequestUrl, '_blank'),
      });
      setSubmitted(true);

      console.log("Attempting to log submission...");
      try {
        // --- Build Log Payload Conditionally ---
        const baseLogPayload = {
          submission_timestamp: new Date().toISOString(),
          user_id: userId,
          microservice_ref: selectedMicroservice.repoUrl,
          feature_name: featureName,
          workflow_type: workflowType, // Log workflow type
          pull_request_url: pullRequestUrl,
        };
        const logPayload = {
          ...baseLogPayload,
          ...( (workflowType === 'api-entity' || workflowType === 'api-only') && { openapi_schema_names: definedSchemaNames } ),
          ...( (workflowType === 'api-entity' || workflowType === 'entity-only') && { entity_spec_names: entities.map(e => e.entityName) } ),
        };
        await logSubmission(logPayload);
        console.log("Submission logged successfully.");
      } catch (logError) {
        console.warn("Error calling logging API:", logError);
      }

    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unknown error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate back based on workflow
    let previousStepNumber: number;
    let previousPath: string;

    switch (workflowType) {
      case 'api-entity':
        previousStepNumber = 4; // Entities
        previousPath = '/create/standalone-entities';
        break;
      case 'api-only':
        previousStepNumber = 3; // Vendor Ext
        previousPath = '/create/vendor-extensions';
        break;
      case 'entity-only':
        previousStepNumber = 2; // Entities
        previousPath = '/create/standalone-entities';
        break;
      default: // Should not happen, but default to vendor ext
        previousStepNumber = 3;
        previousPath = '/create/vendor-extensions';
    }
    setCurrentStep(previousStepNumber);
    router.push(previousPath);
  };

  // --- Derived Data ---
  // Get schema names for logging payload
   const definedSchemaNames = useMemo(() => {
    try {
      const parsedYaml = yaml.load(openApiYaml) as any;
      if (parsedYaml && typeof parsedYaml === 'object' && parsedYaml.components && parsedYaml.components.schemas) {
        return Object.keys(parsedYaml.components.schemas);
      }
    } catch (e) { /* Ignore */ }
    return [];
  }, [openApiYaml]);

  const targetRepoUrl = selectedMicroservice?.repoUrl || 'N/A';
  const branchName = `feature/${featureName?.toLowerCase().replace(/\s+/g, '-') || 'new-feature'}`;
  // Make commit message more generic
  const commitMessage = `feat: Add specification for ${featureName || 'new feature'} (${workflowType || 'unknown type'})`;

  // Determine step number and back button label based on workflow
  let currentStepDisplay: number;
  let backButtonLabel: string;

  switch (workflowType) {
    case 'api-entity':
      currentStepDisplay = 5;
      backButtonLabel = 'Back: Entities';
      break;
    case 'api-only':
      currentStepDisplay = 4;
      backButtonLabel = 'Back: Vendor Ext.';
      break;
    case 'entity-only':
      currentStepDisplay = 3;
      backButtonLabel = 'Back: Entities';
      break;
    default: // Default case
      currentStepDisplay = 5;
      backButtonLabel = 'Back: Entities';
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Step {currentStepDisplay}: Review & Submit</h2> {/* Dynamic Step Number */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Review the generated specifications before submitting.</p>

      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm"> {/* Changed bg */}
          <h3 className="text-lg font-medium mb-3 border-b pb-2 text-gray-800 dark:text-gray-100">Service Details</h3> {/* Added text color */}
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div className="md:col-span-1"><dt className="font-medium text-gray-500 dark:text-gray-300">Service Name:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{featureName || 'N/A'}</dd></div>
            <div className="md:col-span-2"><dt className="font-medium text-gray-500 dark:text-gray-300">Description:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{featureDescription || 'N/A'}</dd></div>
            <div className="md:col-span-1"><dt className="font-medium text-gray-500 dark:text-gray-300">Initiator:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{userId || 'N/A'}</dd></div>
            <div className="md:col-span-2"><dt className="font-medium text-gray-500 dark:text-gray-300">Target Microservice:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{selectedMicroservice?.name || 'N/A'} ({selectedMicroservice?.repoUrl || 'N/A'})</dd></div>
          </dl>
        </div>

        {/* Section 2: Git Info */}
         <div className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm"> {/* Changed bg */}
          <h3 className="text-lg font-medium mb-3 border-b pb-2 text-gray-800 dark:text-gray-100">Git Details</h3> {/* Added text color */}
           <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div className="md:col-span-3"><dt className="font-medium text-gray-500 dark:text-gray-300">Target Repository:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{targetRepoUrl}</dd></div>
            <div className="md:col-span-1"><dt className="font-medium text-gray-500 dark:text-gray-300">Branch Name:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100 font-mono">{branchName}</dd></div>
            <div className="md:col-span-2"><dt className="font-medium text-gray-500 dark:text-gray-300">Commit Message:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{commitMessage}</dd></div>
          </dl>
        </div>

        {/* Section 3: OpenAPI Spec (Conditional) */}
        {(workflowType === 'api-entity' || workflowType === 'api-only') && (
          <div className="border rounded-md shadow-sm overflow-hidden">
            <h3 className="text-lg font-medium bg-gray-100 dark:bg-gray-700 p-3 border-b text-gray-800 dark:text-gray-100">OpenAPI Specification (YAML)</h3>
            <div className="h-[400px] bg-gray-50 dark:bg-gray-800">
              <Editor
                height="100%"
                language="yaml"
                theme="vs-dark"
                value={openApiYaml}
                onMount={(editor, monaco) => {
                  const updateTheme = () => {
                    const isDark = document.documentElement.classList.contains('dark');
                    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs-light');
                  };
                  updateTheme();
                  const observer = new MutationObserver(updateTheme);
                  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
                }}
                options={{
                  readOnly: true, // Make editor read-only
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        )}

         {/* Section 4: Entity Specs (Conditional) */}
         {(workflowType === 'api-entity' || workflowType === 'entity-only') && (
           <div className="border rounded-md shadow-sm">
             <h3 className="text-lg font-medium bg-gray-100 dark:bg-gray-700 p-3 border-b text-gray-800 dark:text-gray-100">Entity Specifications ({entities.length})</h3>
             {entities.length > 0 ? (
               <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                 {entities.map(entity => (
                   <details key={entity.id} className="border rounded">
                     <summary className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                       {entity.entityName}
                       <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${entity.isStandalone ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                         {entity.isStandalone ? 'Standalone' : 'Linked'}
                       </span>
                     </summary>
                     <pre className="p-4 bg-gray-800 text-white text-xs overflow-x-auto rounded-b">
                       {JSON.stringify(entity, null, 2)}
                     </pre>
                   </details>
                 ))}
               </div>
             ) : (
               <p className="p-4 text-sm text-gray-500 italic">No entities defined for this workflow.</p>
             )}
           </div>
         )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        {submitted ? (
          <div className="flex justify-center w-full">
            <Button
              onClick={() => {
                resetState(); // Reset state (now preserves microservices and domain types)
                setSubmitted(false); // Reset submission status for the current page
                // setCurrentStep(1); // resetState already sets currentStep to 1
                router.push('/create/setup'); // Navigate back to setup
              }}
              variant="primary"
            >
              Create New Service
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={handleBack}
              variant="secondary"
            >
              {backButtonLabel} {/* Dynamic Button Text */}
            </Button>
            <div className="flex items-center space-x-4">
              <ErrorMessage message={error || undefined} className="max-w-md" />
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                variant="success"
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
