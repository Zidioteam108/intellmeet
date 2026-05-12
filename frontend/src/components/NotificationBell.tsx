import { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';
import { useAuthStore } from '../store/authStore';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    // Join personal notification room
    socket.emit('join-personal', { userId: user.id });

    socket.on('notification', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 20)); // keep last 20
    });

    return () => {
      socket.off('notification');
    };
  }, [user]);

  const unread = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="font-bold text-sm text-slate-800">Notifications</span>
            <button
              onClick={() => setNotifications([])}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="text-3xl mb-2 opacity-50">📭</div>
                <p className="text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                          {n.message}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
