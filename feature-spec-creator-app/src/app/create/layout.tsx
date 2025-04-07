import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import StoreInitializer from './StoreInitializer'; // Client component for store init
import { Microservice } from '@/lib/store'; // Import type from store

// Function to load domain types from the JSON file
async function loadDomainTypes(): Promise<string[]> {
  try {
    // Construct the absolute path to the file relative to the project root
    const filePath = path.join(process.cwd(), 'domainTypes.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Basic validation
    if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
      return data;
    }
    console.error("Invalid format in domainTypes.json. Expected string[].");
    return []; // Return empty array on error or invalid format
  } catch (error) {
    console.error("Error reading domainTypes.json:", error);
    return []; // Return empty array on error
  }
}

// Function to load microservices from the JSON file
async function loadMicroservices(): Promise<Microservice[]> {
  try {
    // Construct the absolute path relative to the project root
    const filePath = path.join(process.cwd(), 'src', 'config', 'microservices.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Add basic validation if needed
    if (Array.isArray(data)) { // Basic check
      // Add more specific type validation if necessary
      return data as Microservice[];
    }
    console.error("Invalid format in microservices.json.");
    return [];
  } catch (error) {
    console.error("Error reading microservices.json:", error);
    return [];
  }
}


export default async function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load data in parallel
  const [domainTypes, microservices] = await Promise.all([
    loadDomainTypes(),
    loadMicroservices()
  ]);

  return (
    <div>
      {/* Initialize store with loaded data on the client */}
      <StoreInitializer domainTypes={domainTypes} microservices={microservices} />

      {/* Stepper component can be added here later */}
      {/* <Stepper currentStep={...} /> */}

      <div className="mt-4 p-6 bg-white rounded-lg shadow">
        {children}
      </div>
    </div>
  );
}
