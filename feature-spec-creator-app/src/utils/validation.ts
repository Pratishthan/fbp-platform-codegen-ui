export interface FeatureFormFields {
  featureName: string;
  featureDescription: string;
  userId: string;
  selectedMicroservice: { repoUrl: string } | null;
}

export interface FeatureFormErrors {
  featureName?: string;
  featureDescription?: string;
  userId?: string;
  microservice?: string;
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

  return errors;
}
