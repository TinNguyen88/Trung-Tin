import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables.");
  }

  // API routes first
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ 
          error: "Gemini API Client is not initialized. Vui lòng thiết lập GEMINI_API_KEY trong Settings > Secrets." 
        });
      }

      const { message, history, bankState } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Pre-format contents array from history
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.text || turn.message || "" }]
          });
        }
      }

      // Add the latest message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Inject the current state of user's bank account to make the chatbot context-aware!
      const stateStr = bankState ? `
Dữ liệu tài khoản hiện tại của người dùng:
- Số dư thanh toán: ${bankState.balance?.toLocaleString()} VND
- Số dư tiết kiệm: ${bankState.savingsBalance?.toLocaleString()} VND
- Điểm tích lũy: ${bankState.points || 0} điểm
- Các hũ tiết kiệm hiện có: ${JSON.stringify(bankState.savingsJars || [])}
- Các thẻ tín dụng ảo đã mở: ${JSON.stringify(bankState.cards || [])}
- Giao dịch gần đây: ${JSON.stringify(bankState.recentTransactions?.slice(0, 5) || [])}
` : "Không có dữ liệu tài khoản.";

      const systemInstruction = `Bạn là Trợ lý Tài chính AI có tên là VietAI, tích hợp bên trong ứng dụng ngân hàng số thông minh "VietBank".
Nhiệm vụ của bạn:
1. Trò chuyện và trợ giúp người dùng các vấn đề về tài chính, tiết kiệm, ngân hàng một cách lịch sự, tận tâm, chuyên nghiệp bằng Tiếng Việt.
2. Đọc và phân tích dữ liệu tài khoản thực tế của người dùng được cung cấp dưới đây để đưa ra lời khuyên cá nhân hóa, chính xác, không nói chung chung.
3. Khi người dùng hỏi về tài khoản của họ (số dư, mục tiêu tiết kiệm, chi tiêu), hãy trích dẫn số liệu thực tế từ dữ liệu được cung cấp.
4. Gợi ý các mẹo tiết kiệm thông minh (ví dụ: chia nhỏ quỹ theo quy tắc 6 chiếc hũ hoặc 50/30/20, cách tối ưu hũ tiết kiệm hiện có của họ).
5. Trả lời ngắn gọn, súc tích, định dạng Markdown rõ ràng, thân thiện, sử dụng các icon biểu tượng (emojis) phù hợp với ngân hàng (như 💰, 💳, 📈, 🏦, 🚀).

Thông tin tài khoản khách hàng thực tế:${stateStr}

Hãy bắt đầu hỗ trợ khách hàng thật chuyên nghiệp!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
      res.json({ reply });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Serve static assets or use Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
