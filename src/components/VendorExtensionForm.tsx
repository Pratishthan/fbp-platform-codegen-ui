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
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppStore } from '@/store/useAppStore';
import * as yaml from 'js-yaml';

interface RepoMethod {
  name: string;
  returnType: string;
  parameters: Array<{
    name: string;
    type: string;
  }>;
}

interface EndPoint {
  path: string;
  method: string;
  operationId: string;
}

interface VendorExtensionFormProps {
  open: boolean;
  onClose: () => void;
  schemaName: string;
  yamlContent: string;
  onApply: (updatedYaml: string) => void;
}

const VendorExtensionForm: React.FC<VendorExtensionFormProps> = ({
  open,
  onClose,
  schemaName,
  yamlContent,
  onApply,
}) => {
  const [formData, setFormData] = useState({
    generatePersistenceLayer: false,
    tableName: '',
    repoMethods: [] as RepoMethod[],
    endPoints: [] as EndPoint[],
    additionalProperties: {} as Record<string, any>,
  });

  useEffect(() => {
    if (open && yamlContent) {
      try {
        const doc = yaml.load(yamlContent) as any;
        const schema = doc.components?.schemas?.[schemaName];
        if (schema) {
          const extensions = schema['x-fbp-props'] || {};
          setFormData({
            generatePersistenceLayer: extensions.generatePersistenceLayer || false,
            tableName: extensions.tableName || '',
            repoMethods: extensions.repoMethods || [],
            endPoints: extensions.endPoints || [],
            additionalProperties: extensions.additionalProperties || {},
          });
        }
      } catch (error) {
        console.error('Error parsing YAML:', error);
      }
    }
  }, [open, schemaName, yamlContent]);

  const handleAddRepoMethod = () => {
    setFormData(prev => ({
      ...prev,
      repoMethods: [
        ...prev.repoMethods,
        {
          name: '',
          returnType: '',
          parameters: [],
        },
      ],
    }));
  };

  const handleRemoveRepoMethod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      repoMethods: prev.repoMethods.filter((_, i) => i !== index),
    }));
  };

  const handleAddParameter = (methodIndex: number) => {
    setFormData(prev => ({
      ...prev,
      repoMethods: prev.repoMethods.map((method, i) =>
        i === methodIndex
          ? {
              ...method,
              parameters: [
                ...method.parameters,
                { name: '', type: '' },
              ],
            }
          : method
      ),
    }));
  };

  const handleRemoveParameter = (methodIndex: number, paramIndex: number) => {
    setFormData(prev => ({
      ...prev,
      repoMethods: prev.repoMethods.map((method, i) =>
        i === methodIndex
          ? {
              ...method,
              parameters: method.parameters.filter((_, j) => j !== paramIndex),
            }
          : method
      ),
    }));
  };

  const handleAddEndPoint = () => {
    setFormData(prev => ({
      ...prev,
      endPoints: [
        ...prev.endPoints,
        {
          path: '',
          method: 'GET',
          operationId: '',
        },
      ],
    }));
  };

  const handleRemoveEndPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      endPoints: prev.endPoints.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    try {
      const doc = yaml.load(yamlContent) as any;
      if (!doc.components) doc.components = {};
      if (!doc.components.schemas) doc.components.schemas = {};
      if (!doc.components.schemas[schemaName]) {
        doc.components.schemas[schemaName] = {};
      }

      const schema = doc.components.schemas[schemaName];
      schema['x-fbp-props'] = {
        generatePersistenceLayer: formData.generatePersistenceLayer,
        tableName: formData.tableName,
        repoMethods: formData.repoMethods,
        endPoints: formData.endPoints,
        ...formData.additionalProperties,
      };

      const updatedYaml = yaml.dump(doc);
      onApply(updatedYaml);
      onClose();
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Vendor Extensions for {schemaName}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.generatePersistenceLayer}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    generatePersistenceLayer: e.target.checked,
                  }))
                }
              />
            }
            label="Generate Persistence Layer"
          />

          <TextField
            label="Table Name"
            value={formData.tableName}
            onChange={e =>
              setFormData(prev => ({ ...prev, tableName: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          <Typography variant="h6" sx={{ mt: 2 }}>
            Repository Methods
          </Typography>
          <List>
            {formData.repoMethods.map((method, methodIndex) => (
              <ListItem key={methodIndex}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <TextField
                      label="Method Name"
                      value={method.name}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          repoMethods: prev.repoMethods.map((m, i) =>
                            i === methodIndex ? { ...m, name: e.target.value } : m
                          ),
                        }))
                      }
                      size="small"
                    />
                    <TextField
                      label="Return Type"
                      value={method.returnType}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          repoMethods: prev.repoMethods.map((m, i) =>
                            i === methodIndex
                              ? { ...m, returnType: e.target.value }
                              : m
                          ),
                        }))
                      }
                      size="small"
                    />
                    <IconButton
                      onClick={() => handleRemoveRepoMethod(methodIndex)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Parameters
                  </Typography>
                  <List>
                    {method.parameters.map((param, paramIndex) => (
                      <ListItem key={paramIndex}>
                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                          <TextField
                            label="Parameter Name"
                            value={param.name}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                repoMethods: prev.repoMethods.map((m, i) =>
                                  i === methodIndex
                                    ? {
                                        ...m,
                                        parameters: m.parameters.map((p, j) =>
                                          j === paramIndex
                                            ? { ...p, name: e.target.value }
                                            : p
                                        ),
                                      }
                                    : m
                                ),
                              }))
                            }
                            size="small"
                          />
                          <TextField
                            label="Parameter Type"
                            value={param.type}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                repoMethods: prev.repoMethods.map((m, i) =>
                                  i === methodIndex
                                    ? {
                                        ...m,
                                        parameters: m.parameters.map((p, j) =>
                                          j === paramIndex
                                            ? { ...p, type: e.target.value }
                                            : p
                                        ),
                                      }
                                    : m
                                ),
                              }))
                            }
                            size="small"
                          />
                          <IconButton
                            onClick={() =>
                              handleRemoveParameter(methodIndex, paramIndex)
                            }
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                    <ListItem>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddParameter(methodIndex)}
                        size="small"
                      >
                        Add Parameter
                      </Button>
                    </ListItem>
                  </List>
                </Box>
              </ListItem>
            ))}
            <ListItem>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddRepoMethod}
                size="small"
              >
                Add Repository Method
              </Button>
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Endpoints
          </Typography>
          <List>
            {formData.endPoints.map((endpoint, index) => (
              <ListItem key={index}>
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  <TextField
                    label="Path"
                    value={endpoint.path}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        endPoints: prev.endPoints.map((ep, i) =>
                          i === index ? { ...ep, path: e.target.value } : ep
                        ),
                      }))
                    }
                    size="small"
                  />
                  <FormControl size="small">
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={endpoint.method}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          endPoints: prev.endPoints.map((ep, i) =>
                            i === index ? { ...ep, method: e.target.value } : ep
                          ),
                        }))
                      }
                      label="Method"
                    >
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Operation ID"
                    value={endpoint.operationId}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        endPoints: prev.endPoints.map((ep, i) =>
                          i === index ? { ...ep, operationId: e.target.value } : ep
                        ),
                      }))
                    }
                    size="small"
                  />
                  <IconButton
                    onClick={() => handleRemoveEndPoint(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
            <ListItem>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddEndPoint}
                size="small"
              >
                Add Endpoint
              </Button>
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorExtensionForm; 