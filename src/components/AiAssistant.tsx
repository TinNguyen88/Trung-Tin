import { useState, useRef, useEffect } from "react";
import { ChatMessage, BankState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface AiAssistantProps {
  bankState: BankState;
}

const QUICK_SUGGESTIONS = [
  "Phân tích tài chính cá nhân tôi",
  "Lên kế hoạch tiết kiệm mua xe 🚗",
  "Cách tối ưu hũ tài chính 50/30/20?",
  "Tôi có đủ điều kiện mở thẻ mới không?",
];

export default function AiAssistant({ bankState }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Xin chào! Tôi là **VietAI** - Trợ lý Tài chính thông minh của bạn. Tôi có thể đọc trực tiếp số dư tài khoản, mục tiêu tiết kiệm và phân tích chi tiêu của bạn để đưa ra lời khuyên tài chính chính xác nhất. \n\nBạn cần tôi tư vấn về chủ đề gì hôm nay? 🚀",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError("");
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Map history for endpoint (role user/assistant)
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          bankState: {
            balance: bankState.balance,
            savingsBalance: bankState.savingsBalance,
            points: bankState.points,
            savingsJars: bankState.savingsJars.map((j) => ({
              name: j.name,
              currentAmount: j.currentAmount,
              targetAmount: j.targetAmount,
              category: j.category,
            })),
            cards: bankState.cards.map((c) => ({
              cardHolder: c.cardHolder,
              cardType: c.cardType,
              creditLimit: c.creditLimit,
              currentBalance: c.currentBalance,
              status: c.status,
            })),
            recentTransactions: bankState.recentTransactions.slice(0, 8),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi kết nối máy chủ AI hoặc thiếu API Key.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể nhận câu trả lời từ AI. Vui lòng kiểm tra lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Hội thoại đã được đặt lại. Tôi đã sẵn sàng hỗ trợ phân tích chi tiêu và tư vấn tài chính cho bạn! 🏦",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setError("");
  };

  // Simple custom Markdown parser to support bolding, lists, and spacing nicely in text bubbles
  const renderFormattedText = (txt: string) => {
    return txt.split("\n").map((line, lineIdx) => {
      // Bold rendering **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-emerald-300 font-bold">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : line;

      // Unordered list rendering
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-slate-200 text-xs leading-relaxed my-1">
            {typeof content === "string" ? content.replace(/^[-*]\s+/, "") : content}
          </li>
        );
      }

      // Standard line paragraph
      return (
        <p key={lineIdx} className="text-xs leading-relaxed text-slate-200 my-1 min-h-[12px]">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/25 border border-slate-800/40 rounded-2xl overflow-hidden" id="ai-assistant-panel">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/25">
            <Bot className="w-5 h-5 text-emerald-400 animate-pulse-soft" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Trợ Lý Tài Chính VietAI
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            </h4>
            <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              Sẵn sàng tư vấn trực tiếp
            </span>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 rounded-lg transition-all cursor-pointer"
          title="Xóa lịch sử trò chuyện"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]" id="chat-messages-container">
        {messages.map((msg) => {
          const isBot = msg.role === "assistant";
          return (
            <div key={msg.id} className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isBot 
                  ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400" 
                  : "bg-slate-800 border border-slate-700 text-slate-200"
              }`}>
                {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>

              {/* Text Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 space-y-1 ${
                isBot 
                  ? "bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/50 rounded-tl-none shadow-md" 
                  : "bg-emerald-600/10 border border-emerald-500/20 text-white rounded-tr-none shadow-sm"
              }`}>
                <div className="space-y-0.5">{renderFormattedText(msg.text)}</div>
                <span className="block text-[8px] text-slate-500 text-right font-mono mt-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 animate-spin" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lỗi kết nối AI</p>
              <p className="text-[10px] mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick suggest chips */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5" id="chat-suggestions-box">
          {QUICK_SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-medium text-slate-300 rounded-lg transition-all cursor-pointer truncate max-w-[190px]"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-slate-800/60 bg-slate-950/50 flex gap-2"
      >
        <input
          type="text"
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi VietAI: 'Tình hình chi tiêu của tôi thế nào?'..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
