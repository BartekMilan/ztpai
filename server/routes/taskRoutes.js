const express = require('express');
const { 
  getAllTasks, 
  getFilteredTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

// Wszystkie trasy zadań wymagają autoryzacji
router.use(auth);

router.get('/', getAllTasks);
router.get('/filter', getFilteredTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;