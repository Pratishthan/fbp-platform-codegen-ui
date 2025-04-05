export interface SubmitPayload {
  repoOwner: string;
  repoName: string;
  featureName: string;
  featureDescription: string;
  userId: string;
  openApiYaml: string;
  entities: any[];
}

export interface LogPayload {
  submission_timestamp: string;
  user_id: string;
  microservice_ref: string;
  feature_name: string;
  openapi_schema_names: string[];
  entity_spec_names: string[];
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
