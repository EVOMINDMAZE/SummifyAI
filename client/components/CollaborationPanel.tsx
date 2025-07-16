import React, { useState, useRef, useEffect } from "react";
import { useCollaboration } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const {
    isConnected,
    currentSession,
    activeUsers,
    messages,
    createSession,
    joinSession,
    leaveSession,
    sendMessage,
    inviteUser,
  } = useCollaboration();

  const [newMessage, setNewMessage] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [sessionTopic, setSessionTopic] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [joinSessionId, setJoinSessionId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateSession = async () => {
    if (!sessionName.trim() || !sessionTopic.trim()) return;

    setIsCreating(true);
    try {
      await createSession(sessionName, sessionTopic);
      setSessionName("");
      setSessionTopic("");
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create collaboration session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) return;

    setIsJoining(true);
    try {
      await joinSession(joinSessionId);
      setJoinSessionId("");
    } catch (error) {
      console.error("Failed to join session:", error);
      alert("Failed to join session. Please check the session ID.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await inviteUser(inviteEmail);
      setInviteEmail("");
      alert(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error("Failed to invite user:", error);
      alert("Failed to send invitation. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🤝 Real-time Collaboration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {!currentSession ? (
              /* Session Creation/Join UI */
              <div className="flex-1 p-6 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Start Collaborating
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a new session or join an existing one to collaborate
                    with others
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Create Session */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Create New Session
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Session name"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Research topic"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleCreateSession}
                        disabled={
                          !sessionName.trim() ||
                          !sessionTopic.trim() ||
                          isCreating
                        }
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        {isCreating ? "Creating..." : "Create Session"}
                      </button>
                    </div>
                  </div>

                  {/* Join Session */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Join Existing Session
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Session ID"
                        value={joinSessionId}
                        onChange={(e) => setJoinSessionId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleJoinSession}
                        disabled={!joinSessionId.trim() || isJoining}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        {isJoining ? "Joining..." : "Join Session"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Session UI */
              <>
                {/* Session Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {currentSession.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Topic: {currentSession.topic}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentSession.id);
                          alert("Session ID copied to clipboard!");
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        📋 Copy ID
                      </button>
                      <button
                        onClick={leaveSession}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.userId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.type === "system"
                            ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-center mx-auto"
                            : message.userId === user?.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {message.type !== "system" && (
                          <div className="text-xs opacity-75 mb-1">
                            {message.userName}
                          </div>
                        )}
                        <div className="text-sm">{message.message}</div>
                        <div className="text-xs opacity-50 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Active Users & Invite */}
          {currentSession && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Active Users ({activeUsers.length})
                </h4>
                <div className="space-y-2">
                  {activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Invite Users
                </h4>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleInviteUser}
                    disabled={!inviteEmail.trim()}
                    className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
