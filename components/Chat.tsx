import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner";
import { BotMessageSquareIcon, UserIcon } from "./icons";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://careerkraft.up.railway.app"
    : "http://localhost:3001";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeChat = async () => {
      // Ensure we have the career path and todos in localStorage
      const careerPath = localStorage.getItem("selectedCareerPath");
      const todos = localStorage.getItem("careerTodos");

      if (!careerPath) {
        console.warn("No career path found in localStorage");
        // You might want to redirect to career selection or handle this case
      }

      if (!todos) {
        console.warn("No todos found in localStorage");
        localStorage.setItem("careerTodos", "[]");
      }

      await fetchMessages();
    };

    initializeChat();
  }, [currentUser?.id]); // Re-run if user ID changes

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          action: "fetch",
          userId: currentUser?.id,
          context: {
            careerPath: localStorage.getItem("selectedCareerPath"),
            todos: JSON.parse(localStorage.getItem("careerTodos") || "[]"),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Fetch messages error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.message || "Failed to fetch messages");
      }

      const data = await response.json();
      console.log("Fetched chat history:", data);

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        // If no messages yet, add the welcome message
        const welcomeMessage: ChatMessage = {
          id: "welcome",
          content:
            `Hello! I'm your AI Career Mentor. I can help you with:\n\n` +
            `• Understanding your career path: ${localStorage.getItem(
              "selectedCareerPath"
            )}\n` +
            `• Planning and tracking your career goals\n` +
            `• Providing guidance on skill development\n` +
            `• Answering questions about industry trends\n` +
            `• Suggesting learning resources\n\n` +
            `What would you like to discuss about your career journey?`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          userId: currentUser?.id || "",
        };
        setMessages([welcomeMessage]);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    // Add the user's message immediately to the UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || "",
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Get selected career path from localStorage
      const selectedCareerPath = localStorage.getItem("selectedCareerPath");
      // Get todos from localStorage and parse them
      const savedTodos = localStorage.getItem("careerTodos");
      const parsedTodos = savedTodos ? JSON.parse(savedTodos) : [];

      console.log("Sending chat request with context:", {
        careerPath: selectedCareerPath,
        todos: parsedTodos,
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          action: "send",
          content: newMessage,
          userId: currentUser?.id,
          timestamp: new Date().toISOString(),
          context: {
            careerPath: selectedCareerPath,
            todos: parsedTodos,
            messageHistory: messages.slice(-5), // Include last 5 messages for context
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Send message error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      console.log("Received AI response:", data);

      if (!data.content) {
        throw new Error("Invalid response from AI: No content received");
      }

      // Update the messages with the AI response
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || Date.now().toString(),
          content: data.content,
          sender: "ai",
          timestamp: new Date().toISOString(),
          userId: currentUser?.id || "",
        },
      ]);
      setNewMessage("");
    } catch (err) {
      console.error("Send message error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="w-full max-w-2xl h-[600px] bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <BotMessageSquareIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">AI Career Mentor</h2>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === "user"
                  ? "bg-purple-500/20"
                  : "bg-blue-500/20"
              }`}
            >
              {message.sender === "user" ? (
                <UserIcon className="w-5 h-5 text-purple-300" />
              ) : (
                <BotMessageSquareIcon className="w-5 h-5 text-blue-300" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-purple-600/30 text-purple-50"
                  : "bg-gray-700/50 text-gray-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 py-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() =>
              setNewMessage("What skills should I focus on developing first?")
            }
            className="px-3 py-1 text-sm bg-gray-700/50 text-purple-300 rounded-full hover:bg-purple-600/20 transition-colors"
          >
            Skills to develop
          </button>
          <button
            onClick={() =>
              setNewMessage("Can you explain more about my career roadmap?")
            }
            className="px-3 py-1 text-sm bg-gray-700/50 text-purple-300 rounded-full hover:bg-purple-600/20 transition-colors"
          >
            Career roadmap details
          </button>
          <button
            onClick={() =>
              setNewMessage("What are the next steps I should take?")
            }
            className="px-3 py-1 text-sm bg-gray-700/50 text-purple-300 rounded-full hover:bg-purple-600/20 transition-colors"
          >
            Next steps
          </button>
          <button
            onClick={() =>
              setNewMessage("How can I track my progress effectively?")
            }
            className="px-3 py-1 text-sm bg-gray-700/50 text-purple-300 rounded-full hover:bg-purple-600/20 transition-colors"
          >
            Progress tracking
          </button>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        {error && <div className="mb-2 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your career journey..."
            className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
