'use client';

import { Box, Typography, Button, Paper, Grid, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import EntityForm from '@/components/EntityForm';
import VendorExtensionForm from '@/components/VendorExtensionForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import yaml from 'js-yaml';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export default function EditorPage() {
  const router = useRouter();
  const { 
    featureName, 
    featureDescription, 
    yamlContent, 
    setYamlContent, 
    entities, 
    removeEntity,
    setLoading,
    setError
  } = useAppStore();
  const [editorHeight, setEditorHeight] = useState('500px');
  const [isEntityFormOpen, setIsEntityFormOpen] = useState(false);
  const [isVendorExtensionFormOpen, setIsVendorExtensionFormOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>();
  const [selectedSchema, setSelectedSchema] = useState<string | undefined>();
  const [schemas, setSchemas] = useState<string[]>([]);

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

  useEffect(() => {
    try {
      setLoading(true, 'Parsing YAML content...');
      const doc = yaml.load(yamlContent) as any;
      const schemaNames = Object.keys(doc.components?.schemas || {});
      setSchemas(schemaNames);
    } catch (error) {
      console.error('Error parsing YAML:', error);
      setError('Failed to parse YAML content. Please check the syntax.');
      setSchemas([]);
    } finally {
      setLoading(false);
    }
  }, [yamlContent, setLoading, setError]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setYamlContent(value);
    }
  };

  const handleReview = () => {
    try {
      setLoading(true, 'Validating specifications...');
      // Add any validation logic here
      router.push('/review');
    } catch (error) {
      console.error('Error during review:', error);
      setError('Failed to proceed to review. Please check your specifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntity = () => {
    setSelectedEntity(undefined);
    setIsEntityFormOpen(true);
  };

  const handleEditEntity = (name: string) => {
    setSelectedEntity(name);
    setIsEntityFormOpen(true);
  };

  const handleDeleteEntity = async (name: string) => {
    try {
      setLoading(true, 'Removing entity...');
      removeEntity(name);
    } catch (error) {
      console.error('Error removing entity:', error);
      setError('Failed to remove entity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchema = () => {
    const schemaName = prompt('Enter schema name:');
    if (schemaName) {
      try {
        setLoading(true, 'Adding new schema...');
        const doc = yaml.load(yamlContent) as any;
        if (!doc.components) doc.components = {};
        if (!doc.components.schemas) doc.components.schemas = {};
        
        doc.components.schemas[schemaName] = {
          type: 'object',
          properties: {},
        };

        const updatedYaml = yaml.dump(doc);
        setYamlContent(updatedYaml);
      } catch (error) {
        console.error('Error adding schema:', error);
        setError('Failed to add schema. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenVendorExtensionForm = (schemaName: string) => {
    setSelectedSchema(schemaName);
    setIsVendorExtensionFormOpen(true);
  };

  const handleApplyVendorExtensions = (updatedYaml: string) => {
    setYamlContent(updatedYaml);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Specification Editor
        </Typography>

        <Grid container spacing={3}>
          {/* OpenAPI Editor Panel */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  OpenAPI Specification
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddSchema}
                >
                  Add Schema
                </Button>
              </Box>
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
              {schemas.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Schemas
                  </Typography>
                  <List>
                    {schemas.map((schemaName) => (
                      <ListItem
                        key={schemaName}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenVendorExtensionForm(schemaName)}
                            title="Configure Vendor Extensions"
                          >
                            <SettingsIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={schemaName} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Entity Specifications Panel */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                gap: 2 
              }}>
                <Typography variant="h6" sx={{ flexShrink: 0 }}>
                  Entity Specifications
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEntity}
                  sx={{ 
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    flexShrink: 0
                  }}
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

      <VendorExtensionForm
        open={isVendorExtensionFormOpen}
        onClose={() => setIsVendorExtensionFormOpen(false)}
        schemaName={selectedSchema || ''}
        yamlContent={yamlContent}
        onApply={handleApplyVendorExtensions}
      />
    </MainLayout>
  );
} 