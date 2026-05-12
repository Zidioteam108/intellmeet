const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTask, getAllTasks, updateTaskStatus, updateTask, deleteTask,
} = require('../controllers/taskController');

router.use(protect);

router.get('/', getAllTasks);
router.post('/', createTask);
router.patch('/:taskId/status', updateTaskStatus);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
