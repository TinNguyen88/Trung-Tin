import React, { useState, useEffect } from "react";
import { Transaction } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Smartphone, Info, ShieldAlert, Landmark } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainBalance: number;
  onExecuteTransfer: (transfer: Omit<Transaction, "id" | "date">) => void;
}

const POPULAR_BANKS = [
  { code: "VCB", name: "Vietcombank", fullName: "NHTMCP Ngoại Thương Việt Nam" },
  { code: "TCB", name: "Techcombank", fullName: "NHTMCP Kỹ Thương Việt Nam" },
  { code: "MB", name: "MB Bank", fullName: "Ngân hàng TMCP Quân Đội" },
  { code: "BIDV", name: "BIDV", fullName: "NHTMCP Đầu tư và Phát triển Việt Nam" },
  { code: "TPB", name: "TPBank", fullName: "NHTMCP Tiên Phong" },
  { code: "CTG", name: "VietinBank", fullName: "NHTMCP Công Thương Việt Nam" },
  { code: "TIMO", name: "Timo Digital", fullName: "Ngân hàng Số Timo" },
  { code: "VPB", name: "VPBank", fullName: "NHTMCP Việt Nam Thịnh Vượng" },
  { code: "STB", name: "Sacombank", fullName: "NHTMCP Sài Gòn Thương Tín" },
];

