'use client';

import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';

export default function ReviewPage() {
  const router = useRouter();
  const {
    featureName,
    featureDescription,
    selectedMicroservice,
    yamlContent,
    entities,
    setCurrentStep,
  } = useAppStore();

  useEffect(() => {
    // If no feature name is set, redirect to home
    if (!featureName) {
      router.push('/');
      return;
    }
  }, [featureName, router]);

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/editor');
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement submission logic
      console.log('Submitting feature:', {
        featureName,
        featureDescription,
        selectedMicroservice,
        yamlContent,
        entities,
      });
    } catch (error) {
      console.error('Error submitting feature:', error);
    }
  };

  return (
    <MainLayout>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Feature Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Feature Name:</Typography>
              <Typography>{featureName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Description:</Typography>
              <Typography>{featureDescription}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Microservice:</Typography>
              <Typography>{selectedMicroservice}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '50vh' }}>
            <Typography variant="h6" gutterBottom>
              OpenAPI Specification
            </Typography>
            <Editor
              height="90%"
              defaultLanguage="yaml"
              value={yamlContent}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '50vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Entity Specifications
            </Typography>
            {entities.map((entity) => (
              <Box key={entity.name} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{entity.name}</Typography>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {JSON.stringify(entity, null, 2)}
                </pre>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit Feature
            </Button>
          </Box>
        </Grid>
      </Grid>
    </MainLayout>
  );
} 