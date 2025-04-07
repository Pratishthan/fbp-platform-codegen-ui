'use client';

import React, { useEffect, useRef } from 'react'; // Removed useState, Fragment, useMemo
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
// Removed Dialog, Transition imports
import { useAppStore } from '@/lib/store'; // Removed EntitySpec import
// Removed EntityForm, VendorExtensionForm imports
import * as yaml from 'js-yaml'; // Keep yaml for template
import Button from '@/components/Button';

// Basic OpenAPI template
const getOpenApiTemplate = (title: string, description: string): string => `
openapi: 3.0.3
info:
  title: ${title || 'Service Title'}
  version: 1.0.0
  description: ${description || 'Service Description'}
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
    // Removed entities, addStandaloneEntity, deleteEntity
    setCurrentStep,
  } = useAppStore();
  const editorInitialized = useRef(false);

  // Removed state for modals (isEntityModalOpen, editingEntityId, isVendorModalOpen, editingSchemaName)
  // Removed modal handlers (openEntityModal, closeEntityModal, openVendorModal, closeVendorModal)
  // Removed derived state (definedSchemaNames)

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
    setCurrentStep(3); // Next step is Vendor Extensions
    router.push('/create/vendor-extensions');
  };

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/create/setup');
  };

  const handleEditorChange = (value: string | undefined) => {
    setOpenApiYaml(value || '');
  };

  // Removed handleAddStandaloneEntity, handleDeleteEntity
  // Removed handleConfigureExtensions

  // Placeholder for adding schema (can be kept or removed)
  const handleAddSchema = () => {
      alert("Adding schemas directly via button is not implemented yet. Please define schemas in the YAML editor.");
      // Future: Prompt for schema name, add basic structure to YAML
  };


  // --- Render ---
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-4xl mx-auto"> {/* Adjusted max-width */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Step 2: OpenAPI Editor</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Define the core OpenAPI specification using the YAML editor below.</p>

      {/* Only the Editor Panel */}
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
      {/* Removed Right Panel */}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          onClick={handleBack}
          variant="secondary"
        >
          Back: Setup
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
        >
          Next: Vendor Extensions
        </Button>
      </div>

      {/* Removed Entity Edit Modal */}
      {/* Removed Vendor Extension Modal */}
    </div>
  );
}
