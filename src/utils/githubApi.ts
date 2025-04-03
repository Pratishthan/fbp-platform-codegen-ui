interface CreateFeatureResponse {
  success: boolean;
  pullRequestUrl?: string;
  branchName?: string;
  error?: string;
  details?: string;
}

export async function createFeature(
  repoOwner: string,
  repoName: string,
  featureName: string,
  description: string,
  yamlContent: string,
  entities: any[]
): Promise<CreateFeatureResponse> {
  try {
    const response = await fetch('/api/github-feature-creator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoOwner,
        repoName,
        featureName,
        description,
        yamlContent,
        entities,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create feature');
    }

    return data;
  } catch (error: any) {
    console.error('Error creating feature:', error);
    return {
      success: false,
      error: 'Failed to create feature',
      details: error.message,
    };
  }
} 