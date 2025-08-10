import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface CollaborationUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen: string;
}

interface CollaborationSession {
  id: string;
  name: string;
  topic: string;
  owner: string;
  participants: CollaborationUser[];
  createdAt: string;
  isActive: boolean;
}

interface CollaborationMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  type: "text" | "system" | "suggestion" | "book_share";
  timestamp: string;
  data?: any;
}

interface CollaborationContextType {
  // Connection status
  isConnected: boolean;

  // Current session
  currentSession: CollaborationSession | null;

  // Active users
  activeUsers: CollaborationUser[];

  // Messages
  messages: CollaborationMessage[];

  // Actions
  createSession: (name: string, topic: string) => Promise<string>;
  joinSession: (sessionId: string) => Promise<boolean>;
  leaveSession: () => void;
  sendMessage: (message: string, type?: "text" | "suggestion") => void;
  shareBook: (book: any) => void;
  inviteUser: (email: string) => Promise<boolean>;

  // User status
  updateUserStatus: (status: "online" | "away") => void;
}

const CollaborationContext = createContext<
  CollaborationContextType | undefined
>(undefined);

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] =
    useState<CollaborationSession | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);

  // Initialize socket connection
  useEffect(() => {
    if (user && !isLoading) {
      // In a real app, this would connect to your backend
      // For demo purposes, we'll simulate a connection
      const newSocket = io("ws://localhost:3001", {
        auth: {
          userId: user.id,
          email: user.email,
          name: user.email.split("@")[0],
        },
        transports: ["websocket", "polling"],
      });

      // Connection events
      newSocket.on("connect", () => {
        console.log("Connected to collaboration server");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from collaboration server");
        setIsConnected(false);
      });

      // Session events
      newSocket.on("session:created", (session: CollaborationSession) => {
        setCurrentSession(session);
      });

      newSocket.on("session:joined", (session: CollaborationSession) => {
        setCurrentSession(session);
      });

      newSocket.on("session:user-joined", (user: CollaborationUser) => {
        setActiveUsers((prev) => [
          ...prev.filter((u) => u.id !== user.id),
          user,
        ]);
        addSystemMessage(`${user.name} joined the session`);
      });

      newSocket.on("session:user-left", (userId: string) => {
        setActiveUsers((prev) => prev.filter((u) => u.id !== userId));
        const user = activeUsers.find((u) => u.id === userId);
        if (user) {
          addSystemMessage(`${user.name} left the session`);
        }
      });

      newSocket.on("session:message", (message: CollaborationMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("session:users-update", (users: CollaborationUser[]) => {
        setActiveUsers(users);
      });

      // Error handling
      newSocket.on("error", (error) => {
        console.error("Collaboration error:", error);
        // Show user-friendly error message
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addSystemMessage = (message: string) => {
    const systemMessage: CollaborationMessage = {
      id: Date.now().toString(),
      sessionId: currentSession?.id || "",
      userId: "system",
      userName: "System",
      message,
      type: "system",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const createSession = async (
    name: string,
    topic: string,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket || !user) {
        reject(new Error("Not connected"));
        return;
      }

      const sessionData = {
        name,
        topic,
        owner: user.id,
      };

      socket.emit("session:create", sessionData, (response: any) => {
        if (response.success) {
          resolve(response.sessionId);
        } else {
          reject(new Error(response.error));
        }
      });

      // Fallback for demo - simulate session creation
      setTimeout(() => {
        const mockSession: CollaborationSession = {
          id: `session_${Date.now()}`,
          name,
          topic,
          owner: user.id,
          participants: [
            {
              id: user.id,
              email: user.email,
              name: user.email.split("@")[0],
              status: "online",
              lastSeen: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        setCurrentSession(mockSession);
        setActiveUsers(mockSession.participants);
        resolve(mockSession.id);
      }, 1000);
    });
  };

  const joinSession = async (sessionId: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!socket || !user) {
        reject(new Error("Not connected"));
        return;
      }

      socket.emit("session:join", { sessionId }, (response: any) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error));
        }
      });

      // Fallback for demo
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  };

  const leaveSession = () => {
    if (socket && currentSession) {
      socket.emit("session:leave", { sessionId: currentSession.id });
    }
    setCurrentSession(null);
    setActiveUsers([]);
    setMessages([]);
  };

  const sendMessage = (
    message: string,
    type: "text" | "suggestion" = "text",
  ) => {
    if (!socket || !currentSession || !user) return;

    const messageData: CollaborationMessage = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      userId: user.id,
      userName: user.email.split("@")[0],
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    socket.emit("session:message", messageData);

    // Add to local messages immediately for demo
    setMessages((prev) => [...prev, messageData]);
  };

  const shareBook = (book: any) => {
    if (!currentSession) return;

    const shareMessage = `📚 Shared book: "${book.title}" by ${book.author}`;
    sendMessage(shareMessage, "text");
  };

  const inviteUser = async (email: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!socket || !currentSession) {
        reject(new Error("No active session"));
        return;
      }

      socket.emit(
        "session:invite",
        {
          sessionId: currentSession.id,
          email,
        },
        (response: any) => {
          if (response.success) {
            resolve(true);
          } else {
            reject(new Error(response.error));
          }
        },
      );

      // Demo fallback
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const updateUserStatus = (status: "online" | "away") => {
    if (socket && user) {
      socket.emit("user:status-update", { status });
    }
  };

  const value: CollaborationContextType = {
    isConnected,
    currentSession,
    activeUsers,
    messages,
    createSession,
    joinSession,
    leaveSession,
    sendMessage,
    shareBook,
    inviteUser,
    updateUserStatus,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error(
      "useCollaboration must be used within a CollaborationProvider",
    );
  }
  return context;
};
