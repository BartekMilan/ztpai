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
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import TaskStats from '../components/TaskStats';
import { Task, TaskStatus, TaskPriority, NewTask, TaskCreateData, TaskUpdateData } from '../types/task';
import { useNotifications } from '../contexts/NotificationContext';
import { differenceInDays } from 'date-fns';
import taskService from '../services/taskService';

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

type FilterType = 'ALL' | 'todo' | 'in-progress' | 'completed' | 'high' | 'OVERDUE';

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });
  
  const { addNotification } = useNotifications();

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskService.getAllTasks();
        if (response.success) {
          setTasks(response.tasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        addNotification('Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [addNotification]);

  // Check for upcoming and overdue tasks
  useEffect(() => {
    const checkTasksDueStatus = () => {
      const today = new Date();
      tasks.forEach(task => {
        if (!task.dueDate) return;
        
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = differenceInDays(dueDate, today);
        
        if (task.status !== 'completed') {
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
    if (['todo', 'in-progress', 'completed'].includes(filter)) {
      setStatusFilter(filter);
      setPriorityFilter('ALL');
    } else if (filter === 'high') {
      setPriorityFilter('high');
      setStatusFilter('ALL');
    } else {
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = 
          (task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        
        let matchesTileFilter = true;
        if (tileFilter === 'OVERDUE') {
          matchesTileFilter = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'completed' : false;
        } else if (tileFilter === 'high') {
          matchesTileFilter = task.priority === 'high';
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
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return sortOrder === 'asc' 
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc'
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return sortOrder === 'asc'
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder, tileFilter]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      addNotification('Task title is required', 'error');
      return;
    }
    
    try {
      const taskData: TaskCreateData = {
        ...newTask,
        dueDate: newTask.dueDate // dueDate jest już stringiem
      };
      
      const response = await taskService.createTask(taskData);
      
      if (response.success) {
        setTasks([...tasks, response.task]);
        setIsEditDialogOpen(false);
        setNewTask({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: undefined
        });
        addNotification('Task created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification('Failed to create task', 'error');
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({ ...task });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    
    try {
      const taskData: TaskUpdateData = {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate // dueDate jest już stringiem
      };
      
      const response = await taskService.updateTask(editingTask._id, taskData);
      
      if (response.success) {
        setTasks(tasks.map(task => 
          task._id === editingTask._id ? response.task : task
        ));
        setIsEditDialogOpen(false);
        setEditingTask(null);
        addNotification('Task updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      addNotification('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const taskToDelete = tasks.find(task => task._id === id);
        const response = await taskService.deleteTask(id);
        
        if (response.success) {
          setTasks(tasks.filter(task => task._id !== id));
          addNotification(`Task "${taskToDelete?.title}" deleted`, 'info');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        addNotification('Failed to delete task', 'error');
      }
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
                          <MenuItem value="todo">To Do</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Done</MenuItem>
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
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredAndSortedTasks.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        No tasks found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Create a new task to get started
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <Grid item xs={12} md={6} lg={4} key={task._id}>
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
                              color={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'info' : 'default'}
                            />
                            <PriorityChip
                              label={task.priority}
                              size="small"
                              color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                            />
                          </Stack>

                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
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
                                  handleDeleteTask(task._id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </TaskCard>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
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
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
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
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              type="date"
              label="Due Date"
              value={editingTask?.dueDate?.split('T')[0] || newTask.dueDate}
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
            onClick={editingTask ? handleUpdateTask : handleCreateTask} 
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