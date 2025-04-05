import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Define the interface for the logging payload
interface LoggingPayload {
  userId: string;
  microserviceRef: string;
  featureName: string;
  openapiSchemaNames: string[];
  entitySpecNames: string[];
  pullRequestUrl: string;
}

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const payload: LoggingPayload = await request.json();

    // Validate required fields
    if (!payload.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!payload.microserviceRef) {
      return NextResponse.json(
        { error: 'Microservice reference is required' },
        { status: 400 }
      );
    }

    if (!payload.featureName) {
      return NextResponse.json(
        { error: 'Feature name is required' },
        { status: 400 }
      );
    }

    if (!payload.pullRequestUrl) {
      return NextResponse.json(
        { error: 'Pull request URL is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would insert this data into a database
    // For this example, we'll log it to the console and return a success response
    console.log('Logging feature submission:', {
      submission_timestamp: new Date().toISOString(),
      user_id: payload.userId,
      microservice_ref: payload.microserviceRef,
      feature_name: payload.featureName,
      openapi_schema_names: payload.openapiSchemaNames,
      entity_spec_names: payload.entitySpecNames,
      pull_request_url: payload.pullRequestUrl,
    });

    // Return a success response
    return NextResponse.json({
      success: true,
      message: 'Feature submission logged successfully',
    });
  } catch (error) {
    console.error('Error logging feature submission:', error);
    
    // Return an error response
    return NextResponse.json(
      { 
        error: 'Failed to log feature submission',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 