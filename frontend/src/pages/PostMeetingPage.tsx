import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeetingSummary, generateSummary, toggleActionItem } from '../api/summaryApi';

const PostMeetingPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Load existing summary
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMeetingSummary(meetingId!);
        setSummary(data.summary || '');
        setActionItems(data.actionItems || []);
      } catch {
        setError('Could not load summary');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [meetingId]);

  // Generate a new summary using AI
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const data = await generateSummary(meetingId!);
      setSummary(data.summary);
      setActionItems(data.actionItems);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle action item complete
  const handleToggle = async (itemId: string, index: number) => {
    try {
      await toggleActionItem(meetingId!, itemId);
      setActionItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, completed: !item.completed } : item
        )
      );
    } catch {
      setError('Could not update action item');
    }
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500">Loading meeting summary...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Post-Meeting Report</h1>
        <button
          onClick={() => navigate('/meetings')}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Meetings
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-[#121215]/80 border border-white/5 rounded-xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">AI Meeting Summary</h2>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-all font-bold tracking-wide shadow-lg shadow-indigo-600/20"
          >
            {isGenerating ? '⏳ Generating...' : '🤖 Generate Summary'}
          </button>
        </div>

        {summary ? (
          <p className="text-slate-300 leading-relaxed text-sm">{summary}</p>
        ) : (
          <p className="text-slate-500 italic text-sm">
            No summary yet. Click "Generate Summary" to create one using AI.
          </p>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-[#121215]/80 border border-white/5 rounded-xl p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white mb-4">
          Action Items ({actionItems.filter((a) => !a.completed).length} open)
        </h2>

        {actionItems.length === 0 ? (
          <p className="text-slate-500 italic text-sm">No action items extracted yet.</p>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div
                key={item._id || index}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  item.completed ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item._id, index)}
                  className="mt-1 h-5 w-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-600 bg-transparent cursor-pointer transition-all"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.task}
                  </p>
                  <div className="flex gap-2 mt-2 items-center">
                    <span className="text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-1 rounded-md">👤 {item.assignee}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md ${priorityColors[item.priority] || 'bg-gray-100 text-gray-700'}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostMeetingPage;
