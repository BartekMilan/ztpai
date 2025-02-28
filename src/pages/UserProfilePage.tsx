import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  styled,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { User } from '../types/task';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme.palette.grey[200]}`,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 8px rgba(0, 0, 0, 0.4)'
      : '0 4px 8px rgba(9, 30, 66, 0.25)',
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  fontSize: '3rem',
  backgroundColor: theme.palette.primary.main,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 0 0 2px rgba(255, 255, 255, 0.12)'
    : '0 0 0 2px rgba(9, 30, 66, 0.08)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(9, 30, 66, 0.04)',
  },
}));

const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Icon color="action" />
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Box>
  </Stack>
);

const UserProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      addNotification('Profile updated successfully', 'success');
    } catch (error) {
      addNotification('Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.username || 'Anonymous';
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return (user.firstName?.[0] || user.username?.[0] || 'A').toUpperCase();
  };

  return (
    <Box sx={{ 
      backgroundColor: theme => theme.palette.mode === 'dark' ? '#1B1B1B' : '#FAFBFC',
      minHeight: '100vh',
      pt: 3,
      pb: 8,
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 500 }}>
                Profile Settings
              </Typography>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ px: 3 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <ProfilePaper elevation={0}>
              <Box sx={{ 
                p: 3,
                borderBottom: theme => 
                  `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme.palette.grey[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <LargeAvatar src={user.avatar}>
                  {getInitials()}
                </LargeAvatar>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {isEditing ? (
                      <Stack direction="row" spacing={2}>
                        <StyledTextField
                          value={formData.firstName}
                          onChange={handleChange('firstName')}
                          placeholder="First Name"
                          size="small"
                        />
                        <StyledTextField
                          value={formData.lastName}
                          onChange={handleChange('lastName')}
                          placeholder="Last Name"
                          size="small"
                        />
                      </Stack>
                    ) : (
                      getFullName()
                    )}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Stack direction="row" spacing={3} mt={2}>
                    <InfoItem icon={EmailIcon} label="Email" value={user.email} />
                    <InfoItem 
                      icon={PhoneIcon} 
                      label="Phone" 
                      value={formData.phone || 'Not set'} 
                    />
                    <InfoItem 
                      icon={LocationOnIcon} 
                      label="Location" 
                      value={formData.location || 'Not set'} 
                    />
                  </Stack>
                </Box>
              </Box>

              {isEditing && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Phone"
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        placeholder="+1 (123) 456-7890"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Location"
                        value={formData.location}
                        onChange={handleChange('location')}
                        placeholder="City, Country"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </ProfilePaper>
          </Grid>

          <Grid item xs={12}>
            <ProfilePaper elevation={0}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Email Address
                      </Typography>
                      <Typography>{user.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Member Since
                      </Typography>
                      <Typography>
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </ProfilePaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfilePage;