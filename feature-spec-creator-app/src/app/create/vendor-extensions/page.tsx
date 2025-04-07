'use client';

import React, { useState, useMemo } from 'react'; // Removed Fragment (not used)
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Button from '@/components/Button';
import VendorExtensionForm from '@/components/VendorExtensionForm'; // Import the form
import * as yaml from 'js-yaml'; // Import js-yaml

export default function VendorExtensionsPage() {
  const router = useRouter();
  const { setCurrentStep, openApiYaml, workflowType } = useAppStore(); // Get openApiYaml and workflowType
  const [selectedSchemaName, setSelectedSchemaName] = useState<string | null>(null); // State for selected schema

  // Parse YAML to get schema names
  const definedSchemaNames = useMemo(() => {
    try {
      const parsedYaml = yaml.load(openApiYaml) as any;
      if (parsedYaml && typeof parsedYaml === 'object' && parsedYaml.components && parsedYaml.components.schemas) {
        return Object.keys(parsedYaml.components.schemas);
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return [];
  }, [openApiYaml]);

  // --- Navigation Handlers ---
  const handleNext = () => {
    if (workflowType === 'api-entity') {
      setCurrentStep(4); // Step 4 is Entities
      router.push('/create/standalone-entities');
    } else { // Assumes api-only
      setCurrentStep(4); // Step 4 is Review
      router.push('/create/review');
    }
  };

  const handleBack = () => {
    // Always goes back to Specification (Step 2) from Vendor Extensions
    setCurrentStep(2);
    router.push('/create/specification');
  };

  // Determine labels based on workflow
  const backButtonLabel = 'Back: Specification';
  const nextButtonLabel = workflowType === 'api-entity' ? 'Next: Entities' : 'Next: Review';
  const currentStepDisplay = 3; // Vendor Extensions is always Step 3 when shown

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Step {currentStepDisplay}: Configure Vendor Extensions</h2> {/* Dynamic Step */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Configure vendor extensions for schemas defined in the OpenAPI specification.</p>

      {/* Schema List & Vendor Extension Form Area */}
      <div className="border rounded-md shadow-sm p-4 min-h-[400px] dark:bg-gray-800 flex flex-col">
        {!selectedSchemaName ? (
          // Show list of schemas if none is selected
          <>
            <h4 className="text-md font-medium mb-3 dark:text-gray-100">Select Schema to Configure Extensions</h4>
            {definedSchemaNames.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-300 italic">Define schemas in the OpenAPI editor (Previous Step) first.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto">
                {definedSchemaNames.map(schemaName => (
                  <div key={schemaName} className="flex justify-between items-center p-2 border rounded bg-gray-50 dark:bg-gray-700">
                    <span className="font-mono text-sm dark:text-gray-100">{schemaName}</span>
                    <button
                      onClick={() => setSelectedSchemaName(schemaName)}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                      title={`Configure Vendor Extensions for ${schemaName}`}
                    >
                      Configure Extensions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Show VendorExtensionForm when a schema is selected
          <VendorExtensionForm
            schemaName={selectedSchemaName}
            isOpen={!!selectedSchemaName} // Control based on selection
            onClose={() => setSelectedSchemaName(null)} // Add a way to close/cancel
            currentYaml={openApiYaml}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button onClick={handleBack} variant="secondary">
          {backButtonLabel}
        </Button>
        <Button onClick={handleNext} variant="primary">
          {nextButtonLabel}
        </Button>
      </div>
    </div>
  );
}
