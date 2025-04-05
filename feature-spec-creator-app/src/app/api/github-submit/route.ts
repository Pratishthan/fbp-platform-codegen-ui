import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { EntitySpec } from '@/lib/store'; // Assuming store defines this type

// Define expected request body structure
interface SubmitRequestBody {
  repoOwner: string;
  repoName: string;
  featureName: string;
  featureDescription: string;
  userId: string;
  openApiYaml: string;
  entities: EntitySpec[]; // Expecting the full entity spec objects
}

// --- GitHub Interaction Logic ---

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_BRANCH = 'develop'; // Hardcoded base branch for MVP

async function createFeatureBranchAndPR(payload: SubmitRequestBody) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set.');
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const {
    repoOwner,
    repoName,
    featureName,
    featureDescription,
    userId,
    openApiYaml,
    entities,
  } = payload;

  const repo = { owner: repoOwner, repo: repoName };
  const sanitizedFeatureName = featureName.toLowerCase().replace(/\s+/g, '-');
  const featureBranchName = `feature/${sanitizedFeatureName}`;
  const featureYamlFileName = `${sanitizedFeatureName}.yaml`;
  const commitMessage = `feat: Define API specification for ${featureName}`;
  const prTitle = `Feature: ${featureName}`;
  const prBody = `${featureDescription}\n\n*Initiated by: ${userId}*`;

  try {
    // 1. Get base branch (develop) SHA
    console.log(`Fetching base branch (${BASE_BRANCH}) SHA...`);
    const baseBranch = await octokit.rest.git.getRef({
      ...repo,
      ref: `heads/${BASE_BRANCH}`,
    });
    const baseSha = baseBranch.data.object.sha;
    console.log(`Base SHA: ${baseSha}`);

    // 2. Create Blobs for all files
    console.log('Creating blobs...');
    const fileBlobs = [];

    // OpenAPI YAML blob
    const yamlBlob = await octokit.rest.git.createBlob({
      ...repo,
      content: openApiYaml,
      encoding: 'utf-8',
    });
    fileBlobs.push({
      path: featureYamlFileName,
      mode: '100644' as const, // Explicitly cast to literal type
      type: 'blob' as const,   // Also cast type for consistency
      sha: yamlBlob.data.sha,
    });
    console.log(`YAML blob created: ${yamlBlob.data.sha}`);

    // Entity JSON blobs
    for (const entity of entities) {
      const entityFileName = `${entity.entityName}.entity.json`;
      const entityJson = JSON.stringify(entity, null, 2); // Pretty print JSON
      const entityBlob = await octokit.rest.git.createBlob({
        ...repo,
        content: entityJson,
        encoding: 'utf-8',
      });
      fileBlobs.push({
        path: entityFileName,
        mode: '100644' as const, // Explicitly cast to literal type
        type: 'blob' as const,   // Also cast type for consistency
        sha: entityBlob.data.sha,
      });
      console.log(`Entity blob created (${entityFileName}): ${entityBlob.data.sha}`);
    }

    // 3. Get base tree SHA (needed for creating new tree)
    console.log('Fetching base tree SHA...');
    const baseCommit = await octokit.rest.git.getCommit({
        ...repo,
        commit_sha: baseSha,
    });
    const baseTreeSha = baseCommit.data.tree.sha;
    console.log(`Base Tree SHA: ${baseTreeSha}`);


    // 4. Create Tree
    console.log('Creating tree...');
    const tree = await octokit.rest.git.createTree({
      ...repo,
      tree: fileBlobs,
      base_tree: baseTreeSha, // Link to base tree
    });
    console.log(`Tree created: ${tree.data.sha}`);

    // 5. Create Commit
    console.log('Creating commit...');
    const commit = await octokit.rest.git.createCommit({
      ...repo,
      message: commitMessage,
      tree: tree.data.sha,
      parents: [baseSha], // Set parent commit
    });
    const commitSha = commit.data.sha;
    console.log(`Commit created: ${commitSha}`);

    // 6. Create Feature Branch Ref pointing to the new commit
    console.log(`Creating feature branch ref (${featureBranchName})...`);
    try {
        await octokit.rest.git.createRef({
            ...repo,
            ref: `refs/heads/${featureBranchName}`,
            sha: commitSha,
        });
        console.log(`Feature branch created.`);
    } catch (error: any) {
        // Handle case where branch might already exist (e.g., from a previous failed attempt)
        // Attempt to update the ref instead
        if (error.status === 422) { // Unprocessable Entity - likely ref exists
            console.warn(`Branch ${featureBranchName} likely already exists. Attempting to update ref...`);
            await octokit.rest.git.updateRef({
                ...repo,
                ref: `heads/${featureBranchName}`,
                sha: commitSha,
                force: true, // Force update if necessary
            });
            console.log(`Feature branch ref updated.`);
        } else {
            throw error; // Re-throw other errors
        }
    }


    // 7. Create Pull Request
    console.log('Creating pull request...');
    const pullRequest = await octokit.rest.pulls.create({
      ...repo,
      title: prTitle,
      head: featureBranchName,
      base: BASE_BRANCH,
      body: prBody,
    });
    console.log(`Pull request created: ${pullRequest.data.html_url}`);

    return { pullRequestUrl: pullRequest.data.html_url };

  } catch (error: any) {
    console.error('GitHub API Error:', error);
    // Try to provide a more specific error message
    const message = error.response?.data?.message || error.message || 'An unknown error occurred during GitHub operation.';
    const status = error.status || 500;
    // Ensure error is serializable for the response
    throw new Error(`GitHub API Error (${status}): ${message}`);
  }
}


// --- API Route Handler ---

export async function POST(request: NextRequest) {
  console.log("Received POST request to /api/github-submit");
  try {
    const body = await request.json() as SubmitRequestBody;

    // Basic validation of request body
    if (!body.repoOwner || !body.repoName || !body.featureName || !body.userId || !body.openApiYaml || !body.entities) {
      console.error("Missing required fields in request body:", body);
      return NextResponse.json({ error: 'Missing required fields in request body.' }, { status: 400 });
    }

    console.log("Request body validated. Processing GitHub submission...");
    const result = await createFeatureBranchAndPR(body);
    console.log("GitHub submission successful:", result);

    return NextResponse.json(result, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error("Error in /api/github-submit:", error);
    // Ensure error message is extracted correctly
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
