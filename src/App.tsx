import { useState, useEffect } from "react";
import { BankState, Transaction, SavingsJar as JarType, CreditCard as CardType } from "./types";
import { motion, AnimatePresence } from "motion/react";
import CreditCard from "./components/CreditCard";
import SavingsJar from "./components/SavingsJar";
import TransferModal from "./components/TransferModal";
import DashboardCharts from "./components/DashboardCharts";
import AiAssistant from "./components/AiAssistant";
import {
  Wallet,
  Coins,
  History,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  X,
  CreditCard as CardIcon,
  PiggyBank,
  CheckCircle2,
  Info,
  Gift
} from "lucide-react";

// Pre-seeded initial data for rich preview
const DEFAULT_STATE: BankState = {
  balance: 28450000,
  savingsBalance: 120000000,
  points: 5800,
  savingsJars: [
    {
      id: "jar-emergency",
      name: "Quỹ Khẩn Cấp 🛡️",
      targetAmount: 50000000,
      currentAmount: 25000000,
      category: "emergency",
      createdAt: "2026-05-15 09:30",
    },
    {
      id: "jar-car",
      name: "Tích lũy mua xe 🚗",
      targetAmount: 80000000,
      currentAmount: 40000000,
      category: "car",
      createdAt: "2026-06-01 14:15",
    },
    {
      id: "jar-travel",
      name: "Du lịch Nhật Bản ✈️",
      targetAmount: 30000000,
      currentAmount: 30000000,
      category: "travel",
      createdAt: "2026-04-10 10:00",
    }
  ],
  cards: [
    {
      id: "card-slate",
      cardNumber: "5421098765432101",
      cardHolder: "NGUYEN VAN A",
      expiryDate: "12/31",
      cvv: "321",
      cardType: "mastercard",
      status: "active",
      designStyle: "slate",
      creditLimit: 100000000,
      currentBalance: 12450000,
    },
    {
      id: "card-neon",
      cardNumber: "4000123456789012",
      cardHolder: "NGUYEN VAN A",
      expiryDate: "06/29",
      cvv: "888",
      cardType: "visa",
      status: "active",
      designStyle: "neon",
      creditLimit: 50000000,
      currentBalance: 0,
    }
  ],
  recentTransactions: [
    {
      id: "txn-1",
      type: "receive",
      amount: 25000000,
      description: "Nhan Luong Thang 6 - Cong Ty Cong Nghe",
      date: "2026-06-30 08:30",
      category: "salary",
    },
    {
      id: "txn-2",
      type: "spend",
      amount: 1250000,
      description: "Thanh toan hoa don Dien EVN thang 6",
      date: "2026-06-29 18:45",
      category: "utilities",
    },
    {
      id: "txn-3",
      type: "spend",
      amount: 1850000,
      description: "An uong tai nhà hàng Haidilao",
      date: "2026-06-28 20:15",
      category: "dining",
    },
    {
      id: "txn-4",
      type: "spend",
      amount: 4500000,
      description: "Chuyen khoan mua ban ghe Sofa",
      date: "2026-06-25 15:30",
      category: "shopping",
      partnerBank: "Techcombank",
      partnerAccount: "190345678910",
    },
    {
      id: "txn-5",
      type: "receive",
      amount: 600000,
      description: "Hoan tien mua sam Shopee Voucher",
      date: "2026-06-24 11:20",
      category: "shopping",
    }
  ]
};

const BILLS_TO_PAY = [
  { id: "bill-water", name: "Hóa đơn Nước sinh hoạt", amount: 280000, provider: "SawaCO", category: "utilities" },
  { id: "bill-internet", name: "Hóa đơn Internet Viettel", amount: 350000, provider: "Viettel Telecom", category: "utilities" },
  { id: "bill-apartment", name: "Hóa đơn Phí quản lý chung cư", amount: 1500000, provider: "Vinhomes Service", category: "utilities" }
];

