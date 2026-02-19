import React, { useMemo, useState } from 'react';
import { StoredUser, TeamMessage, User } from '../types';
import { MessageSquare, Send } from 'lucide-react';

interface TeamCommunicationPanelProps {
  currentUser: User;
  staff: StoredUser[];
  messages: TeamMessage[];
  onSendMessage: (payload: { message: string; toUid: string | 'ALL' }) => void;
}

const TeamCommunicationPanel: React.FC<TeamCommunicationPanelProps> = ({
  currentUser,
  staff,
  messages,
  onSendMessage
}) => {
  const [message, setMessage] = useState('');
  const [toUid, setToUid] = useState<string | 'ALL'>('ALL');

  const allowedRecipients = useMemo(() => {
    const base = staff.filter((u) => u.uid !== currentUser.uid);
    if (currentUser.role === 'DOCTOR') {
      return base.filter((u) => u.role === 'DOCTOR' || u.role === 'NURSE');
    }
    if (currentUser.role === 'NURSE') {
      return base.filter((u) => u.role === 'DOCTOR' || u.role === 'NURSE');
    }
    if (currentUser.role === 'ADMIN') return base;
    return [];
  }, [staff, currentUser]);

  const visibleMessages = useMemo(() => {
    return messages
      .filter(
        (m) =>
          m.toUid === 'ALL' ||
          m.toUid === currentUser.uid ||
          m.fromUid === currentUser.uid
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages, currentUser.uid]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage({ message: message.trim(), toUid });
    setMessage('');
  };

  const getUserName = (uid: string) => staff.find((u) => u.uid === uid)?.name || uid;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-slate-700" />
          Staff Messaging
        </h2>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
          UID Routed
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {visibleMessages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          visibleMessages.map((msg) => (
            <article key={msg.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  {msg.userName} ({msg.role}) [{msg.fromUid}]
                </p>
                <time className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleString()}</time>
              </div>
              <p className="text-xs text-slate-500">To: {msg.toUid === 'ALL' ? 'All' : getUserName(msg.toUid)}</p>
              <p className="text-sm text-slate-700 mt-1">{msg.message}</p>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="flex gap-2 mb-2">
          <label className="text-xs text-slate-600 pt-2">To</label>
          <select
            value={toUid}
            onChange={(e) => setToUid(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
          >
            <option value="ALL">All Allowed Staff</option>
            {allowedRecipients.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name} ({u.role}) - {u.uid}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Type message..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamCommunicationPanel;
