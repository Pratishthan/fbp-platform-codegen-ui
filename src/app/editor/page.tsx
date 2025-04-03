'use client';

import { Box, Typography, Button, Paper, Grid, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import EntityForm from '@/components/EntityForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export default function EditorPage() {
  const router = useRouter();
  const { featureName, featureDescription, yamlContent, setYamlContent, entities, removeEntity } = useAppStore();
  const [editorHeight, setEditorHeight] = useState('500px');
  const [isEntityFormOpen, setIsEntityFormOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>();

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
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Entity Specifications
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAddEntity}
                >
                  Add Standalone Entity
                </Button>
              </Box>
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

      <EntityForm
        open={isEntityFormOpen}
        onClose={() => setIsEntityFormOpen(false)}
        entityName={selectedEntity}
      />
    </MainLayout>
  );
} 