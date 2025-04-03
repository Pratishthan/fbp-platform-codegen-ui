import { create } from 'zustand';
import { domainDataTypes } from '@/config/domainDataTypes';
import { microservices } from '@/config/microservices';

interface AppState {
  // Configuration
  domainDataTypes: typeof domainDataTypes;
  microservices: typeof microservices;

  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Feature details
  featureName: string;
  featureDescription: string;
  selectedMicroservice: string;
  setFeatureDetails: (name: string, description: string, microservice: string) => void;

  // OpenAPI specification
  yamlContent: string;
  setYamlContent: (content: string) => void;

  // Entity specifications
  entities: Array<{
    name: string;
    tableName: string;
    fields: Array<{
      fieldName: string;
      columnName: string;
      domainDataType: string;
      isPrimaryKey: boolean;
      pkStrategy?: string;
      isNullable: boolean;
    }>;
    relationships?: Array<{
      fieldName: string;
      targetEntity: string;
      relationshipType: string;
      mappedBy?: string;
    }>;
  }>;
  addEntity: (entity: AppState['entities'][0]) => void;
  updateEntity: (name: string, entity: AppState['entities'][0]) => void;
  removeEntity: (name: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Configuration
  domainDataTypes,
  microservices,

  // Initial state
  currentStep: 0,
  featureName: '',
  featureDescription: '',
  selectedMicroservice: '',
  yamlContent: '',
  entities: [],

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setFeatureDetails: (name, description, microservice) => set({
    featureName: name,
    featureDescription: description,
    selectedMicroservice: microservice,
  }),

  setYamlContent: (content) => set({ yamlContent: content }),

  addEntity: (entity) => set((state) => ({
    entities: [...state.entities, entity],
  })),

  updateEntity: (name, updatedEntity) => set((state) => ({
    entities: state.entities.map((entity) =>
      entity.name === name ? updatedEntity : entity
    ),
  })),

  removeEntity: (name) => set((state) => ({
    entities: state.entities.filter((entity) => entity.name !== name),
  })),
})); 