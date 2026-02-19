import React, { useState } from 'react';
import { Patient, User } from '../types';
import { X, Send, Reply, Stethoscope, UserCircle, MessageSquare } from 'lucide-react';

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

  const getReplyToMessage = (messageId: string) => {
    return messages.find(m => m.id === messageId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Care Team Messages</h2>
              <p className="text-sm text-blue-100">Patient: {patient.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <p className="text-sm text-blue-900">
            <strong>Informational Only:</strong> Messages do not affect risk scoring or clinical alerts.
            Timestamped and role-labeled for care coordination.
          </p>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-semibold">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation with the care team</p>
            </div>
          ) : (
            messages.map(msg => {
              const replyToMsg = msg.replyTo ? getReplyToMessage(msg.replyTo) : null;
              const isDoctor = msg.role === 'DOCTOR';

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    isDoctor
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {isDoctor ? (
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                      ) : (
                        <UserCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className={`font-bold text-sm ${
                        isDoctor ? 'text-blue-900' : 'text-green-900'
                      }`}>
                        {msg.userName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        isDoctor
                          ? 'bg-blue-200 text-blue-900'
                          : 'bg-green-200 text-green-900'
                      }`}>
                        {msg.role}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {replyToMsg && (
                    <div className="mb-2 p-2 bg-white bg-opacity-60 rounded text-xs border-l-2 border-gray-300">
                      <div className="font-semibold text-gray-600">
                        Replying to {replyToMsg.userName}:
                      </div>
                      <div className="text-gray-600 line-clamp-2">
                        {replyToMsg.message}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">
                    {msg.message}
                  </p>

                  {currentUser.role !== msg.role && (
                    <button
                      onClick={() => {
                        setReplyingTo(msg.id);
                        setNewMessage('');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center font-semibold"
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

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          {replyingTo && (
            <div className="mb-3 p-2 bg-blue-100 rounded text-sm flex items-center justify-between">
              <span className="text-gray-700">
                Replying to {getReplyToMessage(replyingTo)?.userName}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-600 hover:text-gray-800 font-semibold"
              >
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagesDrawer;
