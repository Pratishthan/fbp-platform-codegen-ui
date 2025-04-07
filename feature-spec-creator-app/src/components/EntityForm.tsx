'use client';

import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useAppStore, EntitySpec, EntityField, EntityRelationship } from '@/lib/store'; // Removed direct import of addStandaloneEntity action

interface EntityFormProps {
  entityId: string | null; // null indicates adding a new entity
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
  const isAdding = entityId === null; // Determine if adding or editing

  // Get store state and actions using individual selectors
  const entities = useAppStore(state => state.entities);
  const updateEntity = useAppStore(state => state.updateEntity);
  const domainTypes = useAppStore(state => state.domainTypes);
  const addEntity = useAppStore(state => state.addStandaloneEntity); // Renamed for clarity below

  // Filter other entities for relationship dropdown
  const otherEntities = useMemo(() => entities.filter(e => e.id !== entityId), [entities, entityId]);
  // Find the entity being edited (will be undefined if adding)
  const entityToEdit = useMemo(() => entities.find(e => e.id === entityId), [entities, entityId]);

  // Local form state
  const [entityName, setEntityName] = useState(''); // Will be editable when adding
  const [tableName, setTableName] = useState<string | null>(null);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]); // State for relationships

  // Initialize form state based on add/edit mode
  useEffect(() => {
    if (isAdding) {
      // Reset form for adding
      setEntityName(''); // Start with empty name for user input
      setTableName(null);
      setFields([]);
      setRelationships([]);
    } else if (entityToEdit) {
      // Populate form for editing
      setEntityName(entityToEdit.entityName);
      setTableName(entityToEdit.tableName);
      setFields(entityToEdit.fields);
      setRelationships(entityToEdit.relationships);
    } else {
      // Handle case where entityId is provided but not found (could show error or reset)
      console.warn(`EntityForm: Entity with ID ${entityId} not found.`);
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
    // When adding a field in the 'Add New Entity' mode, add a blank field.
    // The fieldName will be entered via the input field rendered in the map.
    setFields([...fields, { ...initialField, fieldName: '' }]); // Add blank field
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
    // --- Validation ---
    const validationErrors: string[] = [];
    if (!entityName.trim()) {
      validationErrors.push('Entity Name is required.'); // Now editable, so validate
    }
    // Check for duplicate entity name when adding
    if (isAdding && entities.some(e => e.entityName.toLowerCase() === entityName.trim().toLowerCase())) {
        validationErrors.push(`An entity named "${entityName.trim()}" already exists.`);
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

    // --- Save to Store ---
    if (isAdding) {
      // Call the add action (assuming it's updated to take full spec)
      // Note: The store action 'addStandaloneEntity' needs modification
      // For now, we'll call it with the name and assume it handles the rest,
      // but this needs to be revisited in store.ts
      addEntity(entityName.trim(), tableName?.trim() || null, fields, relationships);
    } else if (entityId && entityToEdit) {
      // Call the update action
      updateEntity(entityId, {
        entityName: entityToEdit.entityName, // Keep original name when editing
        tableName: tableName?.trim() || null,
        fields,
        relationships,
      });
    } else {
      console.error("EntityForm: Cannot save, invalid state.");
      return; // Should not happen if validation passes
    }

    onClose(); // Close modal on successful save
  };

  // Allow rendering the form if adding, even if entityToEdit is null
  if (!isAdding && !entityToEdit) {
    // Show error only if editing and entity not found
    return <div className="p-4 text-red-600 dark:text-red-400">Error: Entity not found.</div>;
  }

  const currentEntityName = isAdding ? entityName : entityToEdit?.entityName || '';
  const isCurrentEntityStandalone = isAdding || entityToEdit?.isStandalone; // Assume adding creates standalone

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        {isAdding ? 'Add New Standalone Entity' : `Edit Entity: ${entityToEdit?.entityName}`}
        {isCurrentEntityStandalone && !isAdding && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Standalone)</span>}
      </h3>

      <div className="space-y-4">
        {/* Entity Name (Editable when adding) */}
        <div>
          <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Entity Name <span className="text-red-600">*</span>
          </label>
          {isAdding ? (
            <input
              type="text"
              id="entityName"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-gray-100 dark:bg-gray-800"
              required
            />
          ) : (
            <p className="mt-1 text-lg font-medium dark:text-gray-100">{currentEntityName}</p>
          )}
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
                 {/* Field Name (Editable when adding) */}
                 <div className="md:col-span-1">
                    <label htmlFor={`fieldName-${index}`} className="block text-xs font-medium text-gray-500 dark:text-gray-300">Field Name*</label>
                    {isAdding ? (
                       <input
                         type="text" id={`fieldName-${index}`} value={field.fieldName} required
                         onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                         className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 dark:bg-gray-800"
                       />
                    ) : (
                       <span className="text-sm font-medium mt-1 block">{field.fieldName}</span>
                    )}
                 </div>
                 {/* Column Name */}
                 <div className="md:col-span-1">
                    <label htmlFor={`colName-${index}`} className="block text-xs font-medium text-gray-500 dark:text-gray-300">Column Name</label>
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
                    <label htmlFor={`domain-${index}`} className="block text-xs font-medium text-gray-500 dark:text-gray-300">Domain Type*</label>
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
                       <span className="text-xs font-medium text-gray-700 dark:text-gray-100">Primary Key</span>
                     </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!field.isNullable} // UI shows "Required" which is !isNullable
                        onChange={(e) => handleFieldChange(index, 'isNullable', !e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                       />
                       <span className="text-xs font-medium text-gray-700 dark:text-gray-100">Required</span>
                     </label>
                 </div>
                 {/* PK Strategy */}
                 <div className="md:col-span-1">
                    <label htmlFor={`pkStrat-${index}`} className="block text-xs font-medium text-gray-500 dark:text-gray-300">PK Strategy</label>
                    <select
                      id={`pkStrat-${index}`}
                      value={field.primaryKeyGenerationStrategy || ''}
                       onChange={(e) => handleFieldChange(index, 'primaryKeyGenerationStrategy', e.target.value || null)}
                       disabled={!field.isPrimaryKey}
                       className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
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
                      // Allow removing fields when adding or if editing a standalone entity
                      disabled={!isAdding && !entityToEdit?.isStandalone}
                    >
                      Remove
                    </button>
                 </div>
              </div>
            ))}
          </div>
          {/* Add Field Button - Allow when adding or if editing a standalone entity */}
          {(isAdding || entityToEdit?.isStandalone) && (
             <button
               onClick={addField} // Need to update addField to not use prompt if name is editable
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
          {isAdding ? 'Add Entity' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
