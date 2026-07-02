var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const PORT = 3e3;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (geminiApiKey) {
    ai = new import_genai.GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables.");
  }
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Gemini API Client is not initialized. Vui l\xF2ng thi\u1EBFt l\u1EADp GEMINI_API_KEY trong Settings > Secrets."
        });
      }
      const { message, history, bankState } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.text || turn.message || "" }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const stateStr = bankState ? `
D\u1EEF li\u1EC7u t\xE0i kho\u1EA3n hi\u1EC7n t\u1EA1i c\u1EE7a ng\u01B0\u1EDDi d\xF9ng:
- S\u1ED1 d\u01B0 thanh to\xE1n: ${bankState.balance?.toLocaleString()} VND
- S\u1ED1 d\u01B0 ti\u1EBFt ki\u1EC7m: ${bankState.savingsBalance?.toLocaleString()} VND
- \u0110i\u1EC3m t\xEDch l\u0169y: ${bankState.points || 0} \u0111i\u1EC3m
- C\xE1c h\u0169 ti\u1EBFt ki\u1EC7m hi\u1EC7n c\xF3: ${JSON.stringify(bankState.savingsJars || [])}
- C\xE1c th\u1EBB t\xEDn d\u1EE5ng \u1EA3o \u0111\xE3 m\u1EDF: ${JSON.stringify(bankState.cards || [])}
- Giao d\u1ECBch g\u1EA7n \u0111\xE2y: ${JSON.stringify(bankState.recentTransactions?.slice(0, 5) || [])}
` : "Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u t\xE0i kho\u1EA3n.";
      const systemInstruction = `B\u1EA1n l\xE0 Tr\u1EE3 l\xFD T\xE0i ch\xEDnh AI c\xF3 t\xEAn l\xE0 VietAI, t\xEDch h\u1EE3p b\xEAn trong \u1EE9ng d\u1EE5ng ng\xE2n h\xE0ng s\u1ED1 th\xF4ng minh "TrungTinApp".
Nhi\u1EC7m v\u1EE5 c\u1EE7a b\u1EA1n:
1. Tr\xF2 chuy\u1EC7n v\xE0 tr\u1EE3 gi\xFAp ng\u01B0\u1EDDi d\xF9ng c\xE1c v\u1EA5n \u0111\u1EC1 v\u1EC1 t\xE0i ch\xEDnh, ti\u1EBFt ki\u1EC7m, ng\xE2n h\xE0ng m\u1ED9t c\xE1ch l\u1ECBch s\u1EF1, t\u1EADn t\xE2m, chuy\xEAn nghi\u1EC7p b\u1EB1ng Ti\u1EBFng Vi\u1EC7t.
2. \u0110\u1ECDc v\xE0 ph\xE2n t\xEDch d\u1EEF li\u1EC7u t\xE0i kho\u1EA3n th\u1EF1c t\u1EBF c\u1EE7a ng\u01B0\u1EDDi d\xF9ng \u0111\u01B0\u1EE3c cung c\u1EA5p d\u01B0\u1EDBi \u0111\xE2y \u0111\u1EC3 \u0111\u01B0a ra l\u1EDDi khuy\xEAn c\xE1 nh\xE2n h\xF3a, ch\xEDnh x\xE1c, kh\xF4ng n\xF3i chung chung.
3. Khi ng\u01B0\u1EDDi d\xF9ng h\u1ECFi v\u1EC1 t\xE0i kho\u1EA3n c\u1EE7a h\u1ECD (s\u1ED1 d\u01B0, m\u1EE5c ti\xEAu ti\u1EBFt ki\u1EC7m, chi ti\xEAu), h\xE3y tr\xEDch d\u1EABn s\u1ED1 li\u1EC7u th\u1EF1c t\u1EBF t\u1EEB d\u1EEF li\u1EC7u \u0111\u01B0\u1EE3c cung c\u1EA5p.
4. G\u1EE3i \xFD c\xE1c m\u1EB9o ti\u1EBFt ki\u1EC7m th\xF4ng minh (v\xED d\u1EE5: chia nh\u1ECF qu\u1EF9 theo quy t\u1EAFc 6 chi\u1EBFc h\u0169 ho\u1EB7c 50/30/20, c\xE1ch t\u1ED1i \u01B0u h\u0169 ti\u1EBFt ki\u1EC7m hi\u1EC7n c\xF3 c\u1EE7a h\u1ECD).
5. Tr\u1EA3 l\u1EDDi ng\u1EAFn g\u1ECDn, s\xFAc t\xEDch, \u0111\u1ECBnh d\u1EA1ng Markdown r\xF5 r\xE0ng, th\xE2n thi\u1EC7n, s\u1EED d\u1EE5ng c\xE1c icon bi\u1EC3u t\u01B0\u1EE3ng (emojis) ph\xF9 h\u1EE3p v\u1EDBi ng\xE2n h\xE0ng (nh\u01B0 \u{1F4B0}, \u{1F4B3}, \u{1F4C8}, \u{1F3E6}, \u{1F680}).

Th\xF4ng tin t\xE0i kho\u1EA3n kh\xE1ch h\xE0ng th\u1EF1c t\u1EBF:${stateStr}

H\xE3y b\u1EAFt \u0111\u1EA7u h\u1ED7 tr\u1EE3 kh\xE1ch h\xE0ng th\u1EADt chuy\xEAn nghi\u1EC7p!`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const reply = response.text || "Xin l\u1ED7i, t\xF4i kh\xF4ng th\u1EC3 tr\u1EA3 l\u1EDDi l\xFAc n\xE0y.";
      res.json({ reply });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
