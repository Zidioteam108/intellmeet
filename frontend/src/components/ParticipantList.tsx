interface Participant {
  socketId: string;
  userName: string;
  isMuted?: boolean;
  avatar?: string;
}

interface Props {
  participants: Participant[];
  localUserName: string;
  localAvatar?: string;
}

const ParticipantList = ({ participants, localUserName, localAvatar }: Props) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-3">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
        Participants ({participants.length + 1})
      </p>
      <div className="space-y-3">
        {/* Local user always shown first */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden border border-white/10">
            {localAvatar ? (
              <img src={localAvatar} alt={localUserName} className="w-full h-full object-cover" />
            ) : (
              localUserName?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-white text-sm font-medium">{localUserName} (You)</span>
        </div>

        {participants.map((p) => (
          <div key={p.socketId} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden border border-white/10">
              {p.avatar ? (
                <img src={p.avatar} alt={p.userName} className="w-full h-full object-cover" />
              ) : (
                p.userName?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-white text-sm font-medium">{p.userName}</span>
            {p.isMuted && <span className="text-red-400 text-xs ml-auto">🔇</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;
