'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Button from '@/components/Button';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Example icons

export default function StandaloneEntitiesPage() {
  const router = useRouter();
  const { entities, deleteEntity, setCurrentStep, workflowType } = useAppStore(); // Added workflowType

  // Filter for standalone entities
  const standaloneEntities = entities.filter(entity => entity.isStandalone);

  const handleAddNewEntity = () => {
    // Navigate to the entity creation/editing step page
    // For now, assuming a route like '/create/standalone-entities-step/new'
    // We might need to create this page/component next.
    router.push('/create/standalone-entities-step/new'); // Placeholder route
  };

  const handleEditEntity = (entityId: string) => {
    // Navigate to the entity creation/editing step page with the ID
    router.push(`/create/standalone-entities-step/${entityId}`); // Placeholder route
  };

  const handleDeleteEntity = (entityId: string) => {
    // Add confirmation dialog here in a real app
    if (confirm('Are you sure you want to delete this entity?')) {
      deleteEntity(entityId);
    }
  };

  const handleNext = () => {
    // Go to Review (Step 5 for api-entity, Step 3 for entity-only)
    const nextStepNumber = workflowType === 'api-entity' ? 5 : 3;
    setCurrentStep(nextStepNumber);
    router.push('/create/review');
  };

  const handleBack = () => {
    // Go back to Vendor Ext (Step 3) for api-entity, or Setup (Step 1) for entity-only
    const previousStepNumber = workflowType === 'api-entity' ? 3 : 1;
    const previousPath = workflowType === 'api-entity' ? '/create/vendor-extensions' : '/create/setup';
    setCurrentStep(previousStepNumber);
    router.push(previousPath);
  };

  // Determine labels and step number
  const backButtonLabel = workflowType === 'api-entity' ? 'Back: Vendor Ext.' : 'Back: Setup';
  const nextButtonLabel = 'Next: Review';
  const currentStepDisplay = workflowType === 'api-entity' ? 4 : 2; // Step 4 for api-entity, Step 2 for entity-only

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Step {currentStepDisplay}: Define Entities</h2> {/* Dynamic Step */}

      <div className="mb-6">
        <Button onClick={handleAddNewEntity} variant="primary">
          <PlusIcon className="h-5 w-5 mr-2 inline-block" />
          Add New Entity
        </Button>
      </div>

      {standaloneEntities.length > 0 ? (
        <div className="space-y-4">
          {standaloneEntities.map((entity) => (
            <div key={entity.id} className="border rounded-md p-4 flex justify-between items-center dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{entity.entityName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Table: {entity.tableName || '(Not specified)'}</p>
                {/* Optionally display number of fields/relationships */}
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleEditEntity(entity.id)} variant="secondary"> {/* Removed size="sm" */}
                  <PencilIcon className="h-4 w-4 mr-1 inline-block" /> Edit
                </Button>
                <Button onClick={() => handleDeleteEntity(entity.id)} variant="danger"> {/* Removed size="sm" */}
                  <TrashIcon className="h-4 w-4 mr-1 inline-block" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No standalone entities defined yet.</p>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button onClick={handleBack} variant="secondary">
          {backButtonLabel}
        </Button>
        {/* Enable Next button only if at least one entity is defined? Or always allow? */}
        <Button onClick={handleNext} variant="primary">
          {nextButtonLabel}
        </Button>
      </div>
    </div>
  );
}
