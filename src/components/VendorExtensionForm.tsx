'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface VendorExtensionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  schemaName: string;
  initialData?: any;
}

export default function VendorExtensionForm({ open, onClose, onSubmit, schemaName, initialData }: VendorExtensionFormProps) {
  const [formData, setFormData] = useState({
    generatePersistenceLayer: initialData?.generatePersistenceLayer || false,
    repoMethods: initialData?.repoMethods || [],
    endPoints: initialData?.endPoints || [],
    props: initialData?.props || {},
  });

  const handleAddRepoMethod = () => {
    setFormData({
      ...formData,
      repoMethods: [...formData.repoMethods, { name: '', returnType: '', parameters: [] }],
    });
  };

  const handleAddEndpoint = () => {
    setFormData({
      ...formData,
      endPoints: [...formData.endPoints, { path: '', method: '', operationId: '' }],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Vendor Extensions for {schemaName}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <Typography variant="h6">Repository Methods</Typography>
            {formData.repoMethods.map((method, index) => (
              <div key={index} className="grid grid-cols-3 gap-4">
                <TextField
                  label="Method Name"
                  value={method.name}
                  onChange={(e) => {
                    const newMethods = [...formData.repoMethods];
                    newMethods[index] = { ...newMethods[index], name: e.target.value };
                    setFormData({ ...formData, repoMethods: newMethods });
                  }}
                />
                <TextField
                  label="Return Type"
                  value={method.returnType}
                  onChange={(e) => {
                    const newMethods = [...formData.repoMethods];
                    newMethods[index] = { ...newMethods[index], returnType: e.target.value };
                    setFormData({ ...formData, repoMethods: newMethods });
                  }}
                />
              </div>
            ))}
            <Button variant="outlined" onClick={handleAddRepoMethod}>
              Add Repository Method
            </Button>

            <Typography variant="h6">Endpoints</Typography>
            {formData.endPoints.map((endpoint, index) => (
              <div key={index} className="grid grid-cols-3 gap-4">
                <TextField
                  label="Path"
                  value={endpoint.path}
                  onChange={(e) => {
                    const newEndpoints = [...formData.endPoints];
                    newEndpoints[index] = { ...newEndpoints[index], path: e.target.value };
                    setFormData({ ...formData, endPoints: newEndpoints });
                  }}
                />
                <TextField
                  select
                  label="Method"
                  value={endpoint.method}
                  onChange={(e) => {
                    const newEndpoints = [...formData.endPoints];
                    newEndpoints[index] = { ...newEndpoints[index], method: e.target.value };
                    setFormData({ ...formData, endPoints: newEndpoints });
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Method</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </TextField>
                <TextField
                  label="Operation ID"
                  value={endpoint.operationId}
                  onChange={(e) => {
                    const newEndpoints = [...formData.endPoints];
                    newEndpoints[index] = { ...newEndpoints[index], operationId: e.target.value };
                    setFormData({ ...formData, endPoints: newEndpoints });
                  }}
                />
              </div>
            ))}
            <Button variant="outlined" onClick={handleAddEndpoint}>
              Add Endpoint
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 