'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, EntitySpec, EntityField, EntityRelationship } from '@/lib/store'; // Import EntityRelationship

interface EntityFormProps {
  entityId: string | null;
  onClose: () => void; // Function to close the form/modal
}

// Initial empty field state
// Initial empty field state
const initialField: Omit<EntityField, 'fieldName'> = {
    columnName: null,
    domainDataType: '', // Default to empty, user must select
    isPrimaryKey: false,
    primaryKeyGenerationStrategy: null,
    isNullable: true, // Default to nullable
};

// Initial empty relationship state
const initialRelationship: Omit<EntityRelationship, 'fieldName'> = {
    targetEntity: '',
    relationshipType: 'ManyToOne', // Sensible default?
    mappedBy: null,
    fetchType: 'LAZY', // Default fetch type
    cascadeOptions: [],
    joinColumnName: null,
};

// Available options
const relationshipTypes: EntityRelationship['relationshipType'][] = ['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany'];
const fetchTypes: EntityRelationship['fetchType'][] = ['LAZY', 'EAGER'];
const cascadeOptionsList = ['ALL', 'PERSIST', 'MERGE', 'REMOVE', 'REFRESH', 'DETACH']; // Common JPA cascade types


export default function EntityForm({ entityId, onClose }: EntityFormProps) {
  // Get all entities to populate target dropdown, filter out self
  const { entities, updateEntity, domainTypes } = useAppStore();
  const otherEntities = entities.filter(e => e.id !== entityId);
  const entityToEdit = entities.find(e => e.id === entityId);

  // Local form state
  const [entityName, setEntityName] = useState('');
  const [tableName, setTableName] = useState<string | null>(null);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]); // State for relationships

  // Initialize form state
  useEffect(() => {
    if (entityToEdit) {
      setEntityName(entityToEdit.entityName);
      setTableName(entityToEdit.tableName);
      setFields(entityToEdit.fields);
      setRelationships(entityToEdit.relationships); // Initialize relationships
    } else {
      // Reset form
      setEntityName('');
      setTableName(null);
      setFields([]);
      setRelationships([]); // Reset relationships
    }
  }, [entityToEdit]);

  // --- Field Handlers ---
  const handleFieldChange = (index: number, fieldProp: keyof EntityField, value: any) => {
    const updatedFields = [...fields];
    const fieldToUpdate = { ...updatedFields[index] };

    // Type assertion needed for dynamic property access
    (fieldToUpdate as any)[fieldProp] = value;

    // Logic for PK strategy dropdown enable/disable
    if (fieldProp === 'isPrimaryKey' && !value) {
        fieldToUpdate.primaryKeyGenerationStrategy = null;
    }
    // Reset column name if it matches field name and user hasn't explicitly set it
    if (fieldProp === 'fieldName' && fieldToUpdate.columnName === updatedFields[index].fieldName) {
        fieldToUpdate.columnName = null; // Let DB decide or user override later
    }

    updatedFields[index] = fieldToUpdate;
    setFields(updatedFields);
  };

  const addField = () => {
     // For standalone entities, prompt for field name or add a default one
     const newFieldName = prompt("Enter new field name:");
     if (newFieldName && newFieldName.trim()) {
        setFields([...fields, { ...initialField, fieldName: newFieldName.trim() }]);
     } else if (newFieldName !== null) {
        alert("Field name cannot be empty.");
     }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // --- Relationship Handlers ---
   const handleRelationshipChange = (index: number, fieldProp: keyof EntityRelationship, value: any) => {
    const updatedRelationships = [...relationships];
    const relToUpdate = { ...updatedRelationships[index] };

    // Type assertion for dynamic property access
    (relToUpdate as any)[fieldProp] = value;

    // Handle cascade options array
    if (fieldProp === 'cascadeOptions') {
        const option = value as string;
        const currentOptions = relToUpdate.cascadeOptions || [];
        if (currentOptions.includes(option)) {
            relToUpdate.cascadeOptions = currentOptions.filter(item => item !== option); // Toggle off
        } else {
            relToUpdate.cascadeOptions = [...currentOptions, option]; // Toggle on
        }
    }


    updatedRelationships[index] = relToUpdate;
    setRelationships(updatedRelationships);
  };

   const addRelationship = () => {
     const newRelFieldName = prompt("Enter new relationship field name (e.g., 'relatedUser', 'orders'):");
     if (newRelFieldName && newRelFieldName.trim()) {
        setRelationships([...relationships, { ...initialRelationship, fieldName: newRelFieldName.trim() }]);
     } else if (newRelFieldName !== null) {
        alert("Relationship field name cannot be empty.");
     }
   };

   const removeRelationship = (index: number) => {
     setRelationships(relationships.filter((_, i) => i !== index));
   };

  // --- Save Handler ---
  const handleSave = () => {
    if (!entityId || !entityToEdit) return;

    // --- Validation ---
    const validationErrors: string[] = [];
    if (!entityName.trim()) {
      // Note: entityName is currently read-only in the form, but good practice to check
      validationErrors.push('Entity Name is missing (should not happen).');
    }

    // Validate Fields
    fields.forEach((field, index) => {
        if (!field.fieldName?.trim()) {
            validationErrors.push(`Field #${index + 1}: Field Name is required.`);
        }
        if (!field.domainDataType) {
             validationErrors.push(`Field "${field.fieldName || index + 1}": Domain Type is required.`);
        }
        if (field.isPrimaryKey && !field.primaryKeyGenerationStrategy) {
             validationErrors.push(`Field "${field.fieldName || index + 1}": PK Strategy is required when Primary Key is checked.`);
        }
        // Add more field validation (e.g., column name format) if needed
    });

    // Validate Relationships
    relationships.forEach((rel, index) => {
        if (!rel.fieldName?.trim()) {
            validationErrors.push(`Relationship #${index + 1}: Field Name is required.`);
        }
        if (!rel.targetEntity) {
             validationErrors.push(`Relationship "${rel.fieldName || index + 1}": Target Entity is required.`);
        }
        // Add more relationship validation if needed
    });

    if (validationErrors.length > 0) {
        alert("Please fix the following errors:\n- " + validationErrors.join("\n- "));
        return; // Stop save if errors found
    }

    // --- Update Store ---
    updateEntity(entityId, {
      // Use entityToEdit.entityName in case the form field was editable but shouldn't change the core name
      entityName: entityToEdit.entityName,
      tableName: tableName?.trim() || null,
      fields,
      relationships, // Include relationships in the update
    });
    onClose();
  };

  if (!entityToEdit) {
    // Handle case where entity is not found (e.g., deleted while form was open)
    // Or potentially show a loading state?
    return <div className="p-4">Error: Entity not found or not selected.</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Edit Entity: {entityToEdit.entityName}
        {entityToEdit.isStandalone && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Standalone)</span>}
      </h3>

      <div className="space-y-4">
        {/* Entity Name (Read-only for now, maybe editable for standalone later) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Entity Name</label>
          <p className="mt-1 text-lg font-medium dark:text-gray-100">{entityName}</p>
        </div>

        {/* Table Name */}
        <div>
          <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Table Name (Optional)
          </label>
          <input
            type="text"
            id="tableName"
            value={tableName || ''}
            onChange={(e) => setTableName(e.target.value || null)}
            placeholder="Defaults to entity name convention"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-gray-100 dark:bg-gray-800"
          />
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave blank to use default naming convention.</p>
        </div>

        {/* Fields Section */}
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-2">Fields</h4>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2 border p-3 rounded bg-gray-50 dark:bg-gray-800 items-center">
                {/* Field Name (Read-only if linked from schema?) */}
                 <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-500">Field Name</label>
                    {/* Make editable for standalone? */}
                    <span className="text-sm font-medium">{field.fieldName}</span>
                 </div>
                 {/* Column Name */}
                 <div className="md:col-span-1">
                    <label htmlFor={`colName-${index}`} className="block text-xs font-medium text-gray-500">Column Name</label>
                    <input
                      type="text"
                      id={`colName-${index}`}
                      value={field.columnName || ''}
                      onChange={(e) => handleFieldChange(index, 'columnName', e.target.value || null)}
                      placeholder={field.fieldName}
                      className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:text-gray-100 dark:bg-gray-800 dark:placeholder-gray-400"
                    />
                 </div>
                 {/* Domain Data Type */}
                 <div className="md:col-span-1">
                    <label htmlFor={`domain-${index}`} className="block text-xs font-medium text-gray-500">Domain Type*</label>
                    <select
                      id={`domain-${index}`}
                      value={field.domainDataType}
                      onChange={(e) => handleFieldChange(index, 'domainDataType', e.target.value)}
                      required
                      className="appearance-none mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="" disabled>Select...</option>
                      {domainTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                 </div>
                 {/* Flags (PK, Nullable) */}
                 <div className="md:col-span-1 flex flex-col space-y-1">
                    <label className="flex items-center space-x-2 text-gray-500 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={field.isPrimaryKey}
                        onChange={(e) => handleFieldChange(index, 'isPrimaryKey', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-700">Primary Key</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!field.isNullable} // UI shows "Required" which is !isNullable
                        onChange={(e) => handleFieldChange(index, 'isNullable', !e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-700">Required</span>
                    </label>
                 </div>
                 {/* PK Strategy */}
                 <div className="md:col-span-1">
                    <label htmlFor={`pkStrat-${index}`} className="block text-xs font-medium text-gray-500">PK Strategy</label>
                    <select
                      id={`pkStrat-${index}`}
                      value={field.primaryKeyGenerationStrategy || ''}
                      onChange={(e) => handleFieldChange(index, 'primaryKeyGenerationStrategy', e.target.value || null)}
                      disabled={!field.isPrimaryKey}
                      className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                    >
                      <option value="" disabled>Select...</option>
                      <option value="AUTO">AUTO</option>
                      <option value="SEQUENCE">SEQUENCE</option>
                      <option value="IDENTITY">IDENTITY</option>
                      <option value="NONE">NONE</option>
                    </select>
                 </div>
                 {/* Remove Button */}
                 <div className="md:col-span-1 flex items-end justify-end">
                    <button
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-800 text-xs"
                      title="Remove Field"
                      disabled={!entityToEdit.isStandalone} // Only allow removing fields for standalone entities? TBD
                    >
                      Remove
                    </button>
                 </div>
              </div>
            ))}
          </div>
          {/* Add Field Button - Only for Standalone? */}
          {entityToEdit.isStandalone && (
             <button
               onClick={addField}
               className="mt-3 text-sm text-blue-600 hover:text-blue-800"
             >
               + Add Field
             </button>
          )}
        </div>

        {/* Relationships Section */}
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-2">Relationships</h4>
          <div className="space-y-3">
             {relationships.map((rel, index) => (
               <div key={index} className="border p-3 rounded bg-gray-50 dark:bg-gray-800 space-y-2">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2 items-start">
                    {/* Field Name */}
                    <div>
                       <label htmlFor={`relName-${index}`} className="block text-xs font-medium text-gray-500">Field Name*</label>
                       <input
                         type="text" id={`relName-${index}`} value={rel.fieldName} required
                         onChange={(e) => handleRelationshipChange(index, 'fieldName', e.target.value)}
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 dark:bg-gray-800"
                       />
                    </div>
                    {/* Target Entity */}
                    <div>
                       <label htmlFor={`target-${index}`} className="block text-xs font-medium text-gray-500">Target Entity*</label>
                       <select
                         id={`target-${index}`} value={rel.targetEntity} required
                         onChange={(e) => handleRelationshipChange(index, 'targetEntity', e.target.value)}
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                       >
                         <option value="" disabled>Select Target...</option>
                         {otherEntities.map(oe => <option key={oe.id} value={oe.entityName}>{oe.entityName}</option>)}
                       </select>
                    </div>
                    {/* Relationship Type */}
                    <div>
                       <label htmlFor={`relType-${index}`} className="block text-xs font-medium text-gray-500">Type*</label>
                       <select
                         id={`relType-${index}`} value={rel.relationshipType} required
                         onChange={(e) => handleRelationshipChange(index, 'relationshipType', e.target.value)}
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                       >
                         {relationshipTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                       </select>
                    </div>
                     {/* Fetch Type */}
                    <div>
                       <label htmlFor={`fetchType-${index}`} className="block text-xs font-medium text-gray-500">Fetch Type*</label>
                       <select
                         id={`fetchType-${index}`} value={rel.fetchType} required
                         onChange={(e) => handleRelationshipChange(index, 'fetchType', e.target.value)}
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                       >
                         {fetchTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                       </select>
                    </div>
                    {/* Mapped By */}
                    <div>
                       <label htmlFor={`mappedBy-${index}`} className="block text-xs font-medium text-gray-500">Mapped By</label>
                       <input
                         type="text" id={`mappedBy-${index}`} value={rel.mappedBy || ''}
                         onChange={(e) => handleRelationshipChange(index, 'mappedBy', e.target.value || null)}
                         placeholder="Only for bi-directional"
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       />
                    </div>
                     {/* Join Column Name */}
                    <div>
                       <label htmlFor={`joinCol-${index}`} className="block text-xs font-medium text-gray-500">Join Column</label>
                       <input
                         type="text" id={`joinCol-${index}`} value={rel.joinColumnName || ''}
                         onChange={(e) => handleRelationshipChange(index, 'joinColumnName', e.target.value || null)}
                         placeholder="Optional override"
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       />
                    </div>
                    {/* Cascade Options */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cascade Options</label>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {cascadeOptionsList.map(option => (
                                <label key={option} className="flex items-center space-x-1">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={rel.cascadeOptions?.includes(option)}
                                        onChange={(e) => handleRelationshipChange(index, 'cascadeOptions', e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-100">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                 </div>
                 {/* Remove Relationship Button */}
                 <div className="flex justify-end mt-1">
                    <button
                      onClick={() => removeRelationship(index)}
                      className="text-red-600 hover:text-red-800 text-xs"
                      title="Remove Relationship"
                    >
                      Remove Relationship
                    </button>
                 </div>
               </div>
             ))}
          </div>
           {/* Add Relationship Button */}
           <button
             onClick={addRelationship}
             className="mt-3 text-sm text-blue-600 hover:text-blue-800"
           >
             + Add Relationship
           </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Save Entity Spec
        </button>
      </div>
    </div>
  );
}
