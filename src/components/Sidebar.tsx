import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  AccessTime as AccessTimeIcon,
  Computer as ComputerIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface SidebarProps {
  drawerWidth: number;
}

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    description: 'Performance overview and summary'
  },
  {
    text: 'ASH Analysis',
    icon: <TimelineIcon />,
    path: '/ash',
    description: 'Active Session History analysis'
  },
  {
    text: 'AWR Reports',
    icon: <AssessmentIcon />,
    path: '/awr',
    description: 'Automatic Workload Repository reports'
  },
  {
    text: 'SQL Analysis',
    icon: <CodeIcon />,
    path: '/sql',
    description: 'SQL statement performance analysis'
  },
  {
    text: 'ORDS Monitoring',
    icon: <ApiIcon />,
    path: '/ords',
    description: 'Oracle REST Data Services monitoring'
  },
  {
    text: 'Wait Events',
    icon: <AccessTimeIcon />,
    path: '/waits',
    description: 'Database wait event analysis'
  },
  {
    text: 'System Metrics',
    icon: <ComputerIcon />,
    path: '/system',
    description: 'System and database metrics'
  },
  {
    text: 'Database Config',
    icon: <SettingsIcon />,
    path: '/config',
    description: 'Database connection configuration'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth }) => {

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              Oracle Perf
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Monitor
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ padding: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <NavLink
              to={item.path}
              style={{ textDecoration: 'none', width: '100%' }}
              end={item.path === '/'}
            >
              {({ isActive }) => (
                <ListItemButton
                  selected={isActive}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? 'white' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: '0.9rem', fontWeight: isActive ? 'bold' : 'normal' }}>{item.text}</span>}
                    secondary={<span style={{ fontSize: '0.75rem', color: isActive ? 'rgba(255,255,255,0.7)' : undefined }}>{item.description}</span>}
                  />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
