'use client';

import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export default function EditorPage() {
  const router = useRouter();
  const { featureName, featureDescription, yamlContent, setYamlContent } = useAppStore();
  const [editorHeight, setEditorHeight] = useState('500px');

  // Basic OpenAPI template
  const basicTemplate = `openapi: 3.0.0
info:
  title: ${featureName}
  description: ${featureDescription}
  version: 1.0.0
paths: {}
components:
  schemas: {}`;

  useEffect(() => {
    // Initialize YAML content with template if empty
    if (!yamlContent) {
      setYamlContent(basicTemplate);
    }
  }, [yamlContent, setYamlContent, basicTemplate]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setYamlContent(value);
    }
  };

  const handleReview = () => {
    router.push('/review');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Specification Editor
        </Typography>

        <Grid container spacing={3}>
          {/* OpenAPI Editor Panel */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                OpenAPI Specification
              </Typography>
              <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
                <MonacoEditor
                  height={editorHeight}
                  defaultLanguage="yaml"
                  value={yamlContent}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Entity Specifications Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Entity Specifications
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {/* TODO: Implement add entity */}}
                >
                  Add Standalone Entity
                </Button>
              </Box>
              {/* TODO: Add entity list component */}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReview}
          >
            Review Specifications
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
} 