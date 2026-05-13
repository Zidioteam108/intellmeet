const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createTask, getAllTasks, updateTaskStatus, updateTask, deleteTask,
} = require('../controllers/taskController');

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
];

router.use(protect);

router.get('/', getAllTasks);
router.post('/', taskValidation, validateRequest, createTask);
router.patch('/:taskId/status', updateTaskStatus);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
