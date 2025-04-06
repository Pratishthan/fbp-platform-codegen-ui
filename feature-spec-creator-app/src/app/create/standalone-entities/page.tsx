'use client';

import React, { useState, Fragment } from 'react'; // Added useState, Fragment
import { useRouter } from 'next/navigation';
import { useAppStore, EntitySpec } from '@/lib/store'; // Import EntitySpec
import Button from '@/components/Button';
import EntityForm from '@/components/EntityForm'; // Import the form
import { Dialog, Transition } from '@headlessui/react'; // Import modal components

export default function StandaloneEntitiesPage() {
  const router = useRouter();
  const {
    setCurrentStep,
    entities,
    addStandaloneEntity,
    deleteEntity,
  } = useAppStore(); // Get entity state and actions

  // State for Entity modal
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);

  // --- Modal Handlers ---
  const openEntityModal = (entityId: string | null = null) => { // Allow null for adding new
    setEditingEntityId(entityId);
    setIsEntityModalOpen(true);
  };

  const closeEntityModal = () => {
    setIsEntityModalOpen(false);
    setEditingEntityId(null);
  };

  // --- Event Handlers ---
  const handleAddStandaloneEntity = () => {
    // We'll open the modal to add a new entity instead of using prompt
    openEntityModal(null);
    // Original prompt logic (can be removed or kept as alternative):
    // const name = prompt("Enter name for the new standalone entity:");
    // if (name && name.trim()) {
    //   addStandaloneEntity(name.trim());
    // } else if (name !== null) {
    //    alert("Entity name cannot be empty.");
    // }
  };

  const handleDeleteEntity = (entityId: string, entityName: string) => {
    if (confirm(`Are you sure you want to delete the entity "${entityName}"?`)) {
      deleteEntity(entityId);
    }
  };

  const handleNext = () => {
    setCurrentStep(5); // Next step is Review
    router.push('/create/review');
  };

  const handleBack = () => {
    setCurrentStep(3); // Previous step is Vendor Extensions
    router.push('/create/vendor-extensions');
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Step 4: Define Standalone Entities</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Define or manage standalone entity specifications.</p>

      {/* Entity Management Area */}
      <div className="border rounded-md shadow-sm p-4 min-h-[400px] dark:bg-gray-800 flex flex-col">
        <div className="mb-4">
          <button
            onClick={handleAddStandaloneEntity}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Standalone Entity
          </button>
        </div>
        {/* List of defined entities */}
        <div className="border-t pt-4 space-y-3 overflow-y-auto">
          {entities.filter(e => e.isStandalone).length === 0 ? ( // Filter for standalone
            <p className="text-sm text-gray-500 italic">No standalone entities defined yet.</p>
          ) : (
            entities.filter(e => e.isStandalone).map((entity) => ( // Filter for standalone
              <div key={entity.id} className="flex justify-between items-center p-2 border rounded bg-gray-50 dark:bg-gray-700">
                <div>
                  <span className="font-medium dark:text-gray-100">{entity.entityName}</span>
                  {/* Optional: Keep the badge if needed, though context implies standalone */}
                  {/* <span className={`text-xs ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800`}>
                     Standalone
                  </span> */}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => openEntityModal(entity.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title="Edit Entity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEntity(entity.id, entity.entityName)}
                    className="text-xs text-red-600 hover:text-red-800"
                    title="Delete Entity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button onClick={handleBack} variant="secondary">
          Back: Vendor Extensions
        </Button>
        <Button onClick={handleNext} variant="primary">
          Next: Review
        </Button>
      </div>

      {/* Entity Add/Edit Modal */}
      <Transition appear show={isEntityModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeEntityModal}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          {/* Modal Content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform rounded-lg bg-white dark:bg-gray-800 align-middle shadow-xl transition-all">
                  {/* Pass null entityId for adding new */}
                  {/* The EntityForm component itself checks if the entity is standalone */}
                  <EntityForm entityId={editingEntityId} onClose={closeEntityModal} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
