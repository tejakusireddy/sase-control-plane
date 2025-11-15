import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Security';
import SessionIcon from '@mui/icons-material/History';
import AuditIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Policies', icon: <PolicyIcon />, path: '/policies' },
  { text: 'Sessions', icon: <SessionIcon />, path: '/sessions' },
  { text: 'Audit Logs', icon: <AuditIcon />, path: '/audit-logs' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-0.5px',
            }}
          >
            SASE Control Plane
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={user?.role?.replace('_', ' ') || 'User'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 600,
              }}
            />
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
              {user?.email}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#fff',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: '#667eea15',
                      borderLeft: '4px solid #667eea',
                      '&:hover': {
                        bgcolor: '#667eea20',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#667eea',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#667eea',
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      bgcolor: '#f5f7fa',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? '#667eea' : '#666',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem disablePadding sx={{ px: 1 }}>
              <ListItemButton
                onClick={logout}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#ffebee',
                    '& .MuiListItemIcon-root': {
                      color: '#f44336',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ color: '#f44336', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f7fa',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
