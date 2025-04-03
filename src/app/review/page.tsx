'use client';

import { Box, Typography, Button, Paper, Grid, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    setCurrentStep 
  } = useAppStore();

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/editor');
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log('Submitting feature:', {
      featureName,
      featureDescription,
      selectedMicroservice,
      yamlContent,
      entities,
    });
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Review Specifications
        </Typography>

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
                    secondary={featureName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Feature Description"
                    secondary={featureDescription}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Selected Microservice"
                    secondary={selectedMicroservice}
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
          >
            Back to Editor
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit Feature
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
} 