export default function App() {
  const [state, setState] = useState<BankState>(() => {
    const saved = localStorage.getItem("vietbank_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  const [showBalance, setShowBalance] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [searchTxn, setSearchTxn] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [notifications, setNotifications] = useState<string[]>([
    "Chào mừng bạn đến với Ngân hàng số VietBank thế hệ mới!",
    "Hũ tích lũy 'Du lịch Nhật Bản ✈️' đã đạt 100% mục tiêu tài chính!",
    "Đã cộng +25.000.000đ lương tháng 6 của bạn."
  ]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [bills, setBills] = useState(BILLS_TO_PAY);
  const [showBillsPanel, setShowBillsPanel] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("vietbank_state", JSON.stringify(state));
  }, [state]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("1028881234");
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleAddCard = (newCardData: any) => {
    const mockCardNumber = "4" + Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join("");
    const mockCvv = Math.floor(100 + Math.random() * 900).toString();
    const mockExpiry = "07/31";

    const newCard: CardType = {
      id: "card-" + Date.now(),
      cardNumber: mockCardNumber,
      cvv: mockCvv,
      expiryDate: mockExpiry,
      currentBalance: 0,
      ...newCardData,
    };

    setState((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
      points: prev.points + 200, // Reward points for opening a card
    }));

    addNotification(`Chúc mừng! Bạn đã mở thành công thẻ ảo ${newCard.cardType.toUpperCase()} phong cách ${newCard.designStyle}. Nhận ngay +200 điểm VietReward!`);
  };

  const handleToggleLockCard = (cardId: string) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === cardId ? { ...c, status: c.status === "active" ? "locked" : "active" } : c
      ),
    }));
  };

  const handleAddJar = (newJarData: any) => {
    const newJar: JarType = {
      id: "jar-" + Date.now(),
      currentAmount: 0,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      ...newJarData,
    };

    setState((prev) => ({
      ...prev,
      savingsJars: [...prev.savingsJars, newJar],
      points: prev.points + 100, // Reward points
    }));

    addNotification(`Đã kích hoạt hũ tích lũy mới "${newJar.name}" hướng tới mục tiêu ${newJar.targetAmount.toLocaleString()}đ.`);
  };

  const handleDeleteJar = (jarId: string) => {
    const jarToDel = state.savingsJars.find((j) => j.id === jarId);
    if (!jarToDel) return;

    setState((prev) => ({
      ...prev,
      balance: prev.balance + jarToDel.currentAmount, // Refund money to main balance
      savingsJars: prev.savingsJars.filter((j) => j.id !== jarId),
    }));

    addNotification(`Đã đóng hũ tích lũy "${jarToDel.name}". Số tiền ${jarToDel.currentAmount.toLocaleString()}đ được hoàn về tài khoản chính.`);
  };

  const handleDepositJar = (jarId: string, amount: number) => {
    if (amount > state.balance) return false;

    setState((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      savingsBalance: prev.savingsBalance + amount,
      savingsJars: prev.savingsJars.map((j) =>
        j.id === jarId ? { ...j, currentAmount: j.currentAmount + amount } : j
      ),
    }));

    addNotification(`Đã tích lũy thêm +${amount.toLocaleString()}đ vào hũ "${state.savingsJars.find((j) => j.id === jarId)?.name}".`);
    return true;
  };

  const handleWithdrawJar = (jarId: string, amount: number) => {
    const jar = state.savingsJars.find((j) => j.id === jarId);
    if (!jar || amount > jar.currentAmount) return false;

    setState((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      savingsBalance: prev.savingsBalance - amount,
      savingsJars: prev.savingsJars.map((j) =>
        j.id === jarId ? { ...j, currentAmount: j.currentAmount - amount } : j
      ),
    }));

    addNotification(`Đã rút ${amount.toLocaleString()}đ từ hũ "${jar.name}" về tài khoản chính.`);
    return true;
  };

  const handleTransferMoney = (transfer: any) => {
    const newTxn: Transaction = {
      id: "txn-" + Date.now(),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      ...transfer,
    };

    setState((prev) => ({
      ...prev,
      balance: prev.balance - transfer.amount,
      recentTransactions: [newTxn, ...prev.recentTransactions],
      points: prev.points + Math.floor(transfer.amount / 100000), // Gain points: 1 point per 100k
    }));

    addNotification(`Giao dịch thành công: Đã chuyển nhanh -${transfer.amount.toLocaleString()}đ tới ${transfer.partnerAccount || "đối tác"}.`);
  };

  const handlePayBill = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || bill.amount > state.balance) return;

    const newTxn: Transaction = {
      id: "txn-" + Date.now(),
      type: "spend",
      amount: bill.amount,
      description: `Thanh toan ${bill.name} qua ${bill.provider}`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      category: "utilities",
    };

    setState((prev) => ({
      ...prev,
      balance: prev.balance - bill.amount,
      recentTransactions: [newTxn, ...prev.recentTransactions],
      points: prev.points + 50, // Reward points for utility payment
    }));

    setBills((prev) => prev.filter((b) => b.id !== billId));
    addNotification(`Đã thanh toán thành công ${bill.name} số tiền -${bill.amount.toLocaleString()}đ.`);
  };

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev.slice(0, 15)]);
  };

  const handleResetState = () => {
    if (confirm("Bạn muốn đặt lại ứng dụng về trạng thái mặc định ban đầu? Toàn bộ lịch sử mô phỏng sẽ bị xóa.")) {
      setState(DEFAULT_STATE);
      setBills(BILLS_TO_PAY);
      localStorage.removeItem("vietbank_state");
      alert("Đã đặt lại dữ liệu VietBank thành công!");
    }
  };

  const filteredTxns = state.recentTransactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTxn.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTxn.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden" id="vietbank-app-root">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-4 py-3 sm:px-6" id="app-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-lg text-emerald-400 tracking-tight">
                VB
              </div>
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                VietBank
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">DIGITAL</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Bảo mật • Đáng tin cậy • Trực tuyến 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions Header Toolbar */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60 text-xs">
              <div className="px-2 py-0.5 text-slate-400">Khách hàng:</div>
              <div className="font-semibold text-slate-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[10px]">NGUYỄN VĂN A</div>
            </div>

            {/* Notification trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifPanel(!showNotifPanel);
                  setShowBillsPanel(false);
                }}
                className="p-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800/60 text-slate-300 transition-all cursor-pointer relative"
                id="btn-notif-trigger"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                )}
              </button>

              {/* Notification dropdown panel */}
              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-slate-800/80 shadow-2xl p-4 z-50 space-y-3"
                    id="notifications-panel"
                  >
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-xs font-bold text-slate-200">Thông Báo Hệ Thống ({notifications.length})</span>
                      <button onClick={() => setNotifications([])} className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer">Xóa tất cả</button>
                    </div>
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.map((n, idx) => (
                          <div key={idx} className="p-2 bg-slate-900/40 rounded-xl border border-slate-850/50 text-[10px] leading-relaxed text-slate-300 font-sans">
                            {n}
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-xs text-slate-500">Chưa có thông báo nào mới.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reset Settings action */}
            <button
              onClick={handleResetState}
              className="p-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800/60 text-slate-300 hover:text-slate-200 transition-all cursor-pointer"
              title="Khôi phục mặc định"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-8 pb-16" id="app-content-body">
        
        {/* FINANCIAL SUMMARY HIGHLIGHTS ROW */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" id="finance-highlights-row">
          
          {/* Main Account Balance Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/60 flex flex-col justify-between space-y-4 relative overflow-hidden" id="payment-balance-card">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Tài Khoản Thanh Toán (Tài khoản nguồn)
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 hover:text-white rounded transition-all cursor-pointer"
                  title={showBalance ? "Ẩn số dư" : "Hiện số dư"}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Balance Amount */}
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
                  {showBalance ? state.balance.toLocaleString() : "••••••••"}
                </span>
                <span className="text-xs font-bold text-slate-400">VND</span>
              </div>

              {/* Acc Number Copy */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">STK: <strong className="text-slate-200">1028881234</strong></span>
                <button
                  onClick={handleCopyAccount}
                  className="p-1 text-slate-500 hover:text-emerald-400 rounded transition-all cursor-pointer flex items-center gap-0.5 text-[9px] font-medium"
                >
                  {copiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedAccount ? "Đã sao chép" : "Sao chép STK"}
                </button>
              </div>
            </div>

            {/* Quick Actions Row below balance */}
            <div className="flex gap-2 pt-2 border-t border-slate-900/60">
              <button
                onClick={() => setIsTransferOpen(true)}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-[0_4px_10px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Chuyển Tiền 24/7
              </button>
              <button
                onClick={() => {
                  setShowBillsPanel(!showBillsPanel);
                  setShowNotifPanel(false);
                }}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-800/60 transition-all cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-sky-400" />
                Thanh Toán Bill
              </button>
            </div>
          </div>

          {/* Savings Balance Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/60 flex flex-col justify-between space-y-4 relative overflow-hidden" id="savings-balance-card">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Tài Khoản Tiết Kiệm (Tích lũy)
                </span>
                <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">APY 5.4%</span>
              </div>

              {/* Savings Amount */}
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
                  {showBalance ? state.savingsBalance.toLocaleString() : "••••••••"}
                </span>
                <span className="text-xs font-bold text-slate-400">VND</span>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                Hệ thống tự động đồng bộ từ tổng số dư các hũ tích lũy đang hoạt động.
              </p>
            </div>

            {/* Micro stats info */}
            <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
              <span>Hũ đang hoạt động:</span>
              <span className="font-bold text-slate-200 font-mono">{state.savingsJars.length} mục tiêu</span>
            </div>
          </div>

          {/* Reward Points Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/60 flex flex-col justify-between space-y-4 relative overflow-hidden" id="rewards-points-card">
            <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Gift className="w-4 h-4 text-sky-400" />
                  Điểm tích lũy VietReward
                </span>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded font-bold">Hạng Kim Cương</span>
              </div>

              {/* Points value */}
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
                  {state.points.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400">điểm</span>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                Cộng dồn tự động sau mỗi giao dịch chuyển khoản, mở thẻ ảo hoặc thanh toán hóa đơn.
              </p>
            </div>

            <button
              onClick={() => setPointsModalOpen(true)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-sky-400 hover:text-sky-300 border border-slate-800/60 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Đổi Quà Tặng Rewards
            </button>
          </div>
        </section>

        {/* BILLS TO PAY DROPDOWN EXPANSION PANEL */}
        <AnimatePresence>
          {showBillsPanel && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              id="bills-to-pay-section"
            >
              <div className="glass-panel p-5 rounded-3xl border border-sky-500/10 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-sky-500/15 rounded text-sky-400">⚡</span>
                    <h4 className="text-sm font-bold text-slate-100">Hóa Đơn Chờ Thanh Toán</h4>
                  </div>
                  <button
                    onClick={() => setShowBillsPanel(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Đóng panel
                  </button>
                </div>

                {bills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {bills.map((bill) => (
                      <div key={bill.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded font-semibold">{bill.provider}</span>
                          <h5 className="text-xs font-bold text-slate-200 mt-1">{bill.name}</h5>
                          <p className="text-sm font-mono font-bold text-sky-400 mt-1">{bill.amount.toLocaleString()}đ</p>
                        </div>
                        <button
                          onClick={() => handlePayBill(bill.id)}
                          disabled={state.balance < bill.amount}
                          className="w-full py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-[10px] transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          {state.balance < bill.amount ? "Số dư không đủ" : "Thanh toán ngay"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Chúc mừng! Bạn đã hoàn thành tất cả các hóa đơn gia đình kỳ này.
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CHARTS / ANALYTICS MODULE */}
        <section id="charts-and-analytics-dashboard">
          <DashboardCharts transactions={state.recentTransactions} />
        </section>

        {/* BENTO GRID: CARDS + SAVINGS GOALS + AI FINANCIAL BOT */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="bento-grid-dashboard">
          
          {/* Column 1: Credit Cards (8 cols on lg screen) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800/60 space-y-6" id="left-column-bento">
            <CreditCard
              cards={state.cards}
              onAddCard={handleAddCard}
              onToggleLock={handleToggleLockCard}
            />
          </div>

          {/* Column 2: Savings Jars (5 cols on lg screen) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800/60 space-y-6" id="right-column-bento">
            <SavingsJar
              jars={state.savingsJars}
              mainBalance={state.balance}
              onAddJar={handleAddJar}
              onDeleteJar={handleDeleteJar}
              onDeposit={handleDepositJar}
              onWithdraw={handleWithdrawJar}
            />
          </div>
        </section>

        {/* TWO-COLUMN LOWER SECTION: TRANSACTION HISTORY + AI FINANCIAL ASSISTANT */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="lower-grid-dashboard">
          
          {/* Column 1: Chat Assistant (5 cols on lg screen) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800/60 space-y-4" id="ai-chat-bento">
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <span className="p-1 bg-emerald-500/10 rounded text-emerald-400">🤖</span>
              <h3 className="font-sans font-bold text-sm text-slate-100">Trợ Lý Tài Chính VietAI</h3>
            </div>
            <p className="text-[10px] text-slate-400">
              VietAI phân tích tức thì ngân sách, tư vấn phân bổ tiền theo các hũ tài chính, và hỗ trợ thiết kế lộ trình đầu tư cá nhân hoàn hảo.
            </p>
            <div className="h-[430px]">
              <AiAssistant bankState={state} />
            </div>
          </div>

          {/* Column 2: Recent Transactions list (7 cols on lg screen) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800/60 space-y-4 flex flex-col justify-between" id="transaction-history-bento">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <h3 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Lịch Sử Giao Dịch Gần Đây
                </h3>

                {/* Filter and Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchTxn}
                      onChange={(e) => setSearchTxn(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded-lg pl-8 pr-3 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 w-32"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[10px] rounded-lg px-2 py-1 text-slate-400 cursor-pointer focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Tất cả mục</option>
                    <option value="salary">Lương</option>
                    <option value="utilities">Hóa đơn</option>
                    <option value="dining">Ăn uống</option>
                    <option value="shopping">Mua sắm</option>
                    <option value="transfer">Chuyển tiền</option>
                  </select>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1" id="transactions-list-scroll">
                {filteredTxns.length > 0 ? (
                  filteredTxns.map((t) => {
                    const isIncome = t.type === "receive";

                    return (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-900/30 rounded-xl border border-slate-850/40 hover:bg-slate-800/20 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Categorized icons */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isIncome 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "bg-slate-950/60 text-slate-300"
                          }`}>
                            {t.category === "salary" ? "💼" :
                             t.category === "utilities" ? "⚡" :
                             t.category === "dining" ? "🍜" :
                             t.category === "shopping" ? "🛒" : "💸"}
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-200 block truncate">{t.description}</span>
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{t.date}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-4">
                          <span className={`text-xs font-mono font-bold ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                            {isIncome ? "+" : "-"}{t.amount.toLocaleString()}đ
                          </span>
                          {t.partnerBank && (
                            <span className="block text-[8px] text-slate-500 font-mono mt-0.5">{t.partnerBank} STK: {t.partnerAccount}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-slate-500">Không tìm thấy giao dịch nào phù hợp.</div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900/60 text-[10px] text-slate-500 text-center font-mono flex justify-between items-center">
              <span>Đang hiển thị {filteredTxns.length} giao dịch gần đây</span>
              <span>VietBank Security Certified 🔒</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-8 text-center text-slate-600 text-xs font-sans space-y-2">
        <p>© 2026 VietBank Digital Corp. Bảo mật dữ liệu được mã hóa đầu cuối AES-256.</p>
        <p className="text-[10px] text-slate-700">Môi trường thử nghiệm an toàn • VietBank Simulator App • Thiết kế bởi AI Coding Agent</p>
      </footer>

      {/* FOOTER FLOATING CHAT ASSISTANT BANNER */}
      <div className="fixed bottom-4 right-4 z-40 hidden md:block">
        <div className="bg-slate-900/95 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-3 shadow-2xl backdrop-blur-md max-w-[320px]">
          <div className="w-8 h-8 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-400/20 text-emerald-400 animate-pulse-soft">
            🤖
          </div>
          <div className="flex-1">
            <span className="text-[9px] text-emerald-400 font-semibold block">VIETAI TRỢ LÝ</span>
            <span className="text-[11px] text-slate-300 block">Bạn cần lập kế hoạch tài chính? Hãy trò chuyện với tôi!</span>
          </div>
        </div>
      </div>

      {/* POINTS CONVERSION MODAL */}
      <AnimatePresence>
        {pointsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPointsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-10 p-5 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-sky-400" />
                  Đổi Quà Tặng VietReward
                </h4>
                <button
                  onClick={() => setPointsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-slate-400">Điểm hiện có của bạn:</span>
                  <span className="text-lg font-mono font-bold text-sky-400">{state.points.toLocaleString()} điểm</span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "gift-cgv", name: "Voucher Xem phim CGV Cinema", points: 1500, detail: "Vé xem phim 2D miễn phí mọi ngày" },
                    { id: "gift-coffee", name: "E-Voucher Phúc Long 100K", points: 2000, detail: "Áp dụng toàn bộ hệ thống Phúc Long Tea & Coffee" },
                    { id: "gift-cash", name: "Hoàn tiền 200.000đ vào tài khoản", points: 4000, detail: "Cộng trực tiếp 200.000 VND vào tài khoản thanh toán" },
                  ].map((gift) => (
                    <div key={gift.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">{gift.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{gift.detail}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (state.points < gift.points) {
                            alert("Bạn chưa tích lũy đủ điểm để đổi quà này.");
                            return;
                          }
                          // Handle cash redeem differently to increase balance
                          if (gift.id === "gift-cash") {
                            setState((prev) => ({
                              ...prev,
                              balance: prev.balance + 200000,
                              points: prev.points - gift.points,
                              recentTransactions: [
                                {
                                  id: "txn-" + Date.now(),
                                  type: "receive",
                                  amount: 200000,
                                  description: "Hoan tien mat doi thuong VietReward",
                                  date: new Date().toISOString().replace("T", " ").substring(0, 16),
                                  category: "salary",
                                },
                                ...prev.recentTransactions,
                              ],
                            }));
                          } else {
                            setState((prev) => ({
                              ...prev,
                              points: prev.points - gift.points,
                            }));
                          }
                          alert(`Chúc mừng bạn đã đổi quà thành công: "${gift.name}". Mã Voucher đã được lưu vào hòm thư điện tử của bạn.`);
                          setPointsModalOpen(false);
                          addNotification(`Bạn đã đổi quà thành công: ${gift.name}. Tài khoản bị trừ -${gift.points} điểm.`);
                        }}
                        disabled={state.points < gift.points}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                      >
                        Đổi: {gift.points}đ
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 items-center text-[10px] text-slate-500 bg-slate-950/40 p-2 rounded-xl">
                  <Info className="w-3.5 h-3.5" />
                  <span>Điểm VietReward được tích lũy tự động từ các giao dịch tiêu dùng thông thường.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSFER 24/7 MODAL */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        mainBalance={state.balance}
        onExecuteTransfer={handleTransferMoney}
      />
    </div>
  );
}
