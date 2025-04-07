import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// --- Types ---

// Define Microservice type
export interface Microservice {
  name: string;
  repoOwner: string;
  repoName: string;
  repoUrl: string;
}

// Define Entity Specification structure (Based on Spec 4.2)
export interface EntityField {
  fieldName: string;
  columnName: string | null;
  domainDataType: string;
  isPrimaryKey: boolean;
  primaryKeyGenerationStrategy: 'AUTO' | 'SEQUENCE' | 'IDENTITY' | 'NONE' | null;
  isNullable: boolean;
}

export interface EntityRelationship {
  fieldName: string;
  targetEntity: string; // Should match another EntitySpec's entityName
  relationshipType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  mappedBy: string | null;
  fetchType: 'LAZY' | 'EAGER';
  cascadeOptions: string[]; // e.g., ["PERSIST", "MERGE"]
  joinColumnName: string | null;
}

export interface EntitySpec {
  id: string; // Unique ID for React keys, etc.
  entityName: string;
  tableName: string | null;
  fields: EntityField[];
  relationships: EntityRelationship[];
  isStandalone: boolean; // Flag to differentiate
  linkedSchemaName?: string; // If linked from OpenAPI
}

// Define the state structure
interface AppState {
  currentStep: number;
  domainTypes: string[];
  featureName: string;
  featureDescription: string;
  userId: string;
  availableMicroservices: Microservice[];
  selectedMicroservice: Microservice | null;
  openApiYaml: string;
  entities: EntitySpec[];
  workflowType: 'api-entity' | 'api-only' | 'entity-only' | null; // Added workflow type
}

// Define the actions structure
interface AppActions {
  setCurrentStep: (step: number) => void;
  setDomainTypes: (types: string[]) => void;
  setFeatureName: (name: string) => void;
  setFeatureDescription: (description: string) => void;
  setUserId: (id: string) => void;
  setAvailableMicroservices: (services: Microservice[]) => void;
  setSelectedMicroservice: (service: Microservice | null) => void;
  setOpenApiYaml: (yaml: string) => void;
  setWorkflowType: (type: 'api-entity' | 'api-only' | 'entity-only' | null) => void; // Added setter
  // Updated signature for addStandaloneEntity
  addStandaloneEntity: (
    name: string,
    tableName: string | null,
    fields: EntityField[],
    relationships: EntityRelationship[]
  ) => void;
  updateEntity: (entityId: string, updatedSpec: Partial<Omit<EntitySpec, 'id' | 'isStandalone' | 'linkedSchemaName'>>) => void; // Allow updating relevant parts
  deleteEntity: (entityId: string) => void;
  resetState: () => void;
}

// --- Initial State ---
const initialState: AppState = {
  currentStep: 1,
  domainTypes: [],
  featureName: '',
  featureDescription: '',
  userId: '',
  availableMicroservices: [],
  selectedMicroservice: null,
  openApiYaml: '',
  entities: [],
  workflowType: 'api-entity', // Default workflow type to API + Entity
};

// --- Store Implementation ---
export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  // --- Actions ---
  setCurrentStep: (step) => set({ currentStep: step }),
  setDomainTypes: (types) => set({ domainTypes: types }),
  setFeatureName: (name) => set({ featureName: name }),
  setFeatureDescription: (description) => set({ featureDescription: description }),
  setUserId: (id) => set({ userId: id }),
  setAvailableMicroservices: (services) => set({ availableMicroservices: services }),
  setSelectedMicroservice: (service) => set({ selectedMicroservice: service }),
  setOpenApiYaml: (yaml) => set({ openApiYaml: yaml }),
  setWorkflowType: (type) => set({ workflowType: type }), // Added action implementation

  // Entity Actions
  addStandaloneEntity: (name, tableName, fields, relationships) => set((state) => {
    // Check for duplicate name (case-insensitive)
    if (state.entities.some(e => e.entityName.toLowerCase() === name.toLowerCase())) {
      // Consider throwing an error or handling it differently than alert
      console.error(`Entity with name "${name}" already exists.`);
      alert(`Entity with name "${name}" already exists.`);
      return {}; // No state change
    }
    const newEntity: EntitySpec = {
      id: uuidv4(),
      entityName: name, // Use the provided name
      tableName: tableName, // Use the provided table name
      fields: fields, // Use the provided fields
      relationships: relationships, // Use the provided relationships
      isStandalone: true, // Mark as standalone
    };
    return { entities: [...state.entities, newEntity] };
  }),

  updateEntity: (entityId, updatedSpec) => set((state) => ({
    entities: state.entities.map(entity =>
      entity.id === entityId
        ? {
            ...entity,
            ...updatedSpec, // Apply partial updates
            // Ensure non-updatable fields aren't overwritten if passed in updatedSpec
            id: entity.id,
            isStandalone: entity.isStandalone,
            linkedSchemaName: entity.linkedSchemaName,
          }
        : entity
    ),
  })),

  deleteEntity: (entityId) => set((state) => ({
    entities: state.entities.filter(entity => entity.id !== entityId),
  })),

  // Reset action - preserve domainTypes and availableMicroservices
  resetState: () => set((state) => ({
    ...initialState, // Reset most fields to initial values
    domainTypes: state.domainTypes, // Keep existing domain types
    availableMicroservices: state.availableMicroservices, // Keep existing microservices
  })),
}));
