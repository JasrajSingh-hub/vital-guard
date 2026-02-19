import React, { useState } from 'react';
import { Patient, PatientMessage, User } from '../types';
import { MessageSquare, Send, Reply, Stethoscope, UserCircle } from 'lucide-react';

interface PatientCommunicationProps {
  patient: Patient;
  currentUser: User;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

const PatientCommunication: React.FC<PatientCommunicationProps> = ({
  patient,
  currentUser,
  onUpdatePatient
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const messages = patient.context?.messages || [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: PatientMessage = {
      id: Date.now().toString(),
      patientId: patient.id,
      role: currentUser.role,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: replyingTo ? 'REPLY' : 'COMMENT',
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
        Patient Communication
      </h3>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Communication Thread:</strong> Exchange messages between doctors and nurses. 
          These are informational only and do not affect clinical risk scoring.
        </p>
      </div>

      {/* Messages List */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-8">
            No messages yet. Start the conversation!
          </p>
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
                    <span className={`font-semibold text-sm ${
                      isDoctor ? 'text-blue-900' : 'text-green-900'
                    }`}>
                      {msg.userName}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      isDoctor
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {msg.role}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>

                {replyToMsg && (
                  <div className="mb-2 p-2 bg-white/50 rounded text-xs border-l-2 border-gray-300">
                    <div className="font-semibold text-gray-600">
                      Replying to {replyToMsg.userName}:
                    </div>
                    <div className="text-gray-600 line-clamp-2">
                      {replyToMsg.message}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {msg.message}
                </p>

                {currentUser.role !== msg.role && (
                  <button
                    onClick={() => {
                      setReplyingTo(msg.id);
                      setNewMessage('');
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center"
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
      <div className="border-t border-gray-200 pt-4">
        {replyingTo && (
          <div className="mb-2 p-2 bg-gray-100 rounded text-sm flex items-center justify-between">
            <span className="text-gray-600">
              Replying to {getReplyToMessage(replyingTo)?.userName}
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Write a message as ${currentUser.role.toLowerCase()}...`}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default PatientCommunication;
