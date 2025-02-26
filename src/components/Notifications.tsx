import {
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Circle as UnreadIcon,
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const Notifications = ({ anchorEl, onClose }: NotificationsProps) => {
  const { notifications, markAsRead, clearNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320, maxHeight: 400 },
      }}
    >
      {notifications.length === 0 ? (
        <MenuItem>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </MenuItem>
      ) : (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              py: 1,
              px: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getIcon(notification.type)}
              </ListItemIcon>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </Typography>
              </Box>
              {!notification.read && (
                <UnreadIcon
                  sx={{ width: 8, height: 8 }}
                  color="primary"
                />
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notification.id);
                }}
              >
                &times;
              </IconButton>
            </Box>
          </MenuItem>
        ))
      )}
    </Menu>
  );
};

export default Notifications;