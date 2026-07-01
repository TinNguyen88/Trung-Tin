import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface DashboardChartsProps {
  transactions: Array<{
    id: string;
    type: "receive" | "spend";
    amount: number;
    description: string;
    date: string;
    category: string;
  }>;
}

const MONTHLY_TREND_DATA = [
  { month: "T1", chi: 12400000, thu: 20000000 },
  { month: "T2", chi: 14500000, thu: 21500000 },
  { month: "T3", chi: 18200000, thu: 20000000 },
  { month: "T4", chi: 9800000, thu: 23000000 },
  { month: "T5", chi: 15300000, thu: 24000000 },
  { month: "T6", chi: 11200000, thu: 25000000 },
];

const CATEGORY_COLORS: Record<string, string> = {
  shopping: "#f43f5e", // Rose
  dining: "#f59e0b", // Amber
  transport: "#0ea5e9", // Sky
  housing: "#8b5cf6", // Violet
  utilities: "#ec4899", // Pink
  other: "#64748b", // Slate
};

const CATEGORY_LABELS: Record<string, string> = {
  shopping: "Mua sắm & Giải trí",
  dining: "Ăn uống / Cà phê",
  transport: "Di chuyển / Xe cộ",
  housing: "Tiền thuê nhà / Phòng",
  utilities: "Điện nước / Internet",
  other: "Khoản chi khác",
};

export default function DashboardCharts({ transactions }: DashboardChartsProps) {
  // Compute category totals based on actual mock transactions
  const spendTransactions = transactions.filter((t) => t.type === "spend");
  const totalSpend = spendTransactions.reduce((acc, t) => acc + t.amount, 0) || 1;

  const categoryTotals: Record<string, number> = {
    shopping: 0,
    dining: 0,
    transport: 0,
    housing: 0,
    utilities: 0,
    other: 0,
  };

  spendTransactions.forEach((t) => {
    const cat = t.category in categoryTotals ? t.category : "other";
    categoryTotals[cat] += t.amount;
  });

  // Seed default values if user hasn't made many transfers to make chart beautiful on start
  if (totalSpend < 10000) {
    categoryTotals.shopping = 4500000;
    categoryTotals.dining = 2800000;
    categoryTotals.housing = 5000000;
    categoryTotals.transport = 1200000;
    categoryTotals.utilities = 800000;
  }

  const updatedTotalSpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const categoryData = Object.entries(categoryTotals)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key] || key,
      value: value,
      percentage: Math.round((value / updatedTotalSpend) * 100),
      color: CATEGORY_COLORS[key] || "#64748b",
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (val: any) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}Mđ`;
    }
    return `${(val / 1000).toLocaleString()}kđ`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-module">
      {/* Historical Cashflow Area Chart */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Biến Động Thu Chi (6 Tháng Qua)
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Đơn vị: VND</span>
        </div>

        <div className="h-[220px] w-full" id="area-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#cbd5e1",
                }}
                formatter={(value: any) => [`${value.toLocaleString()} VND`]}
              />
              <Area type="monotone" dataKey="thu" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorThu)" name="Thu Nhập" />
              <Area type="monotone" dataKey="chi" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorChi)" name="Chi Tiêu" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="w-4 h-4" /> Thu nhập (+24Mđ TB)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <ArrowDownRight className="w-4 h-4" /> Chi tiêu (-13.5Mđ TB)
          </span>
        </div>
      </div>

      {/* Spendings Categories Breakdown */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-sky-400" />
            Phân Tích Cơ Cấu Chi Tiêu
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Tháng hiện tại</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Vertical Bar chart to represent pie values elegantly */}
          <div className="sm:col-span-5 h-[200px] w-full" id="bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value.toLocaleString()} VND`]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Styled progress/percentage indicator lines */}
          <div className="sm:col-span-7 space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {categoryData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[140px]">{item.name}</span>
                  <span className="text-slate-400 font-mono font-semibold">
                    {item.value.toLocaleString()}đ ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: item.color,
                      width: `${item.percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
