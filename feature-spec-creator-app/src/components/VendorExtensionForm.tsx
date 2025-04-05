'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import * as yaml from 'js-yaml';

interface VendorExtensionFormProps {
  schemaName: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentYaml: string;
}

// Define structure for form state
interface VendorFormState {
    rootSchema: boolean;
    generatePersistenceLayer: boolean;
    businessNames: { [propName: string]: string };
    enumName: string | null;
    repoMethods: any[];
    overrideMethods: any[];
    interfaces: any[];
    endPoints: any[];
    nonModifiableAttributes: string[];
    persist: boolean;
    setDefaults: boolean;
    isModifiable: boolean;
}

// Helper type for schema properties
interface SchemaProperty {
    name: string;
    type?: string;
    enum?: string[];
}

export default function VendorExtensionForm({
  schemaName,
  isOpen,
  onClose,
  currentYaml,
}: VendorExtensionFormProps) {
  const { setOpenApiYaml } = useAppStore();
  const [formState, setFormState] = useState<VendorFormState>({
      rootSchema: false,
      generatePersistenceLayer: false,
      businessNames: {},
      enumName: null,
      repoMethods: [],
      overrideMethods: [],
      interfaces: [],
      endPoints: [],
      nonModifiableAttributes: [],
      persist: false,
      setDefaults: false,
      isModifiable: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize parsing the relevant schema section and extracting properties
  const { initialSchemaData, schemaProperties } = useMemo(() => {
    let data: any = null;
    let props: SchemaProperty[] = [];
    if (!schemaName || !currentYaml) return { initialSchemaData: data, schemaProperties: props };
    try {
      const parsedYaml = yaml.load(currentYaml) as any;
      data = parsedYaml?.components?.schemas?.[schemaName] || null;
      if (data?.properties) {
          props = Object.entries(data.properties).map(([name, propDetails]: [string, any]) => ({
              name: name,
              type: propDetails.enum ? 'enum' : propDetails.type,
              enum: propDetails.enum,
          }));
      }
    } catch (e) {
      console.error("Error parsing YAML in VendorExtensionForm:", e);
      setError("Failed to parse current OpenAPI YAML."); // Set error state here
      data = null;
      props = [];
    }
    return { initialSchemaData: data, schemaProperties: props };
  }, [schemaName, currentYaml]);

  // Initialize form state from parsed schema data
  useEffect(() => {
    if (initialSchemaData) {
      // setError(null); // Clear error only if parsing succeeds (handled in useMemo now)
      const initialBusinessNames: { [propName: string]: string } = {};
      if (initialSchemaData.properties) {
          Object.entries(initialSchemaData.properties).forEach(([propName, propDetails]: [string, any]) => {
              if (propDetails['x-fbp-props']?.businessName) {
                  initialBusinessNames[propName] = propDetails['x-fbp-props'].businessName;
              }
          });
      }
      let initialEnumName: string | null = null;
      if (initialSchemaData.properties) {
           const enumProp = Object.values(initialSchemaData.properties).find((prop: any) => prop['x-fbp-enum-name']);
           if (enumProp) {
               initialEnumName = (enumProp as any)['x-fbp-enum-name'];
           }
      }

      setFormState(prev => ({
        ...prev,
        rootSchema: initialSchemaData['x-fbp-params']?.rootSchema || false,
        generatePersistenceLayer: initialSchemaData['x-fbp-params']?.generatePersistenceLayer || false,
        businessNames: initialBusinessNames,
        enumName: initialEnumName,
      }));
    } else if (schemaName && !error) { // Only set error if parsing didn't already set one
        setError(`Schema "${schemaName}" not found in the current YAML.`);
        setFormState(prev => ({
          ...prev,
          rootSchema: false,
          generatePersistenceLayer: false,
          businessNames: {},
          enumName: null,
        }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSchemaData, schemaName]); // Depend only on parsed data and schemaName

  const handleInputChange = (field: keyof VendorFormState | string, value: any) => {
     if (field.startsWith('businessName.')) {
         const propName = field.split('.')[1];
         setFormState(prev => ({
             ...prev,
             businessNames: { ...prev.businessNames, [propName]: value }
         }));
     } else {
        setFormState(prev => ({ ...prev, [field as keyof VendorFormState]: value }));
     }
  };

  const handleApply = () => {
    if (!schemaName) return;
    setIsLoading(true);
    setError(null);

    try {
        const parsedYaml = yaml.load(currentYaml) as any;
        if (!parsedYaml?.components?.schemas?.[schemaName]) {
            throw new Error(`Schema "${schemaName}" not found in YAML.`);
        }

        const schema = parsedYaml.components.schemas[schemaName];

        // Ensure x-fbp-params exists before modifying
        if (!schema['x-fbp-params']) schema['x-fbp-params'] = {};
        schema['x-fbp-params'].rootSchema = formState.rootSchema;
        schema['x-fbp-params'].generatePersistenceLayer = formState.generatePersistenceLayer;
        schema['x-fbp-params'].repoMethods = formState.repoMethods;
        schema['x-fbp-params'].overrideMethods = formState.overrideMethods;
        schema['x-fbp-params'].interfaces = formState.interfaces;
        schema['x-fbp-params'].endPoints = formState.endPoints;
        schema['x-fbp-params'].nonModifiableAttributes = formState.nonModifiableAttributes;
        schema['x-fbp-params'].persist = formState.persist;
        schema['x-fbp-params'].setDefaults = formState.setDefaults;
        schema['x-fbp-params'].isModifiable = formState.isModifiable;

        // Update x-fbp-props
        if (!schema.properties) schema.properties = {};
        Object.entries(formState.businessNames).forEach(([propName, businessName]) => {
            if (!schema.properties[propName]) schema.properties[propName] = {};
            if (!schema.properties[propName]['x-fbp-props']) schema.properties[propName]['x-fbp-props'] = {};
            // Only add/update if businessName is not empty, remove if empty? Or keep empty? Keep for now.
            schema.properties[propName]['x-fbp-props'].businessName = businessName;
        });
         // Clean up empty x-fbp-props if desired (optional)
         Object.keys(schema.properties).forEach(propName => {
             if (schema.properties[propName]['x-fbp-props'] && Object.keys(schema.properties[propName]['x-fbp-props']).length === 0) {
                 delete schema.properties[propName]['x-fbp-props'];
             }
         });


         // Update x-fbp-enum-name
         const firstEnumPropName = schemaProperties.find(p => p.type === 'enum')?.name;
         // Remove existing enum names first
          if (schema.properties) {
             Object.keys(schema.properties).forEach(propName => {
                 if (schema.properties[propName]['x-fbp-enum-name']) {
                     delete schema.properties[propName]['x-fbp-enum-name'];
                 }
             });
          }
         // Add new enum name if provided and an enum property exists
         if (formState.enumName && firstEnumPropName && schema.properties[firstEnumPropName]) {
             schema.properties[firstEnumPropName]['x-fbp-enum-name'] = formState.enumName;
         } else if (formState.enumName) {
             console.warn("Enum name provided but no enum property found in schema to attach it to.");
         }

        const updatedYaml = yaml.dump(parsedYaml, { indent: 2, noRefs: true });
        setOpenApiYaml(updatedYaml);
        onClose();

    } catch (e: any) {
        console.error("Error applying vendor extensions:", e);
        setError(e.message || "Failed to apply extensions.");
    } finally {
        setIsLoading(false);
    }
  };

  // Render nothing if modal is controlled externally and not open
  if (!isOpen) {
      return null;
  }
  // Handle internal loading/error states before rendering form
  if (!schemaName) {
      // This case should ideally be prevented by the parent component
      return <div className="p-4 text-red-600">Error: No schema selected.</div>;
  }
   // Display error if schema wasn't found or parsing failed earlier
   if (error && !initialSchemaData) {
       return (
            <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto">
                 <h3 className="text-xl font-semibold mb-4 text-red-700">Error</h3>
                 <p className="text-red-600 mb-4">{error}</p>
                 <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                     <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium">Close</button>
                 </div>
            </div>
       );
   }


  return (
    // This div assumes it's rendered inside a Headless UI Dialog.Panel or similar
    <div className="p-6 dark:bg-gray-900 dark:text-gray-100">
        <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Configure Vendor Extensions for: <span className="font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-100 px-1 rounded">{schemaName}</span>
        </h3>

        {error && <p className="text-sm text-red-600 mb-4">Error: {error}</p>}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"> {/* Scrollable content */}
            {/* Parameters Section */}
            <div className="border rounded p-3">
                <h4 className="text-md font-semibold mb-2 dark:text-gray-100">Parameters (x-fbp-params)</h4>
                 <label className="flex items-center space-x-2 mb-2">
                    <input
                        type="checkbox"
                        checked={formState.rootSchema}
                        onChange={(e) => handleInputChange('rootSchema', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Root Schema</span>
                </label>
                 <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formState.generatePersistenceLayer}
                        onChange={(e) => handleInputChange('generatePersistenceLayer', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Generate Persistence Layer</span>
                </label>
            </div>

            {/* Properties Section */}
            {schemaProperties.length > 0 && (
                <div className="border rounded p-3">
                    <h4 className="text-md font-semibold mb-2">Properties (x-fbp-props & x-fbp-enum-name)</h4>
                    <div className="space-y-2">
                        {schemaProperties.map(prop => (
                            <div key={prop.name} className="border-b pb-2 last:border-b-0">
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <label htmlFor={`businessName-${prop.name}`} className="text-sm font-medium text-gray-700 justify-self-start col-span-1">
                                        {prop.name} <span className="text-xs text-gray-500">({prop.type || 'N/A'})</span>:
                                    </label>
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            id={`businessName-${prop.name}`}
                                            value={formState.businessNames[prop.name] || ''}
                                            onChange={(e) => handleInputChange(`businessName.${prop.name}`, e.target.value)}
                                            placeholder="Business Name"
                                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                {/* Add Enum Name input specifically for enum types */}
                                {prop.type === 'enum' && (
                                     <div className="grid grid-cols-3 gap-4 items-center mt-1 pl-4">
                                         <label htmlFor={`enumName-${prop.name}`} className="text-sm font-medium text-gray-600 justify-self-start col-span-1">
                                             ↳ Enum Name:
                                         </label>
                                         <div className="col-span-2">
                                             <input
                                                 type="text"
                                                 id={`enumName-${prop.name}`}
                                                 value={formState.enumName || ''} // Assuming one enum name per schema
                                                 onChange={(e) => handleInputChange('enumName', e.target.value || null)}
                                                 placeholder="e.g., MyStatusEnum"
                                                 className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                             />
                                         </div>
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Arrays and Booleans */}
            <div className="border rounded p-3 space-y-4">
              <h4 className="text-md font-semibold mb-2 dark:text-gray-100">Advanced Vendor Extensions</h4>

              {/* Booleans */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.persist}
                    onChange={(e) => handleInputChange('persist', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Persist</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.setDefaults}
                    onChange={(e) => handleInputChange('setDefaults', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Set Defaults</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.isModifiable}
                    onChange={(e) => handleInputChange('isModifiable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Is Modifiable</span>
                </label>
              </div>

              {/* Non-Modifiable Attributes */}
              <div>
                <h5 className="font-semibold mb-1">Non-Modifiable Attributes</h5>
                {formState.nonModifiableAttributes.map((attr, idx) => (
                  <div key={idx} className="flex space-x-2 mb-1">
                    <input
                      type="text"
                      value={attr}
                      onChange={(e) => {
                        const updated = [...formState.nonModifiableAttributes];
                        updated[idx] = e.target.value;
                        handleInputChange('nonModifiableAttributes', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formState.nonModifiableAttributes.filter((_, i) => i !== idx);
                        handleInputChange('nonModifiableAttributes', updated);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('nonModifiableAttributes', [...formState.nonModifiableAttributes, ''])}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Attribute
                </button>
              </div>

              {/* repoMethods */}
              <div>
                <h5 className="font-semibold mb-1">Repo Methods</h5>
                {formState.repoMethods.map((method, idx) => (
                  <div key={idx} className="space-y-1 border p-2 rounded mb-2">
                    <input
                      type="text"
                      placeholder="Query"
                      value={method.query || ''}
                      onChange={(e) => {
                        const updated = [...formState.repoMethods];
                        updated[idx] = { ...updated[idx], query: e.target.value };
                        handleInputChange('repoMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Fetch Method"
                      value={method.fetchMethod || ''}
                      onChange={(e) => {
                        const updated = [...formState.repoMethods];
                        updated[idx] = { ...updated[idx], fetchMethod: e.target.value };
                        handleInputChange('repoMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Fetch Params"
                      value={method.fetchParams || ''}
                      onChange={(e) => {
                        const updated = [...formState.repoMethods];
                        updated[idx] = { ...updated[idx], fetchParams: e.target.value };
                        handleInputChange('repoMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formState.repoMethods.filter((_, i) => i !== idx);
                        handleInputChange('repoMethods', updated);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('repoMethods', [...formState.repoMethods, {}])}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Repo Method
                </button>
              </div>

              {/* overrideMethods */}
              <div>
                <h5 className="font-semibold mb-1">Override Methods</h5>
                {formState.overrideMethods.map((method, idx) => (
                  <div key={idx} className="space-y-1 border p-2 rounded mb-2">
                    <input
                      type="text"
                      placeholder="Type"
                      value={method.type || ''}
                      onChange={(e) => {
                        const updated = [...formState.overrideMethods];
                        updated[idx] = { ...updated[idx], type: e.target.value };
                        handleInputChange('overrideMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Function"
                      value={method.function || ''}
                      onChange={(e) => {
                        const updated = [...formState.overrideMethods];
                        updated[idx] = { ...updated[idx], function: e.target.value };
                        handleInputChange('overrideMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Params"
                      value={method.params || ''}
                      onChange={(e) => {
                        const updated = [...formState.overrideMethods];
                        updated[idx] = { ...updated[idx], params: e.target.value };
                        handleInputChange('overrideMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <textarea
                      placeholder="Body"
                      value={method.body || ''}
                      onChange={(e) => {
                        const updated = [...formState.overrideMethods];
                        updated[idx] = { ...updated[idx], body: e.target.value };
                        handleInputChange('overrideMethods', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formState.overrideMethods.filter((_, i) => i !== idx);
                        handleInputChange('overrideMethods', updated);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('overrideMethods', [...formState.overrideMethods, {}])}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Override Method
                </button>
              </div>

              {/* interfaces */}
              <div>
                <h5 className="font-semibold mb-1">Interfaces</h5>
                {formState.interfaces.map((iface, idx) => (
                  <div key={idx} className="space-y-1 border p-2 rounded mb-2">
                    <input
                      type="text"
                      placeholder="Interface"
                      value={iface.iface || ''}
                      onChange={(e) => {
                        const updated = [...formState.interfaces];
                        updated[idx] = { ...updated[idx], iface: e.target.value };
                        handleInputChange('interfaces', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Package"
                      value={iface.package || ''}
                      onChange={(e) => {
                        const updated = [...formState.interfaces];
                        updated[idx] = { ...updated[idx], package: e.target.value };
                        handleInputChange('interfaces', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formState.interfaces.filter((_, i) => i !== idx);
                        handleInputChange('interfaces', updated);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('interfaces', [...formState.interfaces, {}])}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Interface
                </button>
              </div>

              {/* endPoints */}
              <div>
                <h5 className="font-semibold mb-1">Endpoints</h5>
                {formState.endPoints.map((ep, idx) => (
                  <div key={idx} className="space-y-1 border p-2 rounded mb-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={ep.name || ''}
                      onChange={(e) => {
                        const updated = [...formState.endPoints];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        handleInputChange('endPoints', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Type"
                      value={ep.type || ''}
                      onChange={(e) => {
                        const updated = [...formState.endPoints];
                        updated[idx] = { ...updated[idx], type: e.target.value };
                        handleInputChange('endPoints', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={ep.singleRequest || false}
                        onChange={(e) => {
                          const updated = [...formState.endPoints];
                          updated[idx] = { ...updated[idx], singleRequest: e.target.checked };
                          handleInputChange('endPoints', updated);
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Single Request</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={ep.singleResponse || false}
                        onChange={(e) => {
                          const updated = [...formState.endPoints];
                          updated[idx] = { ...updated[idx], singleResponse: e.target.checked };
                          handleInputChange('endPoints', updated);
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Single Response</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Repo Method"
                      value={ep.repoMethod || ''}
                      onChange={(e) => {
                        const updated = [...formState.endPoints];
                        updated[idx] = { ...updated[idx], repoMethod: e.target.value };
                        handleInputChange('endPoints', updated);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                    {/* Parameters nested array */}
                    <div className="border rounded p-2 mt-2 space-y-2">
                      <h6 className="font-semibold">Parameters</h6>
                      {(ep.parameters || []).map((param: any, pIdx: number) => (
                        <div key={pIdx} className="space-y-1 border p-2 rounded mb-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={param.name || ''}
                            onChange={(e) => {
                              const updatedEPs = [...formState.endPoints];
                              const params = updatedEPs[idx].parameters || [];
                              params[pIdx] = { ...params[pIdx], name: e.target.value };
                              updatedEPs[idx].parameters = params;
                              handleInputChange('endPoints', updatedEPs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={param.description || ''}
                            onChange={(e) => {
                              const updatedEPs = [...formState.endPoints];
                              const params = updatedEPs[idx].parameters || [];
                              params[pIdx] = { ...params[pIdx], description: e.target.value };
                              updatedEPs[idx].parameters = params;
                              handleInputChange('endPoints', updatedEPs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Type"
                            value={param.type || ''}
                            onChange={(e) => {
                              const updatedEPs = [...formState.endPoints];
                              const params = updatedEPs[idx].parameters || [];
                              params[pIdx] = { ...params[pIdx], type: e.target.value };
                              updatedEPs[idx].parameters = params;
                              handleInputChange('endPoints', updatedEPs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Example"
                            value={param.example || ''}
                            onChange={(e) => {
                              const updatedEPs = [...formState.endPoints];
                              const params = updatedEPs[idx].parameters || [];
                              params[pIdx] = { ...params[pIdx], example: e.target.value };
                              updatedEPs[idx].parameters = params;
                              handleInputChange('endPoints', updatedEPs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                          />
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={param.path || false}
                              onChange={(e) => {
                                const updatedEPs = [...formState.endPoints];
                                const params = updatedEPs[idx].parameters || [];
                                params[pIdx] = { ...params[pIdx], path: e.target.checked };
                                updatedEPs[idx].parameters = params;
                                handleInputChange('endPoints', updatedEPs);
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Path</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={param.requiredParam || false}
                              onChange={(e) => {
                                const updatedEPs = [...formState.endPoints];
                                const params = updatedEPs[idx].parameters || [];
                                params[pIdx] = { ...params[pIdx], requiredParam: e.target.checked };
                                updatedEPs[idx].parameters = params;
                                handleInputChange('endPoints', updatedEPs);
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Required</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedEPs = [...formState.endPoints];
                              const params = updatedEPs[idx].parameters || [];
                              updatedEPs[idx].parameters = params.filter((_: any, i: number) => i !== pIdx);
                              handleInputChange('endPoints', updatedEPs);
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove Parameter
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedEPs = [...formState.endPoints];
                          const params = updatedEPs[idx].parameters || [];
                          updatedEPs[idx].parameters = [...params, {}];
                          handleInputChange('endPoints', updatedEPs);
                        }}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Parameter
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = formState.endPoints.filter((_, i) => i !== idx);
                        handleInputChange('endPoints', updated);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('endPoints', [...formState.endPoints, {}])}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Endpoint
                </button>
              </div>
            </div>

        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={handleApply}
                disabled={isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
                {isLoading ? 'Applying...' : 'Apply Extensions'}
            </button>
        </div>
    </div>
  );
}
