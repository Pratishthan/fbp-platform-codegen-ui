'use client';

import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
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
    featureName: '',
    featureDescription: '',
    selectedMicroservice: '',
  });

  const [showError, setShowError] = useState(false);

  const validateForm = () => {
    const newErrors = {
      featureName: !formData.featureName ? 'Feature name is required' : '',
      featureDescription: !formData.featureDescription ? 'Feature description is required' : '',
      selectedMicroservice: !formData.selectedMicroservice ? 'Please select a microservice' : '',
    };

    setErrors(newErrors);
    setShowError(Object.values(newErrors).some(error => error !== ''));
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <MainLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Feature
        </Typography>

        {showError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fill in all required fields correctly.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Feature Name"
          value={formData.featureName}
          onChange={(e) => handleInputChange('featureName', e.target.value)}
          error={!!errors.featureName}
          helperText={errors.featureName}
          margin="normal"
          required
          autoFocus
        />

        <TextField
          fullWidth
          label="Feature Description"
          value={formData.featureDescription}
          onChange={(e) => handleInputChange('featureDescription', e.target.value)}
          error={!!errors.featureDescription}
          helperText={errors.featureDescription}
          margin="normal"
          required
          multiline
          rows={4}
        />

        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!errors.selectedMicroservice}
          required
        >
          <InputLabel>Select Microservice</InputLabel>
          <Select
            value={formData.selectedMicroservice}
            onChange={(e) => handleInputChange('selectedMicroservice', e.target.value)}
            label="Select Microservice"
          >
            {microservices.map((service) => (
              <MenuItem key={service.value} value={service.value}>
                {service.label}
                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  {service.description}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          {errors.selectedMicroservice && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {errors.selectedMicroservice}
            </Typography>
          )}
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