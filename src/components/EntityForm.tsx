'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppStore } from '@/store/useAppStore';

interface EntityFormProps {
  open: boolean;
  onClose: () => void;
  entityName?: string;
}

interface Field {
  fieldName: string;
  columnName: string;
  domainDataType: string;
  isPrimaryKey: boolean;
  pkStrategy?: string;
  isNullable: boolean;
}

export default function EntityForm({ open, onClose, entityName }: EntityFormProps) {
  const { domainDataTypes, entities, addEntity, updateEntity } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    tableName: '',
    fields: [] as Field[],
  });

  const [errors, setErrors] = useState({
    name: '',
    tableName: '',
    fields: [] as string[],
  });

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (entityName) {
      const existingEntity = entities.find(e => e.name === entityName);
      if (existingEntity) {
        setFormData({
          name: existingEntity.name,
          tableName: existingEntity.tableName,
          fields: existingEntity.spec.fields || [],
        });
      }
    } else {
      setFormData({
        name: '',
        tableName: '',
        fields: [],
      });
    }
    // Reset errors when form opens
    setErrors({ name: '', tableName: '', fields: [] });
    setShowError(false);
  }, [entityName, entities, open]);

  const validateForm = () => {
    const newErrors = {
      name: !formData.name ? 'Entity name is required' : '',
      tableName: !formData.tableName ? 'Table name is required' : '',
      fields: formData.fields.map(field => {
        if (!field.fieldName) return 'Field name is required';
        if (!field.columnName) return 'Column name is required';
        if (!field.domainDataType) return 'Data type is required';
        if (field.isPrimaryKey && !field.pkStrategy) return 'Primary key strategy is required';
        return '';
      }),
    };

    setErrors(newErrors);
    setShowError(Object.values(newErrors).some(error => 
      typeof error === 'string' ? error !== '' : error.some(e => e !== '')
    ));

    return !Object.values(newErrors).some(error => 
      typeof error === 'string' ? error !== '' : error.some(e => e !== '')
    );
  };

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          fieldName: '',
          columnName: '',
          domainDataType: '',
          isPrimaryKey: false,
          isNullable: true,
        },
      ],
    }));
    // Clear field errors when adding a new field
    setErrors(prev => ({
      ...prev,
      fields: [...prev.fields, ''],
    }));
  };

  const handleFieldChange = (index: number, field: keyof Field, value: any) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
    // Clear error for this field when it's modified
    if (errors.fields[index]) {
      setErrors(prev => ({
        ...prev,
        fields: prev.fields.map((e, i) => i === index ? '' : e),
      }));
    }
  };

  const handleRemoveField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
    setErrors(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const entity = {
      name: formData.name,
      tableName: formData.tableName,
      spec: {
        fields: formData.fields,
      },
    };

    if (entityName) {
      updateEntity(entityName, entity);
    } else {
      addEntity(entity);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {entityName ? 'Edit Entity' : 'Add New Entity'}
      </DialogTitle>
      <DialogContent>
        {showError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fill in all required fields correctly.
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Entity Name"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Table Name"
            value={formData.tableName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, tableName: e.target.value }));
              if (errors.tableName) setErrors(prev => ({ ...prev, tableName: '' }));
            }}
            error={!!errors.tableName}
            helperText={errors.tableName}
            margin="normal"
            required
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fields</Typography>
            <IconButton onClick={handleAddField} color="primary">
              <AddIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Primary Key</TableCell>
                  <TableCell>PK Strategy</TableCell>
                  <TableCell>Nullable</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.fields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={field.fieldName}
                        onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                        error={!!errors.fields[index]}
                        helperText={errors.fields[index]}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={field.columnName}
                        onChange={(e) => handleFieldChange(index, 'columnName', e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={field.domainDataType}
                          onChange={(e) => handleFieldChange(index, 'domainDataType', e.target.value)}
                          required
                        >
                          {domainDataTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.isPrimaryKey}
                        onChange={(e) => handleFieldChange(index, 'isPrimaryKey', e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {field.isPrimaryKey && (
                        <FormControl size="small" fullWidth>
                          <Select
                            value={field.pkStrategy || ''}
                            onChange={(e) => handleFieldChange(index, 'pkStrategy', e.target.value)}
                            required
                          >
                            <MenuItem value="auto">Auto</MenuItem>
                            <MenuItem value="sequence">Sequence</MenuItem>
                            <MenuItem value="identity">Identity</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.isNullable}
                        onChange={(e) => handleFieldChange(index, 'isNullable', e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveField(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 