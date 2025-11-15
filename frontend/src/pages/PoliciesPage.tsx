import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add,
  Security,
  CheckCircle,
  Cancel,
  TrendingUp,
  PriorityHigh,
} from '@mui/icons-material';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

type PolicyEffect = 'ALLOW' | 'DENY';

interface Policy {
  _id?: string;
  orgId: string;
  name: string;
  priority: number;
  conditions: {
    roles?: string[];
    deviceTrustLevels?: string[];
    countries?: string[];
    resources?: string[];
    timeWindow?: {
      start: string;
      end: string;
      timezone?: string;
    };
  };
  effect: PolicyEffect;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

async function fetchPolicies(orgId: string): Promise<Policy[]> {
  try {
    const response = await apiClient.get(`/api/orgs/${orgId}/policies`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
}

async function createPolicy(orgId: string, policy: Partial<Policy>): Promise<Policy> {
  const response = await apiClient.post(`/api/orgs/${orgId}/policies`, policy);
  return response.data;
}

export default function PoliciesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    priority: 100,
    effect: 'ALLOW' as PolicyEffect,
    description: '',
    roles: [] as string[],
    countries: [] as string[],
    resources: [] as string[],
  });

  const { data: policies, isLoading, error } = useQuery({
    queryKey: ['policies', user?.orgId],
    queryFn: () => fetchPolicies(user?.orgId || ''),
    enabled: !!user?.orgId,
  });

  const createMutation = useMutation({
    mutationFn: (policy: Partial<Policy>) => createPolicy(user?.orgId || '', policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      setOpen(false);
      setFormData({
        name: '',
        priority: 100,
        effect: 'ALLOW',
        description: '',
        roles: [],
        countries: [],
        resources: [],
      });
    },
  });

  const handleSubmit = () => {
    createMutation.mutate({
      name: formData.name,
      priority: formData.priority,
      effect: formData.effect,
      description: formData.description,
      conditions: {
        roles: formData.roles.length > 0 ? (formData.roles as any) : undefined,
        countries: formData.countries.length > 0 ? formData.countries : undefined,
        resources: formData.resources.length > 0 ? formData.resources : undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Policies</Typography>
        </Box>
        <Typography color="error" sx={{ mt: 2 }}>
          Error loading policies. Please try again later.
        </Typography>
      </Box>
    );
  }

  const allowPolicies = policies?.filter((p) => p.effect === 'ALLOW') || [];
  const denyPolicies = policies?.filter((p) => p.effect === 'DENY') || [];
  const avgPriority = policies
    ? Math.round(policies.reduce((sum, p) => sum + p.priority, 0) / policies.length)
    : 0;

  const stats = [
    {
      title: 'Total Policies',
      value: policies?.length || 0,
      icon: <Security sx={{ fontSize: 32, color: '#1976d2' }} />,
      color: '#1976d2',
    },
    {
      title: 'Allow Policies',
      value: allowPolicies.length,
      icon: <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Deny Policies',
      value: denyPolicies.length,
      icon: <Cancel sx={{ fontSize: 32, color: '#f44336' }} />,
      color: '#f44336',
    },
    {
      title: 'Avg Priority',
      value: avgPriority,
      icon: <PriorityHigh sx={{ fontSize: 32, color: '#ff9800' }} />,
      color: '#ff9800',
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Security Policies
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and configure Zero-Trust access policies
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Create Policy
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}30`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${stat.color}40`,
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color, fontWeight: 700, mt: 1 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Policy Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Effect</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Conditions</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies && policies.length > 0 ? (
                policies
                  .sort((a, b) => a.priority - b.priority)
                  .map((policy) => (
                    <TableRow
                      key={policy._id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f7fa' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: policy.effect === 'ALLOW' ? '#4caf50' : '#f44336',
                              fontSize: '0.75rem',
                            }}
                          >
                            {policy.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {policy.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Badge
                          badgeContent={policy.priority}
                          color={policy.priority < 100 ? 'error' : 'primary'}
                          sx={{
                            '& .MuiBadge-badge': {
                              bgcolor: policy.priority < 100 ? '#f44336' : '#1976d2',
                            },
                          }}
                        >
                          <PriorityHigh sx={{ color: '#666' }} />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={policy.effect === 'ALLOW' ? <CheckCircle /> : <Cancel />}
                          label={policy.effect}
                          color={policy.effect === 'ALLOW' ? 'success' : 'error'}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          {policy.conditions.roles && (
                            <Chip
                              label={`Roles: ${policy.conditions.roles.join(', ')}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                          {policy.conditions.countries && (
                            <Chip
                              label={`Countries: ${policy.conditions.countries.join(', ')}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                          {policy.conditions.resources && (
                            <Chip
                              label={`Resources: ${policy.conditions.resources.length}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {policy.description || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      No policies found. Create your first policy to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Create New Policy</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Policy Name"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            label="Priority"
            type="number"
            margin="normal"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            helperText="Lower numbers = higher priority"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Effect</InputLabel>
            <Select
              value={formData.effect}
              onChange={(e) => setFormData({ ...formData, effect: e.target.value as PolicyEffect })}
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="ALLOW">ALLOW</MenuItem>
              <MenuItem value="DENY">DENY</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              },
            }}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Policy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
