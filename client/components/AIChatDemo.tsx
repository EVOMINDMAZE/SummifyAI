import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

interface AIChatDemoProps {
  title: string;
  subtitle: string;
  demoType: "search" | "analyze" | "generate" | "share";
  initialMessages?: ChatMessage[];
  suggestedPrompts?: string[];
  ctaText?: string;
  ctaLink?: string;
}

const AIChatDemo: React.FC<AIChatDemoProps> = ({
  title,
  subtitle,
  demoType,
  initialMessages = [],
  suggestedPrompts = [],
  ctaText = "Start Free Trial",
  ctaLink = "/signup",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (
    content: string,
    type: "user" | "ai",
    status: ChatMessage["status"] = "sent",
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      status,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "";

      switch (demoType) {
        case "search":
          aiResponse = `🔍 I found 5 relevant books on "${userMessage}":\n\n1. **Good to Great** by Jim Collins\n2. **The 7 Habits** by Stephen Covey\n3. **Leaders Eat Last** by Simon Sinek\n4. **Dare to Lead** by Brené Brown\n5. **The Leadership Challenge** by Kouzes & Posner\n\nReady to analyze these insights? ✨`;
          break;
        case "analyze":
          aiResponse = `🧠 **Deep Analysis Complete!**\n\nI've analyzed multiple perspectives on ${userMessage}:\n\n📊 **Key Themes:**\n• Servant leadership principles\n• Emotional intelligence importance\n• Trust-building strategies\n\n🔄 **Contrasting Views:**\n• Collins: Humble + determined\n• Sinek: Safety-first approach\n• Brown: Vulnerability as strength\n\n💡 **Synthesis:** Modern leadership requires authentic connection while maintaining clear vision and accountability.`;
          break;
        case "generate":
          aiResponse = `✨ **Premium Summary Generated!**\n\n📖 **300-Word Comparative Analysis on ${userMessage}**\n\nEffective leadership emerges from the intersection of humility and determination. Collins' research reveals Level 5 leaders channel ambition toward organizational success rather than personal glory, while Covey emphasizes principle-centered leadership through character development.\n\nSinek's "Circle of Safety" concept aligns with Brown's vulnerability research, suggesting leaders must prioritize team psychological safety. This creates an environment where innovation thrives...\n\n🎯 **Key Takeaways:**\n• Leaders serve others first\n• Authenticity builds trust\n• Vision guides decisions\n\n💎 Ready for your personalized library?`;
          break;
        case "share":
          aiResponse = `🚀 **Sharing Made Simple!**\n\nYour "${userMessage}" summary is now ready to share:\n\n📱 **Share Options:**\n• Social media posts with key quotes\n• Professional LinkedIn articles\n• Team presentation slides\n• PDF export for offline access\n\n💰 **Affiliate Earnings:** When friends purchase books through your shared links, you earn commissions!\n\n🎁 **Bonus:** Get +3 credits when someone signs up through your referral link!\n\nReady to build your influence?`;
          break;
        default:
          aiResponse = `I'm here to help you discover, analyze, and summarize book insights! What would you like to explore?`;
      }

      setIsTyping(false);
      addMessage(aiResponse, "ai", "read");
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage(inputValue, "user", "read");
    simulateAIResponse(inputValue);
    setInputValue("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => handleSendMessage(), 500);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Chat Container - Inspired by Figma Design */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] px-5 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                  <span className="text-[#0A0B1E] font-bold text-sm">S</span>
                </div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">{title}</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#43EE7D] rounded-full"></div>
                  <span className="text-[#43EE7D] text-xs font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="w-5 h-5 border border-white/50 rounded-full flex items-center justify-center">
              <div className="w-3 h-0.5 bg-white"></div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {message.type === "ai" && (
                  <div className="w-8 h-8 bg-[#7B2CBF] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl relative ${
                    message.type === "user"
                      ? "bg-[#DEE2E6] text-gray-800 rounded-br-sm"
                      : "bg-[#3C096C] text-white rounded-bl-sm"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-60">
                      {message.timestamp}
                    </span>
                    {message.type === "user" && message.status === "read" && (
                      <svg
                        className="w-3 h-3 text-[#7B2CBF]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-sm font-medium">U</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 bg-[#7B2CBF] rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="bg-[#3C096C] text-white px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Suggested Prompts */}
          {suggestedPrompts.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="bg-[#F3F5F6] hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-center gap-3 bg-[#E8EBF0] dark:bg-gray-700 rounded-lg px-4 py-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="text-[#4361EE] hover:text-[#7B2CBF] disabled:text-gray-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>

          {/* CTA */}
          <div className="mt-4 text-center">
            <Link
              to={ctaLink}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {ctaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-sm">
        {subtitle}
      </p>
    </div>
  );
};

export default AIChatDemo;
