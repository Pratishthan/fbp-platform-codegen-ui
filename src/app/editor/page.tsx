'use client';

import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';

const defaultYaml = `openapi: 3.0.0
info:
  title: Feature API
  version: 1.0.0
paths:
  /api/example:
    get:
      summary: Example endpoint
      responses:
        '200':
          description: Success
components:
  schemas:
    Example:
      type: object
      properties:
        id:
          type: string
          format: uuid`;

export default function EditorPage() {
  const router = useRouter();
  const { featureName, yamlContent, setYamlContent, setCurrentStep } = useAppStore();

  useEffect(() => {
    // If no feature name is set, redirect to home
    if (!featureName) {
      router.push('/');
      return;
    }

    // Initialize YAML content if empty
    if (!yamlContent) {
      setYamlContent(defaultYaml);
    }
  }, [featureName, yamlContent, router, setYamlContent]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setYamlContent(value);
    }
  };

  const handleNext = () => {
    setCurrentStep(2);
    router.push('/review');
  };

  const handleBack = () => {
    setCurrentStep(0);
    router.push('/');
  };

  return (
    <MainLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '70vh' }}>
            <Typography variant="h6" gutterBottom>
              OpenAPI Specification
            </Typography>
            <Editor
              height="90%"
              defaultLanguage="yaml"
              value={yamlContent}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '70vh' }}>
            <Typography variant="h6" gutterBottom>
              Entity Specifications
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Add Standalone Entity
            </Button>
            {/* Entity list will go here */}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" onClick={handleNext}>
              Next: Review
            </Button>
          </Box>
        </Grid>
      </Grid>
    </MainLayout>
  );
} 