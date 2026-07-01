import React, { useState } from "react";
import { CreditCard as CardType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Eye, EyeOff, Lock, Unlock, ShieldCheck, Check } from "lucide-react";

interface CreditCardProps {
  cards: CardType[];
  onAddCard: (card: Omit<CardType, "id" | "cardNumber" | "cvv" | "expiryDate" | "currentBalance">) => void;
  onToggleLock: (cardId: string) => void;
}

export default function CreditCard({ cards, onAddCard, onToggleLock }: CreditCardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || "");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form states for new card
  const [cardHolder, setCardHolder] = useState<string>("NGUYEN VAN A");
  const [cardType, setCardType] = useState<"visa" | "mastercard">("visa");
  const [designStyle, setDesignStyle] = useState<"slate" | "neon" | "gold" | "cyberpunk">("slate");
  const [creditLimit, setCreditLimit] = useState<number>(50000000);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCard({
      cardHolder: cardHolder.toUpperCase(),
      cardType,
      designStyle,
      creditLimit,
      status: "active",
    });
    setIsCreating(false);
    // Reset form
    setCardHolder("NGUYEN VAN A");
    setCreditLimit(50000000);
  };

  const getStyleClasses = (style: string) => {
    switch (style) {
      case "slate":
        return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border border-slate-700/50";
      case "neon":
        return "bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-emerald-100 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
      case "gold":
        return "bg-gradient-to-br from-amber-950 via-yellow-900 to-stone-950 text-amber-100 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
      case "cyberpunk":
        return "bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 text-pink-100 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]";
      default:
        return "bg-gradient-to-br from-slate-900 to-slate-800 text-white";
    }
  };

  const formatCardNumber = (num: string, visible: boolean) => {
    if (visible) {
      return num.match(/.{1,4}/g)?.join(" ") || num;
    }
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className="space-y-6" id="credit-card-module">
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-semibold text-lg text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Quản Lý Thẻ Khách Hàng
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border border-emerald-500/20 cursor-pointer"
          id="btn-create-card-trigger"
        >
          <Plus className="w-3.5 h-3.5" />
          Mở Thẻ Ảo Mới
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5 rounded-2xl border border-slate-700/50"
            id="create-card-form"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                <span className="text-sm font-semibold text-slate-200">Đăng Ký Thẻ Ảo Tức Thì</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">TÊN CHỦ THẺ (VIẾT HOA KHÔNG DẤU)</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="NGUYEN VAN A"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">LOẠI THẺ</label>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setCardType("visa")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        cardType === "visa" ? "bg-slate-800 text-white" : "text-slate-400"
                      }`}
                    >
                      Visa
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardType("mastercard")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        cardType === "mastercard" ? "bg-slate-800 text-white" : "text-slate-400"
                      }`}
                    >
                      Mastercard
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">HẠN MỨC CHI TIÊU (VND)</label>
                  <select
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={10000000}>10.000.000đ</option>
                    <option value={20000000}>20.000.000đ</option>
                    <option value={50000000}>50.000.000đ</option>
                    <option value={100000000}>100.000.000đ</option>
                    <option value={200000000}>200.000.000đ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">THIẾT KẾ PHONG CÁCH THẺ</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "slate", label: "Stealth", color: "bg-slate-800" },
                    { id: "neon", label: "Neon Emerald", color: "bg-emerald-800" },
                    { id: "gold", label: "Amber Gold", color: "bg-amber-700" },
                    { id: "cyberpunk", label: "Cyber Pink", color: "bg-pink-800" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setDesignStyle(style.id as any)}
                      className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                        designStyle === style.id
                          ? "border-emerald-400 bg-slate-800/80 shadow-lg scale-102"
                          : "border-slate-800 bg-slate-950/40 hover:bg-slate-900"
                      }`}
                    >
                      <div className={`w-full h-4 rounded ${style.color} mb-1.5`}></div>
                      <span className="text-[10px] text-slate-300 font-medium">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer"
              >
                Xác Nhận Mở Thẻ Ngay
              </button>
            </form>
          </motion.div>
        ) : selectedCard ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6" id="card-dashboard-view">
            {/* Left side: Card List Selector */}
            <div className="md:col-span-2 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none" id="card-selector-strip">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    setIsFlipped(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left min-w-[200px] md:w-full transition-all cursor-pointer ${
                    selectedCardId === card.id
                      ? "border-emerald-500/30 bg-slate-800/60 shadow-lg"
                      : "border-slate-800/40 bg-slate-900/30 hover:bg-slate-800/30"
                  }`}
                >
                  <div className={`w-10 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                    card.designStyle === "slate" ? "bg-slate-700 text-slate-100" :
                    card.designStyle === "neon" ? "bg-emerald-800 text-emerald-100" :
                    card.designStyle === "gold" ? "bg-amber-700 text-amber-100" :
                    "bg-pink-700 text-pink-100"
                  }`}>
                    {card.cardType === "visa" ? "VISA" : "MC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{card.cardHolder}</div>
                    <div className="text-[10px] text-slate-400 font-mono">•••• {card.cardNumber.slice(-4)}</div>
                  </div>
                  {card.status === "locked" && <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Right side: Active 3D Card Simulator */}
            <div className="md:col-span-3 flex flex-col items-center justify-center space-y-4">
              {/* Perspective card frame */}
              <div 
                className="w-full max-w-[340px] h-[210px] cursor-pointer group"
                style={{ perspective: 1000 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {/* CARD FRONT */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between shadow-2xl overflow-hidden ${getStyleClasses(
                      selectedCard.designStyle
                    )}`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Abstract design elements to make card beautiful */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">VietBank Virtual Card</span>
                        <span className="text-xs text-slate-300 font-mono mt-0.5">DIGITAL CARD</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold italic tracking-tighter">
                          {selectedCard.cardType === "visa" ? "VISA" : "Mastercard"}
                        </span>
                      </div>
                    </div>

                    {/* Chip */}
                    <div className="w-10 h-8 rounded-md bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 opacity-80 shadow-inner flex items-center justify-center overflow-hidden">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-40">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="border border-slate-900"></div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Card Number */}
                      <div className="text-base font-mono tracking-wider font-semibold">
                        {formatCardNumber(selectedCard.cardNumber, showNumbers)}
                      </div>

                      {/* Card Holder & Expiry */}
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">CHỦ THẺ</div>
                          <div className="text-xs font-mono font-bold tracking-wide uppercase">
                            {selectedCard.cardHolder}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">HẠN DÙNG</div>
                          <div className="text-xs font-mono font-bold">{selectedCard.expiryDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD BACK */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between shadow-2xl overflow-hidden ${getStyleClasses(
                      selectedCard.designStyle
                    )}`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Magnetic strip */}
                    <div className="absolute left-0 right-0 top-6 h-10 bg-slate-950"></div>

                    <div className="mt-12">
                      <div className="text-[8px] uppercase tracking-widest text-slate-400 mb-1 font-medium">Chữ ký chủ thẻ / Signature</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-8 bg-white/20 rounded-md flex items-center justify-end px-3 font-mono text-slate-950 font-bold tracking-widest text-sm bg-gradient-to-r from-slate-200 via-stone-100 to-slate-200 italic shadow-inner">
                          {selectedCard.cardHolder.split(" ")[selectedCard.cardHolder.split(" ").length - 1]}
                        </div>
                        <div className="w-12 h-8 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-bold text-center flex items-center justify-center rounded-md text-sm">
                          {selectedCard.cvv}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between text-[8px] text-slate-400">
                      <div>
                        Thẻ mô phỏng an toàn. Phát hành bởi VietBank Digital.
                      </div>
                      <div className="font-mono font-semibold">CVV / CVC</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Utility card actions */}
              <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/60" id="card-utility-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNumbers(!showNumbers);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {showNumbers ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  {showNumbers ? "Ẩn số thẻ" : "Hiện số thẻ"}
                </button>

                <div className="w-px h-4 bg-slate-800"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(selectedCard.id);
                  }}
                  className={`flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                    selectedCard.status === "locked" ? "text-emerald-400 hover:text-emerald-300" : "text-rose-400 hover:text-rose-300"
                  }`}
                >
                  {selectedCard.status === "locked" ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      Mở khóa thẻ
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Khóa thẻ khẩn cấp
                    </>
                  )}
                </button>
              </div>

              {/* Card limits metrics */}
              <div className="w-full max-w-[340px] space-y-3 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Hạn mức khả dụng</span>
                  <span className="font-mono text-emerald-400">
                    {(selectedCard.creditLimit - selectedCard.currentBalance).toLocaleString()} VND
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((selectedCard.creditLimit - selectedCard.currentBalance) / selectedCard.creditLimit) * 100))}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Đã chi tiêu: {selectedCard.currentBalance.toLocaleString()} VND</span>
                  <span>Tổng hạn mức: {selectedCard.creditLimit.toLocaleString()} VND</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có thẻ ảo nào được mở.</div>
        )}
      </AnimatePresence>
    </div>
  );
}
