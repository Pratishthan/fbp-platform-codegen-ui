interface CreateFeatureResponse {
  success: boolean;
  pullRequestUrl?: string;
  branchName?: string;
  error?: string;
  details?: string;
  status?: number;
  response?: any;
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
    // Validate input parameters
    if (!repoOwner || !repoName || !featureName || !description || !yamlContent || !entities) {
      throw new Error('Missing required parameters');
    }

    if (!Array.isArray(entities)) {
      throw new Error('Entities must be an array');
    }

    console.log('Creating feature with:', {
      repoOwner,
      repoName,
      featureName,
      descriptionLength: description.length,
      yamlContentLength: yamlContent.length,
      entitiesCount: entities.length,
    });

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
        entities: entities.map(entity => ({
          name: entity.name,
          spec: entity.spec
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      
      throw new Error(data.error || 'Failed to create feature');
    }

    if (!data.pullRequestUrl) {
      console.error('Missing PR URL in response:', data);
      throw new Error('Pull request URL not received from GitHub API');
    }

    return {
      success: true,
      pullRequestUrl: data.pullRequestUrl,
      branchName: data.branchName,
    };
  } catch (error: any) {
    console.error('Error creating feature:', {
      message: error.message,
      stack: error.stack,
      response: error.response,
    });
    
    return {
      success: false,
      error: 'Failed to create feature',
      details: error.message,
      status: error.status,
      response: error.response,
    };
  }
} 