export default function TransferModal({ isOpen, onClose, mainBalance, onExecuteTransfer }: TransferModalProps) {
  const [step, setStep] = useState<"input" | "otp" | "receipt">("input");

  // Form states
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // OTP states
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [expectedOtp, setExpectedOtp] = useState("123456");
  const [otpError, setOtpError] = useState("");

  // Receipt transaction details
  const [txnId, setTxnId] = useState("");
  const [txnDate, setTxnDate] = useState("");

  // Lookup mock name on typing account number
  useEffect(() => {
    if (accountNumber.length >= 6) {
      // Simulate bank account lookup
      const firstDigit = Number(accountNumber.charAt(0)) || 5;
      const names = ["NGUYEN THI BINH", "TRAN MINH HOANG", "LE VAN CUONG", "PHẠM HỒNG PHÚC", "DOAN MINH ANH"];
      setRecipientName(names[firstDigit % names.length]);
    } else {
      setRecipientName("");
    }
  }, [accountNumber]);

  // Set default description when name changes
  useEffect(() => {
    if (recipientName) {
      setDescription(`Chuyen tien cho ${recipientName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")}`);
    } else {
      setDescription("Chuyen khoan nhanh 247");
    }
  }, [recipientName]);

  const handleNextToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!accountNumber || accountNumber.length < 6) return;
    if (amountNum <= 0 || amountNum > mainBalance) return;

    // Generate simulated expected OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(code);
    setStep("otp");
    setOtp(Array(6).fill(""));
    setOtpError("");
  };

  const handleOtpInput = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Focus next input automatically
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOtp = () => {
    const enteredCode = otp.join("");
    if (enteredCode === expectedOtp || enteredCode === "123456") { // allow override for debug
      // Execute
      const dateStr = new Date().toLocaleString("vi-VN", { hour12: false });
      const mockId = "FT" + Math.floor(100000000 + Math.random() * 900000000).toString();

      onExecuteTransfer({
        type: "spend",
        amount: Number(amount),
        description: description,
        category: "transfer",
        partnerBank: selectedBank.name,
        partnerAccount: accountNumber,
      });

      setTxnId(mockId);
      setTxnDate(dateStr);
      setStep("receipt");
    } else {
      setOtpError("Mã OTP không chính xác. Vui lòng nhập lại hoặc dùng mã '123456'");
    }
  };

  const handleClose = () => {
    // Reset states
    setStep("input");
    setAccountNumber("");
    setAmount("");
    setRecipientName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-10"
          id="transfer-modal-dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
            <h3 className="font-sans font-bold text-base text-slate-100 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              Chuyển Tiền Nhanh 24/7
            </h3>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal steps */}
          <div className="p-5 overflow-y-auto max-h-[80vh] scrollbar-none">
            {step === "input" && (
              <form onSubmit={handleNextToOtp} className="space-y-4" id="transfer-input-step">
                {/* Bank Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">NGÂN HÀNG THỤ HƯỞNG</label>
                  <select
                    value={selectedBank.code}
                    onChange={(e) => {
                      const b = POPULAR_BANKS.find((bk) => bk.code === e.target.value);
                      if (b) setSelectedBank(b);
                    }}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} - {b.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">SỐ TÀI KHOẢN</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]*"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Nhập số tài khoản nhận..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Recipient Name Lookup Display */}
                <AnimatePresence>
                  {recipientName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-emerald-400 font-semibold block">NGƯỜI THỤ HƯỞNG</span>
                        <span className="text-sm font-bold text-emerald-100 font-mono tracking-wide">{recipientName}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">HỢP LỆ</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Amount */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-400">SỐ TIỀN CHUYỂN (VND)</label>
                    <span className="text-[10px] text-slate-400 font-mono">Khả dụng: {mainBalance.toLocaleString()}đ</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={10000}
                      max={mainBalance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono font-bold text-emerald-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold font-mono">VND</span>
                  </div>

                  {/* Quick select chips */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                    {[50000, 100000, 500000, 1000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          if (val <= mainBalance) setAmount(val.toString());
                        }}
                        className={`py-1 rounded-lg text-xs font-semibold border font-mono cursor-pointer transition-all ${
                          amount === val.toString()
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">LỜI NHẮN</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nội dung chuyển khoản..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 items-center text-[10px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Miễn phí 100% phí chuyển khoản liên ngân hàng 24/7. Nhận ngay sau 5 giây.</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!recipientName || !amount || Number(amount) <= 0 || Number(amount) > mainBalance}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tiếp Tục Xác Nhận
                </button>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-5 text-center py-4" id="transfer-otp-step">
                <div className="mx-auto w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mb-2">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Xác Thực Giao Dịch Smart OTP</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
                    Mã xác thực Smart OTP đang được kích hoạt. Hãy nhập mã bảo mật bên dưới.
                  </p>
                </div>

                {/* Show simulated OTP to make it extremely easy to copy and proceed! */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 inline-block max-w-[280px] mx-auto">
                  <span className="text-[10px] text-amber-400 font-bold block mb-0.5">MÃ OTP SIMULATION</span>
                  <span className="text-lg font-mono font-bold tracking-widest text-white">{expectedOtp}</span>
                </div>

                {/* OTP Boxes */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      maxLength={1}
                      pattern="[0-9]*"
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  ))}
                </div>

                {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}

                <div className="pt-2">
                  <button
                    onClick={verifyOtp}
                    disabled={otp.some((d) => !d)}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Xác Thực OTP
                  </button>
                  <button
                    onClick={() => setStep("input")}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Quay lại chỉnh sửa
                  </button>
                </div>
              </div>
            )}

            {step === "receipt" && (
              <div className="space-y-6 text-center py-4" id="transfer-receipt-step">
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mb-2 animate-bounce-soft" />
                  <h4 className="text-lg font-bold text-slate-100">Giao Dịch Thành Công!</h4>
                  <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">-{Number(amount).toLocaleString()} VND</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-mono">Phí dịch vụ: 0 VND</span>
                </div>

                {/* Receipt Details Box */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-left space-y-3 font-sans">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Ngân hàng thụ hưởng</span>
                    <span className="font-bold text-slate-200">{selectedBank.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Tài khoản nhận</span>
                    <span className="font-mono font-bold text-slate-200">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Tên người nhận</span>
                    <span className="font-mono font-bold text-slate-200 uppercase">{recipientName}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400 shrink-0">Lời nhắn</span>
                    <span className="font-medium text-slate-200 text-right max-w-[200px] break-words">{description}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Mã giao dịch FT</span>
                    <span className="font-mono font-bold text-amber-400">{txnId}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Thời gian thực hiện</span>
                    <span className="font-mono text-slate-200">{txnDate}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert("Tính năng in ảnh biên lai đang được tối ưu hóa. Bạn đã lưu thành công lịch sử giao dịch.");
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Lưu Ảnh Biên Lai
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Đóng Giao Diện
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
