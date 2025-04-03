'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { domainDataTypes } from '@/config/domainDataTypes';

interface EntityFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function EntityForm({ open, onClose, onSubmit, initialData }: EntityFormProps) {
  const [formData, setFormData] = useState({
    entityName: initialData?.entityName || '',
    tableName: initialData?.tableName || '',
    fields: initialData?.fields || [{ fieldName: '', columnName: '', domainDataType: '', isPrimaryKey: false, pkStrategy: '', isNullable: true }],
  });

  const handleFieldChange = (index: number, field: string, value: any) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, fields: newFields });
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { fieldName: '', columnName: '', domainDataType: '', isPrimaryKey: false, pkStrategy: '', isNullable: true }],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Define Entity</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Entity Name"
              value={formData.entityName}
              onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Table Name"
              value={formData.tableName}
              onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
              required
            />

            <Typography variant="h6">Fields</Typography>
            {formData.fields.map((field, index) => (
              <div key={index} className="grid grid-cols-6 gap-4">
                <TextField
                  label="Field Name"
                  value={field.fieldName}
                  onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                  required
                />
                <TextField
                  label="Column Name"
                  value={field.columnName}
                  onChange={(e) => handleFieldChange(index, 'columnName', e.target.value)}
                  required
                />
                <TextField
                  select
                  label="Domain Data Type"
                  value={field.domainDataType}
                  onChange={(e) => handleFieldChange(index, 'domainDataType', e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  required
                >
                  <option value="">Select Type</option>
                  {domainDataTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </TextField>
                <TextField
                  select
                  label="PK Strategy"
                  value={field.pkStrategy}
                  onChange={(e) => handleFieldChange(index, 'pkStrategy', e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">None</option>
                  <option value="AUTO">Auto</option>
                  <option value="SEQUENCE">Sequence</option>
                  <option value="IDENTITY">Identity</option>
                </TextField>
                <TextField
                  select
                  label="Nullable"
                  value={field.isNullable}
                  onChange={(e) => handleFieldChange(index, 'isNullable', e.target.value === 'true')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </TextField>
              </div>
            ))}
            
            <Button
              variant="outlined"
              onClick={handleAddField}
            >
              Add Field
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 