'use client';

import { Box, Typography, Button, Paper, Grid, List, ListItem, ListItemText, Divider, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import { createFeature } from '@/utils/githubApi';

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
      // Get repository information from selected microservice
      const selectedService = microservices.find(service => service.value === selectedMicroservice);
      if (!selectedService) {
        throw new Error('Selected microservice not found');
      }

      const { owner: repoOwner, name: repoName } = selectedService.repository;

      console.log('Submitting feature with:', {
        repoOwner,
        repoName,
        featureName,
        featureDescription,
        yamlContent: yamlContent?.substring(0, 100) + '...', // Log first 100 chars
        entitiesCount: entities.length
      });

      const result = await createFeature(
        repoOwner,
        repoName,
        featureName,
        featureDescription,
        yamlContent,
        entities
      );

      console.log('GitHub API Response:', result);

      if (!result.success) {
        const errorMessage = [
          result.error,
          result.details,
          result.status ? `Status: ${result.status}` : '',
          result.response ? `Response: ${JSON.stringify(result.response)}` : '',
        ].filter(Boolean).join('\n');
        
        throw new Error(errorMessage);
      }

      if (!result.pullRequestUrl) {
        console.error('Missing PR URL in response:', result);
        throw new Error('Pull request URL not received from GitHub API');
      }

      // On success, redirect to success page with PR URL
      router.push(`/success?prUrl=${encodeURIComponent(result.pullRequestUrl)}`);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit feature. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
                <MonacoEditor
                  height="300px"
                  defaultLanguage="yaml"
                  value={yamlContent}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
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
              {entities.length === 0 ? (
                <Typography color="text.secondary">
                  No entities defined
                </Typography>
              ) : (
                <List>
                  {entities.map((entity, index) => (
                    <Box key={entity.name}>
                      <ListItem>
                        <ListItemText
                          primary={entity.name}
                          secondary={
                            <Box component="pre" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(entity.spec, null, 2)}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < entities.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
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