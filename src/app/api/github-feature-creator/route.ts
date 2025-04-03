import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      repoOwner,
      repoName,
      featureName,
      description,
      yamlContent,
      entities,
    } = body;

    console.log('Received request body:', {
      repoOwner,
      repoName,
      featureName,
      description,
      hasYamlContent: !!yamlContent,
      entitiesCount: entities?.length || 0,
    });

    // Validate required fields
    if (!repoOwner || !repoName || !featureName || !description || !yamlContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate GitHub token
    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token not configured');
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    try {
      // First verify repository exists and is accessible
      await octokit.repos.get({
        owner: repoOwner,
        repo: repoName,
      });
    } catch (error: any) {
      console.error('Repository validation failed:', error);
      if (error.status === 404) {
        return NextResponse.json(
          { error: `Repository ${repoOwner}/${repoName} not found or not accessible` },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get the SHA of the develop branch
    const { data: branchData } = await octokit.repos.getBranch({
      owner: repoOwner,
      repo: repoName,
      branch: 'develop',
    });

    const baseTreeSha = branchData.commit.sha;

    // Create feature branch name
    const featureBranchName = `feature/${featureName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;

    // Create blobs for YAML and entity files
    const yamlBlob = await octokit.git.createBlob({
      owner: repoOwner,
      repo: repoName,
      content: yamlContent,
      encoding: 'utf-8',
    });

    const entityBlobs = await Promise.all(
      entities.map(async (entity: any) => {
        const blob = await octokit.git.createBlob({
          owner: repoOwner,
          repo: repoName,
          content: JSON.stringify(entity.spec, null, 2),
          encoding: 'utf-8',
        });
        return {
          path: `${entity.name}.entity.json`,
          mode: '100644',
          type: 'blob',
          sha: blob.data.sha,
        };
      })
    );

    // Create tree with all files
    const { data: treeData } = await octokit.git.createTree({
      owner: repoOwner,
      repo: repoName,
      base_tree: baseTreeSha,
      tree: [
        {
          path: `${featureName}.yaml`,
          mode: '100644',
          type: 'blob',
          sha: yamlBlob.data.sha,
        },
        ...entityBlobs,
      ],
    });

    // Create commit
    const { data: commitData } = await octokit.git.createCommit({
      owner: repoOwner,
      repo: repoName,
      message: `feat: Define API specification and entity models for ${featureName}`,
      tree: treeData.sha,
      parents: [baseTreeSha],
    });

    // Create or update feature branch
    try {
      await octokit.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${featureBranchName}`,
        sha: commitData.sha,
      });
    } catch (error: any) {
      if (error.status === 422) {
        // Branch already exists, update it
        await octokit.git.updateRef({
          owner: repoOwner,
          repo: repoName,
          ref: `heads/${featureBranchName}`,
          sha: commitData.sha,
          force: true,
        });
      } else {
        throw error;
      }
    }

    // Create pull request
    const { data: prData } = await octokit.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: `feat: Define API specification and entity models for ${featureName}`,
      body: description,
      head: featureBranchName,
      base: 'develop',
    });

    return NextResponse.json({
      success: true,
      pullRequestUrl: prData.html_url,
      branchName: featureBranchName,
    });
  } catch (error: any) {
    console.error('GitHub operation failed:', {
      error: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack,
    });

    return NextResponse.json(
      { 
        error: error.message,
        details: error.response?.data?.message,
        status: error.status,
        response: error.response?.data,
      },
      { status: error.status || 500 }
    );
  }
} 