import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

interface GitHubError extends Error {
  status?: number;
  response?: {
    data?: any;
  };
}

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

    // Validate required fields
    if (!repoOwner || !repoName || !featureName || !yamlContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: 'repoOwner, repoName, featureName, and yamlContent are required',
        },
        { status: 400 }
      );
    }

    // Check if GitHub token is configured
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'GitHub token not configured',
          details: 'Please set the GITHUB_TOKEN environment variable',
        },
        { status: 500 }
      );
    }

    // Verify repository exists and is accessible
    try {
      await octokit.repos.get({
        owner: repoOwner,
        repo: repoName,
      });
    } catch (error) {
      const githubError = error as GitHubError;
      return NextResponse.json(
        {
          success: false,
          error: 'Repository not found or inaccessible',
          details: githubError.message,
        },
        { status: 404 }
      );
    }

    // Get the SHA of the develop branch
    const { data: developBranch } = await octokit.repos.getBranch({
      owner: repoOwner,
      repo: repoName,
      branch: 'develop',
    });

    const baseTreeSha = developBranch.commit.sha;

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

    // Create a tree with the new files
    const { data: newTree } = await octokit.git.createTree({
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

    // Create a commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner: repoOwner,
      repo: repoName,
      message: `feat: ${featureName}\n\n${description || 'No description provided'}`,
      tree: newTree.sha,
      parents: [baseTreeSha],
    });

    // Create or update the feature branch
    const branchName = `feature/${featureName}`;
    try {
      await octokit.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: newCommit.sha,
      });
    } catch (error) {
      // If branch exists, update it
      await octokit.git.updateRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${branchName}`,
        sha: newCommit.sha,
        force: true,
      });
    }

    // Create a pull request
    const { data: pullRequest } = await octokit.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: `feat: ${featureName}`,
      head: branchName,
      base: 'develop',
      body: description || 'No description provided',
    });

    return NextResponse.json({
      success: true,
      pullRequestUrl: pullRequest.html_url,
      branchName,
    });
  } catch (error) {
    const githubError = error as GitHubError;
    console.error('GitHub API error:', githubError);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create feature',
        details: githubError.message,
        status: githubError.status,
        response: githubError.response?.data,
      },
      { status: githubError.status || 500 }
    );
  }
} 