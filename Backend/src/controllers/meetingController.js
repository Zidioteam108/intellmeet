const Meeting = require('../models/Meeting');
const generateRoomId = require('../utils/generateRoomId');
const { setCache, getCache, deleteCache } = require('../utils/cache');

const createMeeting = async (req, res) => {
  const { title, description, scheduledFor } = req.body;

  const meeting = await Meeting.create({
    title,
    description,
    scheduledFor: scheduledFor || new Date(),
    roomId: generateRoomId(),
    host: req.user._id,
    participants: [req.user._id],
  });

  // Clear cache so user sees fresh meetings list
  await deleteCache(`meetings:user:${req.user._id}`);

  res.status(201).json({
    success: true,
    message: 'Meeting created successfully',
    meeting,
  });
};

const getMeetings = async (req, res) => {
  const cacheKey = `meetings:user:${req.user._id}`;

  // Try to get from cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json({ success: true, meetings: cached, fromCache: true });
  }

  // Not in cache, get from MongoDB
  const meetings = await Meeting.find({
    $or: [{ host: req.user._id }, { participants: req.user._id }],
  })
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar')
    .sort({ createdAt: -1 });

  // Save to cache for next request
  await setCache(cacheKey, meetings);

  res.status(200).json({ success: true, meetings, fromCache: false });
};

const getMeetingById = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar');

  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  const isAllowed =
    meeting.host._id.toString() === req.user._id.toString() ||
    meeting.participants.some((p) => p._id.toString() === req.user._id.toString());

  if (!isAllowed) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.status(200).json({ success: true, meeting });
};

const updateMeeting = async (req, res) => {
  const { title, description, scheduledFor, status } = req.body;

  const meeting = await Meeting.findById(req.params.id);

  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  if (meeting.host.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only host can update meeting' });
  }

  if (title !== undefined) meeting.title = title;
  if (description !== undefined) meeting.description = description;
  if (scheduledFor !== undefined) meeting.scheduledFor = scheduledFor;
  if (status !== undefined) meeting.status = status;

  await meeting.save();

  res.status(200).json({
    success: true,
    message: 'Meeting updated successfully',
    meeting,
  });
};

const deleteMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  if (meeting.host.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only host can delete meeting' });
  }

  await meeting.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Meeting deleted successfully',
  });
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};