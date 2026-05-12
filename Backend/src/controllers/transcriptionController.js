const openai = require('../config/openai');
const Transcription = require('../models/Transcription');
const fs = require('fs');

// ── Transcribe audio file using Whisper ───────────────────────────────────────
const transcribeAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No audio file provided' });
  }

  try {
    // Send the audio file to OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'en',
    });

    // Save to database
    const saved = await Transcription.create({
      meetingId: req.body.meetingId,
      roomId: req.body.roomId,
      speaker: req.user._id,
      text: transcription.text,
    });

    // Delete temp file after sending to Whisper
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      transcription: {
        id: saved._id,
        text: saved.text,
        timestamp: saved.timestamp,
      },
    });

  } catch (error) {
    // Clean up temp file if error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Transcription failed: ' + error.message });
  }
};

// ── Get all transcriptions for a meeting ─────────────────────────────────────
const getMeetingTranscriptions = async (req, res) => {
  const { meetingId } = req.params;

  const transcriptions = await Transcription.find({ meetingId })
    .populate('speaker', 'name avatar')
    .sort({ timestamp: 1 });

  res.status(200).json({ success: true, transcriptions });
};

module.exports = { transcribeAudio, getMeetingTranscriptions };
