import { create } from 'zustand';
import { domainDataTypes } from '@/config/domainDataTypes';
import { microservices } from '@/config/microservices';

interface Microservice {
  value: string;
  label: string;
  description: string;
}

interface Entity {
  name: string;
  tableName: string;
  spec: any;
}

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
  entities: Entity[];
  addEntity: (entity: Entity) => void;
  updateEntity: (name: string, entity: Entity) => void;
  removeEntity: (name: string) => void;

  // Loading state
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset function
  resetFeatureState: () => void;
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
  isLoading: false,
  loadingMessage: '',
  error: null,

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

  // Loading state actions
  setLoading: (loading, message = 'Loading...') => set({
    isLoading: loading,
    loadingMessage: message,
  }),

  // Error state actions
  setError: (error) => set({ error }),

  // Reset function to clear feature-specific state
  resetFeatureState: () => set({
    currentStep: 0,
    featureName: '',
    featureDescription: '',
    selectedMicroservice: '',
    yamlContent: '',
    entities: [],
    error: null,
  }),
})); 