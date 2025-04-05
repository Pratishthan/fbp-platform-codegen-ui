'use client';

import { Box, Typography, Button, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';
import EntityForm from '@/components/EntityForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EntitiesPage() {
  const router = useRouter();
  const { 
    entities, 
    removeEntity,
    setLoading,
    setError,
    setCurrentStep
  } = useAppStore();
  
  const [isEntityFormOpen, setIsEntityFormOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>();

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

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/editor');
  };

  const handleNext = () => {
    setCurrentStep(3);
    router.push('/review');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Entity Specifications
        </Typography>

        <Paper sx={{ p: 2, mb: 3, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            gap: 2 
          }}>
            <Typography variant="h6" sx={{ flexShrink: 0 }}>
              Entities
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Back to Editor
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
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