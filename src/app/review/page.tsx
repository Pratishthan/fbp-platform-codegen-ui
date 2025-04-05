'use client';

import { Box, Typography, Button, Paper, Grid, List, ListItem, ListItemText, Divider, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import { createFeature } from '@/utils/githubApi';
import { parse as parseYaml } from 'yaml';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export default function ReviewPage() {
  const router = useRouter();
  const { 
    featureName, 
    featureDescription, 
    selectedMicroservice, 
    yamlContent, 
    entities,
    setCurrentStep,
    microservices
  } = useAppStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!featureName) return 'Feature name is required';
    if (!featureDescription) return 'Feature description is required';
    if (!selectedMicroservice) return 'Microservice selection is required';
    if (!yamlContent) return 'OpenAPI specification is required';
    return null;
  };

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/editor');
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the selected microservice details
      const selectedService = microservices.find(
        (service) => service.value === selectedMicroservice
      );

      if (!selectedService) {
        throw new Error('Selected microservice not found');
      }

      // Extract repository details from the selected microservice
      const repoOwner = selectedService.repository.owner;
      const repoName = selectedService.repository.name;

      // Create the feature in GitHub
      const result = await createFeature(
        repoOwner,
        repoName,
        featureName,
        featureDescription || '',
        yamlContent || '',
        entities.map((entity) => ({
          name: entity.name,
          spec: entity.spec,
        }))
      );

      // Log the feature creation
      await logFeatureCreation({
        userId: 'current-user', // In a real app, get this from authentication
        microserviceRef: selectedMicroservice,
        featureName,
        openapiSchemaNames: extractSchemaNames(yamlContent || ''),
        entitySpecNames: entities.map((entity) => entity.name),
        pullRequestUrl: result.pullRequestUrl,
      });

      // Navigate to success page or show success message
      router.push(`/success?prUrl=${encodeURIComponent(result.pullRequestUrl)}`);
    } catch (error) {
      console.error('Error creating feature:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while creating the feature'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to extract schema names from YAML content
  const extractSchemaNames = (yamlContent: string): string[] => {
    try {
      const doc = parseYaml(yamlContent) as any;
      return Object.keys(doc.components?.schemas || {});
    } catch (error) {
      console.error('Error extracting schema names:', error);
      return [];
    }
  };

  // Helper function to log feature creation
  async function logFeatureCreation(payload: {
    userId: string;
    microserviceRef: string;
    featureName: string;
    openapiSchemaNames: string[];
    entitySpecNames: string[];
    pullRequestUrl: string;
  }) {
    try {
      const response = await fetch('/api/feature-creator-logger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error logging feature creation:', errorData);
        // We don't throw an error here to avoid affecting the user experience
        // The feature was already created successfully
      }
    } catch (error) {
      console.error('Error calling logging API:', error);
      // We don't throw an error here to avoid affecting the user experience
      // The feature was already created successfully
    }
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Review Specifications
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Feature Details */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Feature Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Feature Name"
                    secondary={featureName || 'Not specified'}
                    secondaryTypographyProps={{
                      color: !featureName ? 'error' : 'text.secondary'
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Feature Description"
                    secondary={featureDescription || 'Not specified'}
                    secondaryTypographyProps={{
                      color: !featureDescription ? 'error' : 'text.secondary'
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Selected Microservice"
                    secondary={selectedMicroservice || 'Not specified'}
                    secondaryTypographyProps={{
                      color: !selectedMicroservice ? 'error' : 'text.secondary'
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* OpenAPI Specification */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                OpenAPI Specification
              </Typography>
              <Box sx={{ mb: 4 }}>
                <MonacoEditor
                  height="400px"
                  defaultLanguage="yaml"
                  value={yamlContent}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Entity Specifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Entity Specifications
              </Typography>
              {entities.length > 0 ? (
                <List>
                  {entities.map((entity, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={entity.name}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              component="div"
                              sx={{
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {JSON.stringify(entity.spec, null, 2)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No entities defined</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back to Editor
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feature'}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
} 