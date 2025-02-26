import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    setIsEditDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'primary.main',
            fontSize: '1.5rem',
          }}
        >
          {user?.name ? getInitials(user.name) : '?'}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{user?.name}</Typography>
          <Typography color="textSecondary">{user?.email}</Typography>
          <Box sx={{ mt: 1 }}>
            <Chip label="Task Manager" size="small" />
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit Profile
          </Button>
          <Button variant="contained" color="error" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Box>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserProfile;