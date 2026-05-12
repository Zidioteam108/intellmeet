const openai = require('../config/openai');
const Meeting = require('../models/Meeting');
const Transcription = require('../models/Transcription');

const generateMeetingSummary = async (req, res) => {
  const { meetingId } = req.params;

  // Get the meeting
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  // Get all transcriptions for this meeting
  const transcriptions = await Transcription.find({ meetingId })
    .populate('speaker', 'name')
    .sort({ timestamp: 1 });

  if (transcriptions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No transcriptions found. Record some audio first.',
    });
  }

  // Build the full transcript text with speaker names
  const fullTranscript = transcriptions
    .map((t) => `${t.speaker?.name || 'Unknown'}: ${t.text}`)
    .join('\n');

  try {
    // Send to GPT-4o-mini for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional meeting analyst. Analyze the meeting transcript and return a JSON response with exactly this structure:
{
  "summary": "2-3 sentence paragraph summarizing the key discussion points",
  "actionItems": [
    {
      "task": "specific task description",
      "assignee": "person name from transcript or 'Team' if unclear",
      "priority": "low or medium or high"
    }
  ]
}
Return ONLY valid JSON. No extra text outside the JSON.`,
        },
        {
          role: 'user',
          content: `Meeting Title: ${meeting.title}\n\nTranscript:\n${fullTranscript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    // Parse GPT response
    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // Save summary and action items to the meeting
    meeting.summary = parsed.summary;
    meeting.actionItems = parsed.actionItems;
    meeting.status = 'ended';
    meeting.endedAt = new Date();
    await meeting.save();

    res.status(200).json({
      success: true,
      summary: parsed.summary,
      actionItems: parsed.actionItems,
      meetingId,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Summary generation failed: ' + error.message,
    });
  }
};

// Get summary for a specific meeting
const getMeetingSummary = async (req, res) => {
  const { meetingId } = req.params;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  res.status(200).json({
    success: true,
    summary: meeting.summary,
    actionItems: meeting.actionItems,
    endedAt: meeting.endedAt,
  });
};

// Mark an action item as complete
const toggleActionItem = async (req, res) => {
  const { meetingId, itemId } = req.params;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

  const item = meeting.actionItems.id(itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Action item not found' });

  item.completed = !item.completed;
  await meeting.save();

  res.status(200).json({ success: true, completed: item.completed });
};

module.exports = { generateMeetingSummary, getMeetingSummary, toggleActionItem };
