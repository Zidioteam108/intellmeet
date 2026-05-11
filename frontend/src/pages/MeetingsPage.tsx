import { useNavigate } from 'react-router-dom';
import { getAllMeetings, createMeeting } from '../api/meetingsApi';

const MeetingsPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch meetings on page load
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getAllMeetings();
        setMeetings(data.meetings);
      } catch (err) {
        setError('Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Meeting title is required');

    setIsCreating(true);
    setError('');

    try {
      const data = await createMeeting({ title, description });
      setMeetings((prev) => [data.meeting, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meetings</h1>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Create Meeting Form */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-4">Create New Meeting</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting Title"
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
          />
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {isCreating ? 'Creating...' : 'Create Meeting'}
          </button>
        </form>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-4">Your Meetings</h2>
        {isLoading ? (
          <p className="text-gray-400">Loading meetings...</p>
        ) : meetings.length === 0 ? (
          <p className="text-gray-400">No meetings yet. Create your first one!</p>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{meeting.title}</h3>
                  <p className="text-sm text-gray-400">Room: {meeting.roomId}</p>
                  <p className="text-sm text-gray-400">
                    Host: {meeting.host?.name || 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    meeting.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {meeting.status}
                  </span>
                  <button 
                    onClick={() => navigate(`/room/${meeting.roomId}`)}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm px-4 py-1.5 rounded-lg font-semibold shadow-lg shadow-blue-600/20"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;