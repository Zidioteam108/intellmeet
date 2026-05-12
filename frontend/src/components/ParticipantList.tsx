interface Participant {
  socketId: string;
  userName: string;
  isMuted?: boolean;
}

interface Props {
  participants: Participant[];
  localUserName: string;
}

const ParticipantList = ({ participants, localUserName }: Props) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-3">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
        Participants ({participants.length + 1})
      </p>
      <div className="space-y-1">
        {/* Local user always shown first */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {localUserName?.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-sm">{localUserName} (You)</span>
        </div>

        {participants.map((p) => (
          <div key={p.socketId} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-semibold">
              {p.userName?.charAt(0).toUpperCase()}
            </div>
            <span className="text-white text-sm">{p.userName}</span>
            {p.isMuted && <span className="text-red-400 text-xs">🔇</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;
