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
    setLoading,
    setError,
    setCurrentStep
  } = useAppStore();
  const [editorHeight, setEditorHeight] = useState('500px');
  const [isVendorExtensionFormOpen, setIsVendorExtensionFormOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<string | undefined>();
  const [schemas, setSchemas] = useState<string[]>([]);
  const [hasYamlError, setHasYamlError] = useState(false);

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
      setHasYamlError(false);
      setError(null);
    } catch (error) {
      console.error('Error parsing YAML:', error);
      setError('Failed to parse YAML content. Please check the syntax.');
      setSchemas([]);
      setHasYamlError(true);
    } finally {
      setLoading(false);
    }
  }, [yamlContent, setLoading, setError]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setYamlContent(value);
    }
  };

  const validateYaml = () => {
    try {
      const doc = yaml.load(yamlContent) as any;
      
      // Basic structure validation
      if (!doc.openapi) {
        throw new Error('Missing OpenAPI version');
      }
      if (!doc.info?.title) {
        throw new Error('Missing API title');
      }
      if (!doc.components?.schemas || Object.keys(doc.components.schemas).length === 0) {
        throw new Error('No schemas defined');
      }

      return true;
    } catch (error) {
      console.error('YAML validation error:', error);
      setError(error instanceof Error ? error.message : 'Invalid YAML content');
      return false;
    }
  };

  const handleNext = () => {
    try {
      setLoading(true, 'Validating specifications...');
      
      if (hasYamlError) {
        setError('Please fix YAML syntax errors before proceeding.');
        return;
      }

      if (!validateYaml()) {
        return;
      }

      setCurrentStep(2);
      router.push('/entities');
    } catch (error) {
      console.error('Error during validation:', error);
      setError('Failed to proceed. Please check your specifications.');
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
          OpenAPI Specification Editor
        </Typography>

        <Paper sx={{ p: 2, mb: 3, minHeight: '60vh' }}>
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={hasYamlError}
          >
            Next: Entity Specifications
          </Button>
        </Box>
      </Box>

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