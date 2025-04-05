'use client';

import React, { useState, useMemo } from 'react'; // Import useMemo
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Editor from '@monaco-editor/react';
import * as yaml from 'js-yaml'; // Import js-yaml
import { toast } from 'react-toastify';

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
        setError("Feature Name, Description, or User ID is missing.");
        return;
    }

    // --- YAML Validation (Basic Syntax Check) ---
    try {
        yaml.load(openApiYaml); // Try parsing
    } catch (yamlError: any) {
        setError(`Invalid OpenAPI YAML syntax: ${yamlError.message}`);
        return; // Stop submission if YAML is invalid
    }
    // Add more advanced OpenAPI schema validation here if needed later

    setIsLoading(true);

    const payload = {
      repoOwner: selectedMicroservice.repoOwner,
      repoName: selectedMicroservice.repoName,
      featureName: featureName,
      featureDescription: featureDescription,
      userId: userId,
      openApiYaml: openApiYaml,
      entities: entities, // Send the full entity specs
    };

    try {
      const response = await fetch('/api/github-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      const pullRequestUrl = result.pullRequestUrl;

      // Success - Log the submission (fire and forget, mostly)
      toast.success(`Pull Request created!`, {
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
        onClick: () => window.open(pullRequestUrl, '_blank'),
      });
      setSubmitted(true);
      console.log("Attempting to log submission...");
      try {
        const logPayload = {
            submission_timestamp: new Date().toISOString(),
            user_id: userId,
            microservice_ref: selectedMicroservice.repoUrl, // Use repoUrl as ref
            feature_name: featureName,
            openapi_schema_names: definedSchemaNames, // Use derived schema names
            entity_spec_names: entities.map(e => e.entityName),
            pull_request_url: pullRequestUrl,
        };
        const logResponse = await fetch('/api/log-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logPayload),
        });
        if (!logResponse.ok) {
            console.warn("Logging submission failed:", await logResponse.text());
            // Don't show error to user, just log it
        } else {
             console.log("Submission logged successfully.");
        }
      } catch (logError) {
          console.warn("Error calling logging API:", logError);
      }

      // Optional: Reset state and navigate home after success + logging attempt
      // resetState();
      // router.push('/');

    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unknown error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
    router.push('/create/step-2');
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
  const commitMessage = `feat: Define API specification for ${featureName || 'new feature'}`;


  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Step 3: Review & Submit</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Review the generated specifications before submitting.</p>

      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm"> {/* Changed bg */}
          <h3 className="text-lg font-medium mb-3 border-b pb-2 text-gray-800 dark:text-gray-100">Feature Details</h3> {/* Added text color */}
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div className="md:col-span-1"><dt className="font-medium text-gray-500 dark:text-gray-300">Feature Name:</dt><dd className="mt-1 text-gray-900 dark:text-gray-100">{featureName || 'N/A'}</dd></div>
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

        {/* Section 3: OpenAPI Spec */}
        <div className="border rounded-md shadow-sm overflow-hidden">
           <h3 className="text-lg font-medium bg-gray-100 dark:bg-gray-700 p-3 border-b text-gray-800 dark:text-gray-100">OpenAPI Specification (YAML)</h3> {/* Changed bg, Added text color */}
           <div className="h-[400px] bg-gray-50 dark:bg-gray-800"> {/* Adjusted bg */}
            <Editor
              height="100%"
              language="yaml"
              theme="vs-dark"
              value={openApiYaml}
              options={{
                readOnly: true, // Make editor read-only
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

         {/* Section 4: Entity Specs */}
        <div className="border rounded-md shadow-sm">
           <h3 className="text-lg font-medium bg-gray-100 dark:bg-gray-700 p-3 border-b text-gray-800 dark:text-gray-100">Entity Specifications ({entities.length})</h3> {/* Changed bg, Added text color */}
           {entities.length > 0 ? (
             <div className="p-4 space-y-4 bg-white dark:bg-gray-800"> {/* Added bg */}
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
             <p className="p-4 text-sm text-gray-500 italic">No entities defined.</p>
           )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        {submitted ? (
          <div className="flex justify-center w-full">
            <button
              onClick={() => {
                resetState();
                // Re-populate microservices list after reset
                const defaultMicroservices = [
                  {
                    name: "Test Service",
                    repoOwner: "Pratishthan",
                    repoName: "fbp-test-component",
                    repoUrl: "https://github.com/Pratishthan/fbp-test-component"
                  },
                  {
                    name: "Order Processor",
                    repoOwner: "my-org",
                    repoName: "order-processor",
                    repoUrl: "https://github.com/my-org/order-processor"
                  },
                  {
                    name: "Product Catalog",
                    repoOwner: "your-org",
                    repoName: "product-catalog",
                    repoUrl: "https://github.com/your-org/product-catalog"
                  }
                ];
                // @ts-ignore
                useAppStore.getState().setAvailableMicroservices(defaultMicroservices);
                setSubmitted(false);
                setCurrentStep(1);
                router.push('/create/step-1');
              }}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Feature
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleBack}
              className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-6 py-2 rounded-md hover:bg-gray-400 hover:dark:bg-gray-600 transition-colors"
            >
              Back: Editor
            </button>
            <div className="flex items-center space-x-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
