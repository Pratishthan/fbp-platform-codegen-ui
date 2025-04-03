'use client';

import { Box, Button, Grid, Paper, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import EntityForm from '@/components/EntityForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const { featureName, yamlContent, setYamlContent, setCurrentStep, entities, removeEntity } = useAppStore();
  const [isEntityFormOpen, setIsEntityFormOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>();

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

  const handleAddEntity = () => {
    setSelectedEntity(undefined);
    setIsEntityFormOpen(true);
  };

  const handleEditEntity = (name: string) => {
    setSelectedEntity(name);
    setIsEntityFormOpen(true);
  };

  const handleDeleteEntity = (name: string) => {
    removeEntity(name);
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
          <Paper elevation={3} sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Entity Specifications
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              onClick={handleAddEntity}
            >
              Add Standalone Entity
            </Button>
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {entities.map((entity) => (
                <ListItem
                  key={entity.name}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={() => handleEditEntity(entity.name)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteEntity(entity.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={entity.name}
                    secondary={entity.tableName}
                  />
                </ListItem>
              ))}
            </List>
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

      <EntityForm
        open={isEntityFormOpen}
        onClose={() => setIsEntityFormOpen(false)}
        entityName={selectedEntity}
      />
    </MainLayout>
  );
} 