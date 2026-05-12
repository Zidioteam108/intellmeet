interface TranscriptEntry {
  id: string;
  speakerName: string;
  text: string;
  time: string;
}

interface Props {
  entries: TranscriptEntry[];
}

const TranscriptionPanel = ({ entries }: Props) => {
  return (
    <div className="bg-gray-50 border rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto">
      <h3 className="font-semibold text-gray-800 text-sm">Live Transcript</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-gray-400">No transcript yet. Start speaking.</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="text-sm">
            <span className="font-medium text-blue-600">{entry.speakerName}: </span>
            <span className="text-gray-700">{entry.text}</span>
            <span className="text-gray-400 text-xs ml-2">{entry.time}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default TranscriptionPanel;
