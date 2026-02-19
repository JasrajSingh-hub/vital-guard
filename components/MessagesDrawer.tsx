import React, { useState } from 'react';
import { Patient, User } from '../types';
import {
  X,
  Send,
  Reply,
  Stethoscope,
  UserCircle,
  MessageSquare,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';

interface MessagesDrawerProps {
  patient: Patient;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

const MessagesDrawer: React.FC<MessagesDrawerProps> = ({
  patient,
  currentUser,
  isOpen,
  onClose,
  onUpdatePatient
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const messages = patient.context?.messages || [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      patientId: patient.id,
      role: currentUser.role,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: replyingTo ? ('REPLY' as const) : ('COMMENT' as const),
      replyTo: replyingTo || undefined
    };

    const updatedContext = {
      ...patient.context,
      messages: [...messages, message]
    };

    onUpdatePatient({
      ...patient,
      context: updatedContext as any
    });

    setNewMessage('');
    setReplyingTo(null);
  };

  const getReplyToMessage = (messageId: string) => messages.find((m) => m.id === messageId);

  const roleStyle = {
    DOCTOR: 'bg-sky-50 border-sky-400 text-sky-900',
    NURSE: 'bg-emerald-50 border-emerald-400 text-emerald-900',
    PATIENT: 'bg-rose-50 border-rose-400 text-rose-900',
    ADMIN: 'bg-slate-100 border-slate-400 text-slate-900'
  } as const;

  const roleIcon = {
    DOCTOR: <Stethoscope className="w-4 h-4" />,
    NURSE: <UserCircle className="w-4 h-4" />,
    PATIENT: <HeartPulse className="w-4 h-4" />,
    ADMIN: <ShieldCheck className="w-4 h-4" />
  } as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
        <div className="bg-slate-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">Care Team Messages</h2>
              <p className="text-sm text-slate-200">Patient: {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-slate-600 rounded-full p-2 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3">
          <p className="text-sm text-slate-700">
            Timestamped messages for coordination between doctor, nurse, patient, and admin.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="font-semibold">No messages yet</p>
              <p className="text-sm mt-1">Start care coordination for this patient.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const replyToMsg = msg.replyTo ? getReplyToMessage(msg.replyTo) : null;
              return (
                <div key={msg.id} className={`p-4 rounded-lg border-l-4 ${roleStyle[msg.role]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {roleIcon[msg.role]}
                      <span className="font-semibold text-sm">{msg.userName}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/70 font-semibold">{msg.role}</span>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>

                  {replyToMsg && (
                    <div className="mb-2 p-2 bg-white/70 rounded text-xs border-l-2 border-slate-300">
                      <div className="font-semibold text-slate-600">Replying to {replyToMsg.userName}:</div>
                      <div className="text-slate-600 line-clamp-2">{replyToMsg.message}</div>
                    </div>
                  )}

                  <p className="text-sm text-slate-800 whitespace-pre-wrap mb-2">{msg.message}</p>

                  {currentUser.role !== msg.role && (
                    <button
                      onClick={() => {
                        setReplyingTo(msg.id);
                        setNewMessage('');
                      }}
                      className="text-xs text-slate-700 hover:text-slate-900 flex items-center font-semibold"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          {replyingTo && (
            <div className="mb-3 p-2 bg-slate-200 rounded text-sm flex items-center justify-between">
              <span className="text-slate-700">Replying to {getReplyToMessage(replyingTo)?.userName}</span>
              <button onClick={() => setReplyingTo(null)} className="text-slate-600 hover:text-slate-800 font-semibold">
                Cancel
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message as ${currentUser.role.toLowerCase()}...`}
              rows={3}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesDrawer;
