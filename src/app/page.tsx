'use client';

import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const router = useRouter();
  const { microservices, setFeatureDetails, setCurrentStep } = useAppStore();

  const [formData, setFormData] = useState({
    featureName: '',
    featureDescription: '',
    selectedMicroservice: '',
  });

  const [errors, setErrors] = useState({
    featureName: false,
    featureDescription: false,
    selectedMicroservice: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors = {
      featureName: !formData.featureName,
      featureDescription: !formData.featureDescription,
      selectedMicroservice: !formData.selectedMicroservice,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    // Save form data to store
    setFeatureDetails(
      formData.featureName,
      formData.featureDescription,
      formData.selectedMicroservice
    );

    // Move to next step
    setCurrentStep(1);
    router.push('/editor');
  };

  return (
    <MainLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Feature
        </Typography>

        <TextField
          fullWidth
          label="Feature Name"
          value={formData.featureName}
          onChange={(e) => setFormData({ ...formData, featureName: e.target.value })}
          error={errors.featureName}
          helperText={errors.featureName ? 'Feature name is required' : ''}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Feature Description"
          value={formData.featureDescription}
          onChange={(e) => setFormData({ ...formData, featureDescription: e.target.value })}
          error={errors.featureDescription}
          helperText={errors.featureDescription ? 'Feature description is required' : ''}
          margin="normal"
          required
          multiline
          rows={4}
        />

        <FormControl fullWidth margin="normal" error={errors.selectedMicroservice} required>
          <InputLabel>Select Microservice</InputLabel>
          <Select
            value={formData.selectedMicroservice}
            onChange={(e) => setFormData({ ...formData, selectedMicroservice: e.target.value })}
            label="Select Microservice"
          >
            {microservices.map((service) => (
              <MenuItem key={service.value} value={service.value}>
                {service.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ mt: 4 }}
        >
          Next: Specification Editor
        </Button>
      </Box>
    </MainLayout>
  );
} 