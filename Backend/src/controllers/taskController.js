const Task = require('../models/Task');

// Create a task (from Kanban board or from action item)
const createTask = async (req, res) => {
  const { title, description, priority, assignee, meetingId, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    priority,
    assignee: assignee || null,
    createdBy: req.user._id,
    meetingId: meetingId || null,
    dueDate: dueDate || null,
  });

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name');

  res.status(201).json({ success: true, task: populated });
};

// Get all tasks (for the board)
const getAllTasks = async (req, res) => {
  const { status, meetingId } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (meetingId) filter.meetingId = meetingId;

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, tasks });
};

// Update task status (drag and drop column change)
const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['todo', 'in-progress', 'review', 'done'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    { status },
    { new: true }
  ).populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  res.status(200).json({ success: true, task });
};

// Update any task field
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  const task = await Task.findByIdAndUpdate(taskId, updates, { new: true })
    .populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  res.status(200).json({ success: true, task });
};

// Delete task
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  await Task.findByIdAndDelete(taskId);
  res.status(200).json({ success: true, message: 'Task deleted' });
};

module.exports = { createTask, getAllTasks, updateTaskStatus, updateTask, deleteTask };
