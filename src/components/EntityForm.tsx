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
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppStore } from '@/store/useAppStore';

interface Field {
  fieldName: string;
  columnName: string;
  domainDataType: string;
  isPrimaryKey: boolean;
  primaryKeyGenerationStrategy: string;
  isNullable: boolean;
}

interface Relationship {
  fieldName: string;
  targetEntity: string;
  relationshipType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  mappedBy: string;
  fetchType: 'LAZY' | 'EAGER';
  cascadeOptions: string[];
  joinColumnName: string;
}

interface EntityFormProps {
  open: boolean;
  onClose: () => void;
  entityName?: string;
  existingEntity?: any;
  isLinked?: boolean;
}

const EntityForm: React.FC<EntityFormProps> = ({
  open,
  onClose,
  entityName,
  existingEntity,
  isLinked = false,
}) => {
  const { domainDataTypes, entities, addEntity, updateEntity } = useAppStore();
  const [formData, setFormData] = useState({
    entityName: entityName || '',
    tableName: '',
    fields: [] as Field[],
    relationships: [] as Relationship[],
  });

  const [errors, setErrors] = useState({
    name: '',
    tableName: '',
    fields: [] as string[],
  });

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (existingEntity) {
      setFormData({
        entityName: existingEntity.name,
        tableName: existingEntity.spec.tableName || '',
        fields: existingEntity.spec.fields || [],
        relationships: existingEntity.spec.relationships || [],
      });
    } else {
      setFormData({
        entityName: '',
        tableName: '',
        fields: [],
        relationships: [],
      });
    }
    // Reset errors when form opens
    setErrors({ name: '', tableName: '', fields: [] });
    setShowError(false);
  }, [existingEntity, open]);

  const validateForm = () => {
    const newErrors = {
      name: !formData.entityName ? 'Entity name is required' : '',
      tableName: !formData.tableName ? 'Table name is required' : '',
      fields: formData.fields.map(field => {
        if (!field.fieldName) return 'Field name is required';
        if (!field.columnName) return 'Column name is required';
        if (!field.domainDataType) return 'Data type is required';
        if (field.isPrimaryKey && !field.primaryKeyGenerationStrategy) return 'Primary key strategy is required';
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
          primaryKeyGenerationStrategy: '',
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

  const handleAddRelationship = () => {
    setFormData(prev => ({
      ...prev,
      relationships: [
        ...prev.relationships,
        {
          fieldName: '',
          targetEntity: '',
          relationshipType: 'OneToOne',
          mappedBy: '',
          fetchType: 'LAZY',
          cascadeOptions: [],
          joinColumnName: '',
        },
      ],
    }));
  };

  const handleRemoveRelationship = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.filter((_, i) => i !== index),
    }));
  };

  const handleRelationshipChange = (
    index: number,
    field: keyof Relationship,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const entitySpec = {
      name: formData.entityName,
      tableName: formData.tableName,
      spec: {
        fields: formData.fields,
        relationships: formData.relationships,
      },
    };

    if (existingEntity) {
      updateEntity(existingEntity.name, entitySpec);
    } else {
      addEntity(entitySpec);
    }
    onClose();
  };

  const availableEntities = entities
    .filter(e => e.name !== formData.entityName)
    .map(e => e.name);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {existingEntity ? 'Edit Entity' : 'Create Entity'}
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
            value={formData.entityName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, entityName: e.target.value }));
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            required
            disabled={isLinked}
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
                            value={field.primaryKeyGenerationStrategy}
                            onChange={(e) => handleFieldChange(index, 'primaryKeyGenerationStrategy', e.target.value)}
                            disabled={!field.isPrimaryKey}
                          >
                            <MenuItem value="AUTO">AUTO</MenuItem>
                            <MenuItem value="SEQUENCE">SEQUENCE</MenuItem>
                            <MenuItem value="IDENTITY">IDENTITY</MenuItem>
                            <MenuItem value="NONE">NONE</MenuItem>
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

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Relationships</Typography>
            <IconButton onClick={handleAddRelationship} color="primary">
              <AddIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell>Target Entity</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Mapped By</TableCell>
                  <TableCell>Fetch Type</TableCell>
                  <TableCell>Join Column</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.relationships.map((relationship, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={relationship.fieldName}
                        onChange={(e) => handleRelationshipChange(index, 'fieldName', e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={relationship.targetEntity}
                          onChange={(e) => handleRelationshipChange(index, 'targetEntity', e.target.value)}
                          required
                        >
                          {availableEntities.map((entity) => (
                            <MenuItem key={entity} value={entity}>
                              {entity}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={relationship.relationshipType}
                          onChange={(e) => handleRelationshipChange(index, 'relationshipType', e.target.value)}
                          required
                        >
                          <MenuItem value="OneToOne">One-to-One</MenuItem>
                          <MenuItem value="OneToMany">One-to-Many</MenuItem>
                          <MenuItem value="ManyToOne">Many-to-One</MenuItem>
                          <MenuItem value="ManyToMany">Many-to-Many</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={relationship.mappedBy}
                        onChange={(e) => handleRelationshipChange(index, 'mappedBy', e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={relationship.fetchType}
                          onChange={(e) => handleRelationshipChange(index, 'fetchType', e.target.value)}
                          required
                        >
                          <MenuItem value="LAZY">Lazy</MenuItem>
                          <MenuItem value="EAGER">Eager</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={relationship.joinColumnName}
                        onChange={(e) => handleRelationshipChange(index, 'joinColumnName', e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveRelationship(index)} color="error">
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
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityForm; 