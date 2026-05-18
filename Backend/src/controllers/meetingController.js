const Meeting = require('../models/Meeting');
const generateRoomId = require('../utils/generateRoomId');
const { setCache, getCache, deleteCache } = require('../utils/cache');

const getClientUrl = (req) => {
  const requestOrigin = req.get('origin');
  if (requestOrigin) return requestOrigin.replace(/\/$/, '');

  const configuredUrl = process.env.CLIENT_URL?.split(',')[0]?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

const attachMeetingLinks = (meeting, req) => {
  const meetingObject = meeting.toObject ? meeting.toObject() : meeting;
  const clientUrl = getClientUrl(req);

  return {
    ...meetingObject,
    inviteLink: `${clientUrl}/room/${meetingObject.roomId}`,
    joinUrl: `${clientUrl}/room/${meetingObject.roomId}`,
  };
};

// ── Create Meeting ─────────────────────────────────────────────────────────
const createMeeting = async (req, res) => {
  const { title, description, scheduledFor, scheduledEndAt } = req.body;

  // Validate scheduledEndAt is after scheduledFor if both are provided
  if (scheduledFor && scheduledEndAt) {
    const startTime = new Date(scheduledFor);
    const endTime = new Date(scheduledEndAt);
    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled end time must be after the start time',
      });
    }
  }

  const meeting = await Meeting.create({
    title,
    description,
    // If a future time is given use it; otherwise null means "join anytime"
    scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt) : null,
    // Status is 'scheduled' when a future time is set, otherwise 'active' immediately
    status: scheduledFor && new Date(scheduledFor) > new Date() ? 'scheduled' : 'active',
    startedAt: scheduledFor && new Date(scheduledFor) > new Date() ? null : new Date(),
    roomId: generateRoomId(),
    host: req.user._id,
    participants: [req.user._id],
  });

  // Clear cache so user sees fresh meetings list
  await deleteCache(`meetings:user:${req.user._id}`);

  const meetingWithLinks = attachMeetingLinks(meeting, req);

  res.status(201).json({
    success: true,
    message: 'Meeting created successfully',
    meeting: meetingWithLinks,
    inviteLink: meetingWithLinks.inviteLink,
    joinUrl: meetingWithLinks.joinUrl,
  });
};

// ── Get All Meetings (for current user) ───────────────────────────────────
const getMeetings = async (req, res) => {
  const cacheKey = `meetings:user:${req.user._id}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json({ success: true, meetings: cached, fromCache: true });
  }

  const meetings = await Meeting.find({
    $or: [{ host: req.user._id }, { participants: req.user._id }],
  })
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar')
    .populate('endedBy', 'name email')
    .sort({ createdAt: -1 });

  await setCache(cacheKey, meetings);

  res.status(200).json({ success: true, meetings, fromCache: false });
};

// ── Get Meeting By MongoDB _id ─────────────────────────────────────────────
const getMeetingById = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar')
    .populate('endedBy', 'name email');

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

// ── Update Meeting ─────────────────────────────────────────────────────────
const updateMeeting = async (req, res) => {
  const { title, description, scheduledFor, scheduledEndAt, status } = req.body;

  const meeting = await Meeting.findById(req.params.id);

  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  if (meeting.host.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only host can update meeting' });
  }

  if (title !== undefined) meeting.title = title;
  if (description !== undefined) meeting.description = description;
  if (scheduledFor !== undefined) meeting.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
  if (scheduledEndAt !== undefined) meeting.scheduledEndAt = scheduledEndAt ? new Date(scheduledEndAt) : null;
  if (status !== undefined) meeting.status = status;

  await meeting.save();

  res.status(200).json({
    success: true,
    message: 'Meeting updated successfully',
    meeting,
  });
};

// ── Join Meeting (pre-room validation) ────────────────────────────────────
const joinMeeting = async (req, res) => {
  const { roomId } = req.params;

  const meeting = await Meeting.findOne({
    $or: [{ roomId }, { _id: roomId.match(/^[0-9a-fA-F]{24}$/) ? roomId : null }],
  })
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar');

  // ── Guard 1: Does the meeting exist? ──────────────────────────────────
  if (!meeting) {
    return res.status(404).json({
      success: false,
      reason: 'not-found',
      message: 'Meeting not found. Check the Room ID.',
    });
  }

  // Check if meeting is already ended — 410 Gone
  if (meeting.status === 'ended') {
    return res.status(410).json({
      success: false,
      reason: 'ended',
      endedAt: meeting.endedAt,
      message: 'This meeting has ended.',
    });
  }

  // Check if user is already in participants list
  const alreadyJoined = meeting.participants.some(
    (p) => p._id.toString() === req.user._id.toString()
  );

  if (!alreadyJoined) {
    meeting.participants.push(req.user._id);
  }

  // ── Activate meeting on first join ────────────────────────────────────
  if (meeting.status === 'scheduled') {
    meeting.status = 'active';
    meeting.startedAt = new Date();
  }

  await meeting.save();

  // Invalidate cache for all participants
  await deleteCache(`meetings:user:${req.user._id}`);

  const updatedMeeting = await Meeting.findById(meeting._id)
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar')
    .populate('endedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Joined meeting successfully',
    roomId: updatedMeeting.roomId,
    inviteLink: attachMeetingLinks(updatedMeeting, req).inviteLink,
    meeting: updatedMeeting,
  });
};

// ── Delete Meeting ─────────────────────────────────────────────────────────
const deleteMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  if (meeting.host.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only host can delete meeting' });
  }

  await meeting.deleteOne();

  await deleteCache(`meetings:user:${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Meeting deleted successfully',
  });
};

const endMeeting = async (req, res) => {
  const { roomId } = req.params;

  const meeting = await Meeting.findOne({ roomId });

  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  if (meeting.host.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only host can end meeting' });
  }

  if (meeting.status === 'ended' || meeting.status === 'expired') {
    return res.status(200).json({ success: true, message: 'Meeting already ended', meeting });
  }

  meeting.status = 'ended';
  meeting.endedAt = new Date();
  meeting.endedBy = req.user._id;
  meeting.allowRejoin = false;
  await meeting.save();

  // Invalidate cache
  await deleteCache(`meetings:user:${req.user._id}`);

  meeting.status = 'ended';
  meeting.endedAt = new Date();
  await meeting.save();

  res.status(200).json({
    success: true,
    message: 'Meeting ended successfully',
    meeting,
  });
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  endMeeting,
};
