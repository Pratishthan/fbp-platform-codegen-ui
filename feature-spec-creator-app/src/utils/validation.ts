export interface FeatureFormFields {
  featureName: string;
  featureDescription: string;
  userId: string;
  selectedMicroservice: { repoUrl: string } | null;
  workflowType: 'api-entity' | 'api-only' | 'entity-only' | null; // Added workflowType
}

export interface FeatureFormErrors {
  featureName?: string;
  featureDescription?: string;
  userId?: string;
  microservice?: string;
  workflowType?: string; // Added workflowType error field
}

export function validateFeatureForm(fields: FeatureFormFields): FeatureFormErrors {
  const errors: FeatureFormErrors = {};

  if (!fields.featureName.trim()) {
    errors.featureName = 'Feature Name is required.';
  }

  if (!fields.featureDescription.trim()) {
    errors.featureDescription = 'Description is required.';
  }

  if (!fields.userId.trim()) {
    errors.userId = 'Your Name/ID is required.';
  }

  if (!fields.selectedMicroservice) {
    errors.microservice = 'Please select a microservice.';
  }

  if (!fields.workflowType) { // Added validation for workflowType
    errors.workflowType = 'Please select a workflow type.';
  }

  return errors;
}
