import React, { useState } from "react";
import { SavingsJar as JarType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { PiggyBank, Plus, ArrowUpRight, ArrowDownLeft, Trash2, TrendingUp } from "lucide-react";

interface SavingsJarProps {
  jars: JarType[];
  mainBalance: number;
  onAddJar: (jar: Omit<JarType, "id" | "currentAmount" | "createdAt">) => void;
  onDeleteJar: (jarId: string) => void;
  onDeposit: (jarId: string, amount: number) => boolean;
  onWithdraw: (jarId: string, amount: number) => boolean;
}

export default function SavingsJar({
  jars,
  mainBalance,
  onAddJar,
  onDeleteJar,
  onDeposit,
  onWithdraw,
}: SavingsJarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedJarId, setSelectedJarId] = useState<string | null>(jars[0]?.id || null);

  // Form states for new jar
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(10000000);
  const [category, setCategory] = useState<JarType["category"]>("emergency");

  // Transfer states
  const [transferType, setTransferType] = useState<"deposit" | "withdraw">("deposit");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeJar = jars.find((j) => j.id === (selectedJarId || jars[0]?.id));

  const handleCreateJar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddJar({
      name: name.trim(),
      targetAmount,
      category,
    });
    setIsCreating(false);
    setName("");
    setTargetAmount(10000000);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const amountNum = Number(transferAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Vui lòng nhập số tiền hợp lệ lớn hơn 0đ");
      return;
    }

    if (!activeJar) {
      setErrorMessage("Vui lòng chọn hũ tiết kiệm trước");
      return;
    }

    if (transferType === "deposit") {
      if (amountNum > mainBalance) {
        setErrorMessage("Số dư tài khoản chính không đủ để tích lũy thêm");
        return;
      }
      const success = onDeposit(activeJar.id, amountNum);
      if (success) {
        setSuccessMessage(`Đã gửi ${amountNum.toLocaleString()}đ vào hũ "${activeJar.name}" thành công!`);
        setTransferAmount("");
      } else {
        setErrorMessage("Có lỗi xảy ra khi nạp tiền.");
      }
    } else {
      if (amountNum > activeJar.currentAmount) {
        setErrorMessage(`Hũ hiện tại chỉ có ${activeJar.currentAmount.toLocaleString()}đ`);
        return;
      }
      const success = onWithdraw(activeJar.id, amountNum);
      if (success) {
        setSuccessMessage(`Đã rút ${amountNum.toLocaleString()}đ từ hũ "${activeJar.name}" về tài khoản chính.`);
        setTransferAmount("");
      } else {
        setErrorMessage("Có lỗi xảy ra khi rút tiền.");
      }
    }
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "car":
        return "🚗";
      case "home":
        return "🏠";
      case "education":
        return "🎓";
      case "travel":
        return "✈️";
      case "emergency":
        return "🛡️";
      default:
        return "💰";
    }
  };

  // Simulated interest rate calculations (5.4% compounded monthly)
  const calculateInterest = (amount: number, rate = 0.054) => {
    const monthlyRate = rate / 12;
    const monthlyEarn = amount * monthlyRate;
    const yearlyEarn = amount * rate;
    return { monthlyEarn, yearlyEarn };
  };

  return (
    <div className="space-y-6" id="savings-jar-module">
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-semibold text-lg text-slate-100 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-amber-400" />
          Hũ Tích Lũy Mục Tiêu
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border border-amber-500/20 cursor-pointer"
          id="btn-create-jar-trigger"
        >
          <Plus className="w-3.5 h-3.5" />
          Tạo Hũ Tích Lũy
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5 rounded-2xl border border-slate-700/50"
            id="create-jar-form"
          >
            <form onSubmit={handleCreateJar} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                <span className="text-sm font-semibold text-slate-200">Xây Dựng Mục Tiêu Tài Chính</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">TÊN HŨ TÍCH LŨY</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Mua Macbook Pro, Đi du lịch Nhật..."
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">DANH MỤC</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="emergency">🛡️ Quỹ khẩn cấp</option>
                    <option value="home">🏠 Mua nhà / Sửa nhà</option>
                    <option value="car">🚗 Mua xe máy / Ô tô</option>
                    <option value="travel">✈️ Du lịch / Trải nghiệm</option>
                    <option value="education">🎓 Học tập / Phát triển</option>
                    <option value="other">💰 Mục tiêu cá nhân khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">SỐ TIỀN MỤC TIÊU CẦN ĐẠT (VND)</label>
                <input
                  type="number"
                  required
                  min={100000}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  placeholder="Nhập số tiền..."
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition-all shadow-[0_4px_12px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                Kích Hoạt Hũ Tiết Kiệm
              </button>
            </form>
          </motion.div>
        ) : jars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6" id="savings-dashboard-view">
            {/* Left side: Jars lists */}
            <div className="md:col-span-2 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none" id="jars-selector-strip">
              {jars.map((jar) => {
                const percent = Math.round((jar.currentAmount / jar.targetAmount) * 100);
                const isActive = (selectedJarId || jars[0]?.id) === jar.id;

                return (
                  <button
                    key={jar.id}
                    onClick={() => {
                      setSelectedJarId(jar.id);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left min-w-[210px] md:w-full transition-all cursor-pointer ${
                      isActive
                        ? "border-amber-500/30 bg-slate-800/60 shadow-lg"
                        : "border-slate-800/40 bg-slate-900/30 hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-950/60 flex items-center justify-center text-xl shrink-0">
                      {getCategoryEmoji(jar.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{jar.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {jar.currentAmount.toLocaleString()}đ / {jar.targetAmount.toLocaleString()}đ
                      </div>
                      {/* Micro progress line */}
                      <div className="w-full h-1 bg-slate-950 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded ml-1 font-mono">
                      {percent}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right side: Selected Jar details & transfer module */}
            {activeJar && (
              <div className="md:col-span-3 glass-card p-5 rounded-2xl border border-slate-800/50 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getCategoryEmoji(activeJar.category)}</div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{activeJar.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Đã tạo ngày: {activeJar.createdAt}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn chắc chắn muốn đóng hũ tiết kiệm "${activeJar.name}"? Số tiền tiết kiệm sẽ được hoàn lại tài khoản thanh toán.`)) {
                          onDeleteJar(activeJar.id);
                          setSelectedJarId(null);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      title="Xóa hũ này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial calculations info */}
                  <div className="grid grid-cols-2 gap-4 mt-5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-medium">Lãi suất mục tiêu (APY)</div>
                      <div className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-4 h-4" />
                        5.4% / năm
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-medium">Lãi dự kiến hằng tháng</div>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {calculateInterest(activeJar.currentAmount).monthlyEarn.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}đ
                      </div>
                    </div>
                  </div>

                  {/* Transfer input form inside */}
                  <form onSubmit={handleTransfer} className="mt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Giao Dịch Với Hũ Tích Lũy</span>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800/60 text-[10px] font-medium">
                        <button
                          type="button"
                          onClick={() => setTransferType("deposit")}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            transferType === "deposit" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                          }`}
                        >
                          <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
                          Tích lũy thêm
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransferType("withdraw")}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            transferType === "withdraw" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                          }`}
                        >
                          <ArrowDownLeft className="w-3 h-3 inline mr-0.5" />
                          Rút về thẻ chính
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="Ví dụ: 100000"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-3 pr-10 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium font-mono">VND</span>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-lg"
                      >
                        Thực Hiện
                      </button>
                    </div>

                    {errorMessage && <p className="text-[10px] text-rose-400 font-medium font-mono">{errorMessage}</p>}
                    {successMessage && <p className="text-[10px] text-emerald-400 font-medium font-mono">{successMessage}</p>}
                  </form>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>Đạt được: {activeJar.currentAmount.toLocaleString()} VND</span>
                    <span>Mục tiêu: {activeJar.targetAmount.toLocaleString()} VND</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có hũ tiết kiệm nào được kích hoạt. Hãy tạo hũ mục tiêu đầu tiên của bạn!</div>
        )}
      </AnimatePresence>
    </div>
  );
}
