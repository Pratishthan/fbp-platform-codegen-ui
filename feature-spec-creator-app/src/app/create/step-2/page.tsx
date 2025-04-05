'use client';

import React, { useEffect, useRef, useState, Fragment, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Dialog, Transition } from '@headlessui/react';
import { useAppStore, EntitySpec } from '@/lib/store';
import EntityForm from '@/components/EntityForm';
import VendorExtensionForm from '@/components/VendorExtensionForm'; // Import the form
import * as yaml from 'js-yaml';

// Basic OpenAPI template
const getOpenApiTemplate = (title: string, description: string): string => `
openapi: 3.0.3
info:
  title: ${title || 'Feature Title'}
  version: 1.0.0
  description: ${description || 'Feature Description'}
servers: []
paths: {}
components:
  schemas: {}
`;

export default function Step2Page() {
  const router = useRouter();
  const {
    featureName,
    featureDescription,
    openApiYaml,
    setOpenApiYaml,
    entities,
    addStandaloneEntity,
    deleteEntity,
    setCurrentStep,
  } = useAppStore();
  const editorInitialized = useRef(false);

  // State for Entity modal
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  // State for Vendor Extension modal
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingSchemaName, setEditingSchemaName] = useState<string | null>(null);


  // --- Modal Handlers ---
  const openEntityModal = (entityId: string) => {
    setEditingEntityId(entityId);
    setIsEntityModalOpen(true);
  };

  const closeEntityModal = () => {
    setIsEntityModalOpen(false);
    setEditingEntityId(null);
  };

  // Vendor Extension modal handlers
  const openVendorModal = (schemaName: string) => {
    setEditingSchemaName(schemaName);
    setIsVendorModalOpen(true);
  };
  const closeVendorModal = () => {
    setIsVendorModalOpen(false);
    setEditingSchemaName(null);
  };


  // --- Derived State ---

  // Parse YAML to get schema names
  const definedSchemaNames = useMemo(() => {
    try {
      const parsedYaml = yaml.load(openApiYaml) as any;
      if (parsedYaml && typeof parsedYaml === 'object' && parsedYaml.components && parsedYaml.components.schemas) {
        return Object.keys(parsedYaml.components.schemas);
      }
    } catch (e) {
      // Ignore parsing errors during typing
    }
    return [];
  }, [openApiYaml]);


  // --- Effects ---

  // Initialize editor content
  useEffect(() => {
    if (!editorInitialized.current && featureName) {
      const initialYaml = getOpenApiTemplate(featureName, featureDescription).trim();
      if (!openApiYaml || openApiYaml.length < 50) {
         setOpenApiYaml(initialYaml);
      }
      editorInitialized.current = true;
    }
  }, [featureName, featureDescription, openApiYaml, setOpenApiYaml]);


  // --- Event Handlers ---
  const handleNext = () => {
    setCurrentStep(3);
    router.push('/create/step-3');
  };

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/create/step-1');
  };

  const handleEditorChange = (value: string | undefined) => {
    setOpenApiYaml(value || '');
  };

  const handleAddStandaloneEntity = () => {
      const name = prompt("Enter name for the new standalone entity:");
      if (name && name.trim()) {
        addStandaloneEntity(name.trim());
      } else if (name !== null) {
         alert("Entity name cannot be empty.");
      }
  };

  const handleDeleteEntity = (entityId: string, entityName: string) => {
     if (confirm(`Are you sure you want to delete the entity "${entityName}"?`)) {
        deleteEntity(entityId);
     }
  };

  // Placeholder for adding schema
  const handleAddSchema = () => {
      alert("Adding schemas directly via button is not implemented yet. Please define schemas in the YAML editor.");
      // Future: Prompt for schema name, add basic structure to YAML
  };

  // Placeholder for configuring vendor extensions
  const handleConfigureExtensions = (schemaName: string) => {
      alert(`Configuring vendor extensions for "${schemaName}" is not implemented yet (Prompt 11).`);
      // Future: openVendorModal(schemaName);
  };


  // --- Render ---
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Step 2: Specification Editor</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Define your OpenAPI specification and associated entities.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Panel: OpenAPI Editor */}
        <div className="border rounded-md shadow-sm overflow-hidden flex flex-col dark:bg-gray-800">
           <h3 className="text-lg font-medium bg-gray-50 dark:bg-gray-700 p-3 border-b flex justify-between items-center dark:text-gray-100">
             <span>OpenAPI Specification (YAML)</span>
             <button
                onClick={handleAddSchema}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                title="Add new schema definition (Coming Soon)"
             >
                + Add Schema
             </button>
           </h3>
           <div className="flex-grow h-[600px] min-h-[300px] bg-gray-50 dark:bg-gray-900"> {/* Match background to theme */}
            <Editor
              height="100%"
              language="yaml"
              theme="vs-dark"
              value={openApiYaml}
              onChange={handleEditorChange}
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
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right Panel: Entity & Schema Definitions */}
        <div className="border rounded-md shadow-sm p-4 flex flex-col dark:bg-gray-800">
          {/* Entity Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Entity Specifications</h3>
            <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">Define standalone entities or link them from schemas using Vendor Extensions.</p>
            <div className="mb-4">
               <button
                  onClick={handleAddStandaloneEntity}
                  className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
               >
                  Add Standalone Entity
               </button>
            </div>
             {/* List of defined entities */}
             <div className="border-t pt-4 space-y-3">
                {entities.length === 0 ? (
                   <p className="text-sm text-gray-500 italic">No entities defined yet.</p>
                ) : (
                   entities.map((entity) => (
                     <div key={entity.id} className="flex justify-between items-center p-2 border rounded bg-gray-50 dark:bg-gray-700">
                       <div>
                          <span className="font-medium dark:text-gray-100">{entity.entityName}</span>
                          <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${entity.isStandalone ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                             {entity.isStandalone ? 'Standalone' : 'Linked'}
                          </span>
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

           {/* Schema List for Vendor Extensions */}
           <div className="mt-6 border-t pt-4">
              <h4 className="text-md font-medium mb-3 dark:text-gray-100">Schema Vendor Extensions</h4>
              {definedSchemaNames.length === 0 ? (
                 <p className="text-sm text-gray-500 dark:text-gray-300 italic">Define schemas in the YAML editor first.</p>
              ) : (
                 <div className="space-y-2">
                    {definedSchemaNames.map(schemaName => (
                       <div key={schemaName} className="flex justify-between items-center p-2 border rounded bg-gray-50 dark:bg-gray-700">
                          <span className="font-mono text-sm">{schemaName}</span>
                          <button
                             onClick={() => openVendorModal(schemaName)} // Wire up button
                             className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                             title={`Configure Vendor Extensions for ${schemaName}`}
                          >
                             Configure Extensions
                          </button>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-6 py-2 rounded-md hover:bg-gray-400 hover:dark:bg-gray-600 transition-colors"
        >
          Back: Setup
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Next: Review
        </button>
      </div>

      {/* Entity Edit Modal */}
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
                <Dialog.Panel className="w-full max-w-4xl transform rounded-lg bg-white align-middle shadow-xl transition-all">
                  {editingEntityId && (
                     <EntityForm entityId={editingEntityId} onClose={closeEntityModal} />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Vendor Extension Modal */}
      <Transition appear show={isVendorModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeVendorModal}> {/* Higher z-index if needed */}
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
                <Dialog.Panel className="w-full max-w-3xl transform rounded-lg bg-white align-middle shadow-xl transition-all">
                  {/* Render VendorExtensionForm */}
                  <VendorExtensionForm
                    schemaName={editingSchemaName}
                    isOpen={isVendorModalOpen} // Pass state to control rendering inside if needed
                    onClose={closeVendorModal}
                    currentYaml={openApiYaml} // Pass current YAML state
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
