import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define expected request body structure (matches schema from plan)
interface LogRequestBody {
  submission_timestamp: string; // ISO string format expected
  user_id: string;
  microservice_ref: string; // e.g., repo URL or owner/name
  feature_name: string;
  workflow_type: 'api-entity' | 'api-only' | 'entity-only' | null; // Added workflow type
  openapi_schema_names?: string[]; // Made optional
  entity_spec_names?: string[]; // Made optional
  pull_request_url: string;
}

const LOG_FILE_PATH = path.join(process.cwd(), 'submissions.log.json');

async function appendToLogFile(logEntry: LogRequestBody) {
  try {
    let logs: LogRequestBody[] = [];
    // Check if file exists and read it
    try {
      const fileContent = await fs.readFile(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(fileContent);
      if (!Array.isArray(logs)) {
          console.warn('Log file does not contain a valid JSON array. Starting fresh.');
          logs = [];
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') { // Ignore file not found, handle other read errors
        console.error('Error reading log file:', error);
        // Decide if we should proceed or throw. For logging, maybe proceed.
      }
       logs = []; // Start fresh if file not found or unreadable
    }

    // Append new entry
    logs.push(logEntry);

    // Write back to file
    await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2)); // Pretty print
    console.log('Log entry appended successfully.');

  } catch (error) {
    console.error('Error writing to log file:', error);
    // Depending on requirements, might want to throw or handle differently
  }
}

// --- API Route Handler ---

export async function POST(request: NextRequest) {
  console.log("Received POST request to /api/log-submission");
  try {
    const body = await request.json() as LogRequestBody;

    // Basic validation (add more specific checks if needed)
    // Added check for workflow_type
    if (!body.submission_timestamp || !body.user_id || !body.microservice_ref || !body.feature_name || !body.pull_request_url || !body.workflow_type) {
      console.error("Missing required fields in log request body:", body);
      return NextResponse.json({ error: 'Missing required fields for logging (timestamp, user, microservice, feature, pr_url, workflow).' }, { status: 400 });
    }

    // Ensure arrays exist, even if empty
    body.openapi_schema_names = body.openapi_schema_names || [];
    body.entity_spec_names = body.entity_spec_names || [];

    console.log("Log request body validated. Appending to log file...");
    await appendToLogFile(body);

    // Respond with success, no content needed usually for logging
    return NextResponse.json({ message: 'Log entry received.' }, { status: 202 }); // 202 Accepted

  } catch (error: any) {
    console.error("Error in /api/log-submission:", error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred during logging.';
    // Don't block primary flow for logging errors, but report server error
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
