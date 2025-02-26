import { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import TaskStats from '../components/TaskStats';
import { Task, TaskStatus, TaskPriority, NewTask } from '../types/task';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNotifications } from '../contexts/NotificationContext';
import { differenceInDays } from 'date-fns';

const TaskCard = styled(Paper)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme.palette.grey[200],
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 8px rgba(0, 0, 0, 0.4)'
      : '0 4px 8px rgba(9, 30, 66, 0.25)',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '3px',
  height: '24px',
  fontWeight: 500,
  fontSize: '12px',
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  borderRadius: '3px',
  height: '24px',
  fontWeight: 500,
  fontSize: '12px',
}));

const AddTaskButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 30, 66, 0.04)',
  color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.grey[900],
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(9, 30, 66, 0.08)',
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(9, 30, 66, 0.04)',
  },
}));

type FilterType = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HIGH' | 'OVERDUE';

const TasksPage = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [tileFilter, setTileFilter] = useState<FilterType>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const { addNotification } = useNotifications();

  // Check for upcoming and overdue tasks
  useEffect(() => {
    const checkTasksDueStatus = () => {
      const today = new Date();
      tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = differenceInDays(dueDate, today);

        if (task.status !== 'DONE') {
          if (daysUntilDue === 0) {
            addNotification(`Task "${task.title}" is due today!`, 'warning');
          } else if (daysUntilDue === 1) {
            addNotification(`Task "${task.title}" is due tomorrow`, 'info');
          } else if (daysUntilDue < 0) {
            addNotification(`Task "${task.title}" is overdue!`, 'error');
          }
        }
      });
    };

    checkTasksDueStatus();
    // Check every day
    const interval = setInterval(checkTasksDueStatus, 86400000);
    return () => clearInterval(interval);
  }, [tasks, addNotification]);

  const handleTileFilterChange = (filter: FilterType) => {
    setTileFilter(filter);
    
    // Reset other filters when tile filter changes
    if (['TODO', 'IN_PROGRESS', 'DONE'].includes(filter)) {
      setStatusFilter(filter);
      setPriorityFilter('ALL');
    } else if (filter === 'HIGH') {
      setPriorityFilter('HIGH');
      setStatusFilter('ALL');
    } else {
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesTileFilter = true;
        if (tileFilter === 'OVERDUE') {
          matchesTileFilter = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
        } else if (tileFilter === 'HIGH') {
          matchesTileFilter = task.priority === 'HIGH';
        } else if (tileFilter !== 'ALL') {
          matchesTileFilter = task.status === tileFilter;
        }

        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
        
        return matchesSearch && 
               (tileFilter === 'ALL' ? (matchesStatus && matchesPriority) : matchesTileFilter);
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return sortOrder === 'asc' 
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return sortOrder === 'asc'
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return sortOrder === 'asc'
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder, tileFilter]);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now(),
      ...newTask,
    };
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
    });
    setIsEditDialogOpen(false); // Close the modal after task creation
    addNotification(`New task "${task.title}" created`, 'success');
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({ ...task });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingTask) return;
    
    const previousTask = tasks.find(task => task.id === editingTask.id);
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));

    if (previousTask?.status !== 'DONE' && editingTask.status === 'DONE') {
      addNotification(`Task "${editingTask.title}" completed! 🎉`, 'success');
    }

    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasks.find(task => task.id === id);
      setTasks(tasks.filter(task => task.id !== id));
      addNotification(`Task "${taskToDelete?.title}" deleted`, 'info');
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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
                My Tasks
              </Typography>
              <AddTaskButton
                variant="contained"
                disableElevation
                startIcon={<AddIcon />}
                onClick={() => setIsEditDialogOpen(true)}
              >
                Create Task
              </AddTaskButton>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TaskStats 
              tasks={tasks} 
              activeFilter={tileFilter}
              onFilterChange={handleTileFilterChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <SearchTextField
                    fullWidth
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                {tileFilter === 'ALL' && (
                  <>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="ALL">All</MenuItem>
                          <MenuItem value="TODO">To Do</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="DONE">Done</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={priorityFilter}
                          label="Priority"
                          onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                          <MenuItem value="ALL">All</MenuItem>
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={tileFilter === 'ALL' ? 2 : 8}>
                  <Stack direction="row" spacing={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort"
                        onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'status')}
                      >
                        <MenuItem value="dueDate">Due Date</MenuItem>
                        <MenuItem value="priority">Priority</MenuItem>
                        <MenuItem value="status">Status</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton 
                      onClick={toggleSortOrder}
                      sx={{ 
                        backgroundColor: theme => 
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 30, 66, 0.04)',
                      }}
                    >
                      <SortIcon sx={{ 
                        transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }} />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {filteredAndSortedTasks.map((task) => (
                <Grid item xs={12} md={6} lg={4} key={task.id}>
                  <TaskCard onClick={() => handleEditClick(task)}>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {task.description}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <StatusChip
                          label={task.status}
                          size="small"
                          color={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'default'}
                        />
                        <PriorityChip
                          label={task.priority}
                          size="small"
                          color={task.priority === 'HIGH' ? 'error' : task.priority === 'MEDIUM' ? 'warning' : 'default'}
                        />
                      </Stack>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(task);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </TaskCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Task Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={editingTask?.title || newTask.title}
              onChange={(e) => editingTask 
                ? setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)
                : setNewTask({ ...newTask, title: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={editingTask?.description || newTask.description}
              onChange={(e) => editingTask
                ? setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)
                : setNewTask({ ...newTask, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editingTask?.priority || newTask.priority}
                    label="Priority"
                    onChange={(e) => {
                      const value = e.target.value as TaskPriority;
                      if (editingTask) {
                        setEditingTask(prev => prev ? { ...prev, priority: value } : null);
                      } else {
                        setNewTask({ ...newTask, priority: value });
                      }
                    }}
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingTask?.status || newTask.status}
                    label="Status"
                    onChange={(e) => {
                      const value = e.target.value as TaskStatus;
                      if (editingTask) {
                        setEditingTask(prev => prev ? { ...prev, status: value } : null);
                      } else {
                        setNewTask({ ...newTask, status: value });
                      }
                    }}
                  >
                    <MenuItem value="TODO">To Do</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="DONE">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              type="date"
              label="Due Date"
              value={editingTask?.dueDate || newTask.dueDate}
              onChange={(e) => editingTask
                ? setEditingTask(prev => prev ? { ...prev, dueDate: e.target.value } : null)
                : setNewTask({ ...newTask, dueDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={editingTask ? handleEditSave : handleAddTask} 
            variant="contained"
            disableElevation
          >
            {editingTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksPage;