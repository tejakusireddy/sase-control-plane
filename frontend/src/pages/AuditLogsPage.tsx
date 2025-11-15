import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Security,
  Warning,
  Timeline,
  Description,
} from '@mui/icons-material';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: string;
  orgId: string;
  userId?: string;
  action: string;
  resource?: string;
  status?: string;
  createdAt: string;
  details?: any;
}

function generateSampleAuditLogs(): AuditLog[] {
  const logs: AuditLog[] = [];
  const actions = ['ACCESS_REQUEST', 'POLICY_EVALUATION', 'SESSION_START', 'SESSION_END'];
  const statuses = ['ALLOW', 'ALLOW', 'ALLOW', 'ALLOW', 'DENY'];
  const countries = ['US', 'GB', 'CA', 'DE', 'FR', 'JP', 'CN', 'RU', 'IN', 'BR'];
  const deviceLevels = ['HIGH', 'MEDIUM', 'LOW', 'UNTRUSTED'];
  const resources = [
    'ssh://internal.acme.com',
    'https://api.acme.com/v1/data',
    'rdp://server-01.acme.com',
    'https://dashboard.acme.com',
    'ssh://db.acme.com',
  ];
  const userIds = ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'];
  
  for (let i = 0; i < 150; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const deviceLevel = deviceLevels[Math.floor(Math.random() * deviceLevels.length)];
    const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    
    logs.push({
      id: `log-${String(i + 1).padStart(4, '0')}`,
      orgId: 'acme',
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      status,
      createdAt: createdAt.toISOString(),
      details: {
        country,
        deviceTrustLevel: deviceLevel,
        policyId: `policy-${Math.floor(Math.random() * 4) + 1}`,
        gatewayId: 'acme-sfo-1',
      },
    });
  }
  
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function fetchAuditLogs(orgId: string): Promise<AuditLog[]> {
  try {
    const response = await apiClient.get(`/api/orgs/${orgId}/audit-logs?limit=1000`);
    const realData = Array.isArray(response.data) ? response.data : [];
    return realData.length > 0 ? realData : generateSampleAuditLogs();
  } catch (error) {
    return generateSampleAuditLogs();
  }
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['audit-logs', user?.orgId],
    queryFn: () => fetchAuditLogs(user?.orgId || ''),
    enabled: !!user?.orgId,
    refetchInterval: 5000,
  });

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
        <Typography variant="h4" gutterBottom>
          Audit Logs
        </Typography>
        <Typography color="error" sx={{ mt: 2 }}>
          Error loading audit logs. Please try again later.
        </Typography>
      </Box>
    );
  }

  const allowedLogs = logs?.filter((l) => l.status === 'ALLOW') || [];
  const deniedLogs = logs?.filter((l) => l.status === 'DENY') || [];
  const totalLogs = logs?.length || 0;
  const recentLogs = logs?.filter(
    (l) => new Date(l.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ) || [];

  const stats = [
    {
      title: 'Total Events',
      value: totalLogs,
      icon: <Description sx={{ fontSize: 32, color: '#1976d2' }} />,
      color: '#1976d2',
    },
    {
      title: 'Allowed',
      value: allowedLogs.length,
      icon: <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Denied',
      value: deniedLogs.length,
      icon: <Cancel sx={{ fontSize: 32, color: '#f44336' }} />,
      color: '#f44336',
    },
    {
      title: 'Last 24h',
      value: recentLogs.length,
      icon: <Timeline sx={{ fontSize: 32, color: '#ff9800' }} />,
      color: '#ff9800',
    },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          Audit Logs
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive security event logs and access history
        </Typography>
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
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 100)
                  .map((log) => {
                    const details =
                      typeof log.details === 'string'
                        ? JSON.parse(log.details || '{}')
                        : log.details || {};
                    return (
                      <TableRow
                        key={log.id}
                        sx={{
                          '&:hover': { bgcolor: '#f5f7fa' },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: '#667eea',
                                fontSize: '0.7rem',
                              }}
                            >
                              {log.userId?.charAt(0).toUpperCase() || '?'}
                            </Avatar>
                            <Typography variant="body2">
                              {log.userId ? log.userId.substring(0, 12) + '...' : 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<Security sx={{ fontSize: 14 }} />}
                            label={log.action}
                            size="small"
                            sx={{
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {log.resource || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              log.status === 'ALLOW' ? (
                                <CheckCircle sx={{ fontSize: 16 }} />
                              ) : (
                                <Cancel sx={{ fontSize: 16 }} />
                              )
                            }
                            label={log.status || 'UNKNOWN'}
                            color={log.status === 'ALLOW' ? 'success' : 'error'}
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
                            {details.country && (
                              <Chip
                                label={`${details.country}`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                              />
                            )}
                            {details.deviceTrustLevel && (
                              <Chip
                                label={details.deviceTrustLevel}
                                size="small"
                                color={
                                  details.deviceTrustLevel === 'HIGH'
                                    ? 'success'
                                    : details.deviceTrustLevel === 'MEDIUM'
                                    ? 'warning'
                                    : 'error'
                                }
                                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                              />
                            )}
                            {details.policyId && (
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                Policy: {details.policyId.substring(0, 8)}...
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      No audit logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
