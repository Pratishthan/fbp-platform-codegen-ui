export interface SubmitPayload {
  repoOwner: string;
  repoName: string;
  featureName: string;
  featureDescription: string;
  userId: string;
  workflowType: 'api-entity' | 'api-only' | 'entity-only' | null; // Added workflow type
  openApiYaml?: string; // Made optional
  entities?: any[]; // Made optional
}

export interface LogPayload {
  submission_timestamp: string;
  user_id: string;
  microservice_ref: string;
  feature_name: string;
  workflow_type: 'api-entity' | 'api-only' | 'entity-only' | null; // Added workflow type
  openapi_schema_names?: string[]; // Made optional
  entity_spec_names?: string[]; // Made optional
  pull_request_url: string;
}

export async function submitToGitHub(payload: SubmitPayload): Promise<{ pullRequestUrl: string }> {
  const response = await fetch('/api/github-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `HTTP error! status: ${response.status}`);
  }

  return { pullRequestUrl: result.pullRequestUrl };
}

export async function logSubmission(payload: LogPayload): Promise<void> {
  const response = await fetch('/api/log-submission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.warn('Logging submission failed:', await response.text());
  }
}
