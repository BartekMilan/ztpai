import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Badge,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Notifications from './Notifications';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1B1B1B' : '#FFFFFF',
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#172B4D',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(9, 30, 66, 0.08)'}`,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#172B4D',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 30, 66, 0.08)',
  },
}));

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar = ({ darkMode, toggleDarkMode }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ minHeight: 56 }}>
        <LogoText
          variant="h6"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <DashboardIcon />
          TaskFlow
        </LogoText>

        <IconButton 
          size="small"
          color="inherit" 
          onClick={toggleDarkMode} 
          sx={{ 
            mr: 2,
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 30, 66, 0.04)',
          }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {isAuthenticated ? (
          <>
            <IconButton 
              size="small"
              color="inherit" 
              onClick={handleNotificationClick}
              sx={{ 
                mr: 2,
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 30, 66, 0.04)',
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#FF5630',
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Button
                onClick={handleProfileClick}
                sx={{ 
                  textTransform: 'none',
                  color: 'inherit',
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 30, 66, 0.04)',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(9, 30, 66, 0.08)',
                  },
                }}
                startIcon={
                  <Avatar
                    sx={{ 
                      width: 24, 
                      height: 24,
                      backgroundColor: '#0052CC',
                      fontSize: '0.875rem',
                    }}
                  >
                    {user?.firstName?.charAt(0)}
                  </Avatar>
                }
              >
                {user?.firstName}
              </Button>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                }
              }}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                My Profile
              </MenuItem>
              <MenuItem onClick={() => {
                handleClose();
                navigate('/tasks');
              }}>
                My Tasks
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

            <Notifications
              anchorEl={notificationAnchor}
              onClose={handleNotificationClose}
            />
          </>
        ) : (
          <>
            <NavButton onClick={() => navigate('/login')}>
              Log in
            </NavButton>
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              sx={{ ml: 1 }}
            >
              Sign up
            </Button>
          </>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;