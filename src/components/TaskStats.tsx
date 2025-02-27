import { Grid } from '@mui/material';
import { Task } from '../types/task';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TaskFilterTile from './TaskFilterTile';

type FilterType = 'ALL' | 'todo' | 'in-progress' | 'completed' | 'high' | 'OVERDUE';

interface TaskStatsProps {
  tasks: Task[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const TaskStats = ({ tasks, activeFilter, onFilterChange }: TaskStatsProps) => {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    done: tasks.filter(task => task.status === 'completed').length,
    highPriority: tasks.filter(task => task.priority === 'high').length,
    overdue: tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length,
  };

  const filters: Array<{
    id: FilterType;
    icon: any;
    label: string;
    value: number;
    color: string;
  }> = [
    {
      id: 'ALL',
      icon: FormatListBulletedIcon,
      label: 'Total Tasks',
      value: stats.total,
      color: '#0052CC',
    },
    {
      id: 'todo',
      icon: AccessTimeIcon,
      label: 'To Do',
      value: stats.todo,
      color: '#FF8B00',
    },
    {
      id: 'in-progress',
      icon: TrendingUpIcon,
      label: 'In Progress',
      value: stats.inProgress,
      color: '#00B8D9',
    },
    {
      id: 'completed',
      icon: CheckCircleIcon,
      label: 'Completed',
      value: stats.done,
      color: '#00875A',
    },
    {
      id: 'high',
      icon: PriorityHighIcon,
      label: 'High Priority',
      value: stats.highPriority,
      color: '#DE350B',
    },
    {
      id: 'OVERDUE',
      icon: ErrorIcon,
      label: 'Overdue',
      value: stats.overdue,
      color: '#FF5630',
    },
  ];

  return (
    <Grid container spacing={2}>
      {filters.map((filter) => (
        <Grid item xs={6} sm={4} md={2} key={filter.id}>
          <TaskFilterTile
            icon={filter.icon}
            label={filter.label}
            value={filter.value}
            color={filter.color}
            onClick={() => onFilterChange(filter.id)}
            active={activeFilter === filter.id}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskStats;