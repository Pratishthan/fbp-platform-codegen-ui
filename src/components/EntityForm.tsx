'use client';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface EntityFormProps {
  open: boolean;
  onClose: () => void;
  entityName?: string;
}

export default function EntityForm({ open, onClose, entityName }: EntityFormProps) {
  const { domainDataTypes, entities, addEntity, updateEntity } = useAppStore();

  const [formData, setFormData] = useState({
    name: entityName || '',
    tableName: '',
    fields: [{
      fieldName: '',
      columnName: '',
      domainDataType: '',
      isPrimaryKey: false,
      pkStrategy: '',
      isNullable: false,
    }],
  });

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          fieldName: '',
          columnName: '',
          domainDataType: '',
          isPrimaryKey: false,
          pkStrategy: '',
          isNullable: false,
        },
      ],
    });
  };

  const handleRemoveField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    });
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, fields: newFields });
  };

  const handleSubmit = () => {
    if (entityName) {
      updateEntity(entityName, formData);
    } else {
      addEntity(formData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {entityName ? `Edit Entity: ${entityName}` : 'Add New Entity'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Entity Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            disabled={!!entityName}
          />

          <TextField
            fullWidth
            label="Table Name"
            value={formData.tableName}
            onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
            margin="normal"
            required
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Fields
          </Typography>

          {formData.fields.map((field, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Field {index + 1}</Typography>
                {index > 0 && (
                  <IconButton onClick={() => handleRemoveField(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <TextField
                fullWidth
                label="Field Name"
                value={field.fieldName}
                onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Column Name"
                value={field.columnName}
                onChange={(e) => handleFieldChange(index, 'columnName', e.target.value)}
                margin="normal"
                required
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={field.domainDataType}
                  onChange={(e) => handleFieldChange(index, 'domainDataType', e.target.value)}
                  label="Data Type"
                  required
                >
                  {domainDataTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPrimaryKey}
                    onChange={(e) => handleFieldChange(index, 'isPrimaryKey', e.target.checked)}
                  />
                }
                label="Primary Key"
              />

              {field.isPrimaryKey && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Primary Key Strategy</InputLabel>
                  <Select
                    value={field.pkStrategy}
                    onChange={(e) => handleFieldChange(index, 'pkStrategy', e.target.value)}
                    label="Primary Key Strategy"
                    required
                  >
                    <MenuItem value="auto">Auto</MenuItem>
                    <MenuItem value="sequence">Sequence</MenuItem>
                    <MenuItem value="identity">Identity</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isNullable}
                    onChange={(e) => handleFieldChange(index, 'isNullable', e.target.checked)}
                  />
                }
                label="Nullable"
              />
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddField}
            sx={{ mt: 2 }}
          >
            Add Field
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 